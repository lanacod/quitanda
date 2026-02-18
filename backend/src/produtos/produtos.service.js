const db = require('../db');
const { createHttpError } = require('../utils/errors');

const listar = async (incluirInativos = false) => {
  const query = incluirInativos
    ? 'SELECT id, codigo, nome, preco_unitario, ativo FROM produto ORDER BY codigo'
    : 'SELECT id, codigo, nome, preco_unitario, ativo FROM produto WHERE ativo = true ORDER BY codigo';

  const result = await db.query(query);
  return result.rows;
};

const buscarPorCodigo = async (codigo) => {
  const result = await db.query(
    'SELECT id, codigo, nome, preco_unitario, ativo FROM produto WHERE codigo = $1',
    [codigo]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Produto nao encontrado');
  }

  return result.rows[0];
};

const criar = async ({ codigo, nome, preco_unitario }) => {
  const existente = await db.query('SELECT id FROM produto WHERE codigo = $1', [
    codigo,
  ]);

  if (existente.rowCount > 0) {
    throw createHttpError(409, 'Codigo de produto ja existente');
  }

  const result = await db.query(
    'INSERT INTO produto (codigo, nome, preco_unitario) VALUES ($1, $2, $3) RETURNING id, codigo, nome, preco_unitario, ativo',
    [codigo, nome, preco_unitario]
  );

  return result.rows[0];
};

const atualizar = async (id, dados) => {
  const campos = [];
  const valores = [];

  if (dados.codigo !== undefined) {
    const existente = await db.query(
      'SELECT id FROM produto WHERE codigo = $1 AND id <> $2',
      [dados.codigo, id]
    );
    if (existente.rowCount > 0) {
      throw createHttpError(409, 'Codigo de produto ja existente');
    }
    campos.push('codigo');
    valores.push(dados.codigo);
  }

  if (dados.nome !== undefined) {
    campos.push('nome');
    valores.push(dados.nome);
  }

  if (dados.preco_unitario !== undefined) {
    campos.push('preco_unitario');
    valores.push(dados.preco_unitario);
  }

  if (campos.length === 0) {
    throw createHttpError(400, 'Nenhum campo para atualizar');
  }

  const setClause = campos
    .map((campo, index) => `${campo} = $${index + 1}`)
    .join(', ');

  const result = await db.query(
    `UPDATE produto SET ${setClause}, updated_at = now() WHERE id = $${campos.length + 1} RETURNING id, codigo, nome, preco_unitario, ativo`,
    [...valores, id]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Produto nao encontrado');
  }

  return result.rows[0];
};

const inativar = async (id) => {
  const result = await db.query(
    'UPDATE produto SET ativo = false, updated_at = now() WHERE id = $1 RETURNING id, codigo, nome, preco_unitario, ativo',
    [id]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Produto nao encontrado');
  }

  return result.rows[0];
};

module.exports = {
  listar,
  buscarPorCodigo,
  criar,
  atualizar,
  inativar,
};
