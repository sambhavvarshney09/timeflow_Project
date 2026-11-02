
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import timeRoutes from './routes/time.js';

dotenv.config();

const app = express();

// PORT
const PORT = process.env.PORT || 5000;

// CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.29.199:5173',
  'https://freelance-time-tracking-tool.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked CORS Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

// JSON MIDDLEWARE
app.use(express.json());

// REQUEST LOGGER
app.use((req, res, next) => {
  console.log(
    'INCOMING REQUEST:',
    req.method,
    req.originalUrl
  );
  next();
});

// ROOT ROUTE
app.get('/', (req, res) => {
  res.status(200).send('TimeFlow Backend is Working!');
});

// HEALTH CHECK ROUTE
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'TimeFlow API',
    message: 'Backend is working successfully'
  });
});

// TEST ROUTE
app.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Test route working'
  });
});

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/time', timeRoutes);

// 404 HANDLER
app.use((req, res) => {
  console.log('404 ROUTE:', req.method, req.originalUrl);

  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'error',
      message: 'CORS origin not allowed'
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// START SERVER
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('================================');
      console.log('TIMEFLOW API STARTED');
      console.log('PORT:', PORT);
      console.log('ROOT ROUTE: /');
      console.log('HEALTH ROUTE: /api/health');
      console.log('TEST ROUTE: /test');
      console.log('================================');
    });
  } catch (error) {
    console.error('SERVER START ERROR:', error);
    process.exit(1);
  }
};

startServer();