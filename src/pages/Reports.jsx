import React, { useState, useEffect, useContext } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BiDownload, BiBarChartAlt2, BiTrendingUp } from 'react-icons/bi';
import { reportService } from '../services';
import { AuthContext } from '../context/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

function Reports() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState(null);
  const [trend, setTrend] = useState([]);
  const [savingsRate, setSavingsRate] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  
  // PDF state
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const currency = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '₹';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        const firstDay = new Date(year, month - 1, 1).toISOString();
        const lastDay = new Date(year, month, 0).toISOString();

        const [catRes, incExpRes, trendRes, savRes, topCatRes] = await Promise.all([
          reportService.getCategoryBreakdown(firstDay, lastDay),
          reportService.getIncomeVsExpense(month, year),
          reportService.getTrendAnalysis(6),
          reportService.getSavingsRate(month, year),
          reportService.getTopCategories(5)
        ]);

        setCategoryBreakdown(catRes.data || []);
        setIncomeVsExpense(incExpRes.data || { totalIncome: 0, totalExpense: 0 });
        setTrend(trendRes.data || []);
        setSavingsRate(savRes.data?.SavingsRate || savRes.data?.savingsRate || 0);
        setTopCategories(topCatRes.data || []);

      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const now = new Date();
      const res = await reportService.generatePdf({
        reportType: 'MONTHLY',
        parameters: {
          month: String(now.getMonth() + 1),
          year: String(now.getFullYear())
        }
      });
      alert(`Report generated! Access it at: ${res.data.filePath}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Chart configs
  ChartJS.defaults.color = '#94a3b8';
  ChartJS.defaults.font.family = "'Outfit', sans-serif";

  // 1. Doughnut Chart (Category Breakdown)
  const doughnutData = {
    labels: categoryBreakdown.map(c => c.categoryName),
    datasets: [{
      data: categoryBreakdown.map(c => c.totalAmount),
      backgroundColor: [
        '#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b',
        '#3b82f6', '#14b8a6', '#f43f5e', '#84cc16', '#64748b'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${currency}${ctx.raw.toLocaleString()}`
        }
      }
    },
    cutout: '70%'
  };

  // 2. Bar Chart (Income vs Expense)
  const barData = {
    labels: ['This Month'],
    datasets: [
      {
        label: 'Income',
        data: [incomeVsExpense?.totalIncome || 0],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: [incomeVsExpense?.totalExpense || 0],
        backgroundColor: '#ef4444',
        borderRadius: 6,
      }
    ]
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${currency}${ctx.raw.toLocaleString()}` } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  // 3. Line Chart (Trend)
  const lineData = {
    labels: trend.map(t => t.period),
    datasets: [
      {
        label: 'Income',
        data: trend.map(t => t.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expense',
        data: trend.map(t => t.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <BiBarChartAlt2 size={42} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <p>Crunching the numbers...</p>
    </div>
  );

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Financial <span className="text-gradient">Analytics</span></h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Insights into your spending and saving habits.</p>
        </div>
        <button className="btn btn-primary" onClick={handleGeneratePdf} disabled={generatingPdf}>
          <BiDownload size={20} /> {generatingPdf ? 'Generating PDF...' : 'Download Report'}
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 grid-gap mb-4">
        <div className="glass-card flex items-center justify-between" style={{ borderLeft: '4px solid var(--success)' }}>
          <div>
            <p className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Savings Rate</p>
            <h2 style={{ margin: '0.25rem 0 0', fontSize: '2rem', color: 'var(--success)' }}>
              {savingsRate}%
            </h2>
          </div>
          <BiTrendingUp size={42} style={{ color: 'var(--success)', opacity: 0.2 }} />
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p className="text-muted mb-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Categories (Month)</p>
          {topCategories.length === 0 ? (
            <span className="text-muted">No expenses yet.</span>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {topCategories.slice(0,3).map((c, i) => (
                <span key={i} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {c.categoryName}: {currency}{c.totalAmount.toLocaleString()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-gap mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Doughnut Chart */}
        <div className="glass-card">
          <h4 style={{ marginBottom: '1.5rem' }}>Expense Breakdown</h4>
          <div style={{ height: '300px' }}>
            {categoryBreakdown.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted">No data available</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card">
          <h4 style={{ marginBottom: '1.5rem' }}>Income vs Expense</h4>
          <div style={{ height: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="glass-card">
        <h4 style={{ marginBottom: '1.5rem' }}>6-Month Trend</h4>
        <div style={{ height: '350px' }}>
          {trend.length > 0 ? (
             <Line data={lineData} options={lineOptions} />
          ) : (
             <div className="flex items-center justify-center h-full text-muted">Not enough data to show trends.</div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Reports;
