import { useState, useEffect } from 'react';
import { listar as listarPedidos, obterFicha } from '../api/pedidos';
import { useToast } from '../components/Toast';

function formatPrice(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDate(s) {
  if (!s) return '–';
  return new Date(s).toLocaleString('pt-BR');
}

export default function Cliente() {
  const [pedidos, setPedidos] = useState([]);
  const [fichaPedidoId, setFichaPedidoId] = useState(null);
  const [ficha, setFicha] = useState(null);
  const { show } = useToast();

  useEffect(() => {
    listarPedidos().then(setPedidos).catch((e) => show(e.message, true));
  }, [show]);

  useEffect(() => {
    if (!fichaPedidoId) {
      setFicha(null);
      return;
    }
    obterFicha(fichaPedidoId).then(setFicha).catch((e) => {
      show(e.message, true);
      setFichaPedidoId(null);
    });
  }, [fichaPedidoId, show]);

  return (
    <div className="cliente-page">
      <h1>Meus pedidos</h1>
      {pedidos.length === 0 ? (
        <p className="empty">Nenhum pedido ainda.</p>
      ) : (
        <ul className="lista-pedidos">
          {pedidos.map((p) => (
            <li key={p.id} className="card pedido-card">
              <div className="pedido-header">
                <span className="status">{p.status}</span>
                <span className="data">{formatDate(p.created_at)}</span>
              </div>
              <p className="total">Total: {formatPrice(Number(p.total))}</p>
              {p.itens?.length > 0 && (
                <ul className="itens">
                  {p.itens.map((i, idx) => (
                    <li key={idx}>
                      {i.quantidade}× {formatPrice(Number(i.preco_unitario_snapshot))} = {formatPrice(Number(i.subtotal))}
                    </li>
                  ))}
                </ul>
              )}
              {p.status === 'pago' && p.numero_ficha && (
                <button
                  type="button"
                  className="btn btn-ficha"
                  onClick={() => setFichaPedidoId(p.id)}
                >
                  Ver ficha de retirada
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {ficha && (
        <div className="modal-overlay" onClick={() => setFichaPedidoId(null)}>
          <div className="modal ficha-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Ficha de retirada</h2>
            <p className="ficha-numero">{ficha.numero_ficha}</p>
            <p className="ficha-msg">Apresente no balcão para retirar seu pedido.</p>
            <button type="button" className="btn btn-primary" onClick={() => setFichaPedidoId(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      <style>{`
        .cliente-page { max-width: 560px; margin: 0 auto; }
        .cliente-page h1 { margin: 0 0 24px; font-size: 1.5rem; color: var(--primary); }
        .empty { color: var(--text-muted); }
        .lista-pedidos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
        .pedido-card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 20px;
        }
        .pedido-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .status { text-transform: capitalize; font-weight: 600; color: var(--primary); }
        .data { font-size: 0.9rem; color: var(--text-muted); }
        .pedido-card .total { margin: 0 0 12px; font-weight: 600; }
        .itens { margin: 0 0 12px; padding-left: 20px; font-size: 0.95rem; color: var(--text-muted); }
        .btn-ficha { margin-top: 8px; padding: 10px 16px; border: none; border-radius: 8px; background: var(--accent-soft); color: var(--text); font-weight: 500; }
        .btn-ficha:hover { background: var(--accent); color: #fff; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
        .modal { background: var(--card); border-radius: var(--radius); padding: 32px; max-width: 360px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .ficha-modal h2 { margin: 0 0 16px; font-size: 1.25rem; }
        .ficha-numero { font-size: 1.75rem; font-weight: 700; letter-spacing: 3px; color: var(--primary); margin: 0 0 8px; }
        .ficha-msg { margin: 0 0 24px; color: var(--text-muted); }
        .modal .btn-primary { padding: 12px 24px; border: none; border-radius: 8px; background: var(--primary); color: #fff; font-weight: 600; }
        .modal .btn-primary:hover { background: var(--primary-hover); }
      `}</style>
    </div>
  );
}
