import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';

const CATEGORIES = ['electronics', 'identification', 'books', 'bags', 'wallets', 'keys', 'clothing', 'documents', 'other'];

export default function ReportItem() {
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'other', type: 'lost', location: '', date: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editId) {
      api.get(`/items/${editId}`).then(({ data }) => {
        const it = data.item;
        setForm({
          title: it.title, description: it.description, category: it.category,
          type: it.type, location: it.location,
          date: new Date(it.date).toISOString().slice(0, 10),
        });
      }).catch((err) => setError(errorMessage(err)));
    }
  }, [editId]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      if (editId) {
        await api.put(`/items/${editId}`, fd);
      } else {
        await api.post('/items', fd);
      }
      navigate('/my-reports');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="form-card wide" onSubmit={submit}>
        <h2>{editId ? 'Edit Report' : 'Report an Item'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="type-toggle">
          {['lost', 'found'].map((t) => (
            <button type="button" key={t}
              className={`btn btn-sm ${form.type === t ? '' : 'btn-outline'}`}
              onClick={() => setForm({ ...form, type: t })}>
              I {t} an item
            </button>
          ))}
        </div>
        <label>Title
          <input required maxLength={150} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label>Description
          <textarea required rows={4} maxLength={2000} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label>Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
          </select>
        </label>
        <label>Location
          <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </label>
        <label>Date {form.type === 'lost' ? 'lost' : 'found'}
          <input type="date" required value={form.date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label>Photo (jpeg/png/gif/webp, max 5MB)
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : editId ? 'Update Report' : 'Submit Report'}</button>
      </form>
    </div>
  );
}
