import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Register from './pages/Register';

export const AuthContext = createContext(null);

function Navbar() {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <nav style={{ background: '#6c5ce7', padding: '15px 0', color: '#fff' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <h2><Link to="/" style={{ color: '#fff', fontWeight: 'bold' }}>MERN Blog</Link></h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#fff' }}>Home</Link>
          {user ? (
            <>
              <Link to="/create" style={{ color: '#fff', background: '#00b894', padding: '6px 12px', borderRadius: '4px' }}>Create Post</Link>
              <span style={{ fontStyle: 'italic' }}>Hi, {user.username}</span>
              <button onClick={logout} style={{ background: '#ff7675', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff' }}>Login</Link>
              <Link to="/register" style={{ color: '#fff', border: '1px solid #fff', padding: '4px 10px', borderRadius: '4px' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('blogUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (userData) => {
    localStorage.setItem('blogUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('blogUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}