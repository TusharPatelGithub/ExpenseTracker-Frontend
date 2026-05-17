import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BiWalletAlt } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <BiWalletAlt size={48} className="text-primary" />
          <h2 className="text-gradient">Welcome Back</h2>
          <p className="text-muted">Login to SpendSmart</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem', textAlign: 'center', borderRadius: '8px' }}>
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" className="text-primary" style={{ textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
