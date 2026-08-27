from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import recipes, ai_generate
from app.config import settings

app = FastAPI(title="Recipe Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(ai_generate.router, prefix="/api/ai", tags=["ai"])


@app.get("/")
def root():
    return {"status": "ok", "service": "recipe-generator-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}
