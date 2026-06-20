from fastapi import APIRouter, HTTPException
from app.models.schemas import IssueSearchRequest
from app.services.github_service import github_service
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.post("/search")
async def search_issues(req: IssueSearchRequest):
    """Search for beginner-friendly GitHub issues."""
    try:
        labels = req.labels or settings.beginner_labels[:5]
        issues = await github_service.search_issues(
            languages=req.languages,
            labels=labels,
            min_stars=req.min_stars,
            max_results=req.max_results,
        )
        return {"issues": issues, "count": len(issues)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
