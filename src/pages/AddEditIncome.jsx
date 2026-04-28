import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { incomeService } from '../services';
import { AuthContext } from '../context/AuthContext';

const SOURCES = ['SALARY', 'FREELANCE', 'INVESTMENT', 'RENTAL', 'OTHER'];
const RECURRENCE = ['MONTHLY', 'WEEKLY', 'YEARLY'];

function AddEditIncome() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    description: '', amount: '', source: 'SALARY', currency: user?.currency || 'INR',
    date: new Date().toISOString().split('T')[0], isRecurring: false, recurrenceType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      incomeService.getById(id).then(res => {
        const inc = res.data;
        setForm({ description: inc.description, amount: inc.amount, source: inc.source, currency: inc.currency, date: inc.date?.split('T')[0], isRecurring: inc.isRecurring, recurrenceType: inc.recurrenceType || '' });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, amount: parseFloat(form.amount), recurrenceType: form.isRecurring ? form.recurrenceType : null };
      if (isEdit) await incomeService.update(id, payload);
      else await incomeService.add(payload);
      navigate('/incomes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save income.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-gradient mb-4">{isEdit ? 'Edit Income' : 'Add Income'}</h2>
      <div className="glass-card">
        {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 grid-gap">
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input name="description" className="form-control" placeholder="e.g. Monthly salary" value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input name="amount" type="number" step="0.01" className="form-control" placeholder="0.00" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Source *</label>
              <select name="source" className="form-control" value={form.source} onChange={handleChange}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input name="date" type="date" className="form-control" value={form.date} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group flex items-center gap-2">
            <input type="checkbox" name="isRecurring" id="isRecurring" checked={form.isRecurring} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="isRecurring" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Recurring income</label>
          </div>
          {form.isRecurring && (
            <div className="form-group">
              <label className="form-label">Recurrence Type</label>
              <select name="recurrenceType" className="form-control" value={form.recurrenceType} onChange={handleChange}>
                <option value="">Select...</option>
                {RECURRENCE.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Income' : 'Add Income'}</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/incomes')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditIncome;
