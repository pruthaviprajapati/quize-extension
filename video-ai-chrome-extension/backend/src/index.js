import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import contentRoutes from './routes/content.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
// During development we need to accept requests coming from three contexts:
// 1) the frontend dev server (localhost:3000/5173)
// 2) chrome-extension:// origins (background/content scripts)
// 3) page origins where an injected overlay (web_accessible_resource) runs (e.g. https://www.youtube.com)
// For local development we'll allow the request origin if present. In production you should lock this down.
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin (e.g. curl) and chrome-extension origins
    if (!origin || origin.startsWith('chrome-extension://')) return callback(null, true);

    // Allow known local dev frontends
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // For dev convenience allow any webpage origin (so overlays injected into pages can call the backend).
    // WARNING: In production you should restrict this to trusted origins or proxy requests through the extension background.
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✓ Connected to MongoDB');
  console.log(`  Database: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('✗ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api', contentRoutes);
console.log('Mounted API routes at /api');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Video AI Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
});
