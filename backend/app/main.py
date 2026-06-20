from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import github, issues, recommendations
import uvicorn

app = FastAPI(
    title="OSS Contribution Recommender API",
    description="AI-powered open source issue matching based on GitHub profile",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github.router, prefix="/api/github", tags=["github"])
app.include_router(issues.router, prefix="/api/issues", tags=["issues"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "OSS Contribution Recommender"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
