import { useState, useEffect } from 'react';
import * as apiProdutos from '../api/produtos';
import { useToast } from '../components/Toast';

function formatPrice(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Admin() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ codigo: '', nome: '', preco_unitario: '' });
  const [showForm, setShowForm] = useState(false);
  const { show } = useToast();

  const load = () => {
    apiProdutos.listar().then(setProdutos).catch((e) => show(e.message, true));
  };

  useEffect(() => load(), [show]);

  const openNew = () => {
    setEditingId(null);
    setForm({ codigo: '', nome: '', preco_unitario: '' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      codigo: String(p.codigo),
      nome: p.nome,
      preco_unitario: String(p.preco_unitario),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const validate = () => {
    const cod = parseInt(form.codigo, 10);
    const preco = parseFloat(form.preco_unitario);
    if (!Number.isInteger(cod) || cod < 1) {
      show('Código deve ser um número inteiro positivo', true);
      return false;
    }
    if (!form.nome.trim()) {
      show('Nome é obrigatório', true);
      return false;
    }
    if (Number.isNaN(preco) || preco <= 0) {
      show('Preço deve ser um número positivo', true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const cod = parseInt(form.codigo, 10);
    const preco = parseFloat(form.preco_unitario);
    setLoading(true);
    try {
      if (editingId) {
        await apiProdutos.atualizar(editingId, {
          codigo: cod,
          nome: form.nome.trim(),
          preco_unitario: preco,
        });
        show('Produto atualizado');
      } else {
        await apiProdutos.criar({
          codigo: cod,
          nome: form.nome.trim(),
          preco_unitario: preco,
        });
        show('Produto criado');
      }
      closeForm();
      load();
    } catch (e) {
      show(e.message ?? 'Erro ao salvar', true);
    } finally {
      setLoading(false);
    }
  };

  const handleInativar = async (id) => {
    if (!window.confirm('Inativar este produto?')) return;
    setLoading(true);
    try {
      await apiProdutos.inativar(id);
      show('Produto inativado');
      load();
    } catch (e) {
      show(e.message ?? 'Erro ao inativar', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Produtos</h1>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Novo produto
        </button>
      </div>

      <table className="table-produtos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Ativo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.nome}</td>
              <td>{formatPrice(p.preco_unitario)}</td>
              <td>{p.ativo ? 'Sim' : 'Não'}</td>
              <td className="actions">
                <button type="button" className="btn-sm" onClick={() => openEdit(p)}>Editar</button>
                {p.ativo && (
                  <button type="button" className="btn-sm danger" onClick={() => handleInativar(p.id)} disabled={loading}>
                    Inativar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Editar produto' : 'Novo produto'}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Código
                <input
                  type="number"
                  min="1"
                  value={form.codigo}
                  onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                  disabled={!!editingId}
                />
              </label>
              <label>
                Nome
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required
                />
              </label>
              <label>
                Preço unitário (R$)
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.preco_unitario}
                  onChange={(e) => setForm((f) => ({ ...f, preco_unitario: e.target.value }))}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page { max-width: 800px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .admin-page h1 { margin: 0; font-size: 1.5rem; color: var(--primary); }
        .btn-primary { padding: 10px 20px; border: none; border-radius: 8px; background: var(--primary); color: #fff; font-weight: 600; }
        .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
        .table-produtos { width: 100%; border-collapse: collapse; background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
        .table-produtos th, .table-produtos td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); }
        .table-produtos th { background: var(--bg); font-weight: 600; color: var(--text); }
        .table-produtos .actions { display: flex; gap: 8px; }
        .btn-sm { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; font-size: 0.9rem; font-weight: 500; }
        .btn-sm:hover { background: var(--accent-soft); }
        .btn-sm.danger { border-color: var(--error); color: var(--error); }
        .btn-sm.danger:hover { background: #fee; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
        .modal { background: var(--card); border-radius: var(--radius); padding: 28px; max-width: 400px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .modal h2 { margin: 0 0 20px; font-size: 1.25rem; }
        .modal label { display: block; margin-bottom: 14px; font-weight: 500; }
        .modal input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; margin-top: 4px; }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
        .btn-secondary { padding: 10px 20px; border: 1px solid var(--border); border-radius: 8px; background: transparent; font-weight: 500; }
        .btn-secondary:hover { background: var(--bg); }
      `}</style>
    </div>
  );
}
