import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiPlus, BiEdit, BiTrash, BiSearch, BiFilter } from 'react-icons/bi';
import { expenseService, categoryService } from '../services';
import { AuthContext } from '../context/AuthContext';

const PAYMENT_MODES = ['ALL', 'CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];

function Expenses() {
  const { user } = useContext(AuthContext);
  const currency = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '₹';
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([expenseService.getAll(), categoryService.getAll()]);
      setExpenses(expRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setDeleting(id);
    try {
      await expenseService.delete(id);
      setExpenses(expenses.filter(e => e.expenseId !== id));
    } catch (err) {
      alert('Failed to delete expense');
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryName = (id) => categories.find(c => c.categoryId === id)?.name || 'Unknown';

  const filtered = expenses
    .filter(e => paymentFilter === 'ALL' || e.paymentMode === paymentFilter)
    .filter(e => !search || (e.description || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gradient">Expenses</h1>
          <p className="text-muted">{expenses.length} total expenses</p>
        </div>
        <Link to="/expenses/add" className="btn btn-danger"><BiPlus /> Add Expense</Link>
      </div>

      {/* Filters */}
      <div className="glass-card mb-4">
        <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <BiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <BiFilter style={{ color: 'var(--text-muted)' }} />
            {PAYMENT_MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setPaymentFilter(mode)}
                className={`btn ${paymentFilter === mode ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="glass-card">
        {loading ? (
          <p className="text-muted text-center" style={{ padding: '2rem' }}>Loading expenses...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Description', 'Category', 'Amount', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.expenseId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{e.description}</div>
                    {e.isRecurring && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Recurring</span>}
                    {e.tags && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>🏷️ {e.tags}</div>}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className="badge badge-primary">{getCategoryName(e.categoryId)}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--danger)', fontWeight: 700 }}>{currency}{Number(e.amount).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className="badge badge-primary" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{e.paymentMode}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => navigate(`/expenses/edit/${e.expenseId}`)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}><BiEdit /></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(e.expenseId)} disabled={deleting === e.expenseId} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>
                        {deleting === e.expenseId ? '...' : <BiTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Expenses;
