import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Notifications() {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });

  const load = () => api.get('/notifications').then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  const markAll = () => api.put('/notifications/read-all').then(load);
  const markOne = (id) => api.put(`/notifications/${id}/read`).then(load);

  return (
    <div>
      <div className="page-head">
        <h2>Notifications {data.unreadCount > 0 && <span className="badge badge-pending">{data.unreadCount} new</span>}</h2>
        {data.unreadCount > 0 && <button onClick={markAll} className="btn btn-sm">Mark all read</button>}
      </div>
      {data.notifications.length === 0 && <p className="muted">No notifications yet.</p>}
      {data.notifications.map((n) => (
        <div key={n._id} className={`list-row ${n.isRead ? '' : 'unread'}`} onClick={() => !n.isRead && markOne(n._id)}>
          <div>
            <p>{n.message}</p>
            <span className="muted">{new Date(n.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
