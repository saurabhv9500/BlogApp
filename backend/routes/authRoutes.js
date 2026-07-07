import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';

const router = express.Router();

// Reuses the same uploads/ folder as post images. Avatars are optional —
// registration still works fine with no file attached.
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `avatar-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Images only!'));
  }
});

// 🔐 SIGNUP / REGISTER USER
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User account already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: req.file ? `/uploads/${req.file.filename}` : ''
    });

    // Instantly log user into their session on successful creation
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    req.session.avatar = newUser.avatar;

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, avatar: newUser.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error: error.message });
  }
});

// 🔑 LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Store user identity inside the cookie session store
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.avatar = user.avatar;

    res.json({
      message: "Logged in successfully",
      user: { id: user._id, username: user.username, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
});

// 🚪 LOGOUT USER (Destroys database session token record)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Could not safely process logout" });
    res.clearCookie('blog_session'); // Clear cookie from user's browser cache
    return res.json({ message: "Logged out clean!" });
  });
});

// 🖼️ UPDATE AVATAR (called from the Profile page after initial signup)
router.put('/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authorized, please log in." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No image file was provided." });
  }
  try {
    const avatarPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { avatar: avatarPath },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    // Keep the session copy in sync so /me reflects the change immediately
    req.session.avatar = user.avatar;

    res.json({ user: { id: user._id, username: user.username, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ message: "Failed to update avatar", error: error.message });
  }
});

// 🔄 GET CURRENT SESSION USER (Crucial for frontend page reloads)
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ isAuthenticated: false, message: "No active session available" });
  }
  res.json({
    isAuthenticated: true,
    user: { id: req.session.userId, username: req.session.username, avatar: req.session.avatar || '' }
  });
});

export default router;