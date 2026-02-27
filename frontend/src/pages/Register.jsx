import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { setAuth } from '../auth';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setAuth(data.token, data.user);
      navigate('/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: '24px auto' }}>
        <h2>Register (Student)</h2>
        <form onSubmit={onSubmit}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button disabled={loading} type="submit">
              {loading ? 'Creating...' : 'Register'}
            </button>
            <span>
              Already have an account? <Link to="/login">Login</Link>
            </span>
          </div>

          {error ? <div className="error">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
