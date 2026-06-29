import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function Layout({ children, hideFooter }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
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
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
        <Route path="/projects/:id" element={<Layout><ProjectDetailPage /></Layout>} />
        <Route path="/profile/:id" element={<Layout><StudentProfilePage /></Layout>} />
        <Route path="/students" element={<Layout><ProjectsPage /></Layout>} />
        <Route path="/auth/login" element={<Layout hideFooter><LoginPage /></Layout>} />
        <Route path="/auth/register" element={<Layout hideFooter><RegisterPage /></Layout>} />

        {/* Complete profile after OAuth */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <Layout hideFooter><CompleteProfilePage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected student routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
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
            <ProtectedRoute roles={['student', 'admin']}>
              <Layout><ProjectFormPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout><NotificationsPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin hidden portal */}
        <Route path="/admin/auth" element={<AdminAuthPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Auth error */}
        <Route path="/auth/error" element={
          <Layout hideFooter>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <FiAlertTriangle size={44} className="text-red-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
                <p className="text-gray-500 mb-6">Something went wrong during sign in.</p>
                <a href="/auth/login" className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
                  Try Again
                </a>
              </div>
            </div>
          </Layout>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
