const express = require('express');
const { z } = require('zod');

const relatoriosService = require('./relatorios.service');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();

router.get(
  '/vendas-dia',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    const parsed = dateSchema.safeParse(req.query.data);

    if (!parsed.success) {
      return res.status(400).json({
        erro: 'Parametro data invalido; use YYYY-MM-DD ou omita para hoje',
        detalhes: parsed.error.errors,
      });
    }

    try {
      const resultado = await relatoriosService.vendasDoDia(parsed.data);
      return res.status(200).json(resultado);
    } catch (err) {
      return res.status(err.status || 500).json({ erro: err.message });
    }
  }
);

module.exports = router;
