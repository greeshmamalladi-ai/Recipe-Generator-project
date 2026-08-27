import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function RecipeDetails() {
  const { state } = useLocation()
  const recipe = state?.recipe
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!recipe) {
    return (
      <div className="page-center">
        <p>No recipe to show. Generate one first.</p>
        <button className="btn-primary" onClick={() => navigate('/generate')}>Generate a Recipe</button>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await api.post('/api/recipes', {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        diet_type: recipe.diet_type,
        source: 'AI',
      })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-page">
      <h1>{recipe.title}</h1>
      <div className="recipe-meta-row">
        <span>⏱ {recipe.cooking_time}</span>
        <span>🍽 {recipe.servings} servings</span>
        <span>📊 {recipe.difficulty}</span>
        <span>🥗 {recipe.diet_type}</span>
      </div>

      <h3>Ingredients</h3>
      <p className="preserve-lines">{recipe.ingredients}</p>

      <h3>Instructions</h3>
      <p className="preserve-lines">{recipe.instructions}</p>

      {error && <p className="form-error">{error}</p>}

      {saved ? (
        <div className="form-success-row">
          <p className="form-success">Saved to My Recipes ✅</p>
          <button className="btn-secondary" onClick={() => navigate('/my-recipes')}>View My Recipes</button>
        </div>
      ) : (
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Recipe'}
        </button>
      )}
    </div>
  )
}
