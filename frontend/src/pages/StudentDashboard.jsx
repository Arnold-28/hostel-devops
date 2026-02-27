import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import { getStoredUser } from '../auth';

const CATEGORIES = ['Electricity', 'Plumbing', 'Internet', 'Cleanliness', 'Security', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function StudentDashboard() {
  const user = getStoredUser();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [description, setDescription] = useState('');

  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComplaints = async () => {
    const data = await apiFetch('/api/complaints');
    setComplaints(data.complaints || []);
  };

  useEffect(() => {
    loadComplaints().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({ category, priority, description }),
      });
      setDescription('');
      setSuccess('Complaint submitted.');
      await loadComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => complaints, [complaints]);

  return (
    <div className="container">
      <h2>Student Dashboard</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div><strong>{user?.name}</strong></div>
            <div className="badge">{user?.email}</div>
          </div>
        </div>

        <h3 style={{ marginTop: 16 }}>Submit Complaint</h3>
        <form onSubmit={onSubmit}>
          <div className="row">
            <div>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label>Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div style={{ marginTop: 12 }}>
            <button disabled={loading || !description.trim()} type="submit">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="success">{success}</div> : null}
        </form>
      </div>

      <div className="card">
        <h3>Your Complaints</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c._id}>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>{c.category}</td>
                <td>{c.priority}</td>
                <td><span className="badge">{c.status}</span></td>
                <td>{c.description}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No complaints yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
