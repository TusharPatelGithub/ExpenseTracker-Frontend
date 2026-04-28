import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Expenses from './pages/Expenses';
import AddEditExpense from './pages/AddEditExpense';
import Incomes from './pages/Incomes';
import AddEditIncome from './pages/AddEditIncome';
import Budgets from './pages/Budgets';
import AddEditBudget from './pages/AddEditBudget';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="text-center text-muted" style={{ padding: '4rem' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="container animate-slide-up" style={{ padding: '2rem 1.5rem' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — Phase 2: Auth & Profile */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Protected routes — Phase 3: Expenses & Incomes */}
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/expenses/add" element={<ProtectedRoute><AddEditExpense /></ProtectedRoute>} />
            <Route path="/expenses/edit/:id" element={<ProtectedRoute><AddEditExpense /></ProtectedRoute>} />
            <Route path="/incomes" element={<ProtectedRoute><Incomes /></ProtectedRoute>} />
            <Route path="/incomes/add" element={<ProtectedRoute><AddEditIncome /></ProtectedRoute>} />
            <Route path="/incomes/edit/:id" element={<ProtectedRoute><AddEditIncome /></ProtectedRoute>} />

            {/* Protected routes — Phase 4: Budgets & Notifications */}
            <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
            <Route path="/budgets/add" element={<ProtectedRoute><AddEditBudget /></ProtectedRoute>} />
            <Route path="/budgets/edit/:id" element={<ProtectedRoute><AddEditBudget /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/admin" element={
              <ProtectedRoute>
                {/* Note: Admin role protection should ideally be enforced at the route level too, 
                    but we'll rely on the backend for actual security. Here we just protect it. */}
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
