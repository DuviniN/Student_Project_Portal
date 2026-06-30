import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiUnlock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import DataTable from './DataTable';
import RoleBadge from './RoleBadge';
import UserAvatar from './UserAvatar';

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
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 400);

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

  // ── Column definitions ───────────────────────────────────────
  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={u.profile_pic} name={u.name} size="sm" colorScheme="green" />
          <div>
            <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
            <div className="text-xs text-gray-400">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          u.is_blocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {u.is_blocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'project_count',
      label: 'Projects',
      render: (u) => (
        <span className="text-gray-600 font-medium">{u.project_count || 0}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) =>
        u.role !== 'admin' ? (
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
        ) : null,
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
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
                     placeholder:text-gray-400 transition-shadow"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found."
        animated
        SkeletonRow={SkeletonRow}
      />
    </motion.div>
  );
}
