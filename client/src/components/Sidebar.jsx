import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const icons = {
  home: ['M3 10.5 12 3l9 7.5', 'M5.5 9v11h13V9', 'M9.5 20v-6h5v6'],
  search: ['m20 20-4.5-4.5', 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  report: ['M8 4h8l4 4v12H4V4h4Z', 'M8 4v5h8V4', 'M8 14h8', 'M8 17h5'],
  claim: ['M5 12.5 9.5 17 19 7.5', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  grid: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21v-2a4 4 0 0 0-3-3.87', 'M17 3.13a4 4 0 0 1 0 7.75'],
  logs: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  profile: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z'],
  logout: ['M10 17l5-5-5-5', 'M15 12H3', 'M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7'],
  sun: ['M12 3v2', 'M12 19v2', 'M3 12h2', 'M19 12h2', 'm5.64 5.64 1.42 1.42', 'm16.94 16.94 1.42 1.42', 'm5.64 18.36 1.42-1.42', 'm16.94 7.06 1.42-1.42', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  moon: ['M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
};

function Icon({ name }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}

function SidebarLink({ to, icon, children, onClick }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      onClick={onClick}>
      <Icon name={icon} />
      <span>{children}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isStaff = user && (user.role === 'admin' || user.role === 'staff');

  const closeMenu = () => setOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <>
      <header className="mobile-header">
        <Link to="/" className="sidebar-brand" onClick={closeMenu}>
          <span className="brand-mark"><Icon name="search" /></span>
          <span>Foundly</span>
        </Link>
        <button type="button" className="mobile-menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </header>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={closeMenu} />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <Link to="/" className="sidebar-brand" onClick={closeMenu}>
          <span className="brand-mark"><Icon name="search" /></span>
          <span>Foundly</span>
          <span className="brand-caption">CAMPUS COMMUNITY</span>
        </Link>

        <div className="sidebar-section-label">DISCOVER</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <SidebarLink to="/" icon="home" onClick={closeMenu}>Overview</SidebarLink>
          <SidebarLink to="/items" icon="search" onClick={closeMenu}>Browse items</SidebarLink>
          {user && (
            <>
              <SidebarLink to="/report" icon="plus" onClick={closeMenu}>Report an item</SidebarLink>
              <SidebarLink to="/my-reports" icon="report" onClick={closeMenu}>My reports</SidebarLink>
              <SidebarLink to="/my-claims" icon="claim" onClick={closeMenu}>My claims</SidebarLink>
              <SidebarLink to="/notifications" icon="bell" onClick={closeMenu}>Notifications</SidebarLink>
            </>
          )}
        </nav>

        {isStaff && (
          <>
            <div className="sidebar-section-label sidebar-section-spaced">MANAGEMENT</div>
            <nav className="sidebar-nav" aria-label="Management navigation">
              <SidebarLink to="/admin" icon="grid" onClick={closeMenu}>Dashboard</SidebarLink>
              <SidebarLink to="/admin/items" icon="report" onClick={closeMenu}>Manage items</SidebarLink>
              <SidebarLink to="/admin/claims" icon="claim" onClick={closeMenu}>Manage claims</SidebarLink>
              {user.role === 'admin' && (
                <>
                  <SidebarLink to="/admin/users" icon="users" onClick={closeMenu}>Users</SidebarLink>
                  <SidebarLink to="/admin/logs" icon="logs" onClick={closeMenu}>Activity logs</SidebarLink>
                </>
              )}
            </nav>
          </>
        )}

        <div className="sidebar-bottom">
          <button type="button" className="theme-toggle" onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className="theme-toggle-icon"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></span>
            <span>{theme === 'dark' ? 'Light appearance' : 'Dark appearance'}</span>
            <span className={`theme-switch${theme === 'dark' ? ' on' : ''}`} aria-hidden="true"><span /></span>
          </button>
          <div className="sidebar-divider" />
          {user ? (
            <div className="sidebar-account">
              <span className="account-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
              <div className="account-info">
                <span className="account-name">{user.name}</span>
                <span className="account-role">{user.role}</span>
              </div>
              <Link to="/profile" className="account-action" aria-label="Profile" onClick={closeMenu}>
                <Icon name="profile" />
              </Link>
              <button type="button" className="account-action" aria-label="Log out" onClick={handleLogout}>
                <Icon name="logout" />
              </button>
            </div>
          ) : (
            <div className="sidebar-auth">
              <Link to="/login" className="sidebar-login" onClick={closeMenu}>Log in</Link>
              <Link to="/register" className="sidebar-register" onClick={closeMenu}>Create account</Link>
            </div>
          )}
          <p className="sidebar-footer">A little help goes a long way.</p>
        </div>
      </aside>
    </>
  );
}
