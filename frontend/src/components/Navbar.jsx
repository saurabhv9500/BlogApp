import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { colorForName, initials } from '../utils/text';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Default to dark (matches the reference design) unless the visitor has
  // explicitly chosen a theme before, or their system prefers light.
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'light'
      ? false
      : localStorage.getItem('theme') === 'dark'
      ? true
      : true
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/');
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-xs transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-3 flex items-center justify-between gap-6">
        <Link to="/" className="font-display font-semibold text-3xl tracking-tight text-ink dark:text-ink-dark shrink-0">
          The Marginalia<span className="text-accent dark:text-accent-dark">.</span>
        </Link>

        {/* Quick search — filters posts by title/tag on Home */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
          <div className="flex items-center gap-2 w-full bg-tag dark:bg-tag-dark rounded-full px-4 py-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-soft dark:text-ink-soft-dark">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="bg-transparent outline-hidden text-sm text-ink dark:text-ink-dark placeholder:text-ink-soft dark:placeholder:text-ink-soft-dark w-full"
            />
          </div>
        </form>

        <div className="flex items-center gap-5 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="text-ink-soft dark:text-ink-soft-dark hover:text-accent dark:hover:text-accent-dark transition-colors cursor-pointer"
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" /><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/create"
                className="text-sm font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-accent-dark px-4 py-2 rounded-sm hover:opacity-85 transition-opacity"
              >
                Write
              </Link>
              <Link to="/profile" className="hidden sm:block" title="Your profile">
                {user.avatar ? (
                  <img
                    src={`http://localhost:5000${user.avatar}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: colorForName(user.username) }}
                  >
                    {initials(user.username)}
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                className="text-sm font-sans text-ink-soft dark:text-ink-soft-dark hover:text-accent dark:hover:text-accent-dark transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-sans text-ink-soft dark:text-ink-soft-dark hover:text-accent dark:hover:text-accent-dark transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-accent-dark px-4 py-2 rounded-sm hover:opacity-85 transition-opacity"
              >
                Subscribe
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Masthead double rule */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t-2 border-ink dark:border-ink-dark" />
        <div className="border-t border-ink dark:border-ink-dark mt-[3px]" />
      </div>
    </header>
  );
}