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
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/expenses/add" element={<ProtectedRoute><AddEditExpense /></ProtectedRoute>} />
            <Route path="/expenses/edit/:id" element={<ProtectedRoute><AddEditExpense /></ProtectedRoute>} />
            <Route path="/incomes" element={<ProtectedRoute><Incomes /></ProtectedRoute>} />
            <Route path="/incomes/add" element={<ProtectedRoute><AddEditIncome /></ProtectedRoute>} />
            <Route path="/incomes/edit/:id" element={<ProtectedRoute><AddEditIncome /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


