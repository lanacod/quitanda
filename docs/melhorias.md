# Melhorias – Quitanda (Fase 4)

## Ideias registradas

1. **Relatório de vendas do dia (implementada)**  
   O admin pode consultar o total vendido em um dia, a quantidade de pedidos pagos e a lista desses pedidos (com número da ficha e valor). Útil para fechamento de caixa e conferência.

2. **Fila de pedidos por ficha**  
   Tela para o operador ou balcão listar pedidos pendentes de retirada (status pago) em ordem de ficha, permitindo marcar como “entregue” quando o cliente retirar.

3. **Notificação quando pedido estiver pronto**  
   Após marcar como pago/gerar ficha, notificar o cliente (ex.: mensagem na tela ou som) ou exibir destaque na lista de pedidos do cliente quando houver ficha disponível.

## Melhoria implementada: Relatório de vendas do dia

O admin acessa a tela **Relatório** (menu) e informa uma data (padrão: hoje). O backend retorna o total vendido (soma dos pedidos com status “pago” naquela data), a quantidade de pedidos e a lista dos pedidos com id, número da ficha, total e data/hora. A feature foi implementada no backend como nova pasta **relatorios**, no padrão **fail_fast**: **relatorios.handler.js** valida a query (data em YYYY-MM-DD ou ausente para “hoje”) e chama **relatorios.service.js**, que consulta o banco e retorna os dados. O frontend consome o endpoint e exibe os totais e a tabela de pedidos do dia.
