import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import GenerateRecipe from './pages/GenerateRecipe'
import RecipeDetails from './pages/RecipeDetails'
import AddRecipe from './pages/AddRecipe'
import MyRecipes from './pages/MyRecipes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><GenerateRecipe /></ProtectedRoute>} />
            <Route path="/recipe-details" element={<ProtectedRoute><RecipeDetails /></ProtectedRoute>} />
            <Route path="/add-recipe" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />
            <Route path="/edit-recipe/:recipeId" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />
            <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}
