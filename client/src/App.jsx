import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { FiAlertTriangle } from 'react-icons/fi';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFormPage from './pages/ProjectFormPage';
import DashboardPage from './pages/DashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminAuthPage from './pages/AdminAuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminProjectEdit from './pages/admin/AdminProjectEdit';
import AdminNotifications from './pages/admin/AdminNotifications';

function Layout({ children, hideFooter, hideHeader }) {
  return (
    <>
      {!hideHeader && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

// Redirect logged-in users away from auth pages
function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (user) {
    if (user.role === 'recruiter') return <Navigate to="/projects" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();

    const onExpired = () => {
      useAuthStore.getState().clearUser();
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
      <Routes>
        {/* ── Public routes ──*/}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
        <Route path="/projects/:id" element={<Layout><ProjectDetailPage /></Layout>} />
        <Route path="/profile/:id" element={<Layout><StudentProfilePage /></Layout>} />

        {/* ── Auth routes (redirect to dashboard if already logged in) ─ */}
        <Route path="/auth/login" element={
          <GuestRoute><Layout hideFooter hideHeader><LoginPage /></Layout></GuestRoute>
        } />
        <Route path="/auth/register" element={
          <GuestRoute><Layout hideFooter hideHeader><RegisterPage /></Layout></GuestRoute>
        } />

        {/* ── Admin auth (separate, hidden portal) ──*/}
        <Route path="/admin/auth" element={<AdminAuthPage />} />

        {/*Protected: complete profile (new OAuth students)*/}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <Layout hideFooter><CompleteProfilePage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: student dashboard ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['student']}>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminDashboardPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="users" element={<Navigate to="/admin/dashboard?tab=users" replace />} />
          <Route path="projects" element={<Navigate to="/admin/dashboard?tab=projects" replace />} />
          <Route path="users/:id" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminUserDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="projects/:id/edit" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminProjectEdit /></Layout>
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminNotifications /></Layout>
            </ProtectedRoute>
          } />
        </Route>



        {/* ── Protected: student project management ────────── */}
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute roles={['student']}>
              <Layout><ProjectFormPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/edit"
          element={
            <ProtectedRoute roles={['student']}>
              <Layout><ProjectFormPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: notifications ─── */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout><NotificationsPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* ── Auth error page ───*/}
        <Route
          path="/auth/error"
          element={
            <Layout hideFooter>
              <AuthErrorPage />
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AuthErrorPage() {
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