import { api } from './client';

export const vendasDia = (data) => {
  const url = data ? `/relatorios/vendas-dia?data=${encodeURIComponent(data)}` : '/relatorios/vendas-dia';
  return api(url);
};
