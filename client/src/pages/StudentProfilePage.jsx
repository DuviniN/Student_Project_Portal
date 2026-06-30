import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiFolder, FiUserPlus, FiUserCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import ProjectCard from '../components/ProjectCard';

export default function StudentProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/projects`),
    ]).then(([profileRes, projectsRes]) => {
      setProfile(profileRes.data.user);
      setFollowing(profileRes.data.user.is_following || false);
      setProjects(projectsRes.data.projects);
    }).catch(() => toast.error('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!user) { toast.error('Sign in to follow users.'); return; }
    try {
      const res = await api.post(`/users/${id}/follow`);
      setFollowing(res.data.following);
      setProfile(prev => ({
        ...prev,
        follower_count: prev.follower_count + (res.data.following ? 1 : -1)
      }));
      toast.success(res.data.message);
    } catch {
      toast.error('Could not update follow.');
    }
  };

  const openFollowModal = async (type) => {
    setModalOpen(true);
    setModalTitle(type === 'followers' ? 'Followers' : 'Following');
    setModalLoading(true);
    try {
      const res = await api.get(`/users/${id}/${type}`);
      setModalUsers(res.data[type]);
    } catch {
      toast.error(`Could not load ${type}.`);
    } finally {
      setModalLoading(false);
    }
  };



  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm"
        >
          {profile.profile_pic ? (
            <img src={profile.profile_pic} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center text-2xl font-bold text-green-700 flex-shrink-0">
              {profile.name?.[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            {profile.student_id && (
              <p className="text-green-600 font-medium text-sm mt-0.5">{profile.student_id}</p>
            )}
            <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FiFolder size={14} /> {profile.project_count} projects
              </span>
              <button 
                onClick={() => openFollowModal('followers')}
                className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
              >
                <FiUsers size={14} /> {profile.follower_count} followers
              </button>
            </div>
          </div>
          {user && user.id !== parseInt(id, 10) && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                following
                  ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
              }`}
            >
              {following ? <><FiUserCheck size={16} /> Following</> : <><FiUserPlus size={16} /> Follow</>}
            </button>
          )}
        </motion.div>

        {/* Projects */}
        <h2 className="text-lg font-bold text-gray-900 mb-6">Projects</h2>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-400">No published projects yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{modalTitle}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : modalUsers.length > 0 ? (
                <div className="space-y-4">
                  {modalUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <Link to={`/profile/${u.id}`} onClick={() => setModalOpen(false)}>
                        {u.profile_pic ? (
                          <img src={u.profile_pic} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            {u.name?.[0]}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${u.id}`} onClick={() => setModalOpen(false)} className="font-semibold text-sm text-gray-900 hover:underline truncate block">
                          {u.name}
                        </Link>
                        <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No users found.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
