import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const { verificationToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const isCalledRef = useRef(false);

  useEffect(() => {
    if (isCalledRef.current) return;
    isCalledRef.current = true;

    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${verificationToken}`);
        setSuccess(true);
        setMessage(res.data?.message || 'Email verified successfully!');
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      } finally {
        setLoading(false);
      }
    };

    if (verificationToken) {
      verifyToken();
    } else {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token provided.');
    }
  }, [verificationToken]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>
        {loading ? (
          <div>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Verifying Your Email...
            </h3>
          </div>
        ) : success ? (
          <div>
            <CheckCircle size={56} color="var(--status-done)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Email Verified!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Login
            </Link>
          </div>
        ) : (
          <div>
            <XCircle size={56} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Verification Failed
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
