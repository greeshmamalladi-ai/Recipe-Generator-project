import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function GenerateRecipe() {
  const [ingredients, setIngredients] = useState('')
  const [dietType, setDietType] = useState('Vegetarian')
  const [difficulty, setDifficulty] = useState('Easy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const recipe = await api.post('/api/ai/generate', {
        ingredients,
        diet_type: dietType,
        difficulty,
      })
      navigate('/recipe-details', { state: { recipe } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <h1>Generate Recipe with AI 🤖</h1>
      <form className="card-form" onSubmit={handleGenerate}>
        <label>Ingredients you have</label>
        <textarea
          placeholder="e.g. Tomato, onion, potato, rice"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={3}
          required
        />

        <div className="form-row">
          <div>
            <label>Diet Type</label>
            <select value={dietType} onChange={(e) => setDietType(e.target.value)}>
              <option>Vegetarian</option>
              <option>Non-vegetarian</option>
              <option>Vegan</option>
            </select>
          </div>
          <div>
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading || !ingredients.trim()}>
          {loading ? 'Generating…' : 'Generate Recipe'}
        </button>
      </form>
    </div>
  )
}
