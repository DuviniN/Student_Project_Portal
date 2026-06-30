/**
 * AdminPageLoader
 * ---------------
 * Reusable full-page loading / not-found placeholder for admin pages.
 *
 * Props
 *   message  {string}  - Text to display (required).
 *   pulse    {boolean} - When true adds animate-pulse (default true).
 *   maxWidth {string}  - Tailwind max-width class (default 'max-w-5xl').
 */
export default function AdminPageLoader({
  message,
  pulse = true,
  maxWidth = 'max-w-5xl',
}) {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div
        className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 p-8 text-center text-gray-500 ${
          pulse ? 'animate-pulse' : ''
        }`}
      >
        {message}
      </div>
    </div>
  );
}
