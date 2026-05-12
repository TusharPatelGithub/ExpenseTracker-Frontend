import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BiWalletAlt } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { loginWithToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const err   = searchParams.get('error');

    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    if (!token) {
      setError('No authentication token received from Google.');
      return;
    }

    loginWithToken(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((e) => setError(e.message));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
        <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <BiWalletAlt size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Authentication Failed</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <BiWalletAlt size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
        <h2 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Signing you in…</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Completing Google authentication</p>
        <div className="google-callback-spinner" />
      </div>
    </div>
  );
}

export default GoogleCallback;
