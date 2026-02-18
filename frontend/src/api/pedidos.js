import { api } from './client';

export const listar = () => api('/pedidos');
export const criar = (cliente_id, itens) =>
  api('/pedidos', {
    method: 'POST',
    body: JSON.stringify({ cliente_id, itens }),
  });
export const marcarComoPago = (id) =>
  api(`/pedidos/${id}/pago`, { method: 'PATCH' });
export const obterFicha = (id) => api(`/pedidos/${id}/ficha`);
