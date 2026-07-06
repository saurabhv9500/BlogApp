import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Editor, EditorProvider } from 'react-simple-wysiwyg';
import { AuthContext } from '../App';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create a post.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing post saving configuration.');
    }
  };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="Post Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '12px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' }} 
        />
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cover Image File</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Content Structure</label>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <EditorProvider>
              <Editor value={content} onChange={(e) => setContent(e.target.value)} containerProps={{ style: { minHeight: '250px' } }} />
            </EditorProvider>
          </div>
        </div>
        <button type="submit" style={{ background: '#6c5ce7', color: '#fff', padding: '12px', fontSize: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Publish Post</button>
      </form>
    </div>
  );
}