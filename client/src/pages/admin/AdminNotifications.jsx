import React, { useEffect } from 'react';
import useAdminStore from '../../store/adminStore';
import TimeAgo from '../../components/admin/TimeAgo';

export default function AdminNotifications() {
  const { notifications, unreadCount, loadNotifications, markRead, markAllRead, loading } = useAdminStore();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const isLoading = loading?.fetchNotifications;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${unreadCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
              {unreadCount} unread
            </span>
          </div>

          <button
            type="button"
            disabled={unreadCount === 0 || isLoading}
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No notifications found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 md:p-6 flex items-center justify-between gap-4 transition-colors ${!n.is_read ? 'bg-indigo-50/40' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start gap-4 overflow-hidden">
                    {n.actor_pic ? (
                      <img src={n.actor_pic} alt={n.actor_name || 'Actor'} className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        {n.actor_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <TimeAgo timestamp={n.created_at} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!n.is_read ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span>
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm transition-colors"
                        >
                          Mark read
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Read</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
