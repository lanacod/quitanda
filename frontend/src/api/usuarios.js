import { api } from './client';

export const listar = () => api('/usuarios');
export const listarClientes = () => api('/usuarios/clientes');
