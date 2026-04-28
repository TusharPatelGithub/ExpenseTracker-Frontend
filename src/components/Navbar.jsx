import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BiWalletAlt, BiLogOut, BiBell, BiUser,
  BiTachometer, BiDollar, BiBarChartAlt2,
  BiPieChartAlt, BiMoney,
} from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';
import { notificationService } from '../services';

function NavLink({ to, icon: Icon, children, currentPath }) {
  const active = currentPath.startsWith(to);
  return (
    <Link to={to} style={{
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      display: 'flex', alignItems: 'center', gap: '0.25rem',
      textDecoration: 'none', fontSize: '0.9rem',
      fontWeight: active ? 600 : 400,
      transition: 'color 0.2s',
    }}>
      <Icon size={20} />
      {children}
    </Link>
  );
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? res.data?.Count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Refresh count when navigating away from notifications page
  useEffect(() => {
    if (!location.pathname.startsWith('/notifications')) {
      fetchUnread();
    }
  }, [location.pathname, fetchUnread]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(26, 29, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BiWalletAlt size={28} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }} className="text-gradient">SpendSmart</h2>
        </Link>

        {/* Primary Nav Links */}
        {user && (
          <div className="flex items-center gap-4">
            <NavLink to="/dashboard" icon={BiTachometer} currentPath={location.pathname}>Dashboard</NavLink>
            <NavLink to="/expenses" icon={BiDollar} currentPath={location.pathname}>Expenses</NavLink>
            <NavLink to="/incomes" icon={BiMoney} currentPath={location.pathname}>Incomes</NavLink>
            <NavLink to="/budgets" icon={BiPieChartAlt} currentPath={location.pathname}>Budgets</NavLink>
            <NavLink to="/reports" icon={BiBarChartAlt2} currentPath={location.pathname}>Reports</NavLink>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Bell */}
              <Link to="/notifications" style={{ color: 'var(--text-muted)', position: 'relative', display: 'flex', alignItems: 'center' }} title="Notifications">
                <BiBell size={24} style={{ transition: 'color 0.2s', color: location.pathname.startsWith('/notifications') ? 'var(--primary)' : undefined }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '999px', fontSize: '0.6rem',
                    padding: '0.15rem 0.4rem', fontWeight: 700,
                    minWidth: '18px', textAlign: 'center',
                    boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                    animation: 'pulse 2s infinite',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <Link to="/profile" style={{
                color: location.pathname.startsWith('/profile') ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                textDecoration: 'none', fontSize: '0.9rem',
              }}>
                <BiUser size={22} />
                {user.fullName?.split(' ')[0]}
              </Link>

              {/* Logout */}
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

      {/* Pulse animation for notification badge */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(239,68,68,0.6); }
          50% { box-shadow: 0 0 14px rgba(239,68,68,0.9); }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
