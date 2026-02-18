# API Quitanda

Base URL: `http://localhost:3000`

## Auth

- **POST** `/auth/login`
  - Handler: `backend/src/auth/auth.handler.js`
  - Service: `backend/src/auth/auth.service.js`
  - Body: `{ "email": "...", "senha": "..." }`
  - Resposta: `{ token, usuario }`

## Produtos

- **GET** `/produtos`
  - Handler: `backend/src/produtos/produtos.handler.js`
  - Service: `backend/src/produtos/produtos.service.js`
  - Perfis: admin/operador/cliente
  - Observacao: admin recebe inativos, demais apenas ativos.

- **POST** `/produtos`
  - Handler: `backend/src/produtos/produtos.handler.js`
  - Service: `backend/src/produtos/produtos.service.js`
  - Perfis: admin
  - Body: `{ "codigo": 1, "nome": "...", "preco_unitario": 0.50 }`

- **PUT** `/produtos/:id`
  - Handler: `backend/src/produtos/produtos.handler.js`
  - Service: `backend/src/produtos/produtos.service.js`
  - Perfis: admin
  - Body: `{ "codigo"?, "nome"?, "preco_unitario"? }`

- **PATCH** `/produtos/:id/inativar`
  - Handler: `backend/src/produtos/produtos.handler.js`
  - Service: `backend/src/produtos/produtos.service.js`
  - Perfis: admin

## Pedidos

- **POST** `/pedidos`
  - Handler: `backend/src/pedidos/pedidos.handler.js`
  - Service: `backend/src/pedidos/pedidos.service.js`
  - Perfis: operador/admin
  - Body: `{ "cliente_id": "uuid", "itens": [{ "codigo": 1, "quantidade": 2 }] }`

- **PATCH** `/pedidos/:id/pago`
  - Handler: `backend/src/pedidos/pedidos.handler.js`
  - Service: `backend/src/pedidos/pedidos.service.js`
  - Perfis: operador/admin

- **GET** `/pedidos`
  - Handler: `backend/src/pedidos/pedidos.handler.js`
  - Service: `backend/src/pedidos/pedidos.service.js`
  - Perfis: admin (todos) / cliente (somente seus pedidos)

- **GET** `/pedidos/:id/ficha`
  - Handler: `backend/src/pedidos/pedidos.handler.js`
  - Service: `backend/src/pedidos/pedidos.service.js`
  - Perfis: admin/operador/cliente (cliente apenas do proprio pedido)

## Usuarios

- **GET** `/usuarios`
  - Handler: `backend/src/usuarios/usuarios.handler.js`
  - Service: `backend/src/usuarios/usuarios.service.js`
  - Perfis: admin

- **PUT** `/usuarios/:id`
  - Handler: `backend/src/usuarios/usuarios.handler.js`
  - Service: `backend/src/usuarios/usuarios.service.js`
  - Perfis: admin
  - Body: `{ "email"?, "nome"?, "perfil"?, "senha"? }`
