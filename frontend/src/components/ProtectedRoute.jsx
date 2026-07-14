import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center" style={{ padding: '3rem', color: '#6a8aaa' }}>⏳ در حال بارگذاری...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;