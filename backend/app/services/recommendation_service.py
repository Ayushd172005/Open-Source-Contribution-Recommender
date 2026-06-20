import json
import re
import asyncio
from typing import List, Dict

from app.core.config import get_settings
from app.models.schemas import GitHubProfile, GitHubIssue, IssueRecommendation

settings = get_settings()


def get_llm():
    if settings.llm_provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.google_api_key,
            temperature=0.2,
        )
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model=settings.openai_model,
        openai_api_key=settings.openai_api_key,
        temperature=0.2,
    )


def _score_issue_heuristic(issue: GitHubIssue, profile: GitHubProfile) -> float:
    """Fast heuristic scoring before LLM ranking."""
    score = 0.0

    # Language match
    user_langs = {l.lower() for l in profile.primary_stack}
    if issue.repo_language and issue.repo_language.lower() in user_langs:
        score += 35

    # Stars (credibility of project)
    if issue.repo_stars > 5000: score += 20
    elif issue.repo_stars > 1000: score += 15
    elif issue.repo_stars > 100: score += 8

    # Beginner labels
    label_lower = [l.lower() for l in issue.labels]
    if "good first issue" in label_lower: score += 20
    if "help wanted" in label_lower: score += 10
    if "documentation" in label_lower: score += 5

    # Comments (community activity)
    if 1 <= issue.comments <= 10: score += 5
    elif issue.comments == 0: score += 2

    # No assignees = still open
    if issue.assignees == 0: score += 5

    return min(score, 100.0)


async def rank_issues_with_llm(
    profile: GitHubProfile,
    issues: List[GitHubIssue],
    max_results: int = 10
) -> List[IssueRecommendation]:
    """Use LLM to rank and annotate top issues."""

    # Pre-filter with heuristic scoring, take top 20 for LLM
    scored = [(issue, _score_issue_heuristic(issue, profile)) for issue in issues]
    scored.sort(key=lambda x: x[1], reverse=True)
    top_issues = [issue for issue, _ in scored[:20]]

    if not top_issues:
        return []

    # Build compact issue list for LLM
    issues_text = ""
    for i, issue in enumerate(top_issues):
        issues_text += f"""
Issue {i+1}:
  Title: {issue.title}
  Repo: {issue.repo_full_name} ({issue.repo_stars} stars)
  Language: {issue.repo_language or 'N/A'}
  Labels: {', '.join(issue.labels)}
  Body preview: {(issue.body or '')[:200]}
  Comments: {issue.comments}
"""

    profile_text = f"""
Developer Profile:
  Username: {profile.username}
  Skill Level: {profile.skill_level}
  Primary Stack: {', '.join(profile.primary_stack)}
  Public Repos: {profile.public_repos}
  Total Stars Earned: {profile.total_stars}
  Account Age: {profile.account_age_years} years
  Bio: {profile.bio or 'N/A'}
"""

    prompt = f"""You are an expert open source contribution advisor.

{profile_text}

Here are {len(top_issues)} candidate GitHub issues:
{issues_text}

Select the best {min(max_results, len(top_issues))} issues for this developer. For each, return a JSON array:
[
  {{
    "issue_index": 1,
    "match_score": 87,
    "match_reasons": ["Uses Python which matches their stack", "Popular repo with active community"],
    "difficulty": "easy",
    "estimated_time": "2-4 hours",
    "why_good_fit": "One-sentence explanation of why this is perfect for this developer",
    "skills_you_ll_use": ["Python", "pytest"],
    "skills_you_ll_learn": ["open source workflow", "CI/CD"],
    "contribution_tips": ["Read CONTRIBUTING.md first", "Comment on the issue before starting"]
  }}
]

Rules:
- match_score: 0-100
- difficulty: "easy", "medium", or "hard"
- Return ONLY valid JSON array, no markdown, no explanation
- Rank by best fit for THIS specific developer
- Consider their skill level: {profile.skill_level}
"""

    llm = get_llm()
    from langchain_core.messages import HumanMessage
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    text = response.content.strip()

    # Clean potential markdown fences
    text = re.sub(r'^```(?:json)?\n?', '', text)
    text = re.sub(r'\n?```$', '', text)

    try:
        ranked = json.loads(text)
    except json.JSONDecodeError:
        # Fallback: return heuristic-scored issues without LLM annotations
        return _fallback_recommendations(top_issues[:max_results], profile, scored)

    recommendations = []
    for item in ranked:
        idx = item.get("issue_index", 1) - 1
        if idx < 0 or idx >= len(top_issues):
            continue
        issue = top_issues[idx]
        recommendations.append(IssueRecommendation(
            issue=issue,
            match_score=float(item.get("match_score", 50)),
            match_reasons=item.get("match_reasons", []),
            difficulty=item.get("difficulty", "easy"),
            estimated_time=item.get("estimated_time", "Unknown"),
            why_good_fit=item.get("why_good_fit", ""),
            skills_you_ll_use=item.get("skills_you_ll_use", []),
            skills_you_ll_learn=item.get("skills_you_ll_learn", []),
            contribution_tips=item.get("contribution_tips", []),
        ))

    return recommendations


def _fallback_recommendations(
    issues: List[GitHubIssue],
    profile: GitHubProfile,
    scored: List,
) -> List[IssueRecommendation]:
    recs = []
    score_map = {issue.id: score for issue, score in scored}
    for issue in issues:
        score = score_map.get(issue.id, 50)
        recs.append(IssueRecommendation(
            issue=issue,
            match_score=score,
            match_reasons=[f"Matches your {issue.repo_language} experience"] if issue.repo_language else [],
            difficulty="easy",
            estimated_time="1-3 days",
            why_good_fit="Beginner-friendly issue in a project matching your stack.",
            skills_you_ll_use=profile.primary_stack[:2],
            skills_you_ll_learn=["open source workflow"],
            contribution_tips=["Read CONTRIBUTING.md", "Comment before starting work"],
        ))
    return recs


async def generate_summary(profile: GitHubProfile, count: int, langs: List[str]) -> str:
    llm = get_llm()
    from langchain_core.messages import HumanMessage
    prompt = f"""Write a 2-sentence personalized summary for this open source contribution search:
Developer: {profile.username} ({profile.skill_level} level)
Stack: {', '.join(profile.primary_stack)}
Found {count} matching issues across {', '.join(langs)} projects.
Be encouraging and specific. Plain text only."""

    r = await llm.ainvoke([HumanMessage(content=prompt)])
    return r.content.strip()
