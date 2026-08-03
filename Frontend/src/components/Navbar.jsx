import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar" style={{
      height: '64px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>
            <LayoutDashboard size={20} />
          </div>
          <span style={{
            fontFamily: 'Outfit',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Project<span style={{ color: 'var(--accent-primary)' }}>Camp</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  user.username?.[0]?.toUpperCase() || <User size={18} />
                )}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.username}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Logout"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
