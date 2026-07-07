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

// Tags arrive as a comma-separated string from the form (e.g. "Machine, AGI").
// Normalize into a clean array: trim whitespace, drop empties, dedupe.
function parseTags(raw) {
  if (!raw) return [];
  return [...new Set(
    raw.split(',').map((t) => t.trim()).filter(Boolean)
  )];
}

// Author fields returned on every populate — keeps avatar available
// wherever a post's author is shown (cards, post detail, etc).
const AUTHOR_FIELDS = 'username avatar';

// Create Post
router.post('/', protect, upload.single('image'), async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const post = new Post({
      title,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      tags: parseTags(tags),
      author: req.user._id
    });
    const createdPost = await post.save();
    const populated = await createdPost.populate('author', AUTHOR_FIELDS);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', AUTHOR_FIELDS).sort({ createdAt: -1 });
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
    const post = await Post.findById(req.params.id).populate('author', AUTHOR_FIELDS);
    if (post) res.json(post);
    else res.status(404).json({ message: 'Post not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Post
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    if (tags !== undefined) post.tags = parseTags(tags);
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    const updatedPost = await post.save();
    const populated = await updatedPost.populate('author', AUTHOR_FIELDS);
    res.json(populated);
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