import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { excerpt, readTime, formatDate, colorForName, initials } from '../utils/text';

// Hand-drawn-style underline accent used under section headings.
function Squiggle({ className }) {
  return (
    <svg viewBox="0 0 160 14" className={className} preserveAspectRatio="none">
      <path
        d="M2 9.5C24 3 46 12 70 6.5S118 2 158 8"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AuthorAvatar({ author }) {
  if (author?.avatar) {
    return (
      <img
        src={`http://localhost:5000${author.avatar}`}
        alt={author.username}
        className="w-7 h-7 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
      style={{ backgroundColor: colorForName(author?.username) }}
    >
      {initials(author?.username || '?')}
    </span>
  );
}

function PostCard({ post }) {
  const visibleTags = post.tags?.slice(0, 2) || [];
  const extraCount = (post.tags?.length || 0) - visibleTags.length;

  return (
    <Link
      to={`/posts/${post._id}`}
      className="group block bg-card dark:bg-card-dark rounded-xl overflow-hidden border border-line dark:border-line-dark hover:-translate-y-0.5 transition-transform duration-300"
    >
      <div className="aspect-16/10 overflow-hidden bg-tag dark:bg-tag-dark">
        {post.image ? (
          <img
            src={`http://localhost:5000${post.image}`}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-4xl text-ink-soft dark:text-ink-soft-dark">
            {post.title.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-ink-soft-dark mb-3">
          <CalendarIcon /> {formatDate(post.createdAt)}
          <span className="mx-0.5">—</span>
          <ClockIcon /> {readTime(post.content)}
        </div>

        <h2 className="font-display text-xl font-semibold leading-snug text-ink dark:text-ink-dark group-hover:text-accent dark:group-hover:text-accent-dark transition-colors mb-2">
          {post.title}
        </h2>

        <p className="text-sm text-ink-soft dark:text-ink-soft-dark leading-relaxed mb-4">
          {excerpt(post.content)}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-ink-soft dark:text-ink-soft-dark">
            <AuthorAvatar author={post.author} />
            by <span className="font-medium text-ink dark:text-ink-dark">{post.author?.username || 'Unknown'}</span>
          </div>

          {visibleTags.length > 0 && (
            <div className="flex items-center gap-1.5">
              {visibleTags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-tag dark:bg-tag-dark text-ink-soft dark:text-ink-soft-dark">
                  {tag}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-tag dark:bg-tag-dark text-ink-soft dark:text-ink-soft-dark">
                  +{extraCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = query
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      )
    : posts;

  return (
    <div>
      {/* Hero */}
      <div className="relative text-center py-16 mb-16 -mx-6 px-6 overflow-hidden">
        <div className="hero-glow" />
        <h1 className="relative font-display text-4xl sm:text-5xl leading-tight text-ink dark:text-ink-dark max-w-3xl mx-auto">
          Taking control of your daily life is easy when you know how!
        </h1>
      </div>

      <div className="text-center mb-12">
        <h2 className="inline-block relative font-display text-3xl font-semibold text-ink dark:text-ink-dark">
          Recent Posts
          <Squiggle className="absolute -bottom-2 left-0 w-full h-3 text-accent dark:text-accent-dark" />
        </h2>
      </div>

      {loading ? (
        <p className="font-serif text-ink-soft dark:text-ink-soft-dark text-center py-20">Loading the latest issue…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <h2 className="font-display text-3xl text-ink dark:text-ink-dark mb-3">
            {query ? `Nothing matches "${query}"` : 'Nothing published yet'}
          </h2>
          <p className="font-serif text-ink-soft dark:text-ink-soft-dark">
            {query ? 'Try a different search.' : 'Be the first to write something worth reading.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-8">
          {filtered.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}