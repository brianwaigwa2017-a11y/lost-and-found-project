import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user && (user.role === 'admin' || user.role === 'staff');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🔍 Lost &amp; Found</Link>
      <div className="nav-links">
        <NavLink to="/items">Browse</NavLink>
        {user && <NavLink to="/report">Report Item</NavLink>}
        {user && <NavLink to="/my-reports">My Reports</NavLink>}
        {user && <NavLink to="/my-claims">My Claims</NavLink>}
        {user && <NavLink to="/notifications">Notifications</NavLink>}
        {isStaff && <NavLink to="/admin">Admin</NavLink>}
      </div>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-user">{user.name} ({user.role})</span>
            <Link to="/profile" className="btn btn-sm">Profile</Link>
            <button onClick={handleLogout} className="btn btn-sm btn-outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm btn-outline">Login</Link>
            <Link to="/register" className="btn btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
