import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navByPerfil = {
  admin: [
    { to: '/admin', label: 'Produtos' },
    { to: '/pedidos', label: 'Pedidos' },
    { to: '/admin/relatorio', label: 'Relatório' },
  ],
  operador: [
    { to: '/operador', label: 'Vendas' },
    { to: '/pedidos', label: 'Pedidos' },
  ],
  cliente: [
    { to: '/cliente', label: 'Meus pedidos' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = user ? navByPerfil[user.perfil] ?? [] : [];

  const handleSair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to={links[0]?.to ?? '/'} className="logo">
          Quitanda
        </Link>
        <nav className="nav">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="user-bar">
          <span className="user-name">{user?.nome}</span>
          <span className="user-perfil">{user?.perfil}</span>
          <button type="button" onClick={handleSair} className="btn-sair">
            Sair
          </button>
        </div>
      </header>
      <main className="main">{children}</main>
      <style>{`
        .layout { min-height: 100vh; display: flex; flex-direction: column; }
        .header {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 24px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .logo {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary);
          text-decoration: none;
        }
        .logo:hover { text-decoration: none; opacity: 0.9; }
        .nav { display: flex; gap: 8px; }
        .nav a {
          padding: 8px 14px;
          border-radius: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
        }
        .nav a:hover { color: var(--primary); background: var(--accent-soft); }
        .nav a.active { color: var(--primary); background: var(--accent-soft); }
        .user-bar {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-name { font-weight: 500; }
        .user-perfil {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .btn-sair {
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: transparent;
          color: var(--text);
          font-weight: 500;
        }
        .btn-sair:hover { background: var(--bg); border-color: var(--text-muted); }
        .main { flex: 1; padding: 24px; }
      `}</style>
    </div>
  );
}
