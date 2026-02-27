import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import StudentLogin from './pages/StudentLogin.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/login" replace />} />
      <Route path="/login" element={<Navigate to="/student/login" replace />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
