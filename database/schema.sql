-- =====================================================
-- Recipe Generator — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =====================================================

-- Enable UUID generation (usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- =====================================================
-- TABLE: recipes
-- =====================================================
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  ingredients text not null,          -- newline or comma separated list
  instructions text not null,
  cooking_time text,                  -- e.g. "30 mins"
  servings int,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  diet_type text check (diet_type in ('Vegetarian', 'Non-vegetarian', 'Vegan')),
  source text not null default 'USER' check (source in ('AI', 'USER')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recipes_updated_at on public.recipes;
create trigger trg_recipes_updated_at
  before update on public.recipes
  for each row execute procedure public.set_updated_at();

-- Helpful indexes for search + per-user listing
create index if not exists idx_recipes_user_id on public.recipes(user_id);
create index if not exists idx_recipes_title on public.recipes using gin (to_tsvector('english', title));
create index if not exists idx_recipes_ingredients on public.recipes using gin (to_tsvector('english', ingredients));

-- =====================================================
-- ROW LEVEL SECURITY — users can only see/edit their own recipes
-- =====================================================
alter table public.recipes enable row level security;

drop policy if exists "Users can view their own recipes" on public.recipes;
create policy "Users can view their own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own recipes" on public.recipes;
create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recipes" on public.recipes;
create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own recipes" on public.recipes;
create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- =====================================================
-- OPTIONAL: Storage bucket for recipe images
-- (Skip this section if you don't need image uploads yet)
-- =====================================================
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to recipe images" on storage.objects;
create policy "Public read access to recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

drop policy if exists "Users can upload their own recipe images" on storage.objects;
create policy "Users can upload their own recipe images"
  on storage.objects for insert
  with check (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1]);
