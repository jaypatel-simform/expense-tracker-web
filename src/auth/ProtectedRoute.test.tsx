import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { AuthContext, type AuthContextValue } from './authContext';

function renderAt(path: string, token: string | null) {
  const value: AuthContextValue = {
    token,
    user: null,
    loading: false,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    setUser: () => {},
  };
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<p>login page</p>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>secret</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('route guards', () => {
  it('redirects to /login when there is no token', () => {
    renderAt('/', null);
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders protected content with a token', () => {
    renderAt('/', 'abc');
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('sends signed-in users away from /login', () => {
    renderAt('/login', 'abc');
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
