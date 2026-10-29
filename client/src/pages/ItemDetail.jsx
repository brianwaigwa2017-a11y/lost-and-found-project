import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard, { StatusBadge } from '../components/ItemCard';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [claimForm, setClaimForm] = useState({
    email: user?.email || '',
    message: '',
    proofDescription: '',
  });
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.get(`/items/${id}`).then(({ data }) => setData(data)).catch(() => setError('Item not found'));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    if (user?.email) {
      setClaimForm((form) => ({ ...form, email: form.email || user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (data && user && (data.item.reporter?._id === user._id || user.role === 'admin' || user.role === 'staff')) {
      api.get(`/claims/item/${id}`).then(({ data }) => setClaims(data.claims)).catch(() => {});
    }
  }, [data, user, id]);

  if (!data) return <p>Loading…</p>;
  const { item, matches } = data;
  const isOwner = user && item.reporter?._id === user._id;

  const submitClaim = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setIsSubmittingClaim(true);
    try {
      const { data: response } = await api.post('/claims', { itemId: id, ...claimForm });
      setIsClaimFormOpen(false);

      if (!response.emailSent) {
        setError(response.message);
        return;
      }

      setSuccess(`Claim submitted. A confirmation email was sent to ${claimForm.email}. An administrator will verify it.`);
      setClaimForm({ email: user?.email || '', message: '', proofDescription: '' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await api.delete(`/items/${id}`);
      navigate('/my-reports');
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <div className="detail-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="detail-layout">
        <div>
          {item.image ? <img src={item.image} alt={item.title} className="detail-img" />
                     : <div className="detail-img placeholder">No image</div>}
        </div>
        <div>
          <div className="item-card-tags">
            <span className={`badge badge-${item.type}`}>{item.type}</span>
            <span className="badge badge-category">{item.category}</span>
            <StatusBadge status={item.status} />
          </div>
          <h2>{item.title}</h2>
          <p className="muted">📍 {item.location} · 🗓 {new Date(item.date).toLocaleDateString()}</p>
          <p>{item.description}</p>
          <p className="muted">Reported by {item.reporter?.name}</p>
          {item.adminNotes && <p className="alert alert-info">Admin note: {item.adminNotes}</p>}
          {isOwner && (
            <div className="row-actions">
              <Link to={`/report?edit=${item._id}`} className="btn btn-sm">Edit</Link>
              <button onClick={remove} className="btn btn-sm btn-danger">Delete</button>
            </div>
          )}
        </div>
      </div>

      {user && !isOwner && item.status === 'approved' && (
        <section>
          <button
            type="button"
            className="btn"
            disabled={isSubmittingClaim}
            aria-expanded={isClaimFormOpen}
            onClick={() => {
              setError('');
              setSuccess('');
              setIsClaimFormOpen((open) => !open);
            }}
          >
            {isClaimFormOpen ? 'Cancel Claim' : 'Claim Item'}
          </button>
          {isClaimFormOpen && (
            <form className="form-card" onSubmit={submitClaim}>
              <h3>Claim this item</h3>
              <p className="muted">Enter an email address for your confirmation. An administrator will verify your claim.</p>
              <label>Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={claimForm.email}
                  onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                />
              </label>
              <label>Message
                <textarea required rows={2} value={claimForm.message}
                  onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })} />
              </label>
              <label>Proof description (e.g., identifying marks, contents)
                <textarea required rows={3} value={claimForm.proofDescription}
                  onChange={(e) => setClaimForm({ ...claimForm, proofDescription: e.target.value })} />
              </label>
              <button className="btn" disabled={isSubmittingClaim}>
                {isSubmittingClaim ? 'Submitting…' : 'Submit Claim'}
              </button>
            </form>
          )}
        </section>
      )}

      {claims.length > 0 && (
        <section>
          <h3>Claims on this item ({claims.length})</h3>
          <table className="table">
            <thead><tr><th>Claimant</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c._id}>
                  <td>{c.claimant?.name}<br /><span className="muted">{c.contactEmail || c.claimant?.email}</span></td>
                  <td>{c.message}<br /><span className="muted">Proof: {c.proofDescription}</span></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {matches?.length > 0 && (
        <section>
          <h3>Potential Matches (unverified suggestions)</h3>
          <div className="card-grid">
            {matches.map((m) => <ItemCard key={m.item?._id || m._id} item={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
