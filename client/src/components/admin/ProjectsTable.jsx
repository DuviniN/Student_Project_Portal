import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiTrash2, FiExternalLink, FiCode, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';

/* ── Skeleton row ──────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-gray-200" /><div className="space-y-1.5"><div className="h-3.5 w-32 bg-gray-200 rounded" /><div className="h-3 w-48 bg-gray-100 rounded" /></div></div></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="flex gap-2"><div className="h-7 w-7 bg-gray-200 rounded-lg" /><div className="h-7 w-16 bg-gray-200 rounded-lg" /></div></td>
    </tr>
  );
}

/* ── Project thumbnail helper ──────────────────────────────────── */
function ProjectThumbnail({ src, title }) {
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className="w-11 h-11 rounded-xl object-cover border border-gray-100"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <FiCode size={18} className="text-green-400" />
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function ProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50, sort: 'newest' };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/admin/projects', { params });
      setProjects(res.data.projects || []);
    } catch {
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Delete
  const handleDelete = async (project) => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/projects/${project.id}`);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast.success(`"${project.title}" deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };


  // ── Column definitions ───────────────────────────────────────
  const columns = [
    {
      key: 'project',
      label: 'Project',
      render: (p) => (
        <div className="flex items-center gap-3">
          <ProjectThumbnail src={p.thumbnail_url} title={p.title} />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate max-w-[220px]">
              {p.title}
            </div>
            <div className="text-xs text-gray-400 truncate max-w-[220px]">
              {p.description || 'No description'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      render: (p) => (
        <span className="text-sm text-gray-600">
          {p.author_name || p.author?.name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${p.id}`}
            title="View project"
            className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            <FiExternalLink size={15} />
          </Link>
          <Link
            to={`/admin/projects/${p.id}/edit`}
            title="Edit project"
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <FiEdit2 size={15} />
          </Link>

          <button
            onClick={() => handleDelete(p)}
            title="Delete"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
          >
            <FiTrash2 size={13} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
                     placeholder:text-gray-400 transition-shadow"
        />
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        emptyMessage="No projects found."
        animated
        SkeletonRow={SkeletonRow}
      />
    </motion.div>
  );
}
