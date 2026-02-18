const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ erro: 'Token ausente' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      nome: payload.nome,
      perfil: payload.perfil,
    };
    return next();
  } catch (_err) {
    return res.status(401).json({ erro: 'Token invalido' });
  }
};

module.exports = {
  authenticate,
};
