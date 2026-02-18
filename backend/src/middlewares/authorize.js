const authorize = (rolesPermitidos) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ erro: 'Nao autenticado' });
  }

  if (!rolesPermitidos.includes(req.user.perfil)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  return next();
};

module.exports = {
  authorize,
};
