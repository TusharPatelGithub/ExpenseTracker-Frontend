import React from 'react';
import { Link } from 'react-router-dom';
import { BiWalletAlt, BiLogOut, BiBell, BiUser } from 'react-icons/bi';

function Navbar() {
  return (
    <nav style={{
      background: 'rgba(26, 29, 36, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container flex items-center justify-between">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BiWalletAlt size={28} className="text-primary" />
          <h2 style={{ margin: 0 }} className="text-gradient">SpendSmart</h2>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/notifications" style={{ color: 'var(--text-muted)', position: 'relative' }}>
            <BiBell size={24} />
            <span className="badge badge-danger" style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>3</span>
          </Link>
          <Link to="/profile" style={{ color: 'var(--text-muted)' }}>
            <BiUser size={24} />
          </Link>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <BiLogOut /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
