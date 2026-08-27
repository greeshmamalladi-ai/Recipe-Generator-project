# 🍳 Recipe Generator

Full-stack recipe app: React + Vite frontend, FastAPI backend, Supabase for
auth + database, Gemini API for AI recipe generation.

```
React + Vite  →  Supabase Auth (login/signup)
              →  FastAPI Backend  →  Gemini API (AI recipes)
                                  →  Supabase Database (Postgres, RLS)
```

## 0. Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A free [Supabase](https://supabase.com) account
- A free [Google AI Studio](https://aistudio.google.com/app/apikey) account (for Gemini)

---

## 1. Create your Supabase project

1. Go to https://supabase.com/dashboard → **New Project**.
2. Pick a name, a database password (save it somewhere), and a region. Wait ~2 min for it to spin up.
3. Once created, go to **Project Settings → API**. You'll need three values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY` (frontend)
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose this in frontend code)
4. Go to **Project Settings → API → JWT Settings** and copy the **JWT Secret** → `SUPABASE_JWT_SECRET`.
5. Go to **SQL Editor → New query**, paste the contents of `database/schema.sql`, and click **Run**.
   This creates the `recipes` table, row-level security policies (so users only ever see their own
   recipes), and a `recipe-images` storage bucket for optional recipe photos.
6. (Optional) Go to **Authentication → Providers → Email** and turn off "Confirm email" if you want
   signups to log straight in without checking their inbox — handy for a college demo.

## 2. Get a Gemini API key

1. Go to https://aistudio.google.com/app/apikey.
2. Click **Create API key** → copy it → `GEMINI_API_KEY`.
   The free tier is plenty for a project like this.

## 3. Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# now open .env and paste in your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
# SUPABASE_JWT_SECRET, and GEMINI_API_KEY from steps 1-2

uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/health — you should see `{"status": "healthy"}`.

## 4. Frontend setup (React + Vite)

```bash
cd frontend
npm install

cp .env.example .env
# open .env and paste in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from step 1
# leave VITE_API_BASE_URL as http://localhost:8000 for local dev

npm run dev
```

Visit http://localhost:5173, sign up for an account, and start generating recipes.

## 5. Project structure

```
recipe-generator/
├── database/
│   └── schema.sql            # run this once in Supabase SQL Editor
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + CORS
│   │   ├── config.py         # env var loading
│   │   ├── database.py       # Supabase client + JWT auth dependency
│   │   ├── models.py         # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── recipes.py    # CRUD + search
│   │       └── ai_generate.py# Gemini-powered recipe generation
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Register, Home, GenerateRecipe,
    │   │                      # RecipeDetails, AddRecipe (also used for Edit), MyRecipes
    │   ├── components/        # NavBar, RecipeCard, ProtectedRoute
    │   └── lib/                # supabaseClient, api (auth-aware fetch), AuthContext
    ├── package.json
    └── .env.example
```

## 6. How auth actually works here

- The frontend uses `@supabase/supabase-js` directly for sign up / login / logout —
  Supabase handles password hashing, sessions, and refresh tokens for you.
- On every API call, the frontend attaches the user's Supabase access token as
  `Authorization: Bearer <token>`.
- The FastAPI backend verifies that token itself (using `SUPABASE_JWT_SECRET`) to get the
  user's id, then uses the Supabase **service role** client to run queries filtered by
  `user_id` — so even though the backend has elevated access, it never returns another
  user's recipes. Row-Level Security in Postgres is a second layer of protection if you
  ever query the DB directly from the frontend.

## 7. Notes / things to extend later

- Recipe images upload to a public `recipe-images` Supabase Storage bucket.
- Search matches recipe title or ingredients (case-insensitive, via `ILIKE`).
- To deploy: frontend → Vercel/Netlify, backend → Render/Railway/Fly.io, just set the
  same env vars there and update `CORS_ORIGINS` / `VITE_API_BASE_URL` accordingly.
