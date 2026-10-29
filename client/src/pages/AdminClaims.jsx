import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { StatusBadge } from '../components/ItemCard';

export default function AdminClaims() {
  const [status, setStatus] = useState('pending');
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/claims', { params: { status } })
    .then(({ data }) => setClaims(data.claims)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const verify = async (id, newStatus) => {
    const adminNotes = window.prompt(`Optional note for ${newStatus}:`) || '';
    try {
      await api.put(`/claims/${id}/verify`, { status: newStatus, adminNotes });
      load();
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div>
      <h2>Claim Verification</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filter-bar">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button key={s || 'all'} className={`btn btn-sm ${status === s ? '' : 'btn-outline'}`}
            onClick={() => setStatus(s)}>{s || 'All'}</button>
        ))}
      </div>
      {claims.length === 0 && <p className="muted">No claims in this category.</p>}
      {claims.map((c) => (
        <div key={c._id} className="list-row claim-row">
          <div>
            <Link to={`/items/${c.item?._id}`}><strong>{c.item?.title}</strong></Link>
            <p>Claimant: {c.claimant?.name} ({c.claimant?.email}) {c.claimant?.studentId && `· ID: ${c.claimant.studentId}`}</p>
            <p>Claim confirmation email: {c.contactEmail || c.claimant?.email}</p>
            <p className="muted">Item reported by: {c.item?.reporter?.name}</p>
            <p><strong>Message:</strong> {c.message}</p>
            <p><strong>Proof:</strong> {c.proofDescription}</p>
            {c.adminNotes && <p className="muted">Note: {c.adminNotes}</p>}
          </div>
          <div className="row-actions">
            <StatusBadge status={c.status} />
            {c.status === 'pending' && (
              <>
                <button onClick={() => verify(c._id, 'approved')} className="btn btn-sm">Approve</button>
                <button onClick={() => verify(c._id, 'rejected')} className="btn btn-sm btn-danger">Reject</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
