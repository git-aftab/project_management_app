import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { User, Mail, ShieldCheck, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, fetchCurrentUser } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setVerificationLoading(true);
      const res = await api.post('/auth/resend-email-verification', { email: user?.email });
      setVerificationMsg(res.data?.message || 'Verification email sent!');
    } catch (err) {
      setVerificationMsg(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setVerificationLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>
        Profile & Security
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* User Info Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: '700',
              boxShadow: '0 4px 14px var(--accent-glow)'
            }}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0 }}>
                {user.fullName || user.username}
              </h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                @{user.username}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> Email Address
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                {user.email}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} /> Verification Status
              </span>
              {user.isEmailVerified ? (
                <span className="badge badge-done" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={12} /> Verified
                </span>
              ) : (
                <span className="badge badge-in_progress">
                  Unverified
                </span>
              )}
            </div>

            {!user.isEmailVerified && (
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={handleResendVerification}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  disabled={verificationLoading}
                >
                  {verificationLoading ? <div className="spinner" /> : 'Resend Verification Email'}
                </button>
                {verificationMsg && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
                    {verificationMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={20} color="var(--accent-primary)" /> Change Password
          </h3>

          {passwordError && <div className="alert alert-error">{passwordError}</div>}
          {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={passwordLoading}
            >
              {passwordLoading ? <div className="spinner" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
