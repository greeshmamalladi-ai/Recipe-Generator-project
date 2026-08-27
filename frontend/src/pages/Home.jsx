import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <h1>Hey {user?.email?.split('@')[0]} 👋</h1>
      <p className="home-subtitle">What would you like to cook today?</p>

      <div className="home-options">
        <Link to="/generate" className="home-option-card">
          <span className="home-option-icon">🤖</span>
          <h2>Generate Recipe with AI</h2>
          <p>Tell us what's in your kitchen and we'll build a recipe around it.</p>
        </Link>

        <Link to="/add-recipe" className="home-option-card">
          <span className="home-option-icon">✍️</span>
          <h2>Add Your Own Recipe</h2>
          <p>Save a recipe you already know, exactly the way you make it.</p>
        </Link>
      </div>

      <Link to="/my-recipes" className="home-my-recipes-link">View My Recipes →</Link>
    </div>
  )
}
