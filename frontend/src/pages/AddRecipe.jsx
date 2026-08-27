import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

const emptyForm = {
  title: '',
  ingredients: '',
  cooking_time: '',
  servings: '',
  difficulty: 'Easy',
  diet_type: 'Vegetarian',
  instructions: '',
}

export default function AddRecipe() {
  const { recipeId } = useParams() // present only when editing
  const isEditing = Boolean(recipeId)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (isEditing) {
      api.get(`/api/recipes/${recipeId}`).then((data) => {
        setForm({ ...emptyForm, ...data, servings: data.servings ?? '' })
      }).catch((err) => setError(err.message))
    }
  }, [isEditing, recipeId])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const uploadImageIfNeeded = async () => {
    if (!imageFile) return form.image_url || null
    const path = `${user.id}/${Date.now()}-${imageFile.name}`
    const { error: uploadError } = await supabase.storage.from('recipe-images').upload(path, imageFile)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const image_url = await uploadImageIfNeeded()
      const payload = {
        ...form,
        servings: form.servings ? Number(form.servings) : null,
        image_url,
        source: 'USER',
      }

      if (isEditing) {
        await api.put(`/api/recipes/${recipeId}`, payload)
      } else {
        await api.post('/api/recipes', payload)
      }
      navigate('/my-recipes')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <h1>{isEditing ? 'Edit Recipe ✏️' : 'Add Your Own Recipe ✍️'}</h1>
      <form className="card-form" onSubmit={handleSubmit}>
        <label>Recipe Name</label>
        <input value={form.title} onChange={update('title')} required />

        <label>Ingredients</label>
        <textarea rows={3} value={form.ingredients} onChange={update('ingredients')} required />

        <div className="form-row">
          <div>
            <label>Cooking Time</label>
            <input placeholder="e.g. 30 mins" value={form.cooking_time} onChange={update('cooking_time')} />
          </div>
          <div>
            <label>Servings</label>
            <input type="number" min={1} value={form.servings} onChange={update('servings')} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={update('difficulty')}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label>Diet Type</label>
            <select value={form.diet_type} onChange={update('diet_type')}>
              <option>Vegetarian</option>
              <option>Non-vegetarian</option>
              <option>Vegan</option>
            </select>
          </div>
        </div>

        <label>Instructions</label>
        <textarea rows={5} value={form.instructions} onChange={update('instructions')} required />

        <label>Image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save Recipe'}
        </button>
      </form>
    </div>
  )
}
