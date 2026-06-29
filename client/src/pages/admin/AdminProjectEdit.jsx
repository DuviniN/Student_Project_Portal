import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAdminStore from '../../store/adminStore';
import api from '../../services/api';
import TagInput from '../../components/admin/TagInput';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, removeProject } = useAdminStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    demo_url: '',
    tech_stack: [],
    tags: [],
    status: 'published'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProj = async () => {
      setLoading(true);
      try {
        // Try finding in store first
        const existing = projects.find((p) => String(p.id) === String(id));
        if (existing) {
          parseAndSet(existing);
          setLoading(false);
          return;
        }
        // Fallback to API
        const res = await api.get(`/projects/${id}`);
        if (isMounted && res.data?.project) {
          parseAndSet(res.data.project);
        }
      } catch (err) {
        toast.error('Failed to load project details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const parseAndSet = (p) => {
      let ts = [];
      let tg = [];
      try {
        ts = Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack || '[]');
      } catch {
        ts = typeof p.tech_stack === 'string' ? p.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
      try {
        tg = Array.isArray(p.tags) ? p.tags : (Array.isArray(p.tag_list) ? p.tag_list : JSON.parse(p.tags || '[]'));
      } catch {
        tg = typeof p.tags === 'string' ? p.tags.split(',').map(s => s.trim()).filter(Boolean) : [];
      }

      setFormData({
        title: p.title || '',
        description: p.description || '',
        github_url: p.github_url || '',
        demo_url: p.demo_url || '',
        tech_stack: ts,
        tags: tg,
        status: p.status || 'published'
      });
    };

    fetchProj();
    return () => { isMounted = false; };
  }, [id, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required.');
    setSubmitting(true);
    try {
      await updateProject(id, formData);
      toast.success('Project updated successfully.');
      navigate(-1);
    } catch (err) {
      toast.error(err.message || 'Failed to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeProject(id);
      toast.success('Project removed successfully.');
      navigate('/admin/projects');
    } catch (err) {
      toast.error(err.message || 'Failed to remove project.');
    } finally {
      setModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 p-8 text-center text-gray-500 animate-pulse">Loading project data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
          >
            Remove Project
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Demo URL</label>
                <input
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tech Stack</label>
              <TagInput
                value={formData.tech_stack}
                onChange={(val) => setFormData({ ...formData, tech_stack: val })}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tags</label>
              <TagInput
                value={formData.tags}
                onChange={(val) => setFormData({ ...formData, tags: val })}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden (Hidden from public)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <ConfirmModal
          isOpen={modalOpen}
          title="Remove Project"
          message={`Are you sure you want to delete "${formData.title}"? This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          confirmVariant="danger"
          onConfirm={handleRemove}
          onCancel={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}
