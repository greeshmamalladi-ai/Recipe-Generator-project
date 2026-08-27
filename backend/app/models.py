from typing import Optional, Literal
from pydantic import BaseModel


class RecipeCreate(BaseModel):
    title: str
    ingredients: str
    instructions: str
    cooking_time: Optional[str] = None
    servings: Optional[int] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    diet_type: Optional[Literal["Vegetarian", "Non-vegetarian", "Vegan"]] = None
    source: Literal["AI", "USER"] = "USER"
    image_url: Optional[str] = None


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    cooking_time: Optional[str] = None
    servings: Optional[int] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    diet_type: Optional[Literal["Vegetarian", "Non-vegetarian", "Vegan"]] = None
    image_url: Optional[str] = None


class RecipeOut(RecipeCreate):
    id: str
    user_id: str
    created_at: str


class GenerateRecipeRequest(BaseModel):
    ingredients: str
    diet_type: Literal["Vegetarian", "Non-vegetarian", "Vegan"]
    difficulty: Literal["Easy", "Medium", "Hard"]


class GeneratedRecipe(BaseModel):
    title: str
    ingredients: str
    instructions: str
    cooking_time: str
    servings: int
