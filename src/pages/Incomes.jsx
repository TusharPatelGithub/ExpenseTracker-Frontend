import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiPlus, BiEdit, BiTrash } from 'react-icons/bi';
import { incomeService } from '../services';
import { AuthContext } from '../context/AuthContext';

const SOURCES = ['ALL', 'SALARY', 'FREELANCE', 'INVESTMENT', 'RENTAL', 'OTHER'];

function Incomes() {
  const { user } = useContext(AuthContext);
  const currency = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '₹';
  const [incomes, setIncomes] = useState([]);
  const [netBalance, setNetBalance] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, netRes] = await Promise.all([incomeService.getAll(), incomeService.getNetBalance()]);
        setIncomes(incRes.data || []);
        setNetBalance(netRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) return;
    await incomeService.delete(id);
    setIncomes(incomes.filter(i => i.incomeId !== id));
  };

  const filtered = incomes.filter(i => sourceFilter === 'ALL' || i.source === sourceFilter);

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gradient">Income</h1>
          <p className="text-muted">{incomes.length} total income entries</p>
        </div>
        <Link to="/incomes/add" className="btn btn-primary"><BiPlus /> Add Income</Link>
      </div>

      {/* Net Balance Card */}
      <div className="grid grid-cols-3 grid-gap mb-4">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>TOTAL INCOME</p>
          <h2 style={{ color: 'var(--success)' }}>{currency}{(netBalance?.totalIncome ?? 0).toLocaleString()}</h2>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>TOTAL EXPENSE</p>
          <h2 style={{ color: 'var(--danger)' }}>{currency}{(netBalance?.totalExpense ?? 0).toLocaleString()}</h2>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>NET BALANCE</p>
          <h2 style={{ color: 'var(--primary)' }}>{currency}{(netBalance?.netBalance ?? 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Source Filter */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {SOURCES.map(s => (
          <button key={s} onClick={() => setSourceFilter(s)} className={`btn ${sourceFilter === s ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>{s}</button>
        ))}
      </div>

      {/* Income Table */}
      <div className="glass-card">
        {loading ? <p className="text-muted text-center" style={{ padding: '2rem' }}>Loading income...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Description', 'Source', 'Amount', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr key={inc.incomeId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {inc.description}
                    {inc.isRecurring && <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>🔄 {inc.recurrenceType}</span>}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className="badge badge-success">{inc.source}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--success)', fontWeight: 700 }}>{currency}{Number(inc.amount).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(inc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => navigate(`/incomes/edit/${inc.incomeId}`)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}><BiEdit /></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(inc.incomeId)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}><BiTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No income entries found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Incomes;
