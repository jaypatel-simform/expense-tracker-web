import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses' },
  { to: '/income', label: 'Income' },
  { to: '/categories', label: 'Categories' },
  { to: '/reports', label: 'Reports' },
  { to: '/profile', label: 'Profile' },
];

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <header className="topbar">
        <span className="brand">Expense Tracker</span>
        <nav aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-user">
          <span className="muted">{user?.name || user?.email}</span>
          <button className="btn btn-secondary" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
