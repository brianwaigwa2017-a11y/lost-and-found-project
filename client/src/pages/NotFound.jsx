import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="form-card">
        <h2>404 — Page Not Found</h2>
        <p className="muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn">Go Home</Link>
      </div>
    </div>
  );
}
