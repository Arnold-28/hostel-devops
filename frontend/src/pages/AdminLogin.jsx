import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuth } from '../auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@hostelops.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Dummy-only auth (no backend calls)
    if (!email.trim() || !password.trim()) {
      setError('Enter email and password.');
      return;
    }

    setAuth('demo-token-admin', {
      name: 'Admin',
      email,
      role: 'admin',
    });

    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
          <div className="mb-6">
            <div className="text-sm font-semibold text-purple-700">HostelOps</div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">Admin Login</h1>
            <p className="mt-1 text-sm text-gray-600">Manage maintenance tickets and track progress.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Login
            </button>

            <div className="text-sm text-gray-600">
              Student?{' '}
              <Link className="font-semibold text-purple-700 hover:text-purple-800" to="/student/login">
                Go to Student Login
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Demo mode: any non-empty password works.
        </div>
      </div>
    </div>
  );
}
