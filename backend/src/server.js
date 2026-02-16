// CRITICAL: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { closePool } from './services/database.js';
import { validateApiKey } from './services/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Task Breakdown API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

async function startServer() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    await validateApiKey();
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: Connected`);
      console.log(`🤖 AI Service: Ready`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await closePool();
    console.log('✅ Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  try {
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

export default app;
