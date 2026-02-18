# Modelagem do banco – Quitanda

Banco: **Neon (PostgreSQL)**.

## Entidades e atributos

### usuario
| Campo       | Tipo         | Restrição        |
|------------|--------------|------------------|
| id         | UUID         | PK, default gen_random_uuid() |
| email      | VARCHAR(255) | NOT NULL, UNIQUE |
| senha_hash | VARCHAR(255) | NOT NULL         |
| nome       | VARCHAR(255) | NOT NULL         |
| perfil     | perfil_enum  | NOT NULL         |
| created_at | TIMESTAMPTZ  | NOT NULL, default now() |
| updated_at | TIMESTAMPTZ  | NOT NULL, default now() |

**perfil_enum:** `admin`, `operador`, `cliente`

### produto
| Campo            | Tipo          | Restrição        |
|-----------------|---------------|------------------|
| id              | UUID          | PK, default gen_random_uuid() |
| codigo          | INTEGER       | NOT NULL, UNIQUE |
| nome            | VARCHAR(255)  | NOT NULL         |
| preco_unitario  | NUMERIC(10,2) | NOT NULL         |
| ativo           | BOOLEAN       | NOT NULL, default true |
| created_at      | TIMESTAMPTZ   | NOT NULL, default now() |
| updated_at      | TIMESTAMPTZ   | NOT NULL, default now() |

### pedido
| Campo            | Tipo          | Restrição        |
|-----------------|---------------|------------------|
| id              | UUID          | PK, default gen_random_uuid() |
| usuario_id      | UUID          | NOT NULL, FK(usuario) – cliente |
| operador_id     | UUID          | NOT NULL, FK(usuario) |
| status          | status_pedido_enum | NOT NULL |
| total           | NUMERIC(10,2) | NOT NULL         |
| numero_ficha    | VARCHAR(50)   | NULL – preenchido ao marcar como pago |
| ficha_gerada_em | TIMESTAMPTZ   | NULL             |
| created_at      | TIMESTAMPTZ   | NOT NULL, default now() |
| updated_at      | TIMESTAMPTZ   | NOT NULL, default now() |

**status_pedido_enum:** `pendente`, `pago`, `entregue`

### item_pedido
| Campo                    | Tipo          | Restrição        |
|--------------------------|---------------|------------------|
| id                       | UUID          | PK, default gen_random_uuid() |
| pedido_id                | UUID          | NOT NULL, FK(pedido) ON DELETE CASCADE |
| produto_id               | UUID          | NOT NULL, FK(produto) |
| quantidade               | INTEGER       | NOT NULL, CHECK (quantidade > 0) |
| preco_unitario_snapshot  | NUMERIC(10,2) | NOT NULL         |
| subtotal                 | NUMERIC(10,2) | NOT NULL         |

## Relacionamentos (FKs)

- **pedido.usuario_id** → usuario.id (cliente do pedido)
- **pedido.operador_id** → usuario.id (operador que registrou)
- **item_pedido.pedido_id** → pedido.id (CASCADE delete)
- **item_pedido.produto_id** → produto.id

## Ficha de retirada

Ficha implementada como campos no **pedido**: `numero_ficha` e `ficha_gerada_em`. Ao marcar pedido como pago, o sistema preenche esses campos para o cliente retirar no balcão.

## Diagrama (texto)

```
usuario 1 ----< pedido (usuario_id, operador_id)
pedido 1 ----< item_pedido
produto 1 ----< item_pedido
```
