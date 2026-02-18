# AI Task Breakdown App

Task manager with AI-generated subtasks.

- Auth and data are handled by Supabase (PostgreSQL + Row Level Security).
- The backend is AI-only and exposes one endpoint to generate subtasks with Gemini.

## Current Architecture

- Frontend: React + Vite (`frontend/`)
- Data/Auth: Supabase (`tasks` + `subtasks` tables, RLS enabled)
- Backend: Express (`backend/`) for AI generation only
- AI Model: Google Gemini (`gemini-3-flash-preview`)

Data flow:
1. User signs in via Supabase Auth.
2. Task CRUD happens directly from frontend to Supabase.
3. "Generate AI Breakdown" sends task text to backend `/api/ai/breakdown`.
4. Frontend inserts returned subtasks into Supabase.

## Prerequisites

- Node.js 18+
- A Supabase project
- Gemini API key from https://aistudio.google.com/app/apikey

## 1. Supabase Setup

Run your SQL schema/policies in Supabase SQL Editor (you already did this):

- `tasks` table with `user_id references auth.users(id)`
- `subtasks` table with `task_id references tasks(id)`
- RLS enabled on both tables
- Per-user policies for select/insert/update/delete

If you are setting this up from scratch, use `database/schema.sql` as your base and apply your Supabase-specific RLS SQL.

## 2. Environment Variables

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001/api
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Currently still required by backend startup check
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskapp
```

Note: backend is AI-only now, but `backend/src/server.js` still validates `DATABASE_URL` during startup.

## 3. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 4. Run the App

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Available Backend Endpoints

- `POST /api/ai/breakdown`
- `GET /api/health`

Example request:

```bash
curl -X POST http://localhost:3001/api/ai/breakdown \
  -H "Content-Type: application/json" \
  -d '{"title":"Launch MVP","description":"2-week timeline"}'
```

## Scripts

Backend:
- `npm run dev`
- `npm start`

Frontend:
- `npm run dev`
- `npm run build`
- `npm run preview`

## Project Structure

```text
task-breakdown-app-final/
├── README.md
├── database/
│   └── schema.sql
├── backend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── controllers/taskController.js
│       ├── routes/api.js
│       └── services/
│           ├── ai.js
│           └── database.js
└── frontend/
    ├── .env
    ├── package.json
    └── src/
        ├── lib/supabase.js
        ├── contexts/AuthContext.jsx
        ├── pages/Tasks.jsx
        └── services/api.js
```

## Troubleshooting

- `You must be signed in.`
  - Sign in first; task queries require Supabase session.

- `Invalid Gemini API key` or 503 from `/api/ai/breakdown`
  - Check `GEMINI_API_KEY` in `backend/.env`.
  - Restart backend after editing env vars.

- CORS errors in browser
  - Ensure `CORS_ORIGIN` matches frontend URL (default `http://localhost:5173`).

- Supabase permission errors
  - Confirm you are using `anon` key in frontend, not service role key.
  - Verify RLS policies are enabled and correct.

