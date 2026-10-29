import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ItemCard';

export default function AdminItems() {
  const { user } = useAuth();
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/items', { params: { status } })
    .then(({ data }) => setItems(data.items)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const moderate = async (id, newStatus) => {
    const adminNotes = window.prompt(`Optional note for ${newStatus}:`) || '';
    try {
      await api.put(`/items/${id}/status`, { status: newStatus, adminNotes });
      load();
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div>
      <h2>Report Moderation</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filter-bar">
        {['pending', 'approved', 'rejected', 'claimed', 'returned', ''].map((s) => (
          <button key={s || 'all'} className={`btn btn-sm ${status === s ? '' : 'btn-outline'}`}
            onClick={() => setStatus(s)}>{s || 'All'}</button>
        ))}
      </div>
      <table className="table">
        <thead><tr><th>Item</th><th>Type</th><th>Reporter</th><th>Status</th>{user.role === 'admin' && <th>Actions</th>}</tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i._id}>
              <td><Link to={`/items/${i._id}`}>{i.title}</Link><br /><span className="muted">{i.location}</span></td>
              <td><span className={`badge badge-${i.type}`}>{i.type}</span></td>
              <td>{i.reporter?.name}</td>
              <td><StatusBadge status={i.status} /></td>
              {user.role === 'admin' && (
                <td className="row-actions">
                  {i.status === 'pending' && (
                    <>
                      <button onClick={() => moderate(i._id, 'approved')} className="btn btn-sm">Approve</button>
                      <button onClick={() => moderate(i._id, 'rejected')} className="btn btn-sm btn-danger">Reject</button>
                    </>
                  )}
                  {i.status === 'claimed' && (
                    <button onClick={() => moderate(i._id, 'returned')} className="btn btn-sm">Mark Returned</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="muted">No reports in this category.</p>}
    </div>
  );
}
