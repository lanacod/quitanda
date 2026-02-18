const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

const getToken = () => localStorage.getItem('quitanda_token');

export const api = async (path, options = {}) => {
  const token = getToken();
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.erro ?? 'Erro na requisição');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};
