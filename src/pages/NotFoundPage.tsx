import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="center-message">
      <h1>Page not found</h1>
      <Link to="/">Go to the dashboard</Link>
    </div>
  );
}
