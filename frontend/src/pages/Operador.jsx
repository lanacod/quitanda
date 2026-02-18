import { useState, useEffect } from 'react';
import { listar as listarProdutos } from '../api/produtos';
import { listarClientes } from '../api/usuarios';
import { criar as criarPedido, marcarComoPago, obterFicha } from '../api/pedidos';
import { useToast } from '../components/Toast';

function formatPrice(n) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(n);
}

export default function Operador() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [ficha, setFicha] = useState(null);
  const { show } = useToast();

  useEffect(() => {
    listarProdutos().then(setProdutos).catch((e) => show(e.message, true));
    listarClientes().then(setClientes).catch((e) => show(e.message, true));
  }, [show]);

  const produtoPorCodigo = (c) => produtos.find((p) => p.codigo === Number(c));

  const adicionarItem = () => {
    const cod = Number(codigo);
    if (!cod || quantidade < 1) {
      show('Código e quantidade (maior que 0) são obrigatórios', true);
      return;
    }
    const prod = produtoPorCodigo(cod);
    if (!prod) {
      show('Produto não encontrado', true);
      return;
    }
    const preco = Number(prod.preco_unitario);
    const qtd = Number(quantidade);
    const subtotal = Number((preco * qtd).toFixed(2));
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.codigo === cod);
      if (idx >= 0) {
        const nova = [...prev];
        nova[idx].quantidade += qtd;
        nova[idx].subtotal = Number((nova[idx].preco_unitario * nova[idx].quantidade).toFixed(2));
        return nova;
      }
      return [...prev, { codigo: cod, nome: prod.nome, preco_unitario: preco, quantidade: qtd, subtotal }];
    });
    setCodigo('');
    setQuantidade(1);
  };

  const removerItem = (idx) => {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  };

  const total = itens.reduce((s, i) => s + i.subtotal, 0);

  const registrarPedido = async () => {
    if (!clienteId) {
      show('Selecione o cliente', true);
      return;
    }
    if (itens.length === 0) {
      show('Adicione ao menos um item', true);
      return;
    }
    setLoading(true);
    setFicha(null);
    try {
      const body = {
        cliente_id: clienteId,
        itens: itens.map((i) => ({ codigo: i.codigo, quantidade: i.quantidade })),
      };
      const pedido = await criarPedido(body.cliente_id, body.itens);
      setPedidoCriado(pedido);
      setItens([]);
      show('Pedido registrado');
    } catch (e) {
      show(e.message ?? 'Erro ao registrar pedido', true);
    } finally {
      setLoading(false);
    }
  };

  const marcarPago = async () => {
    if (!pedidoCriado?.id) return;
    setLoading(true);
    setFicha(null);
    try {
      await marcarComoPago(pedidoCriado.id);
      const f = await obterFicha(pedidoCriado.id);
      setFicha(f);
      setPedidoCriado(null);
      show('Pedido marcado como pago');
    } catch (e) {
      show(e.message ?? 'Erro ao marcar como pago', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operador-page">
      <div className="grid-operador">
        <section className="card cardapio">
          <h2>Cardápio</h2>
          <ul className="lista-produtos">
            {produtos.map((p) => (
              <li key={p.id}>
                <span className="cod">{p.codigo}</span>
                <span className="nome">{p.nome}</span>
                <span className="preco">{formatPrice(p.preco_unitario)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card pedido">
          <h2>Novo pedido</h2>
          <label className="field">
            Cliente
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              disabled={!!pedidoCriado}
            >
              <option value="">Selecione</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
          <div className="add-item">
            <input
              type="number"
              min="1"
              max="8"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={!!pedidoCriado}
            />
            <input
              type="number"
              min="1"
              placeholder="Qtd"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value) || 1)}
              disabled={!!pedidoCriado}
            />
            <button type="button" onClick={adicionarItem} className="btn btn-add" disabled={!!pedidoCriado}>
              Adicionar
            </button>
          </div>
          {itens.length > 0 && (
            <>
              <ul className="itens-pedido">
                {itens.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.nome} × {item.quantidade}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                    <button type="button" onClick={() => removerItem(idx)} className="btn-remove" aria-label="Remover">×</button>
                  </li>
                ))}
              </ul>
              <p className="total">Total: <strong>{formatPrice(total)}</strong></p>
              <button type="button" onClick={registrarPedido} className="btn btn-primary" disabled={loading}>
                {loading ? 'Registrando…' : 'Finalizar pedido'}
              </button>
            </>
          )}

          {pedidoCriado && !ficha && (
            <div className="ficha-box pendente">
              <p>Pedido registrado.</p>
              <button type="button" onClick={marcarPago} className="btn btn-primary" disabled={loading}>
                {loading ? '…' : 'Marcar como pago'}
              </button>
            </div>
          )}

          {ficha && (
            <div className="ficha-box pago">
              <p className="ficha-numero">{ficha.numero_ficha}</p>
              <p className="ficha-msg">Retirar no balcão</p>
            </div>
          )}
        </section>
      </div>
      <style>{`
        .operador-page { max-width: 1000px; margin: 0 auto; }
        .grid-operador { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) { .grid-operador { grid-template-columns: 1fr; } }
        .card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 24px;
        }
        .card h2 { margin: 0 0 20px; font-size: 1.25rem; color: var(--primary); }
        .lista-produtos { list-style: none; margin: 0; padding: 0; }
        .lista-produtos li {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          align-items: center;
        }
        .lista-produtos .cod { font-weight: 600; color: var(--primary); }
        .lista-produtos .preco { font-weight: 500; }
        .field { display: block; margin-bottom: 16px; }
        .field select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; }
        .add-item { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .add-item input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; width: 80px; }
        .btn-add { padding: 10px 16px; border: none; border-radius: 8px; background: var(--accent-soft); color: var(--text); font-weight: 600; }
        .btn-add:hover:not(:disabled) { background: var(--accent); color: #fff; }
        .itens-pedido { list-style: none; margin: 0 0 12px; padding: 0; }
        .itens-pedido li { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); gap: 8px; }
        .btn-remove { width: 28px; height: 28px; border: none; background: transparent; color: var(--text-muted); font-size: 1.2rem; line-height: 1; border-radius: 6px; }
        .btn-remove:hover { background: #fee; color: var(--error); }
        .total { margin: 12px 0; font-size: 1.1rem; }
        .btn-primary { padding: 12px 24px; border: none; border-radius: 8px; background: var(--primary); color: #fff; font-weight: 600; }
        .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .ficha-box { margin-top: 20px; padding: 20px; border-radius: var(--radius); text-align: center; }
        .ficha-box.pendente { background: var(--accent-soft); }
        .ficha-box.pago { background: var(--primary); color: #fff; }
        .ficha-numero { font-size: 1.5rem; font-weight: 700; margin: 0 0 8px; letter-spacing: 2px; }
        .ficha-msg { margin: 0; font-size: 1rem; opacity: 0.95; }
      `}</style>
    </div>
  );
}
