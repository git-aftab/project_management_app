import React, { useState } from 'react';
import {
  BookOpen, Shield, FolderKanban, CheckSquare, Users, FileText,
  GripVertical, UserPlus, Trash2, Edit, Check, X, ChevronDown,
  ChevronRight, Info, Zap, Lock
} from 'lucide-react';


const ROLES = ['Admin', 'Project Admin', 'Member'];

const PERMISSIONS = [
  {
    category: '🗂️ Projects',
    rows: [
      { action: 'Create a new project',          admin: true,  projectAdmin: false, member: false },
      { action: 'View projects they belong to',   admin: true,  projectAdmin: true,  member: true  },
      { action: 'Edit project name / description',admin: true,  projectAdmin: false, member: false },
      { action: 'Delete a project',               admin: true,  projectAdmin: false, member: false },
    ],
  },
  {
    category: '👥 Team Members',
    rows: [
      { action: 'Add a member to project',        admin: true,  projectAdmin: false, member: false },
      { action: 'Remove a member from project',   admin: true,  projectAdmin: false, member: false },
      { action: 'Change a member\'s role',        admin: true,  projectAdmin: false, member: false },
      { action: 'View team members list',         admin: true,  projectAdmin: true,  member: true  },
    ],
  },
  {
    category: '✅ Tasks',
    rows: [
      { action: 'Create a task',                  admin: true,  projectAdmin: true,  member: false },
      { action: 'View all tasks (Kanban board)',   admin: true,  projectAdmin: true,  member: true  },
      { action: 'Update task status / assignee',   admin: true,  projectAdmin: true,  member: false },
      { action: 'Drag & drop task between columns',admin: true, projectAdmin: true,  member: false },
      { action: 'Delete a task',                  admin: true,  projectAdmin: true,  member: false },
      { action: 'Add subtasks to a task',         admin: true,  projectAdmin: true,  member: false },
      { action: 'Toggle subtask completion',       admin: true,  projectAdmin: true,  member: true  },
      { action: 'Delete a subtask',               admin: true,  projectAdmin: true,  member: false },
    ],
  },
  {
    category: '📝 Notes',
    rows: [
      { action: 'Create a project note',          admin: true,  projectAdmin: true,  member: false },
      { action: 'View project notes',             admin: true,  projectAdmin: true,  member: true  },
      { action: 'Delete a project note',          admin: true,  projectAdmin: true,  member: false },
    ],
  },
  {
    category: '👤 Profile',
    rows: [
      { action: 'Update own profile / avatar',    admin: true,  projectAdmin: true,  member: true  },
      { action: 'Change own password',            admin: true,  projectAdmin: true,  member: true  },
    ],
  },
];

const FEATURES = [
  {
    icon: <FolderKanban size={20} color="var(--accent-primary)" />,
    title: 'Projects',
    desc: 'Create and manage multiple project workspaces. Each project has its own Kanban board, team, and notes. Click any project card on the dashboard to open its workspace.',
  },
  {
    icon: <CheckSquare size={20} color="var(--status-todo)" />,
    title: 'Kanban Board',
    desc: 'Tasks are organised into three columns — Todo, In Progress, and Done. You can drag and drop cards between columns to update their status instantly, or open a task card to edit it in detail.',
  },
  {
    icon: <GripVertical size={20} color="var(--status-progress)" />,
    title: 'Drag & Drop',
    desc: 'Grab any task card by its grip handle and drag it to a different column. The column will highlight with a dashed border to show it\'s a valid drop target. The status updates immediately.',
  },
  {
    icon: <Users size={20} color="var(--role-member)" />,
    title: 'Team Members',
    desc: 'Add members to a project by their username or email. Each member is assigned a role (Admin, Project Admin, or Member) that controls what actions they can perform within the project.',
  },
  {
    icon: <FileText size={20} color="var(--role-project-admin)" />,
    title: 'Project Notes',
    desc: 'Store reference docs, meeting minutes, or specs as notes within each project. Notes are visible to all project members but can only be created or deleted by Admins and Project Admins.',
  },
  {
    icon: <UserPlus size={20} color="var(--role-admin)" />,
    title: 'Subtasks',
    desc: 'Break a task down into smaller checklist items. Open any task card and use the subtasks section to add items and tick them off as they\'re completed.',
  },
];


const Tick = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '26px', height: '26px', borderRadius: '50%',
    backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981',
  }}>
    <Check size={14} strokeWidth={3} />
  </span>
);

const Cross = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '26px', height: '26px', borderRadius: '50%',
    backgroundColor: 'rgba(239,68,68,0.10)', color: '#ef4444',
  }}>
    <X size={14} strokeWidth={3} />
  </span>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
      background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <div>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
    </div>
  </div>
);


const GuidePage = () => {
  const [openCategory, setOpenCategory] = useState(null);

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BookOpen size={28} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>User Guide</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Everything you need to know about ProjectCamp — features, workflows, and role permissions.
        </p>
      </div>

      {/* ── Features Overview ── */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <SectionHeader
          icon={<Zap size={20} color="var(--accent-primary)" />}
          title="Features Overview"
          subtitle="A quick look at what you can do in ProjectCamp"
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {f.icon}
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{f.title}</span>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Role Badges Legend ── */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <SectionHeader
          icon={<Shield size={20} color="var(--accent-primary)" />}
          title="Role Permissions"
          subtitle="What each role can and cannot do within a project"
        />

        {/* Role pills legend */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { label: 'Admin', color: 'var(--role-admin)', bg: 'var(--role-admin-bg)', desc: 'Full control — owns the project' },
            { label: 'Project Admin', color: 'var(--role-project-admin)', bg: 'var(--role-project-admin-bg)', desc: 'Can manage tasks and notes' },
            { label: 'Member', color: 'var(--role-member)', bg: 'var(--role-member-bg)', desc: 'Read + subtask toggle only' },
          ].map((r) => (
            <div key={r.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: r.bg,
              border: `1px solid ${r.color}22`,
            }}>
              <Lock size={13} color={r.color} />
              <span style={{ fontWeight: '700', color: r.color, fontSize: '0.82rem' }}>{r.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>— {r.desc}</span>
            </div>
          ))}
        </div>

        {/* Permission Table */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)' }}>
                <th style={{
                  padding: '0.9rem 1.2rem', textAlign: 'left',
                  color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.78rem',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '1px solid var(--border-color)',
                  width: '50%',
                }}>
                  Action
                </th>
                {[
                  { label: 'Admin', color: 'var(--role-admin)' },
                  { label: 'Project Admin', color: 'var(--role-project-admin)' },
                  { label: 'Member', color: 'var(--role-member)' },
                ].map((r) => (
                  <th key={r.label} style={{
                    padding: '0.9rem 1.2rem', textAlign: 'center',
                    color: r.color, fontWeight: '700', fontSize: '0.82rem',
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((section) => (
                <React.Fragment key={section.category}>
                  {/* Category separator row */}
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: '0.55rem 1.2rem',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderTop: '1px solid var(--border-color)',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row, i) => (
                    <tr
                      key={row.action}
                      style={{
                        borderBottom: i < section.rows.length - 1 ? '1px solid var(--border-color)' : 'none',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem 1.2rem', color: 'var(--text-primary)' }}>
                        {row.action}
                      </td>
                      <td style={{ padding: '0.75rem 1.2rem', textAlign: 'center' }}>
                        {row.admin ? <Tick /> : <Cross />}
                      </td>
                      <td style={{ padding: '0.75rem 1.2rem', textAlign: 'center' }}>
                        {row.projectAdmin ? <Tick /> : <Cross />}
                      </td>
                      <td style={{ padding: '0.75rem 1.2rem', textAlign: 'center' }}>
                        {row.member ? <Tick /> : <Cross />}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'flex-start',
        }}>
          <Info size={15} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--accent-primary)' }}>Note:</strong> Roles are scoped per-project.
            A user can be an Admin in one project and a Member in another.
            Only the project's Admin can add members, assign roles, or delete the project.
          </p>
        </div>
      </div>

      {/* ── How-to Tips ── */}
      <div className="glass-card">
        <SectionHeader
          icon={<Info size={20} color="var(--accent-primary)" />}
          title="Quick Tips"
          subtitle="Common workflows to get the most out of ProjectCamp"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { tip: 'To navigate to a project', detail: 'Go to the dashboard and click any project card. The "Open Workspace →" arrow takes you straight to its Kanban board.' },
            { tip: 'To assign a task', detail: 'Open a task card → change the Assignee dropdown. The assignment saves automatically. Close the modal to refresh the board.' },
            { tip: 'To move a task', detail: 'Drag a task card by its grip icon (⋮⋮) and drop it on another column. The status updates instantly without a page reload.' },
            { tip: 'To add a team member', detail: 'Go to the Team Members tab inside a project → click "Add Member" → enter their username or email and pick a role.' },
            { tip: 'To add subtasks', detail: 'Click any task card to open its detail view → type in the subtask input and press "Add". Click the checkbox icon to mark it complete.' },
            { tip: 'Changing your password', detail: 'Go to Profile & Security in the sidebar → use the "Change Password" section. You\'ll need your current password.' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
              }}
            >
              <span style={{
                minWidth: '22px', height: '22px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: '700', flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {item.tip}:{' '}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {item.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
