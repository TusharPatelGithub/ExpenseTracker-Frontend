import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { BiTrendingUp, BiTrendingDown, BiWallet, BiPieChartAlt, BiPlus, BiAlarmExclamation } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';
import { incomeService, expenseService, budgetService } from '../services';

function StatCard({ title, value, icon: Icon, color, subtitle, loading }) {
  return (
    <div className="glass-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <Icon size={28} style={{ color, opacity: 0.8 }} />
      </div>
      {loading ? (
        <div style={{ height: '2.4rem', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: `3px solid rgba(255,255,255,0.1)`, borderTopColor: color, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{value}</h2>
      )}
      {subtitle && <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
  );
}

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Independent loading states
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [loadingExpense, setLoadingExpense] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    // 1. Fetch Income Independently
    incomeService.getTotal().then(res => {
      setTotalIncome(res.data?.total ?? res.data?.Total ?? 0);
      setLoadingIncome(false);
    }).catch(err => {
      console.error('Income fetch error:', err);
      setLoadingIncome(false);
    });

    // 2. Fetch Expenses Independently
    Promise.all([expenseService.getTotal(), expenseService.getAll()]).then(([totalRes, listRes]) => {
      setTotalExpense(totalRes.data?.total ?? totalRes.data?.Total ?? 0);
      setExpenses(listRes.data || []);
      setLoadingExpense(false);
    }).catch(err => {
      console.error('Expense fetch error:', err);
      setLoadingExpense(false);
    });

    // 3. Fetch Budgets Independently
    Promise.all([budgetService.getAll(), budgetService.getAlerts()]).then(([budgetRes, alertRes]) => {
      setBudgets(budgetRes.data || []);
      setAlerts(alertRes.data || []);
      setLoadingBudget(false);
    }).catch(err => {
      console.error('Budget fetch error:', err);
      setLoadingBudget(false);
    });
  }, []);

  const currency = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '₹';
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="animate-slide-up">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .skeleton-row { height: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 0.5rem; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Welcome back, <span className="text-gradient">{user?.fullName?.split(' ')[0]} 👋</span></h1>
          <p className="text-muted">Here's your financial overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/expenses/add" className="btn btn-danger" style={{ fontSize: '0.9rem' }}>
            <BiPlus /> Add Expense
          </Link>
          <Link to="/incomes/add" className="btn btn-primary" style={{ fontSize: '0.9rem', background: 'linear-gradient(135deg, var(--success), #059669)' }}>
            <BiPlus /> Add Income
          </Link>
        </div>
      </div>

      {/* Budget Alerts */}
      {!loadingBudget && alerts.length > 0 && (
        <div className="glass-card mb-4" style={{ borderLeft: '4px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <div className="flex items-center gap-2">
            <BiAlarmExclamation size={22} style={{ color: 'var(--warning)' }} />
            <span>You have <strong>{alerts.length}</strong> budget alert(s). &nbsp;
              <Link to="/notifications" style={{ color: 'var(--warning)', textDecoration: 'none' }}>View Alerts →</Link>
            </span>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 grid-gap mb-4">
        <StatCard title="Total Income" value={`${currency}${Number(totalIncome).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={BiTrendingUp} color="var(--success)" subtitle="All time" loading={loadingIncome} />
        <StatCard title="Total Expenses" value={`${currency}${Number(totalExpense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={BiTrendingDown} color="var(--danger)" subtitle="All time" loading={loadingExpense} />
        <StatCard title="Net Balance" value={`${currency}${Number(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={BiWallet} color="var(--primary)" subtitle="Available balance" loading={loadingIncome || loadingExpense} />
        <StatCard title="Active Budgets" value={budgets.length} icon={BiPieChartAlt} color="var(--warning)" subtitle={`${alerts.length} over limit`} loading={loadingBudget} />
      </div>

      {/* Recent Expenses + Budget Status */}
      <div className="grid grid-gap" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Recent Expenses */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-3">
            <h4>Recent Expenses</h4>
            <Link to="/expenses" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View All</Link>
          </div>
          {loadingExpense ? (
            <div>
              <div className="skeleton-row" style={{ width: '100%', height: '2rem' }}></div>
              <div className="skeleton-row" style={{ width: '100%', height: '2rem' }}></div>
              <div className="skeleton-row" style={{ width: '100%', height: '2rem' }}></div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Title', 'Category', 'Amount', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 6).map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{e.title || e.description}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}><span className="badge badge-primary">{e.category || e.categoryId}</span></td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--danger)', fontWeight: 600 }}>{currency}{Number(e.amount).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses yet. <Link to="/expenses/add" style={{ color: 'var(--primary)' }}>Add one →</Link></td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Budget Status */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-3">
            <h4>Budget Status</h4>
            <Link to="/budgets" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Manage</Link>
          </div>
          {loadingBudget ? (
            <div>
              <div className="skeleton-row" style={{ width: '100%', height: '3rem' }}></div>
              <div className="skeleton-row" style={{ width: '100%', height: '3rem' }}></div>
            </div>
          ) : (
            <>
              {budgets.slice(0, 5).map((b, i) => {
                const pct = b.limitAmount > 0 ? Math.round((b.spentAmount / b.limitAmount) * 100) : 0;
                const color = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';
                return (
                  <div key={i} style={{ marginBottom: '1.25rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span>{b.categoryName || b.name}</span>
                      <span className="text-muted">{currency}{(b.spentAmount || 0).toLocaleString()} / {currency}{(b.limitAmount || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color, marginTop: '0.2rem', textAlign: 'right' }}>{pct}% used</div>
                  </div>
                );
              })}
              {budgets.length === 0 && (
                <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No budgets set. <Link to="/budgets/add" style={{ color: 'var(--primary)' }}>Set one →</Link></p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

