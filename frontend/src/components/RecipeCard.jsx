import { useNavigate } from 'react-router-dom'

export default function RecipeCard({ recipe, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="recipe-card">
      {recipe.image_url && <img src={recipe.image_url} alt={recipe.title} className="recipe-card-img" />}
      <div className="recipe-card-body">
        <div className="recipe-card-tag">{recipe.source === 'AI' ? '🤖 AI Generated' : '✍️ My Recipe'}</div>
        <h3>{recipe.title}</h3>
        <p className="recipe-card-meta">
          {recipe.difficulty} · {recipe.diet_type} · ⏱ {recipe.cooking_time} · 🍽 {recipe.servings} servings
        </p>
        <p className="recipe-card-ingredients">{recipe.ingredients}</p>
        <div className="recipe-card-actions">
          <button className="btn-secondary" onClick={() => navigate(`/edit-recipe/${recipe.id}`)}>Edit</button>
          <button className="btn-danger" onClick={() => onDelete(recipe.id)}>Delete</button>
        </div>
      </div>
    </div>
  )
}
