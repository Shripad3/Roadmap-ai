# AI Task Breakdown App - Complete Setup

A production-ready web application that uses Google Gemini AI (FREE) to break down complex tasks into manageable subtasks.

## ✅ Prerequisites

- Node.js 18+ (check: `node --version`)
- Docker Desktop (for PostgreSQL)
- Google Gemini API key (free at https://aistudio.google.com/app/apikey)

## 🚀 Complete Setup (5 minutes)

### Step 1: Get Your FREE API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Extract and Configure

```bash
# Extract the project
tar -xzf task-breakdown-app-final.tar.gz
cd task-breakdown-app-final

# Edit the backend .env file
nano backend/.env

# Replace YOUR_GEMINI_API_KEY_HERE with your actual key
# Save: Ctrl+X, then Y, then Enter
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

### Step 4: Start Database

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait 10 seconds for database to initialize
sleep 10

# Verify it's running
docker ps
```

You should see a postgres container running.

### Step 5: Start the Application

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Gemini API key validated successfully
🆓 Using FREE Gemini API (15 req/min, 1500 req/day)
Database connected successfully at [timestamp]
🚀 Server running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 6: Use the App!

Open your browser to: **http://localhost:5173**

1. Create a task (e.g., "Launch a new product")
2. Click "Generate AI Breakdown"
3. Watch as Gemini creates subtasks for FREE!
4. Edit subtasks, change statuses, manage your tasks

## 🛑 Stopping the Application

```bash
# Stop backend: Ctrl+C in terminal 1
# Stop frontend: Ctrl+C in terminal 2

# Stop database
docker-compose down
```

## 🔧 Troubleshooting

### "Cannot connect to database"
```bash
docker-compose down
docker-compose up -d
sleep 10
```

### "Invalid API key"
- Make sure you edited `backend/.env` with your actual key
- No quotes around the key
- Restart the backend after editing

### "Module not found"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Port already in use"
```bash
# Kill processes on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill processes on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## 📁 Project Structure

```
task-breakdown-app-final/
├── README.md
├── docker-compose.yml
├── database/
│   └── schema.sql
├── backend/
│   ├── .env (YOU MUST EDIT THIS)
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── controllers/
│       ├── models/
│       └── services/
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── App.jsx
        ├── components/
        └── services/
```

## 🎓 Learning Resources

- Read the code comments - every file is heavily documented
- Start with `frontend/src/App.jsx` to understand the UI flow
- Read `backend/src/server.js` to understand the API
- Check `backend/src/services/ai.js` to see how AI integration works

## 🚀 Deployment

Ready to put it online? The app is ready to deploy to:
- Frontend: Vercel, Netlify
- Backend: Railway, Render, Fly.io
- Database: Railway, Render, Supabase

## ❓ Need Help?

Common issues:
1. **API key not working** - Make sure you saved `.env` after editing
2. **Database errors** - Make sure Docker is running
3. **Port conflicts** - Make sure nothing else is using ports 3001 or 5173

Enjoy building! 🎉
