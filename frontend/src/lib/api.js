import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handle(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export const api = {
  async get(path) {
    const headers = await authHeaders()
    return handle(await fetch(`${API_BASE_URL}${path}`, { headers }))
  },
  async post(path, body) {
    const headers = await authHeaders()
    return handle(await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) }))
  },
  async put(path, body) {
    const headers = await authHeaders()
    return handle(await fetch(`${API_BASE_URL}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) }))
  },
  async del(path) {
    const headers = await authHeaders()
    return handle(await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers }))
  },
}
