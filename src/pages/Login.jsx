import React from 'react';
import { Link } from 'react-router-dom';
import { BiWalletAlt } from 'react-icons/bi';

function Login() {
  return (
    <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <BiWalletAlt size={48} className="text-primary" />
          <h2 className="text-gradient">Welcome Back</h2>
          <p className="text-muted">Login to SpendSmart</p>
        </div>
        
        <form>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>
          
          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Login
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
