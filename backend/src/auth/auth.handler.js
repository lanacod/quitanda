const express = require('express');
const { z } = require('zod');

const authService = require('./auth.service');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      erro: 'Email e senha sao obrigatorios',
      detalhes: parsed.error.errors,
    });
  }

  try {
    const resultado = await authService.login(
      parsed.data.email,
      parsed.data.senha
    );
    return res.status(200).json(resultado);
  } catch (err) {
    return res.status(err.status || 500).json({
      erro: err.message || 'Erro ao autenticar',
    });
  }
});

module.exports = router;
