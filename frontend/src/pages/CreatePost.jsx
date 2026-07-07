import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from 'react-simple-wysiwyg';
import axios from 'axios';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const getAISuggestions = async () => {
    if (!title && !content) {
      setAiSuggestions("Enter a title or write some content first so I can analyze it.");
      return;
    }
    setAiLoading(true);
    setAiSuggestions('');
    try {
      const response = await axios.post('/api/ai/suggest', { title, content });
      setAiSuggestions(response.data.suggestions);
    } catch (err) {
      console.error(err);
      setAiSuggestions("Failed to reach the AI coach. Make sure the server is running.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required to publish.");
      return;
    }
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      await axios.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      <div className="lg:col-span-2">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-3">New Entry</p>
        <h1 className="font-display text-4xl text-ink dark:text-ink-dark mb-8">Draft a Story</h1>

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
              placeholder="Give it a headline..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark font-display text-xl focus:outline-none focus:border-accent dark:focus:border-accent-dark transition-colors"
            />
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Cover image</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer font-sans text-sm font-medium text-ink dark:text-ink-dark border border-line dark:border-line-dark px-4 py-2 rounded-sm hover:border-accent dark:hover:border-accent-dark transition-colors">
                Choose file
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <span className="font-sans text-xs text-ink-soft dark:text-ink-dark/60">
                {image ? image.name : "No file chosen"}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink-soft dark:text-ink-dark/70 mb-1.5">Content</label>
            <div className="rounded-sm overflow-hidden border border-line dark:border-line-dark bg-white text-slate-900">
              <Editor
                value={content}
                onChange={(e) => setContent(e.target.value)}
                containerProps={{ style: { minHeight: '320px', border: '0' } }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-ink-dark px-6 py-3 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>

      {/* AI Assistant sidebar */}
      <div className="border border-line dark:border-line-dark rounded-sm p-6 sticky top-28">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-2">Editorial Assistant</p>
        <h2 className="font-display text-xl text-ink dark:text-ink-dark mb-3">AI Notes</h2>
        <p className="font-sans text-xs text-ink-soft dark:text-ink-dark/70 leading-relaxed mb-4">
          A quick read on clarity, structure, and tone before you publish.
        </p>

        <div className="font-serif text-sm text-ink dark:text-ink-dark leading-relaxed border-t border-line dark:border-line-dark pt-4 min-h-[180px] whitespace-pre-line">
          {aiLoading ? "Reading your draft…" : aiSuggestions || "Your notes will appear here."}
        </div>

        <button
          type="button"
          onClick={getAISuggestions}
          disabled={aiLoading}
          className="mt-6 w-full font-sans text-sm font-medium text-ink dark:text-ink-dark border border-ink dark:border-ink-dark px-4 py-2.5 rounded-sm hover:bg-ink hover:text-paper dark:hover:bg-ink-dark dark:hover:text-paper-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          Get Notes
        </button>
      </div>
    </div>
  );
}