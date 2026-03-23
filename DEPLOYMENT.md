# Deployment Guide

## Backend → Vercel

### 1. Deploy from Backend Folder

**Option A: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your Git repository
3. Set **Root Directory** to `backend`
4. Vercel will auto-detect the config from `vercel.json`
5. Add environment variables (Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `EMAIL_USER` (optional)
   - `EMAIL_APP_PASSWORD` (optional)
6. Deploy

**Option B: Vercel CLI**
```bash
cd backend
npx vercel
# Follow prompts, add env vars when asked
# For production: npx vercel --prod
```

### 2. Copy Your Backend URL
After deploy, you'll get a URL like `https://adhd-prediction-backend-xxx.vercel.app`

---

## Frontend → Netlify

### 1. Deploy from Frontend Folder

**Option A: Netlify Dashboard**
1. Go to [netlify.com](https://netlify.com) → Add new site → Import existing project
2. Connect your Git repository
3. Set **Base directory** to `frontend`
4. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variable (Site settings → Environment variables):
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.vercel.app` (your Vercel backend URL)
6. Deploy

**Option B: Netlify CLI**
```bash
cd frontend
npm run build
npx netlify deploy --prod --dir=dist
# Or connect to Git: npx netlify init
```

### 2. Set VITE_API_URL
**Important:** The frontend must know your backend URL. In Netlify:
- Site settings → Environment variables → New variable
- `VITE_API_URL` = `https://your-actual-vercel-backend.vercel.app`
- Redeploy after adding (env vars are baked in at build time)

---

## Checklist

- [ ] Backend env vars set on Vercel
- [ ] Frontend `VITE_API_URL` set on Netlify to Vercel backend URL
- [ ] Both deployed and tested (login, assessment, email)
