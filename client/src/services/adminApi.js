import api from './api';

export const fetchAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const fetchAdminUsers = async (params) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const fetchAdminUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const blockAdminUser = async (id, blocked) => {
  const res = await api.patch(`/admin/users/${id}/block`, { blocked });
  return res.data;
};

export const deleteAdminUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const fetchAdminProjects = async (params) => {
  const res = await api.get('/admin/projects', { params });
  return res.data;
};

export const addAdminProject = async (formData) => {
  const res = await api.post('/admin/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateAdminProject = async (id, data) => {
  const res = await api.patch(`/admin/projects/${id}`, data);
  return res.data;
};

export const deleteAdminProject = async (id) => {
  const res = await api.delete(`/admin/projects/${id}`);
  return res.data;
};

export const fetchAdminSearch = async (q) => {
  const res = await api.get('/admin/search', { params: { q } });
  return res.data;
};

export const fetchAdminNotifications = async () => {
  const res = await api.get('/admin/notifications');
  return res.data;
};

export const markAdminNotificationRead = async (id) => {
  const res = await api.patch(`/admin/notifications/${id}/read`);
  return res.data;
};

export const markAllAdminNotificationsRead = async () => {
  const res = await api.patch('/admin/notifications/read-all');
  return res.data;
};
