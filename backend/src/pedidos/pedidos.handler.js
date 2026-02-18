const express = require('express');
const { z } = require('zod');

const pedidosService = require('./pedidos.service');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const { createHttpError } = require('../utils/errors');

const router = express.Router();

const itemSchema = z.object({
  codigo: z.number().int().positive(),
  quantidade: z.number().int().positive(),
});

const criarPedidoSchema = z.object({
  cliente_id: z.string().uuid(),
  itens: z.array(itemSchema).min(1),
});

router.post('/', authenticate, authorize(['operador', 'admin']), async (req, res) => {
  const parsed = criarPedidoSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      erro: 'Dados invalidos para criar pedido',
      detalhes: parsed.error.errors,
    });
  }

  try {
    const pedido = await pedidosService.criar({
      operadorId: req.user.id,
      clienteId: parsed.data.cliente_id,
      itens: parsed.data.itens,
    });
    return res.status(201).json(pedido);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.patch(
  '/:id/pago',
  authenticate,
  authorize(['operador', 'admin']),
  async (req, res) => {
    const idSchema = z.string().uuid();
    const idParsed = idSchema.safeParse(req.params.id);

    if (!idParsed.success) {
      return res.status(400).json({
        erro: 'Id invalido',
        detalhes: idParsed.error.errors,
      });
    }

    try {
      const resultado = await pedidosService.marcarComoPago(idParsed.data);
      return res.status(200).json(resultado);
    } catch (err) {
      return res.status(err.status || 500).json({ erro: err.message });
    }
  }
);

router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.perfil === 'admin' || req.user.perfil === 'operador') {
      const pedidos = await pedidosService.listarTodos();
      return res.status(200).json(pedidos);
    }

    if (req.user.perfil === 'cliente') {
      const pedidos = await pedidosService.listarPorCliente(req.user.id);
      return res.status(200).json(pedidos);
    }

    throw createHttpError(403, 'Acesso negado');
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.get('/:id/ficha', authenticate, async (req, res) => {
  const idSchema = z.string().uuid();
  const idParsed = idSchema.safeParse(req.params.id);

  if (!idParsed.success) {
    return res.status(400).json({
      erro: 'Id invalido',
      detalhes: idParsed.error.errors,
    });
  }

  try {
    const ficha = await pedidosService.obterFicha(idParsed.data);

    if (req.user.perfil === 'cliente' && ficha.usuario_id !== req.user.id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    return res.status(200).json(ficha);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

module.exports = router;
