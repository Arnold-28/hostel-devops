import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getStoredUser } from '../auth';

export default function Nav() {
  const user = getStoredUser();
  const navigate = useNavigate();

  const onLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="nav">
      <div className="nav-inner">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <strong>HostelOps</strong>
          {user ? <span className="badge">{user.role}</span> : null}
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/student'}>Dashboard</Link>
              <button className="secondary" onClick={onLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
