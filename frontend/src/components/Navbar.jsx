import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Apply dark mode class to root <html> tag when state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-xs transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-3 flex items-center justify-between">
        <Link to="/" className="font-display font-semibold text-3xl tracking-tight text-ink dark:text-ink-dark">
          The Marginalia<span className="text-accent dark:text-accent-dark">.</span>
        </Link>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="text-sm text-ink-soft dark:text-ink-dark/70 hover:text-accent dark:hover:text-accent-dark transition-colors cursor-pointer"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <div className="flex items-center gap-5">
              <span className="hidden sm:inline text-sm font-sans text-ink-soft dark:text-ink-dark/70">
                {user.username}
              </span>
              <Link
                to="/create"
                className="text-sm font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-ink-dark px-4 py-2 rounded-sm hover:opacity-85 transition-opacity"
              >
                Write
              </Link>
              <button
                onClick={logout}
                className="text-sm font-sans text-ink-soft dark:text-ink-dark/70 hover:text-accent dark:hover:text-accent-dark transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-sans text-ink-soft dark:text-ink-dark/70 hover:text-accent dark:hover:text-accent-dark transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-ink-dark px-4 py-2 rounded-sm hover:opacity-85 transition-opacity"
              >
                Subscribe
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Masthead double rule */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t-2 border-ink dark:border-ink-dark" />
        <div className="border-t border-ink dark:border-ink-dark mt-[3px]" />
      </div>
    </header>
  );
}