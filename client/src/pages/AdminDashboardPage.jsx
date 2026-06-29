import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/projects', { params: { status: 'all', limit: 50 } })
        .then(res => setProjects(res.data.projects))
        .catch(() => toast.error('Could not load projects'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted.');
    } catch {
      toast.error('Could not delete project.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}
        </p>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Projects (Including Drafts)</h2>
          
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading projects...</div>
          ) : projects.length > 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Author</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {p.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.author_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link to={`/projects/${p.id}`} className="text-gray-400 hover:text-green-600 transition-colors">
                            <FiEye size={16} />
                          </Link>
                          <Link to={`/projects/${p.id}/edit`} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <FiEdit2 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FiFileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p>No projects found in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
