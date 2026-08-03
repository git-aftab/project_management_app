import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderKanban, User, BookOpen } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Projects', path: '/', icon: <FolderKanban size={18} /> },
    { name: 'Profile & Security', path: '/profile', icon: <User size={18} /> },
  ];

  const navLinkStyle = (isActive) => ({
    justifyContent: 'flex-start',
    width: '100%',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    fontWeight: isActive ? '600' : '500',
    borderRadius: 'var(--radius-md)',
  });

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      gap: '0.5rem',
    }}>
      {/* Nav section */}
      <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Navigation
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `btn btn-ghost ${isActive ? 'active-nav' : ''}`}
          style={({ isActive }) => navLinkStyle(isActive)}
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}

      {/* Spacer — pushes guide to bottom */}
      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }} />

      {/* Guide link */}
      <NavLink
        to="/guide"
        className={({ isActive }) => `btn btn-ghost ${isActive ? 'active-nav' : ''}`}
        style={({ isActive }) => ({
          ...navLinkStyle(isActive),
          backgroundColor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
        })}
      >
        <BookOpen size={18} />
        <span>User Guide</span>
      </NavLink>
    </aside>
  );
};

export default Sidebar;
