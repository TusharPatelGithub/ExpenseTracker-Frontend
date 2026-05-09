import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiWalletAlt } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    currency: 'INR'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters and contain at least one uppercase, one lowercase, one number, and one special character.');
      return;
    }

    setLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <BiWalletAlt size={48} className="text-primary" />
          <h2 className="text-gradient">Create Account</h2>
          <p className="text-muted">Start tracking with SpendSmart</p>
        </div>
        
        {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              className="form-control" 
              placeholder="John Doe" 
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              placeholder="you@example.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Currency</label>
            <select 
              name="currency" 
              className="form-control" 
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" className="text-primary" style={{ textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
