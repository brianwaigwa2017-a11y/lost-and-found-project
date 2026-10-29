import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/admin/dashboard').then(({ data }) => setData(data)); }, []);
  if (!data) return <p>Loading…</p>;
  const { stats } = data;
  const isAdmin = user.role === 'admin';

  const cards = [
    ['Total Reports', stats.totalItems], ['Pending Reports', stats.pendingItems],
    ['Approved', stats.approvedItems], ['Claimed/Returned', stats.claimedItems],
    ['Pending Claims', stats.pendingClaims], ['Recovery Rate', `${stats.recoveryRate}%`],
  ];

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        {cards.map(([label, value]) => (
          <div key={label} className="stat-card"><div className="stat-value">{value}</div><div className="muted">{label}</div></div>
        ))}
      </div>
      <div className="admin-nav">
        <Link to="/admin/items" className="btn">Moderate Reports</Link>
        <Link to="/admin/claims" className="btn">Verify Claims</Link>
        <Link to="/admin/users" className="btn">Manage Users</Link>
        {isAdmin && <Link to="/admin/logs" className="btn">System Logs</Link>}
      </div>
      <div className="two-col">
        <section>
          <h3>Recent Reports</h3>
          {data.recentItems.map((i) => (
            <div key={i._id} className="list-row">
              <Link to={`/items/${i._id}`}>{i.title}</Link>
              <span className={`badge badge-${i.status}`}>{i.status}</span>
            </div>
          ))}
        </section>
        <section>
          <h3>Pending Claims</h3>
          {data.recentClaims.length === 0 && <p className="muted">No pending claims.</p>}
          {data.recentClaims.map((c) => (
            <div key={c._id} className="list-row">
              <span>{c.item?.title} — <em>{c.claimant?.name}</em></span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
