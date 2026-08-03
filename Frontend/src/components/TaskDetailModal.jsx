import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/api';
import { CheckSquare, Square, Plus, Trash2, Paperclip, User, Clock } from 'lucide-react';

const TaskDetailModal = ({ isOpen, onClose, task, projectId, members = [], onTaskUpdated, onTaskDeleted }) => {
  const [status, setStatus] = useState(task?.status || 'TODO');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || '');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setStatus(task.status || 'TODO');
      setAssignedTo(task.assignedTo?._id || '');
      fetchSubtasks();
    }
  }, [task]);

  const fetchSubtasks = async () => {
    if (!task?._id || !projectId) return;
    try {
      setLoadingSubtasks(true);
      const res = await api.get(`/tasks/${projectId}/t/${task._id}`);
      setSubtasks(res.data?.data?.subTasks || []);
    } catch (err) {
      console.error('Failed to fetch task subtasks:', err);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatus(newStatus);
      await api.put(`/tasks/${projectId}/t/${task._id}`, { status: newStatus });
      onTaskUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssigneeChange = async (newAssignee) => {
    try {
      setAssignedTo(newAssignee);
      await api.put(`/tasks/${projectId}/t/${task._id}`, { assignedTo: newAssignee });
      onTaskUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignee');
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      const res = await api.post(`/tasks/${projectId}/t/${task._id}/subtasks`, {
        title: newSubtaskTitle,
      });
      setSubtasks((prev) => [...prev, res.data.data]);
      setNewSubtaskTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subtask');
    }
  };

  const handleToggleSubtask = async (subTaskId, currentCompleted) => {
    try {
      const res = await api.put(`/tasks/${projectId}/st/${subTaskId}`, {
        isCompleted: !currentCompleted,
      });
      setSubtasks((prev) =>
        prev.map((st) => (st._id === subTaskId ? res.data.data : st))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subTaskId) => {
    try {
      await api.delete(`/tasks/${projectId}/st/${subTaskId}`);
      setSubtasks((prev) => prev.filter((st) => st._id !== subTaskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subtask');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${projectId}/t/${task._id}`);
      onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} maxWidth="640px">
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Status & Assignee Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="select-field"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Assignee</label>
            <select
              className="select-field"
              value={assignedTo}
              onChange={(e) => handleAssigneeChange(e.target.value)}
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

        {/* Description */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Description
          </h4>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            background: 'var(--bg-main)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            margin: 0,
            whiteSpace: 'pre-wrap'
          }}>
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Subtasks Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={16} /> Subtasks ({subtasks.filter((s) => s.isCompleted).length}/{subtasks.length})
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {subtasks.map((st) => (
              <div
                key={st._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flex: 1 }}
                  onClick={() => handleToggleSubtask(st._id, st.isCompleted)}
                >
                  {st.isCompleted ? (
                    <CheckSquare size={18} color="var(--status-done)" />
                  ) : (
                    <Square size={18} color="var(--text-muted)" />
                  )}
                  <span style={{
                    fontSize: '0.9rem',
                    color: st.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: st.isCompleted ? 'line-through' : 'none'
                  }}>
                    {st.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteSubtask(st._id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444', padding: '0.2rem' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Form */}
          <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add a new subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              <Plus size={16} /> Add
            </button>
          </form>
        </div>

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Paperclip size={16} /> Attachments
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {task.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <Paperclip size={14} />
                  <span>{att.url.split('/').pop()}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleDeleteTask} className="btn btn-danger btn-sm">
            <Trash2 size={16} /> Delete Task
          </button>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
