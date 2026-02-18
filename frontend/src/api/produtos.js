import { api } from './client';

export const listar = () => api('/produtos');
export const criar = (data) =>
  api('/produtos', { method: 'POST', body: JSON.stringify(data) });
export const atualizar = (id, data) =>
  api(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const inativar = (id) =>
  api(`/produtos/${id}/inativar`, { method: 'PATCH' });
