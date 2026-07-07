import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { colorForName, initials } from '../utils/text';

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.put('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Merge the new avatar into the existing auth context user object
      login({ ...user, avatar: res.data.user.avatar });
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update avatar.');
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = preview || (user?.avatar ? `http://localhost:5000${user.avatar}` : null);

  return (
    <div className="max-w-md mx-auto">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-3">Account</p>
      <h1 className="font-display text-4xl text-ink dark:text-ink-dark mb-8">Your Profile</h1>

      <div className="border border-line dark:border-line-dark rounded-xl p-8 flex flex-col items-center">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt={user?.username}
            className="w-28 h-28 rounded-full object-cover mb-6"
          />
        ) : (
          <span
            className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-semibold text-white mb-6"
            style={{ backgroundColor: colorForName(user?.username) }}
          >
            {initials(user?.username || '?')}
          </span>
        )}

        <p className="font-display text-xl text-ink dark:text-ink-dark mb-1">{user?.username}</p>
        <p className="font-sans text-sm text-ink-soft dark:text-ink-soft-dark mb-8">Signed in</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <label className="cursor-pointer font-sans text-sm font-medium text-ink dark:text-ink-dark border border-line dark:border-line-dark px-4 py-2.5 rounded-sm hover:border-accent dark:hover:border-accent-dark transition-colors">
            Choose a new photo
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <button
              type="submit"
              disabled={saving}
              className="w-full font-sans font-medium text-paper dark:text-paper-dark bg-ink dark:bg-accent-dark px-6 py-3 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save photo'}
            </button>
          )}

          {error && <p className="font-sans text-sm text-red-700 dark:text-red-400">{error}</p>}
          {success && <p className="font-sans text-sm text-accent dark:text-accent-dark">Avatar updated.</p>}
        </form>
      </div>
    </div>
  );
}