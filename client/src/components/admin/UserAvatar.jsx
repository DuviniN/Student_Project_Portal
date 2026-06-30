/**
 * UserAvatar
 * ----------
 * Renders a user profile picture, falling back to a coloured circle
 * with the user's first initial when no image is available.
 *
 * Props
 *   src         {string}  - Image URL (optional).
 *   name        {string}  - User display name (used for alt text + fallback initial).
 *   size        {string}  - 'xs' | 'sm' | 'md' | 'lg'  (default 'md').
 *   colorScheme {string}  - 'green' | 'indigo'           (default 'green').
 *   className   {string}  - Extra classes forwarded to the root element.
 */

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-2xl',
};

const colorMap = {
  green:  'bg-green-50 text-green-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export default function UserAvatar({
  src,
  name,
  size = 'md',
  colorScheme = 'green',
  className = '',
}) {
  const sizeClass  = sizeMap[size]  || sizeMap.md;
  const colorClass = colorMap[colorScheme] || colorMap.green;
  const initial    = name?.[0]?.toUpperCase() || 'U';
  const shared     = `rounded-full object-cover ${sizeClass} ${className}`;

  if (src) {
    return <img src={src} alt={name || 'User'} className={shared} />;
  }

  return (
    <div className={`${shared} ${colorClass} flex items-center justify-center font-bold shrink-0`}>
      {initial}
    </div>
  );
}
