import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import useAdminStore from '../../store/adminStore';
import RoleBadge from './RoleBadge';
import UserAvatar from './UserAvatar';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { searchQuery, searchResults, searchOpen, runSearch, setSearchOpen } = useAdminStore();
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchOpen]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!val || val.trim().length < 2) {
      setSearchOpen(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      runSearch(val);
    }, 350);
  };

  const handleSelectUser = (id) => {
    setSearchOpen(false);
    navigate(`/admin/users/${id}`);
  };

  const handleSelectProject = (id) => {
    setSearchOpen(false);
    navigate(`/admin/projects/${id}/edit`);
  };

  const hasUsers = searchResults?.users?.length > 0;
  const hasProjects = searchResults?.projects?.length > 0;

  return (
    <div ref={containerRef} className="relative w-64">
      <div className="relative flex items-center">
        <FiSearch className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          onFocus={() => {
            if (inputValue.trim().length >= 2) setSearchOpen(true);
          }}
          placeholder="Search portal..."
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {searchOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
          {hasUsers && (
            <div className="px-3 py-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Users</div>
              <div className="space-y-1">
                {searchResults.users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <UserAvatar src={u.profile_pic} name={u.name} size="xs" colorScheme="indigo" />
                      <span className="text-sm font-medium text-gray-800 truncate">{u.name}</span>
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasProjects && (
            <div className="px-3 py-1 border-t border-gray-100 mt-1 pt-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Projects</div>
              <div className="space-y-1">
                {searchResults.projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.title} className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">
                        📁
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-gray-800 truncate">{p.title}</div>
                      <div className="text-xs text-gray-500 truncate">by {p.author_name || 'Unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasUsers && !hasProjects && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}
