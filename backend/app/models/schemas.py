from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class GitHubRepo(BaseModel):
    name: str
    full_name: str
    description: Optional[str]
    language: Optional[str]
    stars: int
    forks: int
    url: str
    topics: List[str] = []


class GitHubProfile(BaseModel):
    username: str
    name: Optional[str]
    bio: Optional[str]
    avatar_url: str
    public_repos: int
    followers: int
    following: int
    location: Optional[str]
    blog: Optional[str]
    company: Optional[str]
    top_languages: Dict[str, int]          # language -> bytes
    top_repos: List[GitHubRepo]
    total_stars: int
    account_age_years: float
    skill_level: str                        # "beginner" | "intermediate" | "advanced"
    primary_stack: List[str]               # top 5 languages/technologies


class GitHubIssue(BaseModel):
    id: int
    number: int
    title: str
    body: Optional[str]
    url: str
    repo_name: str
    repo_full_name: str
    repo_description: Optional[str]
    repo_stars: int
    repo_language: Optional[str]
    labels: List[str]
    created_at: str
    comments: int
    assignees: int


class IssueRecommendation(BaseModel):
    issue: GitHubIssue
    match_score: float                     # 0-100
    match_reasons: List[str]
    difficulty: str                        # "easy" | "medium" | "hard"
    estimated_time: str                    # "1-2 hours", "1-2 days" etc.
    why_good_fit: str
    skills_you_ll_use: List[str]
    skills_you_ll_learn: List[str]
    contribution_tips: List[str]


class RecommendationRequest(BaseModel):
    username: str
    languages: Optional[List[str]] = None  # override language filter
    max_results: int = 10
    include_languages: Optional[List[str]] = None
    difficulty_filter: Optional[str] = None  # "easy" | "medium" | "all"


class RecommendationResponse(BaseModel):
    profile: GitHubProfile
    recommendations: List[IssueRecommendation]
    summary: str
    total_issues_scanned: int
    search_languages: List[str]


class IssueSearchRequest(BaseModel):
    languages: List[str]
    labels: Optional[List[str]] = None
    min_stars: int = 100
    max_results: int = 50
