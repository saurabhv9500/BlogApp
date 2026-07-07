import express from 'express';
import multer from 'multer';
import path from 'path';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Storage Configuration for Image Uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
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

// Create Post
router.post('/', protect, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = new Post({
      title,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      author: req.user._id
    });
    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Post by ID
router.get('/:id', async (req, res) => {
  try {
    // FIX: req.get('id') reads an HTTP header, not the route param — it was
    // always undefined and only worked by accident via the || fallback.
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (post) res.json(post);
    else res.status(404).json({ message: 'Post not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Post
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed completely' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;