import httpx
import asyncio
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
from collections import defaultdict

from app.core.config import get_settings
from app.models.schemas import GitHubProfile, GitHubRepo, GitHubIssue

settings = get_settings()

BASE = "https://api.github.com"


def _headers() -> Dict[str, str]:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.github_token:
        h["Authorization"] = f"Bearer {settings.github_token}"
    return h


class GitHubService:

    async def get_user(self, username: str) -> Dict:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{BASE}/users/{username}", headers=_headers(), timeout=15)
            if r.status_code == 404:
                raise ValueError(f"GitHub user '{username}' not found")
            r.raise_for_status()
            return r.json()

    async def get_user_repos(self, username: str, max_repos: int = 100) -> List[Dict]:
        repos = []
        async with httpx.AsyncClient() as client:
            page = 1
            while len(repos) < max_repos:
                r = await client.get(
                    f"{BASE}/users/{username}/repos",
                    params={"sort": "pushed", "per_page": 100, "page": page, "type": "owner"},
                    headers=_headers(), timeout=15
                )
                r.raise_for_status()
                data = r.json()
                if not data:
                    break
                repos.extend(data)
                if len(data) < 100:
                    break
                page += 1
        return repos[:max_repos]

    async def get_repo_languages(self, full_name: str) -> Dict[str, int]:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{BASE}/repos/{full_name}/languages", headers=_headers(), timeout=10)
            if r.status_code != 200:
                return {}
            return r.json()

    async def analyze_profile(self, username: str) -> GitHubProfile:
        user, repos = await asyncio.gather(
            self.get_user(username),
            self.get_user_repos(username, max_repos=settings.max_repos_to_analyze)
        )

        # Aggregate languages across repos
        lang_bytes: Dict[str, int] = defaultdict(int)
        tasks = [self.get_repo_languages(r["full_name"]) for r in repos[:15]]
        lang_results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in lang_results:
            if isinstance(result, dict):
                for lang, count in result.items():
                    lang_bytes[lang] += count

        # Sort languages by bytes
        sorted_langs = dict(sorted(lang_bytes.items(), key=lambda x: x[1], reverse=True))

        # Top repos by stars
        sorted_repos = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
        top_repos = [
            GitHubRepo(
                name=r["name"],
                full_name=r["full_name"],
                description=r.get("description"),
                language=r.get("language"),
                stars=r.get("stargazers_count", 0),
                forks=r.get("forks_count", 0),
                url=r.get("html_url", ""),
                topics=r.get("topics", []),
            )
            for r in sorted_repos[:8]
        ]

        total_stars = sum(r.get("stargazers_count", 0) for r in repos)

        # Account age
        created_at = user.get("created_at", "")
        if created_at:
            created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            age_years = (datetime.now(timezone.utc) - created).days / 365
        else:
            age_years = 0

        # Infer skill level
        skill_level = self._infer_skill_level(
            repo_count=user.get("public_repos", 0),
            age_years=age_years,
            total_stars=total_stars,
            lang_count=len(sorted_langs),
        )

        primary_stack = list(sorted_langs.keys())[:5]

        return GitHubProfile(
            username=username,
            name=user.get("name"),
            bio=user.get("bio"),
            avatar_url=user.get("avatar_url", ""),
            public_repos=user.get("public_repos", 0),
            followers=user.get("followers", 0),
            following=user.get("following", 0),
            location=user.get("location"),
            blog=user.get("blog"),
            company=user.get("company"),
            top_languages=sorted_langs,
            top_repos=top_repos,
            total_stars=total_stars,
            account_age_years=round(age_years, 1),
            skill_level=skill_level,
            primary_stack=primary_stack,
        )

    def _infer_skill_level(self, repo_count: int, age_years: float,
                            total_stars: int, lang_count: int) -> str:
        score = 0
        if repo_count > 50: score += 3
        elif repo_count > 20: score += 2
        elif repo_count > 5: score += 1

        if age_years > 4: score += 3
        elif age_years > 2: score += 2
        elif age_years > 1: score += 1

        if total_stars > 200: score += 3
        elif total_stars > 50: score += 2
        elif total_stars > 10: score += 1

        if lang_count > 8: score += 2
        elif lang_count > 4: score += 1

        if score >= 8: return "advanced"
        elif score >= 4: return "intermediate"
        return "beginner"

    async def search_issues(
        self,
        languages: List[str],
        labels: List[str],
        min_stars: int = 100,
        max_results: int = 50,
    ) -> List[GitHubIssue]:
        """Search GitHub for open beginner-friendly issues."""
        all_issues = []

        async with httpx.AsyncClient() as client:
            for lang in languages[:4]:  # Limit to top 4 languages
                for label in labels[:3]:  # Top 3 beginner labels
                    query = f'label:"{label}" language:{lang} state:open is:issue no:assignee stars:>={min_stars}'
                    r = await client.get(
                        f"{BASE}/search/issues",
                        params={"q": query, "sort": "created", "per_page": 15, "page": 1},
                        headers=_headers(), timeout=20
                    )
                    if r.status_code != 200:
                        continue

                    data = r.json()
                    for item in data.get("items", []):
                        repo_info = item.get("repository", {})
                        # Extract repo name from URL
                        repo_url = item.get("repository_url", "")
                        repo_full_name = "/".join(repo_url.split("/")[-2:]) if repo_url else ""

                        issue = GitHubIssue(
                            id=item["id"],
                            number=item["number"],
                            title=item["title"],
                            body=(item.get("body") or "")[:600],
                            url=item["html_url"],
                            repo_name=repo_full_name.split("/")[-1] if repo_full_name else "",
                            repo_full_name=repo_full_name,
                            repo_description=repo_info.get("description"),
                            repo_stars=repo_info.get("stargazers_count", 0),
                            repo_language=repo_info.get("language"),
                            labels=[l["name"] for l in item.get("labels", [])],
                            created_at=item.get("created_at", ""),
                            comments=item.get("comments", 0),
                            assignees=len(item.get("assignees", [])),
                        )
                        all_issues.append(issue)

                    await asyncio.sleep(0.5)  # Rate limit courtesy

        # Deduplicate by issue id
        seen = set()
        unique = []
        for issue in all_issues:
            if issue.id not in seen:
                seen.add(issue.id)
                unique.append(issue)

        return unique[:max_results]


github_service = GitHubService()
