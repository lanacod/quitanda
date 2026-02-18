import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedProfiles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedProfiles && !allowedProfiles.includes(user.perfil)) {
    const to = user.perfil === 'admin' ? '/admin' : user.perfil === 'operador' ? '/operador' : '/cliente';
    return <Navigate to={to} replace />;
  }

  return children;
}
