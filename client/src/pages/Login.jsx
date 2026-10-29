import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage } from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const dest = location.state?.from?.pathname || (user.role === 'admin' || user.role === 'staff' ? '/admin' : '/');
      navigate(dest);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-welcome">
        <div className="login-welcome-content">
          <span className="login-eyebrow"><span /> YOUR CAMPUS, CONNECTED</span>
          <h1>Lost something?<br /><span>Find your way</span> back to it.</h1>
          <p>A thoughtful campus community makes it easier to reunite people with the things they care about.</p>
          <div className="login-proof">
            <span className="proof-icon">↗</span>
            <span><strong>One community.</strong><br />A better way to find what’s missing.</span>
          </div>
          <div className="login-orbit orbit-one" />
          <div className="login-orbit orbit-two" />
          <div className="login-orbit orbit-three" />
        </div>
        <div className="login-welcome-footer">Made for campus. Built around community.</div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-heading">
            <span className="login-card-kicker">WELCOME BACK</span>
            <h2>Sign in to Foundly</h2>
            <p>Pick up right where you left off.</p>
          </div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <label className="login-label" htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="email" placeholder="you@school.edu"
            required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="login-password-label">
            <label className="login-label" htmlFor="login-password">Password</label>
          </div>
          <input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password"
            required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="login-submit" disabled={busy}>
            {busy ? 'Signing in…' : <>Sign in <span aria-hidden="true">→</span></>}
          </button>
          <p className="login-register">New to Foundly? <Link to="/register">Create an account</Link></p>
          <div className="login-secure"><span aria-hidden="true">✦</span> A safe place for your campus community</div>
        </form>
      </section>
    </div>
  );
}
