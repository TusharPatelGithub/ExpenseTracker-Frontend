import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiSave, BiArrowBack, BiPieChartAlt } from 'react-icons/bi';
import { budgetService, categoryService } from '../services';
import { AuthContext } from '../context/AuthContext';

const PERIODS = ['MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'];

function toInputDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

function getDefaultDates(period) {
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 1);
  let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  if (period === 'WEEKLY') {
    const day = now.getDay();
    start = new Date(now); start.setDate(now.getDate() - day);
    end = new Date(start); end.setDate(start.getDate() + 6);
  } else if (period === 'YEARLY') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31);
  }
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function AddEditBudget() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEdit = Boolean(id);

  const defaultDates = getDefaultDates('MONTHLY');
  const [form, setForm] = useState({
    name: '',
    limitAmount: '',
    currency: user?.currency || 'INR',
    period: 'MONTHLY',
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    budgetService.getById(Number(id))
      .then(res => {
        const d = res.data;
        setForm({
          name: d.name,
          limitAmount: d.limitAmount,
          currency: d.currency || user?.currency || 'INR',
          period: d.period,
          startDate: toInputDate(d.startDate),
          endDate: toInputDate(d.endDate),
          categoryId: d.categoryId || '',
        });
      })
      .catch(() => navigate('/budgets'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, user]);

  const handlePeriodChange = (period) => {
    const dates = period !== 'CUSTOM' ? getDefaultDates(period) : { startDate: form.startDate, endDate: form.endDate };
    setForm(prev => ({ ...prev, period, ...dates }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Budget name is required.';
    if (!form.limitAmount || Number(form.limitAmount) <= 0) e.limitAmount = 'Please enter a valid positive amount.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate) e.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = 'End date must be after start date.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        limitAmount: Number(form.limitAmount),
        currency: form.currency,
        period: form.period,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };
      if (isEdit) {
        await budgetService.update(Number(id), payload);
      } else {
        await budgetService.create(payload);
      }
      navigate('/budgets');
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save budget. Please try again.';
      setErrors({ submit: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <BiPieChartAlt size={42} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <p>Loading budget details...</p>
    </div>
  );

  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/budgets')} className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <BiArrowBack size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>{isEdit ? 'Edit' : 'New'} <span className="text-gradient">Budget</span></h1>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
            {isEdit ? 'Update your budget settings.' : 'Define a spending limit for a category or period.'}
          </p>
        </div>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          {/* Period Selection */}
          <div className="form-group">
            <label className="form-label">Budget Period</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PERIODS.map(p => (
                <button type="button" key={p} onClick={() => handlePeriodChange(p)} style={{
                  padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                  border: form.period === p ? 'none' : '1px solid var(--border-color)',
                  background: form.period === p ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.03)',
                  color: form.period === p ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: form.period === p ? '0 4px 12px var(--primary-glow)' : 'none',
                }}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Budget Name *</label>
            <input
              id="budget-name"
              type="text"
              className="form-control"
              placeholder="e.g. Groceries, Entertainment, Travel..."
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              maxLength={100}
            />
            {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.name}</p>}
          </div>

          {/* Limit Amount */}
          <div className="form-group">
            <label className="form-label">Spending Limit ({form.currency}) *</label>
            <input
              id="budget-limit"
              type="number"
              className="form-control"
              placeholder="Enter maximum spending amount"
              value={form.limitAmount}
              onChange={e => setForm(prev => ({ ...prev, limitAmount: e.target.value }))}
              min="0.01"
              step="0.01"
            />
            {errors.limitAmount && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.limitAmount}</p>}
          </div>

          {/* Category (optional) */}
          <div className="form-group">
            <label className="form-label">Category <span className="text-muted" style={{ fontSize: '0.78rem' }}>(optional)</span></label>
            <select
              id="budget-category"
              className="form-control"
              value={form.categoryId}
              onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              <option value="">— Overall / No specific category —</option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                id="budget-start"
                type="date"
                className="form-control"
                value={form.startDate}
                onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
              {errors.startDate && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.startDate}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                id="budget-end"
                type="date"
                className="form-control"
                value={form.endDate}
                onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
              {errors.endDate && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.endDate}</p>}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/budgets')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <BiSave size={18} />
              {saving ? 'Saving...' : isEdit ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditBudget;
