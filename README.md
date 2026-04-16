# Appliance Parts Inventory — Setup Guide

A shared, real-time parts inventory app built with React + Supabase + Vercel.
Anyone with the link can add, edit, search, and delete parts. All changes are
live for everyone instantly.

---

## Step 1: Set Up Supabase (your database)

1. Go to **https://supabase.com** and click **Start your project**
2. Sign in with GitHub (or create a free account)
3. Click **New Project** — name it anything (e.g. "parts-inventory")
4. Choose a region close to you, set a database password, click **Create**
5. Wait ~2 minutes for the project to spin up
6. In the left sidebar, click **SQL Editor**
7. Click **New query**, then paste the entire contents of `supabase/schema.sql`
8. Click **Run** — this creates your table and imports all 2,822 parts
9. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

---

## Step 2: Push to GitHub

1. Go to **https://github.com** and create a free account if needed
2. Click **+** → **New repository**, name it `parts-inventory`, click **Create**
3. Follow GitHub's instructions to push this folder to that repo:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/parts-inventory.git
git push -u origin main
```

> If you don't have Git installed: download from https://git-scm.com

---

## Step 3: Deploy on Vercel (your web host)

1. Go to **https://vercel.com** and sign in with your GitHub account
2. Click **Add New → Project**
3. Find your `parts-inventory` repo and click **Import**
4. Before clicking Deploy, click **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → paste your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → paste your Supabase anon key
5. Click **Deploy** — Vercel builds and hosts it automatically (~1 minute)
6. You'll get a free URL like `https://parts-inventory-abc123.vercel.app`

**Share that URL with your team — they can all use it immediately.**

---

## How It Works Day-to-Day

- **Add a part**: Click "+ ADD PART" in the top right
- **Edit a part**: Click the EDIT button on any row
- **Delete a part**: Click DEL (you'll be asked to confirm)
- **Search**: Type in the search bar — matches part #, description, or location
- **Filter**: Use the Brand or Status dropdowns
- **Sort**: Click any column header

Changes made by anyone are visible to everyone within seconds (real-time sync).

---

## Updating the App Later

If you want to make changes to the app, edit the code and push to GitHub.
Vercel will automatically rebuild and redeploy it within minutes.

---

## Cost

- **Supabase free tier**: Up to 500MB database, 50,000 requests/month — more than enough
- **Vercel free tier**: Unlimited personal projects, custom domains available
- **Total cost: $0**
