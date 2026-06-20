from fastapi import APIRouter, HTTPException
import asyncio

from app.models.schemas import RecommendationRequest, RecommendationResponse
from app.services.github_service import github_service
from app.services.recommendation_service import rank_issues_with_llm, generate_summary
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.post("/", response_model=RecommendationResponse)
async def get_recommendations(req: RecommendationRequest):
    """
    Full pipeline:
    1. Analyze GitHub profile
    2. Search for beginner-friendly issues in matching languages
    3. LLM-rank and annotate issues for this specific developer
    """
    # Step 1: Profile analysis
    try:
        profile = await github_service.analyze_profile(req.username)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile analysis failed: {str(e)}")

    # Step 2: Determine languages to search
    search_langs = req.include_languages or profile.primary_stack[:4]
    if not search_langs:
        search_langs = ["Python", "JavaScript"]  # sensible default

    # Adjust labels by skill level
    if profile.skill_level == "beginner":
        labels = ["good first issue", "beginner friendly", "easy", "first-timers-only"]
    elif profile.skill_level == "intermediate":
        labels = ["good first issue", "help wanted", "beginner friendly"]
    else:
        labels = ["help wanted", "good first issue"]

    # Step 3: Search issues
    try:
        issues = await github_service.search_issues(
            languages=search_langs,
            labels=labels,
            min_stars=50,
            max_results=settings.max_issues_per_query,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Issue search failed: {str(e)}")

    if not issues:
        return RecommendationResponse(
            profile=profile,
            recommendations=[],
            summary="No matching issues found. Try again later or expand your language filters.",
            total_issues_scanned=0,
            search_languages=search_langs,
        )

    # Step 4: LLM ranking
    try:
        recommendations = await rank_issues_with_llm(
            profile=profile,
            issues=issues,
            max_results=req.max_results,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ranking failed: {str(e)}")

    # Step 5: Summary
    try:
        summary = await generate_summary(profile, len(recommendations), search_langs)
    except Exception:
        summary = f"Found {len(recommendations)} matching issues for {req.username}."

    return RecommendationResponse(
        profile=profile,
        recommendations=recommendations,
        summary=summary,
        total_issues_scanned=len(issues),
        search_languages=search_langs,
    )
