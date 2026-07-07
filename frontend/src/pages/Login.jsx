import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // FIX: the backend authenticates via server-side session (cookie), not a
      // JWT — it never returns res.data.token, so the old `if (res.data.token)`
      // check was always false and login() never fired. We now trust the
      // session cookie and just use the returned user object directly.
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-3 text-center">Reader Access</p>
      <h1 className="font-display text-4xl text-ink dark:text-ink-dark text-center mb-8">Sign In</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="font-sans text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded-sm px-4 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-serif focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
          />
        </div>
        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-serif focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-ink-dark py-3 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-ink-soft dark:text-ink-dark/70">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent dark:text-accent-dark font-medium">Subscribe here</Link>
      </p>
    </div>
  );
}