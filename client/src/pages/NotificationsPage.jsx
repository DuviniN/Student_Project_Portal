import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setNotifications(res.data.notifications))
      .catch(() => toast.error('Could not load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const handleFollow = async (actorId, index) => {
    try {
      const res = await api.post(`/users/${actorId}/follow`);
      setNotifications((prev) => {
        const next = [...prev];
        next[index].is_following = res.data.following;
        return next;
      });
      toast.success(res.data.message);
    } catch {
      toast.error('Could not update follow.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <FiCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  !n.is_read ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'
                }`}
              >
                {n.actor_pic ? (
                  <Link to={`/profile/${n.actor_id}`} className="flex-shrink-0">
                    <img src={n.actor_pic} alt={n.actor_name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  </Link>
                ) : (
                  <Link to={`/profile/${n.actor_id}`} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <FiBell size={16} className="text-gray-500" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {n.type === 'follow' && (
                  <button
                    onClick={() => handleFollow(n.actor_id, i)}
                    className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                      n.is_following 
                        ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {n.is_following ? <><FiUserCheck size={14}/> Following</> : <><FiUserPlus size={14}/> Follow Back</>}
                  </button>
                )}

                {!n.is_read && (
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiBell size={40} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium">No notifications yet</h3>
          </div>
        )}
      </div>
    </div>
  );
}
