import React, { useEffect, useState } from 'react';
import { BiPlus, BiEdit, BiTrash, BiPowerOff, BiCheckCircle } from 'react-icons/bi';
import { categoryService } from '../services';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🏷️', color: '#3b82f6', type: 'EXPENSE' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenForm = (category = null) => {
    setError('');
    if (category) {
      setEditId(category.categoryId);
      setForm({
        name: category.name,
        icon: category.icon || '🏷️',
        color: category.color || '#3b82f6',
        type: category.type || 'EXPENSE'
      });
    } else {
      setEditId(null);
      setForm({ name: '', icon: '🏷️', color: '#3b82f6', type: 'EXPENSE' });
    }
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await categoryService.update(editId, form);
      } else {
        await categoryService.create(form);
      }
      setFormVisible(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await categoryService.deactivate(id);
      fetchCategories();
    } catch (err) {
      alert('Failed to update category status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      setCategories(categories.filter(c => c.categoryId !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category. It may be in use.');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Seed default categories?')) return;
    try {
      await categoryService.seedDefaults();
      fetchCategories();
    } catch (err) {
      alert('Failed to seed defaults.');
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gradient">Categories</h1>
          <p className="text-muted">Manage your income and expense categories</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={handleSeedDefaults}>Seed Defaults</button>
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <BiPlus /> Add Category
          </button>
        </div>
      </div>

      {formVisible && (
        <div className="glass-card mb-4">
          <h3 className="mb-3">{editId ? 'Edit Category' : 'New Category'}</h3>
          {error && <div className="badge badge-danger mb-3" style={{ display: 'block', padding: '0.75rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 grid-gap">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input name="name" className="form-control" value={form.name} onChange={handleChange} required placeholder="e.g. Groceries" />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select name="type" className="form-control" value={form.type} onChange={handleChange} required>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Icon (Emoji)</label>
                <input name="icon" className="form-control" value={form.icon} onChange={handleChange} placeholder="e.g. 🍔" />
              </div>
              <div className="form-group">
                <label className="form-label">Color Hex</label>
                <div className="flex gap-2 items-center">
                  <input name="color" type="color" value={form.color} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', background: 'none' }} />
                  <input name="color" className="form-control flex-1" value={form.color} onChange={handleChange} placeholder="#3b82f6" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Category'}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleCloseForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        {loading ? (
          <p className="text-muted text-center" style={{ padding: '2rem' }}>Loading categories...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Icon', 'Name', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.categoryId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: c.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '1.5rem' }}>{c.icon}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>
                    {c.name}
                    {c.isSystemDefault && <span className="badge badge-warning ml-2" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>Default</span>}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span className={`badge ${c.type === 'INCOME' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {c.isActive ? (
                      <span className="text-success flex items-center gap-1" style={{ fontSize: '0.8rem' }}><BiCheckCircle /> Active</span>
                    ) : (
                      <span className="text-muted flex items-center gap-1" style={{ fontSize: '0.8rem' }}><BiPowerOff /> Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => handleOpenForm(c)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }} title="Edit">
                        <BiEdit />
                      </button>
                      <button className="btn btn-outline" onClick={() => handleToggleActive(c.categoryId)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }} title="Toggle Active">
                        <BiPowerOff />
                      </button>
                      {!c.isSystemDefault && (
                        <button className="btn btn-danger" onClick={() => handleDelete(c.categoryId)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }} title="Delete">
                          <BiTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found. Click 'Seed Defaults' to get started.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Categories;
