import { useEffect, useState } from 'react';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';

const CATEGORIES = ['', 'electronics', 'identification', 'books', 'bags', 'wallets', 'keys', 'clothing', 'documents', 'other'];

export default function BrowseItems() {
  const [filters, setFilters] = useState({ search: '', category: '', type: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get('/items', {
        params: { ...filters, page: p, limit: 12 },
      });
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); setPage(1); /* eslint-disable-next-line */ }, []);

  const submit = (e) => { e.preventDefault(); setPage(1); load(1); };

  return (
    <div>
      <h2>Browse Reports</h2>
      <form className="filter-bar" onSubmit={submit}>
        <input placeholder="Search keywords…" value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c ? c[0].toUpperCase() + c.slice(1) : 'All categories'}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">Lost &amp; Found</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <button className="btn">Search</button>
      </form>

      {loading ? <p>Loading…</p> : (
        <>
          <p className="muted">{data.total} result(s)</p>
          <div className="card-grid">
            {data.items.map((item) => <ItemCard key={item._id} item={item} />)}
          </div>
          {data.items.length === 0 && <p>No matching reports found.</p>}
          {data.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: data.pages }, (_, i) => (
                <button key={i + 1} className={`btn btn-sm ${page === i + 1 ? '' : 'btn-outline'}`}
                  onClick={() => { setPage(i + 1); load(i + 1); }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
