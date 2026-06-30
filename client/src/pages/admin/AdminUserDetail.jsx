import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import RoleBadge from '../../components/admin/RoleBadge';
import StatusBadge from '../../components/admin/StatusBadge';
import TimeAgo from '../../components/admin/TimeAgo';
import ConfirmModal from '../../components/admin/ConfirmModal';
import UserAvatar from '../../components/admin/UserAvatar';
import AdminPageLoader from '../../components/admin/AdminPageLoader';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUser, loadUserById, toggleBlockUser, removeUser, removeProject, loading } = useAdminStore();
  const [modalState, setModalState] = useState({ isOpen: false, type: '', targetId: null });

  useEffect(() => {
    if (id) loadUserById(id);
  }, [id, loadUserById]);

  if (loading?.fetchUser && !selectedUser) {
    return <AdminPageLoader message="Loading user details..." maxWidth="max-w-5xl" />;
  }

  if (!selectedUser) {
    return (
      <AdminPageLoader message="User not found." pulse={false} maxWidth="max-w-5xl" />
    );
  }

  const handleConfirm = async () => {
    try {
      if (modalState.type === 'block') {
        await toggleBlockUser(selectedUser.id, !selectedUser.is_blocked);
      } else if (modalState.type === 'remove-user') {
        await removeUser(selectedUser.id);
        navigate('/admin/users');
      } else if (modalState.type === 'remove-project') {
        await removeProject(modalState.targetId);
        loadUserById(id);
      }
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setModalState({ isOpen: false, type: '', targetId: null });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Back to Users
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center space-y-4">
              <UserAvatar src={selectedUser.profile_pic} name={selectedUser.name} size="lg" colorScheme="indigo" />

              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <RoleBadge role={selectedUser.role} />
                {selectedUser.admin_verified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Verified Admin
                  </span>
                )}
              </div>

              {selectedUser.student_id && (
                <div className="text-xs font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 w-full">
                  ID: {selectedUser.student_id}
                </div>
              )}

              <div className="text-xs text-gray-500 w-full pt-2 border-t border-gray-100 flex justify-between">
                <span>Joined:</span>
                <TimeAgo timestamp={selectedUser.created_at} />
              </div>

              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-gray-100 text-center">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{selectedUser.project_count || 0}</div>
                  <div className="text-xs text-gray-400">Projects</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{selectedUser.follower_count || 0}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{selectedUser.following_count || 0}</div>
                  <div className="text-xs text-gray-400">Following</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{selectedUser.total_likes_received || 0}</div>
                  <div className="text-xs text-gray-400">Likes Recv</div>
                </div>
              </div>

              <div className="w-full pt-4 space-y-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, type: 'block' })}
                  className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors border ${
                    selectedUser.is_blocked
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      : 'border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {selectedUser.is_blocked ? 'Unblock Account' : 'Block Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, type: 'remove-user' })}
                  className="w-full py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Recent Projects</h3>
              
              <div className="divide-y divide-gray-100">
                {(!selectedUser.recent_projects || selectedUser.recent_projects.length === 0) ? (
                  <div className="py-12 text-center text-sm text-gray-500">This user has no projects yet.</div>
                ) : (
                  selectedUser.recent_projects.map((p) => (
                    <div key={p.id} className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-4 overflow-hidden">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt={p.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl shrink-0">
                            📁
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="text-base font-semibold text-gray-900 truncate">{p.title}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <StatusBadge status={p.status} />
                            <span className="text-xs text-gray-400">{p.view_count || 0} views</span>
                            <TimeAgo timestamp={p.created_at} />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setModalState({ isOpen: true, type: 'remove-project', targetId: p.id })}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold shrink-0 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.type === 'block' ? (selectedUser.is_blocked ? 'Unblock Account' : 'Block Account') : 'Remove Item'}
          message={
            modalState.type === 'block'
              ? `Are you sure you want to ${selectedUser.is_blocked ? 'unblock' : 'block'} ${selectedUser.name}?`
              : 'Are you sure you want to delete this permanently? This action cannot be undone.'
          }
          confirmLabel={modalState.type === 'block' ? (selectedUser.is_blocked ? 'Unblock' : 'Block') : 'Delete Permanently'}
          confirmVariant={modalState.type === 'block' && !selectedUser.is_blocked ? 'warning' : 'danger'}
          onConfirm={handleConfirm}
          onCancel={() => setModalState({ isOpen: false, type: '', targetId: null })}
        />
      </div>
    </div>
  );
}
