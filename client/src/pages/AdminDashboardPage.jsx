import React from 'react';
import useAuthStore from '../store/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}
        </p>
        <div className="mt-10 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-gray-600">Admin features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
