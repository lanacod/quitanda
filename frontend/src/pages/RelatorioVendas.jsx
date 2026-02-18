import { useState, useEffect } from 'react';
import { vendasDia } from '../api/relatorios';
import { useToast } from '../components/Toast';

function formatPrice(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDate(s) {
  if (!s) return '–';
  return new Date(s).toLocaleString('pt-BR');
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function RelatorioVendas() {
  const [data, setData] = useState(todayStr());
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const carregar = (dataParam) => {
    setLoading(true);
    vendasDia(dataParam ?? data)
      .then(setResultado)
      .catch((e) => show(e.message ?? 'Erro ao carregar relatório', true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar(data);
  }, [data]);

  return (
    <div className="relatorio-page">
      <div className="page-header">
        <h1>Relatório de vendas</h1>
        <label className="field-inline">
          Data
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </label>
      </div>

      {loading && <p className="loading">Carregando…</p>}
      {!loading && resultado && (
        <>
          <div className="resumo">
            <div className="resumo-card">
              <span className="resumo-label">Pedidos pagos</span>
              <span className="resumo-valor">{resultado.totalPedidos}</span>
            </div>
            <div className="resumo-card destaque">
              <span className="resumo-label">Total vendido</span>
              <span className="resumo-valor">{formatPrice(resultado.totalVendido)}</span>
            </div>
          </div>
          <section className="card tabela-section">
            <h2>Pedidos do dia</h2>
            {resultado.pedidos.length === 0 ? (
              <p className="empty">Nenhum pedido pago nesta data.</p>
            ) : (
              <table className="table-pedidos">
                <thead>
                  <tr>
                    <th>Ficha</th>
                    <th>Total</th>
                    <th>Data/hora</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.pedidos.map((p) => (
                    <tr key={p.id}>
                      <td className="ficha">{p.numero_ficha ?? '–'}</td>
                      <td>{formatPrice(Number(p.total))}</td>
                      <td>{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      <style>{`
        .relatorio-page { max-width: 720px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .relatorio-page h1 { margin: 0; font-size: 1.5rem; color: var(--primary); }
        .field-inline { display: flex; align-items: center; gap: 8px; font-weight: 500; }
        .field-inline input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; }
        .loading { color: var(--text-muted); }
        .resumo { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .resumo-card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 20px 28px;
          min-width: 160px;
        }
        .resumo-card.destaque { background: var(--primary); color: #fff; }
        .resumo-label { display: block; font-size: 0.9rem; opacity: 0.9; margin-bottom: 4px; }
        .resumo-valor { font-size: 1.35rem; font-weight: 700; }
        .tabela-section { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); padding: 24px; }
        .tabela-section h2 { margin: 0 0 16px; font-size: 1.1rem; color: var(--text); }
        .empty { margin: 0; color: var(--text-muted); }
        .table-pedidos { width: 100%; border-collapse: collapse; }
        .table-pedidos th, .table-pedidos td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); }
        .table-pedidos th { font-weight: 600; color: var(--text-muted); font-size: 0.9rem; }
        .table-pedidos .ficha { font-weight: 600; font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
}
