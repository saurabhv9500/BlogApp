import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Database & Route Imports
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; 

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Configuration (Allows frontend to talk to backend and send session cookies safely)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your Vite React App URL
  credentials: true
}));

// 2. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Server-Side Session Management (Replaces localStorage token tracking)
app.use(session({
  name: 'blog_session', 
  secret: process.env.SESSION_SECRET || 'super_secret_blogapp_encryption_key_xyz', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/blogapp', 
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // Sessions auto-expire in 1 day
  }),
  cookie: {
    httpOnly: true, // Prevents custom browser scripts from hijacking user login identity
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    maxAge: 1000 * 60 * 60 * 24 // 1 day session lifespan
  }
}));

// 4. Create uploads folder automatically if it's missing
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 5. Static folder for post pictures
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 6. Router API Mounts
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes); 

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Backend API system running flawlessly.',
    sessionActive: !!req.session.userId 
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('System Exception:', err.stack);
  res.status(500).json({ error: 'Internal Server Error. Something broke on our end!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Production-ready Server running on port ${PORT}`);
});