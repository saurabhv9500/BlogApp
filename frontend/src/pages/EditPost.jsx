import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor, EditorProvider } from 'react-simple-wysiwyg';

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags((res.data.tags || []).join(', '));
      } catch (err) {
        console.error(err);
        setError('Could not load this post.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', tags);
    if (image) formData.append('image', image);

    try {
      // FIX: removed the Authorization: Bearer ${user.token} header — this app
      // authenticates via the session cookie (axios.defaults.withCredentials
      // is set globally), so `user.token` never existed and the header did
      // nothing but sit there unused.
      await axios.put(`/api/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="font-serif text-ink-soft dark:text-ink-dark/70 text-center py-20">Loading draft…</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-3">Revise</p>
      <h1 className="font-display text-4xl text-ink dark:text-ink-dark mb-8">Edit Entry</h1>

      {error && (
        <p className="font-sans text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded-sm px-4 py-2 mb-6">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-display text-xl focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
          />
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Replace cover image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="font-sans text-sm text-ink-soft dark:text-ink-dark/70"
          />
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Tags</label>
          <input
            type="text"
            placeholder="e.g. Machine, AGI, Life"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-sans text-sm focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
          />
          <p className="font-sans text-xs text-ink-soft dark:text-ink-dark/50 mt-1.5">Comma-separated.</p>
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Content</label>
          <div className="rounded-sm overflow-hidden border border-line dark:border-line-dark bg-white text-slate-900">
            <EditorProvider>
              <Editor
                value={content}
                onChange={(e) => setContent(e.target.value)}
                containerProps={{ style: { minHeight: '280px', border: '0' } }}
              />
            </EditorProvider>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-ink-dark px-6 py-3 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}