-- Senha dos usuários de teste: password (bcrypt cost 10)
-- Rodar após schema.sql. Ordem: produtos primeiro, depois usuarios (pedidos dependem de ambos).

INSERT INTO produto (codigo, nome, preco_unitario) VALUES
  (1, 'Cafezinho', 0.50),
  (2, 'Pão com manteiga', 1.20),
  (3, 'Misto quente', 1.75),
  (4, 'Misto quente com ovo', 2.00),
  (5, 'Suco natural (300 ml)', 2.25),
  (6, 'Suco em lata', 3.00),
  (7, 'Pão de queijo (grande)', 1.00),
  (8, 'Porção de pão de queijo (10 unid.)', 2.50)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO usuario (email, senha_hash, nome, perfil) VALUES
  (
    'admin@quitanda.local',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin Teste',
    'admin'
  ),
  (
    'operador@quitanda.local',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Operador Teste',
    'operador'
  ),
  (
    'cliente@quitanda.local',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Cliente Teste',
    'cliente'
  )
ON CONFLICT (email) DO NOTHING;
