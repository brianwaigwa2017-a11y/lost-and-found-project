import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items', { params: { limit: 6 } })
      .then(({ data }) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>School Lost &amp; Found</h1>
        <p>Report, search, verify and recover lost property — all in one place.</p>
        <div className="hero-actions">
          <Link to="/items" className="btn">Browse Items</Link>
          <Link to="/report" className="btn btn-outline">Report an Item</Link>
        </div>
      </section>
      <h2>Recently Reported</h2>
      {loading ? <p>Loading…</p> : (
        <div className="card-grid">
          {items.map((item) => <ItemCard key={item._id} item={item} />)}
          {items.length === 0 && <p className="muted">No items yet. Be the first to report one.</p>}
        </div>
      )}
    </div>
  );
}
