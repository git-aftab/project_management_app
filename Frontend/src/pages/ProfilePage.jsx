import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { User, Mail, ShieldCheck, KeyRound, CheckCircle, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { user, fetchCurrentUser } = useAuth();

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      setAvatarError('Image must be under 1 MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError('');
    setAvatarMsg('');
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    try {
      setAvatarLoading(true);
      setAvatarError('');
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      await api.post('/auth/update-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchCurrentUser();
      setAvatarMsg('Avatar updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

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
      await api.post('/auth/change-password', { oldPassword, newPassword });
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

  const displayAvatar = avatarPreview || user.avatar?.url;
  const avatarIsPlaceholder = !user.avatar?.url || user.avatar.url.includes('placehold.co');

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>
        Profile & Security
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* ── User Info Card ── */}
        <div className="glass-card">
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <div style={{
                width: '88px', height: '88px', borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--accent-primary)',
                boxShadow: '0 4px 14px var(--accent-glow)',
                backgroundColor: 'var(--bg-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {displayAvatar && !avatarIsPlaceholder ? (
                  <img
                    src={displayAvatar}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              {/* Camera button overlay */}
              <button
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Camera size={13} color="#fff" />
              </button>
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />

            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.2rem' }}>
              {user.fullName || user.username}
            </h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{user.username}</span>

            {/* Avatar preview + upload button */}
            {avatarFile && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {avatarFile.name}
                </span>
                {avatarError && <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>{avatarError}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleAvatarUpload}
                    className="btn btn-primary btn-sm"
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? <div className="spinner" /> : 'Save Avatar'}
                  </button>
                  <button
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {avatarMsg && !avatarFile && (
              <p style={{ fontSize: '0.8rem', color: 'var(--status-done)', marginTop: '0.5rem', textAlign: 'center' }}>
                {avatarMsg}
              </p>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Click the camera icon to change photo (max 1 MB)
            </p>
          </div>

          {/* Info rows */}
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
                <span className="badge badge-in_progress">Unverified</span>
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

        {/* ── Change Password Card ── */}
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
