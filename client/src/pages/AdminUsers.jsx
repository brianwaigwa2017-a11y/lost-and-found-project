import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/admin/users', { params: search ? { search } : {} })
    .then(({ data }) => setUsers(data.users)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const changeRole = async (id, role) => {
    try { await api.put(`/admin/users/${id}/role`, { role }); load(); }
    catch (e) { setError(errorMessage(e)); }
  };

  const toggleActive = async (id) => {
    try { await api.put(`/admin/users/${id}/toggle-active`); load(); }
    catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div>
      <h2>User Management</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn">Search</button>
      </form>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name} {u.studentId && <span className="muted">({u.studentId})</span>}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                  <option value="student">student</option>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td><span className={`badge badge-${u.isActive ? 'approved' : 'rejected'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
              <td><button onClick={() => toggleActive(u._id)} className="btn btn-sm btn-outline">{u.isActive ? 'Deactivate' : 'Reactivate'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
