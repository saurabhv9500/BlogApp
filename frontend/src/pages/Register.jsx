import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';

export default function Register() {
  const [username, setUsername] = useState('');
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
      // Same session-vs-token fix as Login.jsx — see note there.
      const res = await axios.post('/api/auth/register', { username, email, password });
      login(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-3 text-center">New Reader</p>
      <h1 className="font-display text-4xl text-ink dark:text-ink-dark text-center mb-8">Create Account</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="font-sans text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded-sm px-4 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-serif focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
          />
        </div>
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
            minLength={6}
            className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-serif focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-ink-dark py-3 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-ink-soft dark:text-ink-dark/70">
        Already registered?{' '}
        <Link to="/login" className="text-accent dark:text-accent-dark font-medium">Sign in here</Link>
      </p>
    </div>
  );
}