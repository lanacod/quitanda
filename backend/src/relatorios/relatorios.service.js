const db = require('../db');
const { createHttpError } = require('../utils/errors');

const vendasDoDia = async (dataStr) => {
  let data;
  if (dataStr) {
    const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataStr);
    if (!parsed) {
      throw createHttpError(400, 'Data invalida; use YYYY-MM-DD');
    }
    const [, y, m, d] = parsed;
    data = `${y}-${m}-${d}`;
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    data = `${y}-${m}-${d}`;
  }

  const result = await db.query(
    `SELECT id, usuario_id, operador_id, status, total, numero_ficha, created_at
     FROM pedido
     WHERE status = 'pago' AND created_at::date = $1::date
     ORDER BY created_at ASC`,
    [data]
  );

  const pedidos = result.rows;
  const totalVendido = Number(
    pedidos.reduce((acc, p) => acc + Number(p.total), 0).toFixed(2)
  );

  return {
    data,
    totalPedidos: pedidos.length,
    totalVendido,
    pedidos,
  };
};

module.exports = {
  vendasDoDia,
};
