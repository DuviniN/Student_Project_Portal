import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShield, FiUnlock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

/* ── Skeleton row ──────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200" /><div className="space-y-1.5"><div className="h-3.5 w-28 bg-gray-200 rounded" /><div className="h-3 w-36 bg-gray-100 rounded" /></div></div></td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-5 w-14 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="flex gap-2"><div className="h-7 w-16 bg-gray-200 rounded-lg" /><div className="h-7 w-16 bg-gray-200 rounded-lg" /></div></td>
    </tr>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50, sort: 'newest' };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Actions ─────────────────────────────────────────────────
  const handleBlock = async (user) => {
    const willBlock = !user.is_blocked;
    if (!confirm(`${willBlock ? 'Block' : 'Unblock'} ${user.name}?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/block`, { blocked: willBlock });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_blocked: willBlock } : u))
      );
      toast.success(`${user.name} has been ${willBlock ? 'blocked' : 'unblocked'}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.name} has been deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

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
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
                     placeholder:text-gray-400 transition-shadow"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 font-semibold">User</th>
              <th className="px-6 py-3.5 font-semibold">Role</th>
              <th className="px-6 py-3.5 font-semibold">Status</th>
              <th className="px-6 py-3.5 font-semibold">Projects</th>
              <th className="px-6 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {users.map((u) => (
                  <motion.tr
                    key={u.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* User cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.profile_pic ? (
                          <img src={u.profile_pic} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center text-sm font-bold">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : u.role === 'recruiter'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.is_blocked
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {u.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    {/* Projects count */}
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {u.project_count || 0}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {u.role !== 'admin' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBlock(u)}
                            title={u.is_blocked ? 'Unblock' : 'Block'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              u.is_blocked
                                ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-100'
                                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100'
                            }`}
                          >
                            {u.is_blocked ? <FiUnlock size={13} /> : <FiShield size={13} />}
                            {u.is_blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            title="Delete"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                       text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                          >
                            <FiTrash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
