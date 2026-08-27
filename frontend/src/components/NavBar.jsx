import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">🍳 Recipe Generator</Link>
      {user && (
        <nav className="nav-links">
          <Link to="/generate">Generate</Link>
          <Link to="/add-recipe">Add Recipe</Link>
          <Link to="/my-recipes">My Recipes</Link>
          <span className="nav-user">{user.email}</span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </nav>
      )}
    </header>
  )
}
