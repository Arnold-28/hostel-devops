import { Navigate } from 'react-router-dom';
import { getStoredUser, getToken } from '../auth';

export default function ProtectedRoute({ children, role }) {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/student/login'} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
}
