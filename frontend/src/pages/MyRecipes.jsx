import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import RecipeCard from '../components/RecipeCard'

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'AI', label: '🤖 AI Generated' },
  { key: 'USER', label: '✍️ My Own' },
]

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([])
  const [tab, setTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (tab !== 'ALL') params.set('source', tab)
      if (search.trim()) params.set('q', search.trim())
      const data = await api.get(`/api/recipes?${params.toString()}`)
      setRecipes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this recipe?')) return
    try {
      await api.del(`/api/recipes/${id}`)
      setRecipes((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="my-recipes-page">
      <h1>My Recipes 📖</h1>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          placeholder="Search by name or ingredient…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary" type="submit">Search</button>
      </form>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && recipes.length === 0 && (
        <p className="empty-state">No recipes here yet. Go generate or add one!</p>
      )}

      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
