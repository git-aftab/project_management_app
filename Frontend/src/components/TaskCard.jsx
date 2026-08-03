import React from 'react';
import { Paperclip, User, Calendar, GripVertical } from 'lucide-react';

const TaskCard = ({ task, onClick, onDragStart }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'done': return 'badge-done';
      case 'in_progress': return 'badge-in_progress';
      default: return 'badge-todo';
    }
  };

  const formattedStatus = task.status
    ? task.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Todo';

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task._id);
    if (onDragStart) onDragStart(task);
  };

  return (
    <div
      className="glass-card glass-card-interactive"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(task)}
      style={{
        padding: '1.2rem',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        backgroundColor: 'var(--bg-elevated)',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`badge ${getStatusBadgeClass(task.status)}`}>
          {formattedStatus}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {task.createdAt && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} />
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          )}
          <GripVertical size={14} color="var(--text-muted)" style={{ cursor: 'grab' }} />
        </div>
      </div>

      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
        {task.title}
      </h4>

      {task.description && (
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        {/* Assignee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: task.assignedTo ? 'var(--accent-primary)' : 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '600'
          }}>
            {task.assignedTo?.username?.[0]?.toUpperCase() || <User size={12} color="var(--text-muted)" />}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {task.assignedTo?.username || 'Unassigned'}
          </span>
        </div>

        {/* Attachments indicator */}
        {task.attachments && task.attachments.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Paperclip size={13} />
            {task.attachments.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
