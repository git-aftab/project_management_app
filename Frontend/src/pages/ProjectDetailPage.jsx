import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import Modal from '../components/Modal';
import {
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  ArrowLeft,
  Calendar
} from 'lucide-react';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'members' | 'notes'

  // Task Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);

  // Notes Modal
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [creatingNote, setCreatingNote] = useState(false);

  // Kanban Drag-and-Drop
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const fetchProjectData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [projRes, tasksRes, membersRes, notesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/${projectId}`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/notes/${projectId}`),
      ]);

      setProject(projRes.data?.data);
      setTasks(tasksRes.data?.data || []);
      setMembers(membersRes.data?.data || []);
      setNotes(notesRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project workspace data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchTasksOnly = async () => {
    try {
      const tasksRes = await api.get(`/tasks/${projectId}`);
      setTasks(tasksRes.data?.data || []);
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Kanban DnD: drop a task card into a new status column
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${projectId}/t/${taskId}`, { status: newStatus });
    } catch (err) {
      setError('Failed to move task. Please try again.');
      fetchTasksOnly(); // revert on failure
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setCreatingTask(true);
      await api.post(`/tasks/${projectId}`, {
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        assignedTo: newTaskAssignee || null,
      });

      setIsCreateTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskStatus('todo');
      setNewTaskAssignee('');
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  // Add Member Handler
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberIdentifier.trim()) return;

    try {
      setAddingMember(true);
      await api.post(`/projects/${projectId}/members`, {
        username: memberIdentifier,
        email: memberIdentifier,
        role: memberRole,
      });

      setIsAddMemberOpen(false);
      setMemberIdentifier('');
      setMemberRole('member');
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add project member');
    } finally {
      setAddingMember(false);
    }
  };

  // Remove Member Handler
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Update Member Role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/projects/${projectId}/members/${userId}`, { newRole: newRole.toLowerCase() });
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member role');
    }
  };

  // Create Note Handler
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    try {
      setCreatingNote(true);
      await api.post(`/notes/${projectId}`, {
        title: newNoteTitle,
        content: newNoteContent,
      });

      setIsCreateNoteOpen(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create note');
    } finally {
      setCreatingNote(false);
    }
  };

  // Delete Note Handler
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${projectId}/n/${noteId}`);
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  // Delete Project Handler
  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this entire project and all associated tasks/notes?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Top Back Link */}
      <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      {project && (
        <>
          {/* Project Header */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', color: 'var(--text-primary)', margin: 0, marginBottom: '0.4rem' }}>
                  {project.name}
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', maxWidth: '800px' }}>
                  {project.description || 'No description available for this project.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={handleDeleteProject} className="btn btn-danger btn-sm">
                  <Trash2 size={16} /> Delete Project
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`btn btn-ghost ${activeTab === 'tasks' ? 'active' : ''}`}
              style={{
                borderRadius: 0,
                borderBottom: activeTab === 'tasks' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'tasks' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'tasks' ? '600' : '500',
                paddingBottom: '0.75rem'
              }}
            >
              <CheckSquare size={18} /> Tasks ({tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`btn btn-ghost ${activeTab === 'members' ? 'active' : ''}`}
              style={{
                borderRadius: 0,
                borderBottom: activeTab === 'members' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'members' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'members' ? '600' : '500',
                paddingBottom: '0.75rem'
              }}
            >
              <Users size={18} /> Team Members ({members.length})
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`btn btn-ghost ${activeTab === 'notes' ? 'active' : ''}`}
              style={{
                borderRadius: 0,
                borderBottom: activeTab === 'notes' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'notes' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'notes' ? '600' : '500',
                paddingBottom: '0.75rem'
              }}
            >
              <FileText size={18} /> Notes ({notes.length})
            </button>
          </div>

          {/* TAB 1: TASKS KANBAN BOARD */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button onClick={() => setIsCreateTaskOpen(true)} className="btn btn-primary">
                  <Plus size={18} /> Create Task
                </button>
              </div>

              <div className="kanban-board">
                {/* Column 1: TODO */}
                <div
                  className="kanban-column"
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn('todo'); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, 'todo')}
                  style={{
                    outline: dragOverColumn === 'todo' ? '2px dashed var(--accent-primary)' : 'none',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'outline 0.15s ease',
                  }}
                >
                  <div className="kanban-header">
                    <span style={{ fontWeight: '600', color: 'var(--status-todo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-todo)' }} />
                      Todo
                    </span>
                    <span className="badge badge-todo">
                      {tasks.filter((t) => !t.status || t.status === 'todo').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '80px' }}>
                    {tasks.filter((t) => !t.status || t.status === 'todo').map((task) => (
                      <TaskCard key={task._id} task={task} onClick={setSelectedTask} />
                    ))}
                  </div>
                </div>

                {/* Column 2: IN_PROGRESS */}
                <div
                  className="kanban-column"
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn('in_progress'); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, 'in_progress')}
                  style={{
                    outline: dragOverColumn === 'in_progress' ? '2px dashed var(--accent-primary)' : 'none',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'outline 0.15s ease',
                  }}
                >
                  <div className="kanban-header">
                    <span style={{ fontWeight: '600', color: 'var(--status-progress)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-progress)' }} />
                      In Progress
                    </span>
                    <span className="badge badge-in_progress">
                      {tasks.filter((t) => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '80px' }}>
                    {tasks.filter((t) => t.status === 'in_progress').map((task) => (
                      <TaskCard key={task._id} task={task} onClick={setSelectedTask} />
                    ))}
                  </div>
                </div>

                {/* Column 3: DONE */}
                <div
                  className="kanban-column"
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn('done'); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, 'done')}
                  style={{
                    outline: dragOverColumn === 'done' ? '2px dashed var(--accent-primary)' : 'none',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'outline 0.15s ease',
                  }}
                >
                  <div className="kanban-header">
                    <span style={{ fontWeight: '600', color: 'var(--status-done)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-done)' }} />
                      Done
                    </span>
                    <span className="badge badge-done">
                      {tasks.filter((t) => t.status === 'done').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '80px' }}>
                    {tasks.filter((t) => t.status === 'done').map((task) => (
                      <TaskCard key={task._id} task={task} onClick={setSelectedTask} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM MEMBERS */}
          {activeTab === 'members' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button onClick={() => setIsAddMemberOpen(true)} className="btn btn-primary">
                  <UserPlus size={18} /> Add Member
                </button>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem 1.5rem' }}>User</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Role</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}>
                              {m.user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                {m.user?.fullName || m.user?.username}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                @{m.user?.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1.5rem' }}>
                          <select
                            className="select-field"
                            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.user?._id || m._id, e.target.value)}
                          >
                            <option value="admin">Admin</option>
                            <option value="project_admin">Project Admin</option>
                            <option value="member">Member</option>
                          </select>
                        </td>

                        <td style={{ padding: '1rem 1.5rem' }}>
                          <button
                            onClick={() => handleRemoveMember(m.user?._id || m._id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT NOTES */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button onClick={() => setIsCreateNoteOpen(true)} className="btn btn-primary">
                  <Plus size={18} /> Create Note
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <FileText size={44} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    No Notes Yet
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Add project documentation, specifications, or meeting minutes.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {notes.map((note) => (
                    <div key={note._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                          {note.title}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {note.content}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CREATE TASK MODAL */}
      <Modal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Design Landing Page Wireframes"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea-field"
              placeholder="Task details and expectations..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="select-field"
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select
                className="select-field"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
                    {m.user?.username || m.username || 'User'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, paddingTop: '1rem', border: 'none' }}>
            <button type="button" onClick={() => setIsCreateTaskOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creatingTask}>
              {creatingTask ? <div className="spinner" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD MEMBER MODAL */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter user's email or username"
              value={memberIdentifier}
              onChange={(e) => setMemberIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Role</label>
            <select
              className="select-field"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="project_admin">Project Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="modal-footer" style={{ padding: 0, paddingTop: '1rem', border: 'none' }}>
            <button type="button" onClick={() => setIsAddMemberOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={addingMember}>
              {addingMember ? <div className="spinner" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE NOTE MODAL */}
      <Modal isOpen={isCreateNoteOpen} onClose={() => setIsCreateNoteOpen(false)} title="Create Project Note">
        <form onSubmit={handleCreateNote}>
          <div className="form-group">
            <label className="form-label">Note Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Architecture Guidelines"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="textarea-field"
              placeholder="Write note contents here..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, paddingTop: '1rem', border: 'none' }}>
            <button type="button" onClick={() => setIsCreateNoteOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creatingNote}>
              {creatingNote ? <div className="spinner" /> : 'Save Note'}
            </button>
          </div>
        </form>
      </Modal>

      {/* TASK DETAIL DRAWER MODAL */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          members={members}
          onTaskUpdated={() => fetchProjectData(true)}
          onTaskDeleted={() => {
            setSelectedTask(null);
            fetchProjectData(true);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
