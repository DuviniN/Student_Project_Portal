import React from 'react';

export default function TimeAgo({ timestamp }) {
  if (!timestamp) return <span className="text-gray-400">—</span>;

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return <span className="text-gray-400">—</span>;

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  let timeString = '';
  if (diffInSeconds < 60) {
    timeString = 'Just now';
  } else if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    timeString = `${mins}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    timeString = `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    timeString = `${days}d ago`;
  } else {
    timeString = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  return (
    <span title={date.toLocaleString()} className="text-xs text-gray-500 font-medium">
      {timeString}
    </span>
  );
}
