import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { StatusBadge } from '../components/ItemCard';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/claims/mine').then(({ data }) => setClaims(data.claims)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this claim?')) return;
    try { await api.delete(`/claims/${id}`); load(); }
    catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div>
      <h2>My Claims</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {claims.length === 0 && <p className="muted">You haven't submitted any claims.</p>}
      {claims.map((c) => (
        <div key={c._id} className="list-row">
          <div>
            <Link to={`/items/${c.item?._id}`}><strong>{c.item?.title}</strong></Link>
            <p className="muted">{c.message}</p>
            {c.adminNotes && <p className="muted">Admin note: {c.adminNotes}</p>}
          </div>
          <div className="row-actions">
            <StatusBadge status={c.status} />
            {c.status === 'pending' && (
              <button onClick={() => withdraw(c._id)} className="btn btn-sm btn-danger">Withdraw</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
