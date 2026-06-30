import { FiAlertTriangle } from 'react-icons/fi';

/**
 * AuthErrorPage
 * -------------
 * Shown at /auth/error when an OAuth sign-in attempt fails.
 * Reads the `?message=` query param and displays it.
 */
export default function AuthErrorPage() {
  const params = new URLSearchParams(window.location.search);
  const message = params.get('message') || 'Something went wrong during sign in.';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <FiAlertTriangle size={44} className="text-red-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
        <p className="text-gray-500 mb-6">{decodeURIComponent(message)}</p>
        <a
          href="/auth/login"
          className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}
