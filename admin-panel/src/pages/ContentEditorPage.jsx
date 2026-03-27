import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';
import { fetchProjects, createProject, updateProject, deleteProject } from '../services/api';

const emptyProject = { title: '', description: '', tech: '', liveUrl: '', githubUrl: '', image: '', featured: false, order: 0 };

export default function ContentEditorPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tech: typeof form.tech === 'string' ? form.tech.split(',').map((t) => t.trim()).filter(Boolean) : form.tech };
      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyProject);
      await loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setForm({ ...project, tech: Array.isArray(project.tech) ? project.tech.join(', ') : project.tech });
    setEditingId(project._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      await loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyProject);
  };

  return (
    <>
      <TopNavbar pageTitle="CMS — Project Manager" />

      <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#3D3A34]">Portfolio Projects</h3>
            <p className="text-sm text-[#8B8680]">Add, edit, or remove projects from your portfolio. Changes reflect live.</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyProject); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4754C] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#D4754C]/20 hover:bg-[#c26742] transition-all">
            <Icon icon="lucide:plus" /> Add Project
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
            <h4 className="text-md font-bold mb-6 flex items-center gap-2">
              <Icon icon="lucide:edit-3" className="text-[#D4754C]" />
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Project Title *</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="e.g. E-Commerce Platform" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Tech Stack</label>
                  <input type="text" name="tech" value={form.tech} onChange={handleChange} className="input-field" placeholder="React, Node.js, MongoDB (comma separated)" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows="3" className="input-field" placeholder="Brief description of the project..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Live URL</label>
                  <input type="text" name="liveUrl" value={form.liveUrl} onChange={handleChange} className="input-field" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">GitHub URL</label>
                  <input type="text" name="githubUrl" value={form.githubUrl} onChange={handleChange} className="input-field" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Image URL</label>
                  <input type="text" name="image" value={form.image} onChange={handleChange} className="input-field" placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 rounded border-[#E8DDD1] text-[#D4754C] focus:ring-[#D4754C]" />
                  <span className="text-sm font-medium">Featured Project</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider">Order</label>
                  <input type="number" name="order" value={form.order} onChange={handleChange} className="input-field w-20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DDD1]">
                <button type="button" onClick={handleCancel} className="px-5 py-2 border border-[#E8DDD1] rounded-lg text-sm font-medium text-[#8B8680] hover:text-[#3D3A34] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#D4754C] rounded-lg text-sm font-bold text-white hover:bg-[#c26742] transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-[#F5EDE4] rounded-xl mb-4"></div>
                <div className="h-4 bg-[#F5EDE4] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#F5EDE4] rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-16 text-center">
            <Icon icon="lucide:folder-open" className="text-4xl text-[#E8DDD1] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-[#3D3A34] mb-2">No Projects Yet</h4>
            <p className="text-sm text-[#8B8680] mb-6">Add your first project to showcase on your portfolio.</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-[#D4754C] text-white rounded-xl text-xs font-bold hover:bg-[#c26742] transition-all">
              <Icon icon="lucide:plus" className="inline mr-1" /> Add Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl overflow-hidden card-hover group">
                <div className="h-40 bg-gradient-to-br from-[#D4754C]/20 to-[#D4754C]/5 flex items-center justify-center relative">
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl font-bold text-[#D4754C]/30">{project.title.split(' ').map((w) => w[0]).join('')}</div>
                  )}
                  {project.featured && (
                    <span className="absolute top-3 right-3 bg-[#D4754C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-md font-bold text-[#3D3A34] mb-2">{project.title}</h4>
                  <p className="text-xs text-[#8B8680] mb-4 line-clamp-2">{project.description}</p>
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#F5EDE4] text-[#D4754C] text-[10px] font-bold rounded">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8DDD1]">
                    <div className="flex gap-3">
                      {project.liveUrl && project.liveUrl !== '#' && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#D4754C] hover:underline flex items-center gap-1">
                          <Icon icon="lucide:external-link" /> Live
                        </a>
                      )}
                      {project.githubUrl && project.githubUrl !== '#' && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#8B8680] hover:text-[#3D3A34] flex items-center gap-1">
                          <Icon icon="lucide:github" /> GitHub
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(project)} className="p-1.5 hover:bg-[#F5EDE4] rounded text-[#8B8680] hover:text-[#D4754C]"><Icon icon="lucide:edit-2" /></button>
                      <button onClick={() => handleDelete(project._id)} className="p-1.5 hover:bg-red-50 rounded text-[#8B8680] hover:text-red-500"><Icon icon="lucide:trash-2" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
