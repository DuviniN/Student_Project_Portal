import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  demo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
});

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'published' },
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/projects/${id}`)
      .then((res) => {
        const p = res.data.project;
        reset({
          title: p.title,
          description: p.description,
          github_url: p.github_url || '',
          demo_url: p.demo_url || '',
          status: p.status,
        });
        setTechStack(p.tech_stack || []);
        setTags(p.tags || []);
        if (p.thumbnail_url) setPreview(p.thumbnail_url);
      })
      .catch(() => toast.error('Could not load project.'))
      .finally(() => setFetching(false));
  }, [id, isEdit, reset]);

  const addTechStack = () => {
    const val = techInput.trim();
    if (val && !techStack.includes(val)) setTechStack((prev) => [...prev, val]);
    setTechInput('');
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
    setTagInput('');
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v || ''));
    formData.append('tech_stack', JSON.stringify(techStack));
    formData.append('tags', JSON.stringify(tags));
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      if (isEdit) {
        await api.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Project updated!');
      } else {
        await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Project created!');
      }
      if (user?.role === 'admin') {
        navigate('/admin/dashboard?tab=projects');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {isEdit ? 'Edit Project' : 'Add New Project'}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Thumbnail</label>
              <div
                className="relative h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors overflow-hidden"
                onClick={() => document.getElementById('thumbnail-input').click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <FiUpload size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-300 mt-1">Max 5MB</p>
                  </div>
                )}
              </div>
              <input id="thumbnail-input" type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Title *</label>
              <input
                {...register('title')}
                placeholder="My Awesome Project"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your project..."
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub URL</label>
                <input
                  {...register('github_url')}
                  placeholder="https://github.com/..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.github_url ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.github_url && <p className="mt-1 text-xs text-red-600">{errors.github_url.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Demo URL</label>
                <input
                  {...register('demo_url')}
                  placeholder="https://..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.demo_url ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.demo_url && <p className="mt-1 text-xs text-red-600">{errors.demo_url.message}</p>}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tech Stack</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                  placeholder="e.g. React, Node.js"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="button" onClick={addTechStack} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">Add</button>
              </div>
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((t) => (
                    <span key={t} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                      {t}
                      <button type="button" onClick={() => setTechStack((prev) => prev.filter((x) => x !== t))}>
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="e.g. Machine Learning, Web"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="button" onClick={addTag} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">Add</button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                      {tag}
                      <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== tag))}>
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Publish Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
