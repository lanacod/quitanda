const express = require('express');
const { z } = require('zod');

const produtosService = require('./produtos.service');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

const produtoCreateSchema = z.object({
  codigo: z.number().int().positive(),
  nome: z.string().min(1),
  preco_unitario: z.number().positive(),
});

const produtoUpdateSchema = z.object({
  codigo: z.number().int().positive().optional(),
  nome: z.string().min(1).optional(),
  preco_unitario: z.number().positive().optional(),
});

router.get('/', authenticate, async (req, res) => {
  try {
    const incluirInativos = req.user.perfil === 'admin';
    const produtos = await produtosService.listar(incluirInativos);
    return res.status(200).json(produtos);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  const parsed = produtoCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      erro: 'Dados invalidos para criar produto',
      detalhes: parsed.error.errors,
    });
  }

  try {
    const produto = await produtosService.criar(parsed.data);
    return res.status(201).json(produto);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const idSchema = z.string().uuid();
  const idParsed = idSchema.safeParse(req.params.id);
  const bodyParsed = produtoUpdateSchema.safeParse(req.body);

  if (!idParsed.success || !bodyParsed.success) {
    return res.status(400).json({
      erro: 'Dados invalidos para atualizar produto',
      detalhes: [...(idParsed.error?.errors || []), ...(bodyParsed.error?.errors || [])],
    });
  }

  try {
    const produto = await produtosService.atualizar(
      idParsed.data,
      bodyParsed.data
    );
    return res.status(200).json(produto);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
});

router.patch(
  '/:id/inativar',
  authenticate,
  authorize(['admin']),
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
      const produto = await produtosService.inativar(idParsed.data);
      return res.status(200).json(produto);
    } catch (err) {
      return res.status(err.status || 500).json({ erro: err.message });
    }
  }
);

module.exports = router;
