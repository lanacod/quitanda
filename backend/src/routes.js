const express = require('express');

const authHandler = require('./auth/auth.handler');
const produtosHandler = require('./produtos/produtos.handler');
const pedidosHandler = require('./pedidos/pedidos.handler');
const usuariosHandler = require('./usuarios/usuarios.handler');
const relatoriosHandler = require('./relatorios/relatorios.handler');

const router = express.Router();

router.use('/auth', authHandler);
router.use('/produtos', produtosHandler);
router.use('/pedidos', pedidosHandler);
router.use('/usuarios', usuariosHandler);
router.use('/relatorios', relatoriosHandler);

module.exports = router;
