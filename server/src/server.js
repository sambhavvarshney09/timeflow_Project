
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import timeRoutes from './routes/time.js';

dotenv.config();

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  'http://localhost:5173',
  'https://timeflow-project.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

console.log('Allowed CORS Origins:', allowedOrigins);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without origin (Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('Blocked CORS Origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'TimeFlow API is running'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'TimeFlow API',
    database: 'connected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/time', timeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS blocked this origin'
    });
  }

  res.status(500).json({
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('================================');
      console.log('TIMEFLOW API STARTED');
      console.log(`PORT: ${PORT}`);
      console.log('ROOT ROUTE: /');
      console.log('HEALTH ROUTE: /api/health');
      console.log('================================');
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

startServer();
