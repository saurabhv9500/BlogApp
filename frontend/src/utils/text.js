// Small text helpers shared between Home and PostDetails.
// Post content is stored as rich-text HTML, so anywhere we need plain text
// (card excerpts, read-time estimates) we strip tags first.

export function stripHtml(html = '') {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

export function excerpt(html, maxLength = 140) {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

// Simple 200wpm estimate, floored at 1 minute so short posts don't show "0 min read".
export function readTime(html) {
  const words = stripHtml(html).split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${String(minutes).padStart(2, '0')} min read`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

// Deterministic color pick for initials-avatar fallback, so the same
// username always gets the same background tint.
const PALETTE = ['#3f8f6f', '#a9822c', '#6b7fd7', '#c4635a', '#4b8fa0'];
export function colorForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name = '') {
  return name.trim().slice(0, 2).toUpperCase();
}