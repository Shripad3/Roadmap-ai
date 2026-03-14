# Roadmap AI

AI-powered task manager that breaks down goals into actionable subtasks with time estimates.

## Features

- **AI Subtask Breakdown** — generate 3–7 ordered subtasks from any task title/description
- **AI Time Estimation** — automatically estimates time when creating a task (or set it manually)
- **Kanban Board** — drag-and-drop tasks across To Do / In Progress / Done columns
- **Dashboard** — progress tracking, priority breakdown, AI usage meter, upcoming deadlines
- **Priority & Due Dates** — set High / Medium / Low priority and due dates on tasks
- **Public Roadmap Sharing** — share any task as a public read-only link (no login required)
- **Freemium Model** — 10 free AI generations per month
- **Dark Mode** — full dark theme support
- **Onboarding Tour** — guided walkthrough for new users

## Architecture

- **Frontend**: React + Vite (`frontend/`)
- **Data / Auth**: Supabase (PostgreSQL + Row Level Security)
- **Backend**: Express (`backend/`) — AI endpoints only
- **AI Model**: Google Gemini (`gemini-2.0-flash-preview`)

Data flow:
1. User signs in via Supabase Auth.
2. Task/subtask CRUD goes directly from frontend → Supabase.
3. AI calls go frontend → Express backend → Gemini → frontend → Supabase.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 1. Supabase Setup

The `database/` folder is gitignored — SQL migrations are run manually in the **Supabase SQL Editor**.

### Required tables

Run these in order in the Supabase SQL Editor:

**tasks**
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending','in_progress','completed')),
  priority text default 'medium' check (priority in ('high','medium','low')),
  due_date date,
  estimated_hours numeric(5,2),
  is_public boolean default false,
  order_index integer default 0,
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "Users manage own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Public tasks viewable by anyone" on tasks for select using (is_public = true);
```

**subtasks**
```sql
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending','in_progress','completed')),
  estimated_hours numeric(5,2),
  order_index integer default 0,
  created_at timestamptz default now()
);
alter table subtasks enable row level security;
create policy "Users manage own subtasks" on subtasks for all
  using (exists (select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()));
create policy "Subtasks of public tasks viewable by anyone" on subtasks for select
  using (exists (select 1 from tasks where tasks.id = subtasks.task_id and tasks.is_public = true));
```

**ai_usage_logs**
```sql
create table ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);
alter table ai_usage_logs enable row level security;
create policy "Users manage own logs" on ai_usage_logs for all using (auth.uid() = user_id);
```

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
```

## 3. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 4. Run the App

Terminal 1 — backend:
```bash
cd backend && npm run dev
```

Terminal 2 — frontend:
```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`.

## Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/breakdown` | Generate subtasks from task title/description |
| `POST` | `/api/ai/estimate-task` | Estimate time for a task (returns `estimated_hours`) |
| `GET` | `/api/health` | Health check |

## Project Structure

```
task-breakdown-app/
├── README.md
├── .gitignore
├── .mcp.json
├── backend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── controllers/taskController.js
│       ├── routes/api.js
│       └── services/ai.js
└── frontend/
    ├── .env
    ├── package.json
    └── src/
        ├── lib/supabase.js
        ├── contexts/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── TaskList.jsx
        │   ├── TaskDetail.jsx
        │   ├── SubtaskItem.jsx
        │   ├── KanbanBoard.jsx
        │   ├── OnboardingModal.jsx
        │   └── AIBreakdownPreviewModal.jsx
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Tasks.jsx
        │   ├── AIBreakdown.jsx
        │   ├── Dashboard.jsx
        │   ├── Settings.jsx
        │   └── SharedTaskView.jsx
        └── services/
            ├── api.js
            └── publicApi.js
```

## Scripts

Backend: `npm run dev` · `npm start`

Frontend: `npm run dev` · `npm run build` · `npm run preview`

## Troubleshooting

**`You must be signed in.`**
Sign in first — all task queries require a Supabase session.

**`Invalid Gemini API key` or 503 from AI endpoints**
Check `GEMINI_API_KEY` in `backend/.env`. Restart backend after editing env vars.

**CORS errors in browser**
Ensure `CORS_ORIGIN` in `backend/.env` matches the frontend URL (default `http://localhost:5173`).

**Supabase permission errors**
Use the `anon` key in frontend (not the service role key). Verify RLS policies are enabled.

**AI time estimate not appearing after task creation**
The `estimated_hours` column may not exist yet — run the `tasks` table SQL above in Supabase.

**Share link returns "not found"**
The `is_public` column or RLS policies for public sharing may not be set up — run the `tasks` table SQL above and ensure the public SELECT policy is created.
