# STCD - Sistema de Controle de Diaristas - TODO

## Bugs Identificados e Corrigidos

- [x] Bug #1: Faltavam `await` em operações de banco de dados em server/db.ts (19 funções corrigidas)
- [x] Bug #2: Schema Zod desatualizado em routers.ts (campos nomeCliente e telefoneCliente removidos)
- [x] Bug #3: Falta `import { useState }` em Agendamentos.tsx
- [x] Bug #4: Cálculo incorreto de valorServico em Agendamentos.tsx (multiplicava por 100 novamente)
- [ ] Bug #5: Erro de conexão ao banco de dados - DATABASE_URL com SSL ativado causando erro de certificado (CRÍTICO - BLOQUEADOR)

## Features Implementadas

- [x] Página de Agendamentos com formulário completo
- [x] Cálculo automático de dias trabalhados
- [x] Cálculo automático de valor total do serviço
- [x] Dropdown de seleção de diarista
- [x] Dropdown de seleção de especialidade
- [x] Dropdown de seleção de local de serviço
- [x] Campos de data de início e fim
- [x] Campo de valor da diária
- [x] Campos opcionais: descrição do serviço e observações
- [x] Botão "Agendar" e "Cancelar"

## Próximos Passos

- [ ] Resolver erro de conexão ao banco de dados (DATABASE_URL)
- [ ] Testar botão "Agendar" com dados reais
- [ ] Testar notificações WhatsApp
- [ ] Testar página de Pagamentos
- [ ] Testar página de Avaliações
- [ ] Testar página de Recibos
- [ ] Testar página de Relatórios
- [ ] Testar Dashboard
- [ ] Testar gerenciamento de Diaristas
- [ ] Testar gerenciamento de Especialidades

## Notas Técnicas

- Banco de dados: TiDB Cloud (MySQL compatível)
- Host: gateway02.us-east-1.prod.aws.tidbcloud.com:4000
- Database: KWmw8qonEqZE2SBpspQBoN
- Problema atual: SSL certificate validation error na conexão
- Solução: Usar DATABASE_URL com `ssl=false` ou certificado válido

## URLs Importantes

- Dev Server: https://3000-i2td8lfhw8s06eg5z5l4v-33645479.manusvm.computer
- Nova DATABASE_URL (sem SSL): `mysql://27JhVsvhRVViDor.root:9C9nP80VAcRo7ssuE4OZ@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/KWmw8qonEqZE2SBpspQBoN?ssl=false`

