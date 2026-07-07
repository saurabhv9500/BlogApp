import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Relative path — relies on the axios.defaults.baseURL set in App.jsx
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

  if (loading) {
    return <p className="font-serif text-ink-soft dark:text-ink-dark/70 text-center py-20">Loading the latest issue…</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="font-display text-4xl text-ink dark:text-ink-dark mb-3">Nothing published yet</h1>
        <p className="font-serif text-ink-soft dark:text-ink-dark/70">
          Be the first to write something worth reading.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div>
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-8">
        Issue No. {posts.length} · Latest Dispatch
      </p>

      {/* Featured lead story */}
      <Link to={`/posts/${featured._id}`} className="group grid md:grid-cols-2 gap-8 items-center pb-12 border-b border-line dark:border-line-dark">
        {featured.image && (
          <div className="overflow-hidden rounded-sm">
            <img
              src={`http://localhost:5000${featured.image}`}
              alt={featured.title}
              className="w-full h-72 object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        )}
        <div className={featured.image ? '' : 'md:col-span-2'}>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] text-ink dark:text-ink-dark mb-4 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">
            {featured.title}
          </h1>
          <p className="font-sans text-sm text-ink-soft dark:text-ink-dark/70">
            By {featured.author?.username || 'Unknown'} · {new Date(featured.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </Link>

      {/* Remaining posts, list style */}
      <div className="mt-12 divide-y divide-line dark:divide-line-dark">
        {rest.map((post) => (
          <Link
            key={post._id}
            to={`/posts/${post._id}`}
            className="group flex items-start justify-between gap-6 py-6 first:pt-0"
          >
            <div>
              <h2 className="font-display text-2xl text-ink dark:text-ink-dark group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">
                {post.title}
              </h2>
              <p className="font-sans text-sm text-ink-soft dark:text-ink-dark/70 mt-1">
                By {post.author?.username || 'Unknown'} · {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {post.image && (
              <img
                src={`http://localhost:5000${post.image}`}
                alt={post.title}
                className="w-24 h-24 object-cover rounded-sm shrink-0 grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}