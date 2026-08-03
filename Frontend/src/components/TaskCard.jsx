import React from 'react';
import { Paperclip, CheckSquare, User, Calendar } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DONE': return 'badge-done';
      case 'IN_PROGRESS': return 'badge-in_progress';
      default: return 'badge-todo';
    }
  };

  const formattedStatus = task.status ? task.status.replace('_', ' ') : 'TODO';

  return (
    <div
      className="glass-card glass-card-interactive"
      onClick={() => onClick(task)}
      style={{
        padding: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        backgroundColor: 'var(--bg-elevated)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`badge ${getStatusBadgeClass(task.status)}`}>
          {formattedStatus}
        </span>
        {task.createdAt && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={12} />
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        )}
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
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '600'
          }}>
            {task.assignedTo?.username?.[0]?.toUpperCase() || <User size={12} />}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {task.assignedTo?.username || 'Unassigned'}
          </span>
        </div>

        {/* Attachments & Subtasks indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {task.attachments && task.attachments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Paperclip size={13} />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
