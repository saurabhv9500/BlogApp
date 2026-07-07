import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// 🔐 SIGNUP / REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User account already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });

    // Instantly log user into their session session on successful creation
    req.session.userId = newUser._id;
    req.session.username = newUser.username;

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username }
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

    res.json({
      message: "Logged in successfully",
      user: { id: user._id, username: user.username }
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

// 🔄 GET CURRENT SESSION USER (Crucial for frontend page reloads)
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ isAuthenticated: false, message: "No active session available" });
  }
  res.json({
    isAuthenticated: true,
    user: { id: req.session.userId, username: req.session.username }
  });
});

export default router;