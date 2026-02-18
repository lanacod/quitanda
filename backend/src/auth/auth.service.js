const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db');
const { createHttpError } = require('../utils/errors');

const login = async (email, senha) => {
  const result = await db.query(
    'SELECT id, nome, perfil, senha_hash FROM usuario WHERE email = $1',
    [email]
  );

  if (result.rowCount === 0) {
    throw createHttpError(401, 'Email ou senha invalidos');
  }

  const usuario = result.rows[0];
  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaOk) {
    throw createHttpError(401, 'Email ou senha invalidos');
  }

  const payload = {
    sub: usuario.id,
    nome: usuario.nome,
    perfil: usuario.perfil,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil,
    },
  };
};

module.exports = {
  login,
};
