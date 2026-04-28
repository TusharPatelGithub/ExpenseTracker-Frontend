import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiWalletAlt, BiLogOut, BiBell, BiUser, BiSpeedometer, BiCash, BiBarChartAlt2, BiPieChartAlt } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(26, 29, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container flex items-center justify-between">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BiWalletAlt size={28} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }} className="text-gradient">SpendSmart</h2>
        </Link>
        
        {user && (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" title="Dashboard" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
              <BiSpeedometer size={20} /> Dashboard
            </Link>
            <Link to="/expenses" title="Expenses" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
              <BiCash size={20} /> Expenses
            </Link>
            <Link to="/reports" title="Reports" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
              <BiBarChartAlt2 size={20} /> Reports
            </Link>
            <Link to="/budgets" title="Budgets" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
              <BiPieChartAlt size={20} /> Budgets
            </Link>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/notifications" style={{ color: 'var(--text-muted)', position: 'relative' }}>
                <BiBell size={24} />
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', borderRadius: '999px', fontSize: '0.6rem', padding: '0.15rem 0.4rem', fontWeight: 600 }}>3</span>
              </Link>
              <Link to="/profile" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                <BiUser size={22} /> {user.fullName?.split(' ')[0]}
              </Link>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <BiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

