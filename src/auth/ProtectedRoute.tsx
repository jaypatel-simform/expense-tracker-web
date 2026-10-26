import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

/** Renders child routes only for signed-in users. */
export function ProtectedRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (loading) return <p className="center-message">Loading…</p>;
  return <Outlet />;
}

/** Login/signup are not for signed-in users. */
export function PublicOnlyRoute() {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
