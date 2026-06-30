import { create } from 'zustand';
import * as adminApi from '../services/adminApi';

const useAdminStore = create((set, get) => ({
  stats: null,
  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersTotalPages: 1,
  usersFilters: { search: '', role: '', sort: 'newest' },
  
  projects: [],
  projectsTotal: 0,
  projectsPage: 1,
  projectsTotalPages: 1,
  projectsFilters: { search: '', status: 'all', sort: 'newest' },
  
  selectedUser: null,
  selectedProject: null,
  
  notifications: [],
  unreadCount: 0,
  
  searchQuery: '',
  searchResults: { users: [], projects: [] },
  searchOpen: false,
  
  loading: {},
  errors: {},

  loadStats: async () => {
    set((state) => ({ loading: { ...state.loading, fetchStats: true }, errors: { ...state.errors, fetchStats: null } }));
    try {
      const data = await adminApi.fetchAdminStats();
      set({ stats: data.stats || data });
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, fetchStats: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, fetchStats: false } }));
    }
  },

  loadUsers: async (pageArg) => {
    const page = (typeof pageArg === 'object' ? pageArg.page : pageArg) || get().usersPage || 1;
    const limit = (typeof pageArg === 'object' ? pageArg.limit : null) || 20;
    const customSort = (typeof pageArg === 'object' ? pageArg.sort : null);
    set((state) => ({ loading: { ...state.loading, fetchUsers: true }, errors: { ...state.errors, fetchUsers: null } }));
    try {
      const { usersFilters } = get();
      const params = { page, limit, sort: customSort || usersFilters.sort };
      if (usersFilters.search) params.search = usersFilters.search;
      if (usersFilters.role && usersFilters.role !== 'All') params.role = usersFilters.role.toLowerCase();
      
      const data = await adminApi.fetchAdminUsers(params);
      set({
        users: data.users || [],
        usersTotal: data.total || 0,
        usersPage: data.page || page,
        usersTotalPages: data.totalPages || 1
      });
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, fetchUsers: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, fetchUsers: false } }));
    }
  },

  setUsersFilter: (key, value) => {
    set((state) => ({
      usersFilters: { ...state.usersFilters, [key]: value },
      usersPage: 1
    }));
    get().loadUsers(1);
  },

  loadUserById: async (id) => {
    set((state) => ({ loading: { ...state.loading, fetchUser: true }, errors: { ...state.errors, fetchUser: null } }));
    try {
      const data = await adminApi.fetchAdminUserById(id);
      set({ selectedUser: data.user || data });
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, fetchUser: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, fetchUser: false } }));
    }
  },

  toggleBlockUser: async (id, blocked) => {
    set((state) => ({ loading: { ...state.loading, blockUser: true } }));
    try {
      await adminApi.blockAdminUser(id, blocked);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, is_blocked: blocked } : u)),
        selectedUser: state.selectedUser?.id === id ? { ...state.selectedUser, is_blocked: blocked } : state.selectedUser
      }));
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, blockUser: err.message } }));
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, blockUser: false } }));
    }
  },

  removeUser: async (id) => {
    set((state) => ({ loading: { ...state.loading, removeUser: true } }));
    try {
      await adminApi.deleteAdminUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        usersTotal: Math.max(0, state.usersTotal - 1)
      }));
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, removeUser: err.message } }));
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, removeUser: false } }));
    }
  },

  loadProjects: async (pageArg) => {
    const page = (typeof pageArg === 'object' ? pageArg.page : pageArg) || get().projectsPage || 1;
    const limit = (typeof pageArg === 'object' ? pageArg.limit : null) || 20;
    const customSort = (typeof pageArg === 'object' ? pageArg.sort : null);
    set((state) => ({ loading: { ...state.loading, fetchProjects: true }, errors: { ...state.errors, fetchProjects: null } }));
    try {
      const { projectsFilters } = get();
      const params = { page, limit, sort: customSort || projectsFilters.sort };
      if (projectsFilters.search) params.search = projectsFilters.search;
      if (projectsFilters.status && projectsFilters.status !== 'All' && projectsFilters.status !== 'all') {
        params.status = projectsFilters.status.toLowerCase();
      }
      
      const data = await adminApi.fetchAdminProjects(params);
      set({
        projects: data.projects || [],
        projectsTotal: data.total || 0,
        projectsPage: data.page || page,
        projectsTotalPages: data.totalPages || 1
      });
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, fetchProjects: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, fetchProjects: false } }));
    }
  },

  setProjectsFilter: (key, value) => {
    set((state) => ({
      projectsFilters: { ...state.projectsFilters, [key]: value },
      projectsPage: 1
    }));
    get().loadProjects(1);
  },

  removeProject: async (id) => {
    set((state) => ({ loading: { ...state.loading, removeProject: true } }));
    try {
      await adminApi.deleteAdminProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        projectsTotal: Math.max(0, state.projectsTotal - 1),
        selectedUser: state.selectedUser ? {
          ...state.selectedUser,
          recent_projects: (state.selectedUser.recent_projects || []).filter((p) => p.id !== id)
        } : null
      }));
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, removeProject: err.message } }));
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, removeProject: false } }));
    }
  },

  updateProject: async (id, data) => {
    set((state) => ({ loading: { ...state.loading, updateProject: true } }));
    try {
      const resData = await adminApi.updateAdminProject(id, data);
      const updated = resData.project || resData;
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p))
      }));
      return updated;
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, updateProject: err.message } }));
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, updateProject: false } }));
    }
  },

  addProject: async (formData) => {
    set((state) => ({ loading: { ...state.loading, addProject: true } }));
    try {
      const resData = await adminApi.addAdminProject(formData);
      const created = resData.project || resData;
      set((state) => ({
        projects: [created, ...state.projects],
        projectsTotal: state.projectsTotal + 1
      }));
      return created;
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, addProject: err.message } }));
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, addProject: false } }));
    }
  },

  loadNotifications: async () => {
    set((state) => ({ loading: { ...state.loading, fetchNotifications: true } }));
    try {
      const data = await adminApi.fetchAdminNotifications();
      const list = data.notifications || [];
      const unread = list.filter((n) => !n.is_read).length;
      set({ notifications: list, unreadCount: unread });
    } catch (err) {
      set((state) => ({ errors: { ...state.errors, fetchNotifications: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, fetchNotifications: false } }));
    }
  },

  markRead: async (id) => {
    try {
      await adminApi.markAdminNotificationRead(id);
      set((state) => {
        const list = state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
        const unread = list.filter((n) => !n.is_read).length;
        return { notifications: list, unreadCount: unread };
      });
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  },

  markAllRead: async () => {
    try {
      await adminApi.markAllAdminNotificationsRead();
      set((state) => {
        const list = state.notifications.map((n) => ({ ...n, is_read: true }));
        return { notifications: list, unreadCount: 0 };
      });
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  },

  runSearch: async (q) => {
    set({ searchQuery: q });
    if (!q || q.length < 2) {
      set({ searchResults: { users: [], projects: [] }, searchOpen: false });
      return;
    }
    set((state) => ({ loading: { ...state.loading, search: true } }));
    try {
      const data = await adminApi.fetchAdminSearch(q);
      set({ searchResults: data.searchResults || data || { users: [], projects: [] }, searchOpen: true });
    } catch (err) {
      console.error('Search error', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, search: false } }));
    }
  },

  setSearchOpen: (bool) => set({ searchOpen: bool })
}));

export default useAdminStore;
