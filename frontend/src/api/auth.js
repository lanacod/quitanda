import { api } from './client';

export const login = (email, senha) =>
  api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
