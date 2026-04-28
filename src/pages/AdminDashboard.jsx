import React, { useState, useEffect } from 'react';
import { BiUser, BiTrash, BiBlock, BiCheckCircle, BiShieldQuarter } from 'react-icons/bi';
import { adminService } from '../services';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm(`Are you sure you want to suspend user #${userId}?`)) return;
    setProcessingId(userId);
    try {
      await adminService.suspendAccount(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isSuspended: true } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to suspend user.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to permanently delete user #${userId}? All their data will be lost.`)) return;
    setProcessingId(userId);
    try {
      await adminService.deleteAccount(userId);
      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <BiShieldQuarter size={42} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <p>Loading admin tools...</p>
    </div>
  );

  const activeUsers = users.filter(u => !u.isSuspended).length;
  const suspendedUsers = users.filter(u => u.isSuspended).length;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <BiShieldQuarter size={32} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 style={{ margin: 0 }}>Admin <span className="text-gradient">Dashboard</span></h1>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.9rem' }}>Manage users and platform settings.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 grid-gap mb-4">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</p>
          <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem' }}>{users.length}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Accounts</p>
          <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem', color: 'var(--success)' }}>{activeUsers}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suspended</p>
          <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem', color: suspendedUsers > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{suspendedUsers}</h3>
        </div>
      </div>

      {/* User Table */}
      <div className="glass-card">
        <h4 style={{ marginBottom: '1.25rem' }}>User Management</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>User</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>#{u.userId}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 600, color: 'white'
                      }}>
                        {u.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={u.role === 'Admin' ? 'badge badge-danger' : 'badge badge-primary'} style={{ fontSize: '0.65rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {u.isSuspended ? (
                      <span style={{ color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><BiBlock /> Suspended</span>
                    ) : (
                      <span style={{ color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><BiCheckCircle /> Active</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {u.role !== 'Admin' && (
                        <>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleSuspend(u.userId)}
                            disabled={u.isSuspended || processingId === u.userId}
                            style={{ padding: '0.4rem', color: u.isSuspended ? 'var(--text-muted)' : 'var(--warning)', border: 'none', background: 'rgba(245,158,11,0.1)' }}
                            title="Suspend User"
                          >
                            <BiBlock size={18} />
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(u.userId)}
                            disabled={processingId === u.userId}
                            style={{ padding: '0.4rem', color: 'var(--danger)', border: 'none', background: 'var(--danger-bg)' }}
                            title="Delete User"
                          >
                            <BiTrash size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BiUser size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p>No users found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
