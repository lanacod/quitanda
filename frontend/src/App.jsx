import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Operador from './pages/Operador';
import Cliente from './pages/Cliente';
import Admin from './pages/Admin';
import Pedidos from './pages/Pedidos';
import RelatorioVendas from './pages/RelatorioVendas';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/operador"
        element={
          <ProtectedRoute allowedProfiles={['operador', 'admin']}>
            <Layout><Operador /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos"
        element={
          <ProtectedRoute allowedProfiles={['operador', 'admin']}>
            <Layout><Pedidos /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedProfiles={['cliente']}>
            <Layout><Cliente /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedProfiles={['admin']}>
            <Layout><Admin /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/relatorio"
        element={
          <ProtectedRoute allowedProfiles={['admin']}>
            <Layout><RelatorioVendas /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
