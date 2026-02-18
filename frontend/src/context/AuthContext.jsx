import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

const storageKey = 'quitanda_auth';

const loadStored = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.token && data?.usuario) return data;
  } catch (_) {}
  return null;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadStored);

  const login = useCallback(async (email, senha) => {
    const data = await apiLogin(email, senha);
    const payload = { token: data.token, usuario: data.usuario };
    localStorage.setItem('quitanda_token', data.token);
    localStorage.setItem(storageKey, JSON.stringify(payload));
    setAuth(payload);
    return data.usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quitanda_token');
    localStorage.removeItem(storageKey);
    setAuth(null);
  }, []);

  const value = {
    user: auth?.usuario ?? null,
    token: auth?.token ?? null,
    isAuthenticated: !!auth?.token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
