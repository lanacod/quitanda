import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const getRedirectByPerfil = (perfil) => {
  if (perfil === 'admin') return '/admin';
  if (perfil === 'operador') return '/operador';
  return '/cliente';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      show('Preencha email e senha', true);
      return;
    }
    setLoading(true);
    try {
      const usuario = await login(email.trim(), senha);
      const to = from && ['/admin', '/operador', '/cliente'].includes(from)
        ? from
        : getRedirectByPerfil(usuario.perfil);
      navigate(to, { replace: true });
    } catch (err) {
      show(err.message ?? 'Erro ao entrar', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Quitanda</h1>
        <p className="login-sub">Entre com sua conta</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .login-card {
          width: 100%;
          max-width: 380px;
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 40px;
        }
        .login-card h1 {
          margin: 0 0 4px;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary);
        }
        .login-sub {
          margin: 0 0 28px;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .login-card form label {
          display: block;
          margin-bottom: 16px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text);
        }
        .login-card form input {
          display: block;
          width: 100%;
          margin-top: 6px;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
        }
        .login-card form input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .login-card .btn {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
        }
        .btn-primary {
          background: var(--primary);
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
