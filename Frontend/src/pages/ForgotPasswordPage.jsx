import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { KeyRound, Mail, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 6px 20px var(--accent-glow)'
          }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={48} color="var(--status-done)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Reset Link Sent!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
            Remembered your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
