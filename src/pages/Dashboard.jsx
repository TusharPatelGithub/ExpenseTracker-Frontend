import React from 'react';

function Dashboard() {
  return (
    <div>
      <h1 className="text-gradient">Dashboard</h1>
      <p className="text-muted mb-4">Welcome back to SpendSmart! Here is your financial overview.</p>
      
      <div className="grid grid-cols-3 grid-gap">
        <div className="glass-card">
          <p className="text-muted">Net Balance</p>
          <h2>₹ 45,200</h2>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <p className="text-muted">Total Income</p>
          <h2 className="text-success">₹ 85,000</h2>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p className="text-muted">Total Expense</p>
          <h2 className="text-danger">₹ 39,800</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
