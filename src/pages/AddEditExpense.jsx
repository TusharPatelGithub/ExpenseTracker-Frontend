import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expenseService, categoryService } from '../services';
import { AuthContext } from '../context/AuthContext';

const PAYMENT_MODES = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];

function AddEditExpense() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    description: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH', tags: '', isRecurring: false, currency: user?.currency || 'INR', receiptFile: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data || []));
    if (isEdit) {
      expenseService.getById(id).then(res => {
        const e = res.data;
        setForm({
          description: e.description, amount: e.amount, categoryId: e.categoryId,
          date: e.date?.split('T')[0], paymentMode: e.paymentMode,
          tags: e.tags || '', isRecurring: e.isRecurring, currency: e.currency,
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await expenseService.update(id, { ...form, amount: parseFloat(form.amount), categoryId: parseInt(form.categoryId) });
      } else {
        const formData = new FormData();
        formData.append('description', form.description);
        formData.append('amount', parseFloat(form.amount));
        formData.append('categoryId', parseInt(form.categoryId));
        formData.append('date', form.date);
        formData.append('paymentMode', form.paymentMode);
        formData.append('currency', form.currency);
        formData.append('isRecurring', form.isRecurring);
        if (form.tags) formData.append('tags', form.tags);
        if (form.receiptFile) formData.append('receiptFile', form.receiptFile);

        await expenseService.add(formData);
      }
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-gradient mb-4">{isEdit ? 'Edit Expense' : 'Add New Expense'}</h2>
      <div className="glass-card">
        {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 grid-gap">
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input name="description" className="form-control" placeholder="e.g. Grocery shopping" value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input name="amount" type="number" step="0.01" className="form-control" placeholder="0.00" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="categoryId" className="form-control" value={form.categoryId} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input name="date" type="date" className="form-control" value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select name="paymentMode" className="form-control" value={form.paymentMode} onChange={handleChange}>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input name="tags" className="form-control" placeholder="food, weekly, essentials" value={form.tags} onChange={handleChange} />
            </div>
            {!isEdit && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Receipt Image</label>
                <input name="receiptFile" type="file" accept="image/*" className="form-control" onChange={handleChange} style={{ padding: '0.5rem' }} />
                <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>Upload an image of your receipt (optional).</small>
              </div>
            )}
          </div>
          <div className="form-group flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <input type="checkbox" name="isRecurring" id="isRecurring" checked={form.isRecurring} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="isRecurring" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>This is a recurring expense</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/expenses')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditExpense;
