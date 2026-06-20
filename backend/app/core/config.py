from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # GitHub API
    github_token: str = ""          # Personal access token (optional, increases rate limits)

    # LLM
    openai_api_key: str = ""
    google_api_key: str = ""
    llm_provider: str = "openai"    # "openai" or "gemini"
    openai_model: str = "gpt-4o-mini"
    gemini_model: str = "gemini-1.5-flash"

    # GitHub Search params
    max_repos_to_analyze: int = 20
    max_issues_per_query: int = 30
    beginner_labels: list = [
        "good first issue",
        "beginner friendly",
        "easy",
        "starter",
        "help wanted",
        "first-timers-only",
        "good-first-issue",
        "beginner",
        "newcomer",
        "up-for-grabs",
    ]

    # Cache TTL (seconds)
    cache_ttl: int = 3600  # 1 hour

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
