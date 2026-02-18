const express = require('express');
const { z } = require('zod');

const usuariosService = require('./usuarios.service');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

const usuarioUpdateSchema = z.object({
  email: z.string().email().optional(),
  nome: z.string().min(1).optional(),
  perfil: z.enum(['admin', 'operador', 'cliente']).optional(),
  senha: z.string().min(6).optional(),
});

router.get('/', authenticate, authorize(['admin']), async (_req, res) => {
  try {
    const usuarios = await usuariosService.listar();
    return res.status(200).json(usuarios);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.get('/clientes', authenticate, authorize(['admin', 'operador']), async (_req, res) => {
  try {
    const clientes = await usuariosService.listarClientes();
    return res.status(200).json(clientes);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const idSchema = z.string().uuid();
  const idParsed = idSchema.safeParse(req.params.id);
  const bodyParsed = usuarioUpdateSchema.safeParse(req.body);

  if (!idParsed.success || !bodyParsed.success) {
    return res.status(400).json({
      erro: 'Dados invalidos para atualizar usuario',
      detalhes: [...(idParsed.error?.errors || []), ...(bodyParsed.error?.errors || [])],
    });
  }

  try {
    const usuario = await usuariosService.atualizar(
      idParsed.data,
      bodyParsed.data
    );
    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

module.exports = router;
