from fastapi import APIRouter, HTTPException
from app.services.github_service import github_service

router = APIRouter()


@router.get("/profile/{username}")
async def get_profile(username: str):
    """Analyze a GitHub profile and return enriched skill data."""
    try:
        profile = await github_service.analyze_profile(username)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub API error: {str(e)}")
