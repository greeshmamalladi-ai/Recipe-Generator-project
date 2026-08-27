from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.database import supabase, get_current_user
from app.models import RecipeCreate, RecipeUpdate

router = APIRouter()


@router.get("")
def list_recipes(
    source: Optional[str] = None,  # "AI" | "USER" | None (both)
    q: Optional[str] = None,       # search by title or ingredients
    user_id: str = Depends(get_current_user),
):
    query = supabase.table("recipes").select("*").eq("user_id", user_id)

    if source in ("AI", "USER"):
        query = query.eq("source", source)

    if q:
        # match title OR ingredients containing the search term
        query = query.or_(f"title.ilike.%{q}%,ingredients.ilike.%{q}%")

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/{recipe_id}")
def get_recipe(recipe_id: str, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("recipes")
        .select("*")
        .eq("id", recipe_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return result.data


@router.post("")
def create_recipe(recipe: RecipeCreate, user_id: str = Depends(get_current_user)):
    payload = recipe.model_dump()
    payload["user_id"] = user_id
    result = supabase.table("recipes").insert(payload).execute()
    return result.data[0]


@router.put("/{recipe_id}")
def update_recipe(recipe_id: str, recipe: RecipeUpdate, user_id: str = Depends(get_current_user)):
    # Confirm ownership first
    existing = (
        supabase.table("recipes").select("id").eq("id", recipe_id).eq("user_id", user_id).execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Recipe not found")

    updates = {k: v for k, v in recipe.model_dump().items() if v is not None}
    result = supabase.table("recipes").update(updates).eq("id", recipe_id).eq("user_id", user_id).execute()
    return result.data[0]


@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: str, user_id: str = Depends(get_current_user)):
    existing = (
        supabase.table("recipes").select("id").eq("id", recipe_id).eq("user_id", user_id).execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Recipe not found")

    supabase.table("recipes").delete().eq("id", recipe_id).eq("user_id", user_id).execute()
    return {"status": "deleted", "id": recipe_id}
