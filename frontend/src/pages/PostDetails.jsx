import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { readTime, formatDate, colorForName, initials } from '../utils/text';

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      // FIX: auth here is via the session cookie (axios.defaults.withCredentials
      // is set globally in App.jsx) — the old Bearer header used `user.token`,
      // which never existed under session-based auth, and was simply ignored
      // by the backend. Removed the dead header.
      await axios.delete(`/api/posts/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting post');
    }
  };

  if (notFound) {
    return (
      <div className="text-center py-24">
        <h1 className="font-display text-3xl text-ink dark:text-ink-dark mb-3">Post not found</h1>
        <Link to="/" className="text-accent dark:text-accent-dark font-sans text-sm">← Back to the front page</Link>
      </div>
    );
  }

  if (!post) {
    return <p className="font-serif text-ink-soft dark:text-ink-dark/70 text-center py-20">Loading…</p>;
  }

  // FIX: the logged-in user object is shaped { id, username } (see authRoutes.js),
  // not { _id }. Comparing user._id against post.author._id was always
  // undefined === value, so the Edit/Delete controls never appeared for the
  // actual author.
  const isAuthor = user && post.author && user.id === post.author._id;

  return (
    <article className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide text-gold mb-4">
        {formatDate(post.createdAt)}
        <span className="mx-0.5">—</span>
        {readTime(post.content)}
      </div>
      <h1 className="font-display text-4xl sm:text-5xl leading-tight text-ink dark:text-ink-dark mb-4">
        {post.title}
      </h1>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-line dark:border-line-dark">
        <div className="flex items-center gap-2.5 font-sans text-sm text-ink-soft dark:text-ink-dark/70">
          {post.author?.avatar ? (
            <img
              src={`http://localhost:5000${post.author.avatar}`}
              alt={post.author.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: colorForName(post.author?.username) }}
            >
              {initials(post.author?.username || '?')}
            </span>
          )}
          By <span className="font-medium text-ink dark:text-ink-dark">{post.author?.username || 'Unknown'}</span>
        </div>

        {post.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-tag dark:bg-tag-dark text-ink-soft dark:text-ink-soft-dark">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.image && (
        <img
          src={`http://localhost:5000${post.image}`}
          alt={post.title}
          className="w-full max-h-[420px] object-cover rounded-sm mb-10"
        />
      )}

      <div
        className="article-body text-lg leading-8 text-ink dark:text-ink-dark [&_p]:mb-5"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {isAuthor && (
        <div className="mt-12 pt-6 border-t border-line dark:border-line-dark flex gap-4">
          <Link
            to={`/edit/${post._id}`}
            className="font-sans text-sm font-medium text-ink dark:text-ink-dark border border-line dark:border-line-dark px-4 py-2 rounded-sm hover:border-accent dark:hover:border-accent-dark transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="font-sans text-sm font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}