const bcrypt = require('bcryptjs');

const db = require('../db');
const { createHttpError } = require('../utils/errors');

const listar = async () => {
  const result = await db.query(
    'SELECT id, email, nome, perfil, created_at, updated_at FROM usuario ORDER BY created_at DESC'
  );
  return result.rows;
};

const listarClientes = async () => {
  const result = await db.query(
    'SELECT id, nome FROM usuario WHERE perfil = $1 ORDER BY nome',
    ['cliente']
  );
  return result.rows;
};

const atualizar = async (id, dados) => {
  const campos = [];
  const valores = [];

  if (dados.email !== undefined) {
    campos.push('email');
    valores.push(dados.email);
  }

  if (dados.nome !== undefined) {
    campos.push('nome');
    valores.push(dados.nome);
  }

  if (dados.perfil !== undefined) {
    campos.push('perfil');
    valores.push(dados.perfil);
  }

  if (dados.senha !== undefined) {
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    campos.push('senha_hash');
    valores.push(senhaHash);
  }

  if (campos.length === 0) {
    throw createHttpError(400, 'Nenhum campo para atualizar');
  }

  const setClause = campos
    .map((campo, index) => `${campo} = $${index + 1}`)
    .join(', ');

  const result = await db.query(
    `UPDATE usuario SET ${setClause}, updated_at = now() WHERE id = $${campos.length + 1} RETURNING id, email, nome, perfil, created_at, updated_at`,
    [...valores, id]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, 'Usuario nao encontrado');
  }

  return result.rows[0];
};

module.exports = {
  listar,
  listarClientes,
  atualizar,
};
