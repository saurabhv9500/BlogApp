import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';

dotenv.config();

// Initialize DB connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists dynamically
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Static Route to serve uploaded profile/blog pictures
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Main Route APIs
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API System running flawlessly.' });
});

app.listen(PORT, () => {
  console.log(`Backend Server launched cleanly on port ${PORT}`);
});