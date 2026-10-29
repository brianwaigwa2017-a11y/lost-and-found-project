import { Link } from 'react-router-dom';

const CATEGORIES = {
  electronics: 'Electronics', identification: 'ID / Identification', books: 'Books',
  bags: 'Bags', wallets: 'Wallets', keys: 'Keys', clothing: 'Clothing',
  documents: 'Documents', other: 'Other',
};

export const STATUS_LABELS = {
  pending: 'Pending Review', approved: 'Approved', rejected: 'Rejected',
  claimed: 'Claimed', returned: 'Returned',
};

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export default function ItemCard({ item, showStatus = false }) {
  return (
    <Link to={`/items/${item._id}`} className="item-card">
      {item.image ? (
        <img src={item.image} alt={item.title} className="item-card-img" />
      ) : (
        <div className="item-card-img placeholder">No image</div>
      )}
      <div className="item-card-body">
        <div className="item-card-tags">
          <span className={`badge badge-${item.type}`}>{item.type === 'lost' ? 'Lost' : 'Found'}</span>
          <span className="badge badge-category">{CATEGORIES[item.category] || item.category}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="muted">📍 {item.location} · {new Date(item.date).toLocaleDateString()}</p>
        {showStatus && <StatusBadge status={item.status} />}
      </div>
    </Link>
  );
}
