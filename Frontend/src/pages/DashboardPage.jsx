import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { FolderKanban, Plus, Search, Users, Calendar, ArrowRight, Layers } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data?.data?.projects || res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setCreating(true);
      const res = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc,
      });
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>
            Projects Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
            Manage your project workspaces and team collaboration
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Total Projects
            </span>
            <FolderKanban size={22} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {projects.length}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Active Member
            </span>
            <Users size={22} color="var(--role-member)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {user?.username || 'Active'}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search projects..."
          style={{ paddingLeft: '2.5rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: '36px', height: '36px' }} />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Layers size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Projects Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {searchQuery ? 'No projects match your search query.' : 'Get started by creating your first project workspace.'}
          </p>
          {!searchQuery && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={18} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProjects.map((proj) => (
            <div
              key={proj._id}
              className="glass-card glass-card-interactive"
              onClick={() => navigate(`/projects/${proj._id}`)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
                    {proj.name}
                  </h3>
                  {proj.role && (
                    <span className={`badge badge-${proj.role.toLowerCase()}`}>
                      {proj.role.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'Active'}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                  Open Workspace <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Website Redesign"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea-field"
              placeholder="Describe the goals and scope of this project..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={4}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, paddingTop: '1rem', border: 'none' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? <div className="spinner" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
