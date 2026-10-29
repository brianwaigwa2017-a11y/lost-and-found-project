import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/admin/logs').then(({ data }) => setLogs(data.logs)); }, []);

  return (
    <div>
      <h2>System Activity Logs</h2>
      <table className="table">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th><th>IP</th></tr></thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id}>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td>{l.user?.name || '—'}</td>
              <td><span className="badge badge-category">{l.action}</span></td>
              <td>{l.details}</td>
              <td className="muted">{l.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p className="muted">No activity logged yet.</p>}
    </div>
  );
}
