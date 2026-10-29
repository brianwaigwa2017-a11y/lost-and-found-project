import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import ItemCard from '../components/ItemCard';

export default function MyReports() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/items/mine').then(({ data }) => setItems(data.items)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try { await api.delete(`/items/${id}`); load(); }
    catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div>
      <div className="page-head">
        <h2>My Reports</h2>
        <Link to="/report" className="btn">+ New Report</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card-grid">
        {items.map((item) => (
          <div key={item._id} className="card-with-actions">
            <ItemCard item={item} showStatus />
            <div className="row-actions">
              <Link to={`/items/${item._id}`} className="btn btn-sm btn-outline">View</Link>
              {!['claimed', 'returned'].includes(item.status) && (
                <>
                  <Link to={`/report?edit=${item._id}`} className="btn btn-sm">Edit</Link>
                  <button onClick={() => remove(item._id)} className="btn btn-sm btn-danger">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="muted">You haven't reported any items yet.</p>}
    </div>
  );
}
