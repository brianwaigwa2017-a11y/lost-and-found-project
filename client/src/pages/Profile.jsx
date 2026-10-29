import { useState } from 'react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user.name, studentId: user.studentId || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      const { data } = await api.put('/auth/profile', profile);
      localStorage.setItem('lf_user', JSON.stringify(data.user));
      setUser(data.user);
      setMsg('Profile updated.');
    } catch (err) { setError(errorMessage(err)); }
  };

  const savePw = async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      await api.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      setMsg('Password changed.');
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <div className="auth-page">
      <div className="form-card wide">
        <h2>My Profile</h2>
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <p className="muted">{user.email} · {user.role}</p>
        <form onSubmit={saveProfile}>
          <label>Name
            <input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </label>
          <label>Student / Registration No.
            <input value={profile.studentId} onChange={(e) => setProfile({ ...profile, studentId: e.target.value })} />
          </label>
          <button className="btn">Save Profile</button>
        </form>
        <hr />
        <form onSubmit={savePw}>
          <h3>Change Password</h3>
          <label>Current Password
            <input type="password" required value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </label>
          <label>New Password (min 6 characters)
            <input type="password" required minLength={6} value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </label>
          <button className="btn">Change Password</button>
        </form>
      </div>
    </div>
  );
}
