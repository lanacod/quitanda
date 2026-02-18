const db = require('../db');
const { createHttpError } = require('../utils/errors');

const gerarNumeroFicha = () => {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10).replace(/-/g, '');
  const hora = agora.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${data}${hora}-${random}`;
};

const criar = async ({ operadorId, clienteId, itens }) => {
  if (!itens || itens.length === 0) {
    throw createHttpError(400, 'Itens do pedido sao obrigatorios');
  }

  const codigos = itens.map((item) => item.codigo);
  const produtosResult = await db.query(
    'SELECT id, codigo, nome, preco_unitario FROM produto WHERE codigo = ANY($1) AND ativo = true',
    [codigos]
  );

  if (produtosResult.rowCount !== codigos.length) {
    throw createHttpError(404, 'Produto inexistente ou inativo');
  }

  const produtosPorCodigo = new Map(
    produtosResult.rows.map((produto) => [produto.codigo, produto])
  );

  const itensCalculados = itens.map((item) => {
    const produto = produtosPorCodigo.get(item.codigo);
    if (!produto) {
      throw createHttpError(404, 'Produto inexistente ou inativo');
    }
    if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
      throw createHttpError(400, 'Quantidade invalida');
    }

    const preco = Number(produto.preco_unitario);
    const subtotal = Number((preco * item.quantidade).toFixed(2));
    return {
      produtoId: produto.id,
      quantidade: item.quantidade,
      precoUnitario: preco,
      subtotal,
    };
  });

  const total = Number(
    itensCalculados
      .reduce((acc, item) => acc + item.subtotal, 0)
      .toFixed(2)
  );

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      'INSERT INTO pedido (usuario_id, operador_id, status, total) VALUES ($1, $2, $3, $4) RETURNING id, usuario_id, operador_id, status, total, created_at',
      [clienteId, operadorId, 'pendente', total]
    );

    const pedido = pedidoResult.rows[0];

    for (const item of itensCalculados) {
      await client.query(
        'INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario_snapshot, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [
          pedido.id,
          item.produtoId,
          item.quantidade,
          item.precoUnitario,
          item.subtotal,
        ]
      );
    }

    await client.query('COMMIT');
    return pedido;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const marcarComoPago = async (id) => {
  const result = await db.query(
    'SELECT status FROM pedido WHERE id = $1',
    [id]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Pedido nao encontrado');
  }

  if (result.rows[0].status === 'pago') {
    throw createHttpError(409, 'Pedido ja esta pago');
  }

  const numeroFicha = gerarNumeroFicha();

  const updateResult = await db.query(
    'UPDATE pedido SET status = $1, numero_ficha = $2, ficha_gerada_em = now(), updated_at = now() WHERE id = $3 RETURNING id, status, numero_ficha, ficha_gerada_em',
    ['pago', numeroFicha, id]
  );

  return updateResult.rows[0];
};

const listarPorCliente = async (clienteId) => {
  const result = await db.query(
    `SELECT p.id, p.usuario_id, p.operador_id, p.status, p.total, p.numero_ficha, p.ficha_gerada_em, p.created_at,
      COALESCE(json_agg(json_build_object(
        'id', i.id,
        'produto_id', i.produto_id,
        'quantidade', i.quantidade,
        'preco_unitario_snapshot', i.preco_unitario_snapshot,
        'subtotal', i.subtotal
      ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS itens
      FROM pedido p
      LEFT JOIN item_pedido i ON i.pedido_id = p.id
      WHERE p.usuario_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
    [clienteId]
  );

  return result.rows;
};

const listarTodos = async () => {
  const result = await db.query(
    `SELECT p.id, p.usuario_id, p.operador_id, p.status, p.total, p.numero_ficha, p.ficha_gerada_em, p.created_at,
      u.nome AS cliente_nome,
      COALESCE(json_agg(json_build_object(
        'id', i.id,
        'produto_id', i.produto_id,
        'quantidade', i.quantidade,
        'preco_unitario_snapshot', i.preco_unitario_snapshot,
        'subtotal', i.subtotal
      ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS itens
      FROM pedido p
      LEFT JOIN usuario u ON u.id = p.usuario_id
      LEFT JOIN item_pedido i ON i.pedido_id = p.id
      GROUP BY p.id, u.nome
      ORDER BY p.created_at DESC`
  );

  return result.rows;
};

const obterFicha = async (pedidoId) => {
  const result = await db.query(
    'SELECT id, usuario_id, status, numero_ficha, ficha_gerada_em FROM pedido WHERE id = $1',
    [pedidoId]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Pedido nao encontrado');
  }

  const pedido = result.rows[0];

  if (pedido.status !== 'pago' || !pedido.numero_ficha) {
    throw createHttpError(409, 'Ficha ainda nao foi gerada');
  }

  return pedido;
};

module.exports = {
  criar,
  marcarComoPago,
  listarPorCliente,
  listarTodos,
  obterFicha,
};
