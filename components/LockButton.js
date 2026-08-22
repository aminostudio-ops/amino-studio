'use client';

export default function LockButton() {
  async function handleClick() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <button className="pill-link" onClick={handleClick} type="button">
      Lock shop
    </button>
  );
}
