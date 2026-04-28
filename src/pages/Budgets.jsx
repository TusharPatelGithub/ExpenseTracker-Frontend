import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  BiPlus, BiPieChartAlt, BiTrash, BiEditAlt,
  BiAlarmExclamation, BiCheckCircle, BiTrendingUp,
} from 'react-icons/bi';
import { budgetService } from '../services';
import { AuthContext } from '../context/AuthContext';

const PERIOD_LABELS = {
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom',
};

function PeriodBadge({ period }) {
  const colors = {
    MONTHLY: { bg: 'var(--primary-glow)', color: '#a5b4fc' },
    WEEKLY: { bg: 'rgba(139,92,246,0.15)', color: 'var(--secondary)' },
    YEARLY: { bg: 'rgba(16,185,129,0.12)', color: 'var(--success)' },
    CUSTOM: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)' },
  };
  const style = colors[period] || colors.CUSTOM;
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '0.2rem 0.75rem', borderRadius: '999px',
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {PERIOD_LABELS[period] || period}
    </span>
  );
}

function BudgetCard({ budget, currency, onDelete }) {
  const pct = budget.limitAmount > 0 ? Math.min(Math.round((budget.spentAmount / budget.limitAmount) * 100), 100) : 0;
  const overBudget = pct >= 100;
  const nearLimit = pct >= 80 && pct < 100;
  const barColor = overBudget ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--success)';
  const statusLabel = overBudget ? '🚨 Over Budget' : nearLimit ? '⚠️ Near Limit' : '✅ On Track';
  const statusColor = overBudget ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="glass-card" style={{
      borderLeft: `4px solid ${barColor}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{budget.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
            <PeriodBadge period={budget.period} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(budget.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} –{' '}
              {new Date(budget.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/budgets/edit/${budget.budgetId}`} className="btn btn-outline" style={{ padding: '0.4rem 0.7rem' }} title="Edit">
            <BiEditAlt size={16} />
          </Link>
          <button className="btn btn-danger" style={{ padding: '0.4rem 0.7rem' }} onClick={() => onDelete(budget.budgetId)} title="Delete">
            <BiTrash size={16} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: barColor,
            borderRadius: '999px', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: `0 0 8px ${barColor}60`,
          }} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
        <div>
          <span className="text-muted">Spent: </span>
          <strong style={{ color: barColor }}>{currency}{(budget.spentAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: statusColor, fontWeight: 600, fontSize: '0.78rem' }}>{statusLabel}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="text-muted">Limit: </span>
          <strong>{currency}{(budget.limitAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {/* Remaining */}
      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', textAlign: 'right', color: 'var(--text-muted)' }}>
        Remaining:{' '}
        <span style={{ color: overBudget ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
          {currency}{Math.abs(budget.remainingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          {overBudget && ' over'}
        </span>
        {' '}· {pct}% used
      </div>
    </div>
  );
}

function Budgets() {
  const { user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);

  const currency = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '₹';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetRes, alertRes] = await Promise.all([
          budgetService.getAll(),
          budgetService.getAlerts(),
        ]);
        setBudgets(budgetRes.data || []);
        setAlerts(alertRes.data || []);
      } catch (err) {
        console.error('Budget fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await budgetService.delete(id);
      setBudgets(prev => prev.filter(b => b.budgetId !== id));
      setAlerts(prev => prev.filter(a => a.budgetId !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete budget. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const filteredBudgets = budgets.filter(b => {
    if (filter === 'ALL') return true;
    return b.period === filter;
  });

  const totalBudgeted = budgets.reduce((s, b) => s + (b.limitAmount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spentAmount || 0), 0);
  const overBudgetCount = budgets.filter(b => b.spentAmount >= b.limitAmount).length;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <BiPieChartAlt size={42} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <p>Loading your budgets...</p>
    </div>
  );

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Budget <span className="text-gradient">Management</span></h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Set limits, track spending, and stay in control.</p>
        </div>
        <Link to="/budgets/add" className="btn btn-primary">
          <BiPlus size={20} /> New Budget
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 grid-gap mb-4">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Budgeted</p>
          <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.6rem', fontWeight: 700 }}>{currency}{totalBudgeted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>{budgets.length} active budget{budgets.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</p>
          <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--warning)' }}>{currency}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>{Math.round((totalSpent / (totalBudgeted || 1)) * 100)}% of total budget</p>
        </div>
        <div className="glass-card" style={{ borderLeft: `4px solid ${overBudgetCount > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Alerts</p>
          <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.6rem', fontWeight: 700, color: overBudgetCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {alerts.length}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
            {overBudgetCount > 0 ? `${overBudgetCount} budget(s) exceeded` : 'All budgets on track'}
          </p>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="glass-card mb-4" style={{ borderLeft: '4px solid var(--danger)', background: 'rgba(239,68,68,0.05)' }}>
          <div className="flex items-center gap-2">
            <BiAlarmExclamation size={22} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--danger)' }}>{alerts.length} Budget Alert{alerts.length > 1 ? 's' : ''}</strong>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.15rem 0 0' }}>
                {alerts.map(a => a.name).join(', ')} — {alerts.length > 1 ? 'these budgets have' : 'this budget has'} reached or exceeded its limit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn" style={{
            padding: '0.4rem 1rem', fontSize: '0.82rem',
            background: filter === f ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.04)',
            color: filter === f ? 'white' : 'var(--text-muted)',
            border: filter === f ? 'none' : '1px solid var(--border-color)',
            boxShadow: filter === f ? '0 4px 15px var(--primary-glow)' : 'none',
          }}>
            {f === 'ALL' ? `All (${budgets.length})` : `${PERIOD_LABELS[f]}`}
          </button>
        ))}
      </div>

      {/* Budget Cards Grid */}
      {filteredBudgets.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BiTrendingUp size={48} style={{ color: 'var(--primary)', opacity: 0.4, marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No budgets found</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {filter !== 'ALL' ? `No ${PERIOD_LABELS[filter].toLowerCase()} budgets yet.` : 'Start managing your spending by creating your first budget.'}
          </p>
          <Link to="/budgets/add" className="btn btn-primary"><BiPlus /> Create Budget</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 grid-gap">
          {filteredBudgets.map(b => (
            <BudgetCard
              key={b.budgetId}
              budget={b}
              currency={currency}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Budgets;
