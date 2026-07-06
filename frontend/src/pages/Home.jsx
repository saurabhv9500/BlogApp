import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h1 style={{ margin: '20px 0', textAlign: 'center' }}>Latest Blog Posts</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginTop: '20px' }}>
        {posts.map((post) => (
          <div key={post._id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            {post.image && (
              <img src={`http://localhost:5000${post.image}`} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#777', margin: '5px 0 15px 0' }}>By {post.author?.username || 'Unknown'}</p>
              </div>
              <Link to={`/posts/${post._id}`} style={{ color: '#6c5ce7', fontWeight: 'bold', alignSelf: 'flex-start' }}>Read More →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}   