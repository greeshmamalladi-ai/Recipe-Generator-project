import json
import re
import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.database import get_current_user
from app.models import GenerateRecipeRequest

router = APIRouter()

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3.6-flash:generateContent"
)


def build_prompt(req: GenerateRecipeRequest) -> str:
    return f"""You are a recipe generator. Based on the ingredients and preferences below,
create ONE recipe.

Ingredients available: {req.ingredients}
Diet type: {req.diet_type}
Difficulty: {req.difficulty}

Respond with ONLY valid JSON (no markdown fences, no extra text) in exactly this shape:
{{
  "title": "Recipe Name",
  "ingredients": "comma or newline separated list of ingredients with quantities",
  "instructions": "numbered step-by-step instructions as a single string",
  "cooking_time": "e.g. 30 mins",
  "servings": 2
}}
"""


@router.post("/generate")
async def generate_recipe(req: GenerateRecipeRequest, user_id: str = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured on the server")

    prompt = build_prompt(req)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{GEMINI_URL}?key={settings.GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {response.text}")

    data = response.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise HTTPException(status_code=502, detail="Unexpected response shape from Gemini")

    # Strip markdown code fences if the model added them anyway
    cleaned = re.sub(r"^```json\s*|^```\s*|```$", "", text.strip(), flags=re.MULTILINE).strip()

    try:
        recipe = json.loads(cleaned)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Could not parse recipe JSON from AI response")

    recipe["difficulty"] = req.difficulty
    recipe["diet_type"] = req.diet_type
    recipe["source"] = "AI"
    return recipe
