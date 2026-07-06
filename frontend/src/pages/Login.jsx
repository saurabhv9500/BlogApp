import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, automatically push them away from the login page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data && res.data.token) {
        login(res.data);
        // Small timeout ensures local storage state registers before switching pages
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid Login Credentials provided.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center' }}>Account Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        <button type="submit" style={{ background: '#6c5ce7', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>Don't have an account? <Link to="/register" style={{ color: '#6c5ce7' }}>Register here</Link></p>
    </div>
  );
}