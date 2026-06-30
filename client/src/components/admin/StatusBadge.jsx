import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  let classes = 'bg-gray-100 text-gray-600';

  if (s === 'published') classes = 'bg-green-100 text-green-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}>
      {status || 'Draft'}
    </span>
  );
}
