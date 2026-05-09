import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BiUserCircle, BiCoin, BiLockAlt } from 'react-icons/bi';

function Profile() {
  const { user, updateCurrency, logout } = useContext(AuthContext);
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [saving, setSaving] = useState(false);

  const handleCurrencySave = async () => {
    setSaving(true);
    try {
      await updateCurrency(currency);
      alert('Currency updated successfully!');
    } catch (err) {
      alert('Failed to update currency');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="text-center text-muted">Please login to view profile.</div>;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-gradient mb-4">User Profile</h2>
      
      <div className="glass-card mb-4 text-center">
        <BiUserCircle size={80} className="text-primary mx-auto" />
        <h3 className="mt-2">{user.fullName}</h3>
        <p className="text-muted">{user.email}</p>
        <span className="badge badge-success mt-2">Active Account</span>
      </div>

      <div className="grid grid-cols-2 grid-gap">
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-3">
            <BiCoin size={24} className="text-warning" />
            <h4>Preferences</h4>
          </div>
          <div className="form-group">
            <label htmlFor="currency-select" className="form-label">Preferred Currency</label>
            <select 
              id="currency-select"
              name="currency"
              className="form-control" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>
          <button 
            className="btn btn-outline" 
            onClick={handleCurrencySave} 
            disabled={saving || currency === user.currency}
            style={{ width: '100%' }}
          >
            {saving ? 'Saving...' : 'Update Currency'}
          </button>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-2 mb-3">
            <BiLockAlt size={24} className="text-secondary" />
            <h4>Security</h4>
          </div>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Keep your account secure by updating your password regularly.
          </p>
          <button className="btn btn-outline" style={{ width: '100%', marginBottom: '1rem' }}>
            Change Password
          </button>
          <button className="btn btn-danger" onClick={logout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
