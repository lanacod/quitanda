import { useState, useEffect } from 'react';
import { listar as listarPedidos } from '../api/pedidos';
import { useToast } from '../components/Toast';

function formatPrice(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDate(s) {
  if (!s) return '–';
  return new Date(s).toLocaleString('pt-BR');
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    setLoading(true);
    listarPedidos()
      .then(setPedidos)
      .catch((e) => show(e.message, true))
      .finally(() => setLoading(false));
  }, [show]);

  return (
    <div className="pedidos-page">
      <h1>Todos os pedidos</h1>
      {loading ? (
        <p className="loading">Carregando…</p>
      ) : pedidos.length === 0 ? (
        <p className="empty">Nenhum pedido registrado.</p>
      ) : (
        <ul className="lista-pedidos">
          {pedidos.map((p) => (
            <li key={p.id} className="card pedido-card">
              <div className="pedido-header">
                <span className="cliente">{p.cliente_nome ?? '–'}</span>
                <span className="status">{p.status}</span>
                <span className="data">{formatDate(p.created_at)}</span>
              </div>
              <p className="total">Total: {formatPrice(Number(p.total))}</p>
              {p.numero_ficha && (
                <p className="ficha">Ficha: {p.numero_ficha}</p>
              )}
              {p.itens?.length > 0 && (
                <ul className="itens">
                  {p.itens.map((i, idx) => (
                    <li key={idx}>
                      {i.quantidade}× {formatPrice(Number(i.preco_unitario_snapshot))} = {formatPrice(Number(i.subtotal))}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .pedidos-page { max-width: 720px; margin: 0 auto; }
        .pedidos-page h1 { margin: 0 0 24px; font-size: 1.5rem; color: var(--primary); }
        .loading, .empty { color: var(--text-muted); }
        .lista-pedidos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
        .pedido-card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 20px;
        }
        .pedido-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
        .pedido-header .cliente { font-weight: 600; min-width: 120px; }
        .pedido-header .status { text-transform: capitalize; font-size: 0.9rem; padding: 4px 10px; border-radius: 6px; background: var(--accent-soft); color: var(--primary); font-weight: 500; }
        .pedido-header .data { margin-left: auto; font-size: 0.9rem; color: var(--text-muted); }
        .pedido-card .total { margin: 0 0 4px; font-weight: 600; }
        .pedido-card .ficha { margin: 0 0 8px; font-size: 0.9rem; color: var(--text-muted); }
        .itens { margin: 0; padding-left: 20px; font-size: 0.95rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
