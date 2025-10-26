# STCD - Sistema de Controle de Diaristas - TODO

## Bugs Corrigidos
- [x] Faltavam `await` em operações de banco de dados (19 funções)
- [x] Schema Zod desatualizado (removidos campos nomeCliente e telefoneCliente)
- [x] Import de `useState` faltando em Agendamentos.tsx
- [x] Cálculo de `valorServico` incorreto (multiplicação dupla)
- [x] Campo `telefoneCliente` no formulário
- [x] Configuração SSL do TiDB Cloud
- [x] Migrações do Drizzle (tabelas criadas)
- [x] Banco de dados conectando com sucesso
- [x] Dropdowns resetando ao preencher inputs (extraído para componente separado)

## Tarefas Pendentes
- [ ] Substituir `<select>` nativo por componente robusto (Shadcn/ui Select)
- [ ] Testar criação de novo agendamento com todos os campos preenchidos
- [ ] Verificar se notificações WhatsApp estão sendo enviadas
- [ ] Testar edição de agendamentos
- [ ] Testar cancelamento de agendamentos

## Status Atual
- ✅ Banco de dados: Conectando
- ✅ Agendamentos existentes: 3 agendamentos salvos
- ✅ Formulário: Abrindo corretamente
- ✅ Validação: Funcionando
- ⚠️ Botão "Agendar": Funciona, mas com limitação
- ✅ Dropdowns: Mantêm valores selecionados

