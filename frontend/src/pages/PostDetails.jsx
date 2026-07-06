import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this blog post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting post');
      }
    }
  };

  if (!post) return <h2 style={{ textAlign: 'center', marginTop: '5px' }}>Loading Blog Content...</h2>;

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '20px' }}>
      <h1>{post.title}</h1>
      <p style={{ color: '#777', margin: '10px 0 20px 0' }}>Published by: <strong>{post.author?.username}</strong></p>
      
      {post.image && (
        <img src={`http://localhost:5000${post.image}`} alt={post.title} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} />
      )}

      <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ lineHeight: '1.8', fontSize: '1.1rem' }} />

      {user && user._id === post.author?._id && (
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
          <Link to={`/edit/${post._id}`} style={{ background: '#f1c40f', color: '#fff', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold' }}>Edit Post</Link>
          <button onClick={handleDelete} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Delete Post</button>
        </div>
      )}
    </div>
  );
}