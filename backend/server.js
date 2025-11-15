import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database.js';
import queriesRouter from './routes/queries.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import realtimeRouter, { initWebSocket } from './routes/realtime.js';
import reportsRouter from './routes/reports.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }

// Security middleware
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? true 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());

// Initialize WebSocket
initWebSocket(server);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/users', usersRouter);
app.use('/api/realtime', realtimeRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai', aiRouter);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Serve static files with proper MIME types
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready`);
  });
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});