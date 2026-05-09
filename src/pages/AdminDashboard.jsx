import React, { useState, useEffect } from 'react';
import { BiUser, BiTrash, BiBlock, BiCheckCircle, BiShieldQuarter, BiMoney, BiMessageRoundedEdit, BiHistory, BiCrown } from 'react-icons/bi';
import { adminService } from '../services';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', type: 'INFO' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await adminService.getAllUsers();
        setUsers(res.data || []);
      } else if (activeTab === 'analytics') {
        const res = await adminService.getAnalytics();
        setAnalytics(res.data);
      } else if (activeTab === 'audit') {
        const res = await adminService.getAuditLogs();
        setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm(`Are you sure you want to suspend user #${userId}?`)) return;
    setProcessingId(userId);
    try {
      await adminService.suspendAccount(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isActive: false } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to suspend user.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReactivate = async (userId) => {
    if (!window.confirm(`Are you sure you want to reactivate user #${userId}?`)) return;
    setProcessingId(userId);
    try {
      await adminService.reactivateAccount(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isActive: true } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to reactivate user.');
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

  const handlePromote = async (userId) => {
    if (!window.confirm(`Are you sure you want to promote user #${userId} to Admin? This gives them full access.`)) return;
    setProcessingId(userId);
    try {
      await adminService.promoteToAdmin(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, role: 'Admin' } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to promote user to Admin.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title || !broadcastData.message) return;
    setSendingBroadcast(true);
    try {
      // Send to all users
      const allUserIds = users.length > 0 ? users.map(u => u.userId) : [];
      await adminService.broadcastNotification({
        userIds: allUserIds,
        title: broadcastData.title,
        message: broadcastData.message,
        type: broadcastData.type
      });
      alert('Broadcast sent successfully!');
      setBroadcastData({ title: '', message: '', type: 'INFO' });
    } catch (err) {
      console.error(err);
      alert('Failed to send broadcast.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const suspendedUsers = users.filter(u => !u.isActive).length;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <BiShieldQuarter size={32} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 style={{ margin: 0 }}>Admin <span className="text-gradient">Dashboard</span></h1>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.9rem' }}>Platform control center.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')} style={{ padding: '0.5rem 1rem' }}>
          <BiUser /> Users
        </button>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('analytics')} style={{ padding: '0.5rem 1rem' }}>
          <BiMoney /> Analytics
        </button>
        <button className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('broadcast')} style={{ padding: '0.5rem 1rem' }}>
          <BiMessageRoundedEdit /> Broadcast
        </button>
        <button className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('audit')} style={{ padding: '0.5rem 1rem' }}>
          <BiHistory /> Audit Logs
        </button>
      </div>

      {loading && activeTab !== 'broadcast' ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p>Loading {activeTab}...</p>
        </div>
      ) : (
        <>
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <>
              <div className="grid grid-cols-3 grid-gap mb-4">
                <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>Total Users</p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem' }}>{users.length}</h3>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
                  <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>Active Accounts</p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem', color: 'var(--success)' }}>{activeUsers}</h3>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                  <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>Suspended</p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem', color: suspendedUsers > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{suspendedUsers}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'white'
                            }}>
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{u.fullName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={u.role === 'Admin' ? 'badge badge-danger' : 'badge badge-primary'} style={{ fontSize: '0.65rem' }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {!u.isActive ? (
                            <span style={{ color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><BiBlock /> Suspended</span>
                          ) : (
                            <span style={{ color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><BiCheckCircle /> Active</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {u.role !== 'Admin' && (
                              <>
                                <button className="btn btn-outline" onClick={() => handlePromote(u.userId)} disabled={!u.isActive || processingId === u.userId} style={{ padding: '0.4rem', color: 'var(--success)', border: 'none' }} title="Promote to Admin"><BiCrown size={18} /></button>
                                {u.isActive ? (
                                  <button className="btn btn-outline" onClick={() => handleSuspend(u.userId)} disabled={processingId === u.userId} style={{ padding: '0.4rem', color: 'var(--warning)', border: 'none' }} title="Suspend User"><BiBlock size={18} /></button>
                                ) : (
                                  <button className="btn btn-outline" onClick={() => handleReactivate(u.userId)} disabled={processingId === u.userId} style={{ padding: '0.4rem', color: 'var(--success)', border: 'none' }} title="Reactivate User"><BiCheckCircle size={18} /></button>
                                )}
                                <button className="btn btn-outline" onClick={() => handleDelete(u.userId)} disabled={processingId === u.userId} style={{ padding: '0.4rem', color: 'var(--danger)', border: 'none' }} title="Delete User"><BiTrash size={18} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && analytics && (
            <div className="grid grid-cols-2 grid-gap">
              <div className="glass-card">
                <h4 style={{ color: 'var(--text-muted)' }}>Platform Expenses</h4>
                <h2 style={{ color: 'var(--danger)', fontSize: '2rem', margin: '0.5rem 0' }}>₹{analytics.totalExpenses?.toLocaleString()}</h2>
              </div>
              <div className="glass-card">
                <h4 style={{ color: 'var(--text-muted)' }}>Platform Income</h4>
                <h2 style={{ color: 'var(--success)', fontSize: '2rem', margin: '0.5rem 0' }}>₹{analytics.totalIncome?.toLocaleString()}</h2>
              </div>
              <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                <h4>Top Spending Categories</h4>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                  {analytics.topSpendingCategories?.map((cat, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span>{cat.categoryName} (ID: {cat.categoryId})</span>
                      <span style={{ fontWeight: 600 }}>₹{cat.totalAmount?.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* BROADCAST TAB */}
          {activeTab === 'broadcast' && (
            <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '1rem' }}>Broadcast Notification</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Send a notification to all registered users.</p>
              <form onSubmit={handleBroadcast}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="form-control" value={broadcastData.title} onChange={e => setBroadcastData({...broadcastData, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea className="form-control" rows="4" value={broadcastData.message} onChange={e => setBroadcastData({...broadcastData, message: e.target.value})} required></textarea>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={broadcastData.type} onChange={e => setBroadcastData({...broadcastData, type: e.target.value})}>
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="SUCCESS">Success</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={sendingBroadcast}>
                  {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                </button>
              </form>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div className="glass-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)' }}>Time</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)' }}>Admin</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)' }}>Action</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)' }}>Target ID</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.auditLogId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{log.actorEmail}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span className={`badge ${log.action === 'DELETE_USER' ? 'badge-danger' : log.action === 'SUSPEND_USER' ? 'badge-warning' : 'badge-primary'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>{log.targetUserId || '-'}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No audit logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
