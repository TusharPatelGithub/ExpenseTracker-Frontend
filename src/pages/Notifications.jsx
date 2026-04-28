import React, { useEffect, useState, useCallback } from 'react';
import {
  BiBell, BiTrash, BiCheckDouble, BiCheck,
  BiFilter, BiRefresh, BiMessageRounded,
} from 'react-icons/bi';
import { notificationService } from '../services';

const TYPE_CONFIG = {
  BUDGET_WARNING: { label: 'Budget Warning', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', emoji: '⚠️' },
  BUDGET_EXCEEDED: { label: 'Over Budget', color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', emoji: '🚨' },
  BUDGET_ALERT: { label: 'Budget Alert', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', emoji: '⚠️' },
  INFO: { label: 'Info', color: 'var(--info)', bg: 'rgba(59,130,246,0.1)', emoji: 'ℹ️' },
  SUCCESS: { label: 'Success', color: 'var(--success)', bg: 'rgba(16,185,129,0.08)', emoji: '✅' },
  SYSTEM: { label: 'System', color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.08)', emoji: '🔔' },
};

function getConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.SYSTEM;
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function NotificationItem({ notification, onMarkRead, onDelete }) {
  const cfg = getConfig(notification.type);
  const [deleting, setDeleting] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleMarkRead = async () => {
    if (notification.isRead) return;
    setMarking(true);
    await onMarkRead(notification.notificationId);
    setMarking(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(notification.notificationId);
    setDeleting(false);
  };

  return (
    <div
      style={{
        display: 'flex', gap: '1rem', alignItems: 'flex-start',
        padding: '1rem 1.25rem',
        background: notification.isRead ? 'rgba(26,29,36,0.4)' : cfg.bg,
        borderRadius: '12px',
        border: `1px solid ${notification.isRead ? 'var(--border-color)' : cfg.color + '30'}`,
        borderLeft: `4px solid ${notification.isRead ? 'rgba(255,255,255,0.05)' : cfg.color}`,
        transition: 'all 0.2s',
        opacity: deleting ? 0.5 : 1,
        marginBottom: '0.75rem',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0, paddingTop: '0.1rem' }}>
        {cfg.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '0.95rem', color: notification.isRead ? 'var(--text-muted)' : 'var(--text-main)' }}>
            {notification.title}
          </strong>
          <span style={{
            padding: '0.1rem 0.6rem', borderRadius: '999px', fontSize: '0.65rem',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: cfg.bg, color: cfg.color,
          }}>
            {cfg.label}
          </span>
          {!notification.isRead && (
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: cfg.color, display: 'inline-block', flexShrink: 0,
              boxShadow: `0 0 6px ${cfg.color}`,
            }} />
          )}
        </div>
        <p style={{
          fontSize: '0.875rem', color: notification.isRead ? 'var(--text-muted)' : '#cbd5e1',
          margin: 0, lineHeight: 1.5,
        }}>
          {notification.message}
        </p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          {timeAgo(notification.sentAt)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'flex-start' }}>
        {!notification.isRead && (
          <button
            onClick={handleMarkRead}
            disabled={marking}
            title="Mark as read"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '0.4rem', cursor: 'pointer',
              color: 'var(--success)', transition: 'all 0.2s',
            }}
          >
            <BiCheck size={18} />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete notification"
          style={{
            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '8px', padding: '0.4rem', cursor: 'pointer',
            color: 'var(--danger)', transition: 'all 0.2s',
          }}
        >
          <BiTrash size={18} />
        </button>
      </div>
    </div>
  );
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [markingAll, setMarkingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filtered = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return n.type === filter;
  });

  const uniqueTypes = [...new Set(notifications.map(n => n.type))];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <BiBell size={42} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <p>Loading notifications...</p>
    </div>
  );

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>
              Notification <span className="text-gradient">Center</span>
            </h1>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--danger)', color: 'white',
                borderRadius: '999px', padding: '0.2rem 0.65rem',
                fontSize: '0.78rem', fontWeight: 700,
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Budget alerts and platform updates.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            style={{ padding: '0.5rem 0.9rem' }}
            title="Refresh"
          >
            <BiRefresh size={20} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          {unreadCount > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              style={{ fontSize: '0.85rem' }}
            >
              <BiCheckDouble size={18} />
              {markingAll ? 'Marking...' : `Mark All Read (${unreadCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 grid-gap mb-4">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
          <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem' }}>{notifications.length}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unread</p>
          <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem', color: unreadCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{unreadCount}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <p className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Read</p>
          <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.5rem', color: 'var(--success)' }}>{notifications.length - unreadCount}</h3>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <BiFilter size={18} style={{ color: 'var(--text-muted)' }} />
        {['ALL', 'UNREAD', ...uniqueTypes].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
            border: filter === f ? 'none' : '1px solid var(--border-color)',
            background: filter === f ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.04)',
            color: filter === f ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: filter === f ? '0 4px 12px var(--primary-glow)' : 'none',
          }}>
            {f === 'ALL' ? `All (${notifications.length})` : f === 'UNREAD' ? `Unread (${unreadCount})` : (getConfig(f).label)}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BiMessageRounded size={48} style={{ color: 'var(--primary)', opacity: 0.35, marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>
            {filter === 'UNREAD' ? 'All caught up!' : 'No notifications here'}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {filter === 'UNREAD'
              ? 'You have no unread notifications at the moment.'
              : 'Notifications about budget alerts will appear here.'}
          </p>
        </div>
      ) : (
        <div>
          {filtered.map(n => (
            <NotificationItem
              key={n.notificationId}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Spin keyframe for refresh icon */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Notifications;
