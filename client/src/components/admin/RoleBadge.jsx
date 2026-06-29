import React from 'react';

export default function RoleBadge({ role }) {
  const r = (role || '').toLowerCase();
  let classes = 'bg-gray-100 text-gray-700';

  if (r === 'student') classes = 'bg-blue-100 text-blue-700';
  if (r === 'recruiter') classes = 'bg-purple-100 text-purple-700';
  if (r === 'admin') classes = 'bg-red-100 text-red-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}>
      {role || 'Unknown'}
    </span>
  );
}
