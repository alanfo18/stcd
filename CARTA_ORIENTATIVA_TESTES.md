# 📋 CARTA ORIENTATIVA - TESTES DO SISTEMA DE CONTROLE DE DIARISTAS (STCD)

**Data:** 24 de Outubro de 2025  
**De:** Equipe de Desenvolvimento  
**Para:** Equipe Operacional - 067 Vinhos  
**Assunto:** Teste e Validação do Sistema de Controle de Diaristas (STCD)

---

## 🎯 OBJETIVO

Convidamos você a testar o novo **Sistema de Controle de Diaristas (STCD)** e reportar qualquer erro, bug ou sugestão de melhoria. Seu feedback é essencial para garantir que o sistema funcione perfeitamente antes do lançamento oficial.

---

## 📱 COMO ACESSAR O SISTEMA

**URL:** https://w8qon.manus.space

**Credenciais de Acesso:**
- Use suas credenciais Manus OAuth (mesmo login que você usa em outros sistemas)
- Caso não tenha acesso, solicite ao administrador

---

## ✅ FUNCIONALIDADES PRINCIPAIS A TESTAR

### 1️⃣ **DASHBOARD (Monitoramento)**
- [ ] Acesse a página "Dashboard" na home
- [ ] Verifique se exibe corretamente:
  - Agendamentos pendentes (próximos 7 dias)
  - Pagamentos em atraso
  - Receita do mês
  - Taxa de conclusão de serviços
  - Diaristas ativas
- [ ] Clique em "Ações Rápidas" para criar novo agendamento

**Reportar se:**
- Os números estão incorretos
- Alguma informação não carrega
- Os gráficos não aparecem

---

### 2️⃣ **GERENCIAR DIARISTAS**
- [ ] Clique em "Diaristas" → "Gerenciar"
- [ ] Clique no botão azul "➕ Adicionar Diarista"
- [ ] Preencha os dados:
  - **Nome** (obrigatório): Nome completo da diarista
  - **Telefone** (obrigatório): Com formato (XX) 9XXXX-XXXX
  - **Email** (opcional): Email da diarista
  - **Endereço** (opcional): Rua e número
  - **Cidade** (opcional): Cidade
  - **CEP** (opcional): CEP no formato XXXXX-XXX
- [ ] Clique em "Adicionar"
- [ ] Verifique se a diarista aparece na lista
- [ ] Teste o botão "✏️ Editar" para modificar dados
- [ ] Teste o botão "🗑️ Deletar" para remover uma diarista

**Reportar se:**
- O botão "Adicionar" não funciona
- Os dados não são salvos
- Erros aparecem ao editar ou deletar
- A lista não atualiza corretamente

---

### 3️⃣ **AGENDAR SERVIÇOS**
- [ ] Clique em "Agendamentos" → "Agendar"
- [ ] Clique no botão "Novo Agendamento"
- [ ] Preencha os campos:
  - **Diarista** (obrigatório): Selecione uma diarista cadastrada
  - **Especialidade** (obrigatório): Escolha (ex: Cozinheiro, Garçom, Limpeza, etc)
  - **Local de Serviço** (obrigatório): Selecione entre as operações (Havalon, Cantina Havalon, Pegasus, Cantina Pegasus, Aeroporto, Quiosque, Ima)
  - **Telefone do Cliente** (obrigatório): Contato do cliente
  - **Data de Início** (obrigatório): Quando o serviço começa
  - **Data de Fim** (obrigatório): Quando o serviço termina
  - **Valor da Diária** (obrigatório): Valor em reais (ex: 150)
  - **Descrição do Serviço** (obrigatório): O que será feito
  - **Observações** (opcional): Notas adicionais
- [ ] Verifique o cálculo automático: "Valor estimado a receber" deve ser (dias × valor da diária)
- [ ] Clique em "Agendar"
- [ ] Verifique se o agendamento aparece na lista
- [ ] **Importante:** Verifique se a diarista recebeu notificação no WhatsApp com os detalhes do agendamento

**Reportar se:**
- O cálculo do valor está incorreto
- O botão "Agendar" não funciona
- As notificações WhatsApp não chegam
- Os dados não são salvos corretamente
- Erros ao selecionar diarista ou especialidade

---

### 4️⃣ **REGISTRAR PAGAMENTOS**
- [ ] Clique em "Pagamentos" → "Registrar"
- [ ] Clique no botão "Novo Pagamento"
- [ ] Preencha os campos:
  - **Agendamento** (obrigatório): Selecione um agendamento
  - **Valor** (obrigatório): Valor a ser pago
  - **Método de Pagamento** (obrigatório): Dinheiro, PIX ou Cartão
  - **Data do Pagamento** (obrigatório): Quando foi pago
  - **Comprovante** (opcional): Faça upload de imagem ou PDF
- [ ] Clique em "Registrar Pagamento"
- [ ] Verifique se o pagamento aparece na lista
- [ ] **Importante:** Verifique se o coordenador (Nunes) e a diarista receberam notificação no WhatsApp confirmando o pagamento com mensagem de "prosperidade e abundância"

**Reportar se:**
- O botão "Registrar" não funciona
- O upload de comprovante falha
- As notificações WhatsApp não chegam
- Os dados não são salvos

---

### 5️⃣ **VISUALIZAR RELATÓRIOS**
- [ ] Clique em "Relatórios" → "Visualizar"
- [ ] Verifique se exibe corretamente:
  - Total de diaristas cadastradas
  - Resumo de agendamentos (agendados, concluídos, cancelados)
  - Resumo de pagamentos (pagos, pendentes, cancelados)
  - Total pago e pendente
  - Distribuição por método de pagamento
  - Gráficos e estatísticas

**Reportar se:**
- Os números estão incorretos
- Alguma informação não carrega
- Os gráficos não aparecem

---

### 6️⃣ **EMITIR RECIBOS**
- [ ] Clique em "Recibos" → "Emitir"
- [ ] Clique em "📄 Visualizar Recibo" de um pagamento
- [ ] Verifique se o recibo exibe:
  - Logo da 067 Vinhos
  - CNPJ: 34.257.880/0001-06
  - Dados da diarista
  - Dados do serviço
  - Valor pago
  - Campos para assinatura
- [ ] Clique em "📋 Copiar Recibo" para copiar o texto
- [ ] Clique em "🖨️ Imprimir" para abrir a janela de impressão
- [ ] **Importante:** Verifique se apenas o recibo é impresso, não a página inteira

**Reportar se:**
- O recibo não exibe corretamente
- A impressão imprime a página inteira em vez do recibo
- Faltam informações no recibo
- O botão de copiar não funciona

---

## 🔔 NOTIFICAÇÕES WHATSAPP

O sistema envia notificações automáticas para:

**Ao Agendar um Serviço:**
- ✅ Coordenador Operacional (Nunes): 67 99958-3290
- ✅ Cópia para Alan: 67 99982-0888
- ✅ Cópia para Bárbara: 21 97206-1271
- ✅ Cópia para Samuel (Financeiro): 67 99927-7878
- ✅ Diarista: Número cadastrado no sistema

**Ao Registrar um Pagamento:**
- ✅ Coordenador Operacional (Nunes): Com confirmação de pagamento
- ✅ Diarista: Com confirmação de pagamento e mensagem de "prosperidade e abundância"

**Verifique se:**
- [ ] As notificações chegam no WhatsApp
- [ ] Os dados estão corretos (nome da diarista, especialidade, datas, operação, valor)
- [ ] O formato está descontraído com emojis
- [ ] Nenhuma notificação está faltando

---

## 📝 COMO REPORTAR ERROS E BUGS

Quando encontrar um erro ou bug, por favor envie um email ou WhatsApp com as seguintes informações:

**Modelo de Relatório:**
```
📌 TÍTULO DO BUG: [Descrição breve do problema]

🔴 SEVERIDADE: 
   - 🔴 Crítico (Sistema não funciona)
   - 🟠 Alto (Funcionalidade não funciona)
   - 🟡 Médio (Funcionalidade parcialmente funciona)
   - 🟢 Baixo (Cosmético/Sugestão)

📍 LOCALIZAÇÃO: 
   [Qual página/seção do sistema]

📝 DESCRIÇÃO DO PROBLEMA:
   [Descreva exatamente o que aconteceu]

🔄 PASSOS PARA REPRODUZIR:
   1. [Primeiro passo]
   2. [Segundo passo]
   3. [Terceiro passo]
   ...

📸 SCREENSHOT/VÍDEO:
   [Se possível, anexe uma captura de tela ou vídeo]

💬 OBSERVAÇÕES ADICIONAIS:
   [Qualquer informação extra que possa ajudar]
```

---

## 📧 ONDE ENVIAR OS RELATÓRIOS

**Email:** [seu email aqui]  
**WhatsApp:** [seu número aqui]  
**Prazo:** Por favor, envie os testes até **[DATA]**

---

## ⏰ CRONOGRAMA DE TESTES

- **Semana 1:** Testes básicos (Dashboard, Diaristas, Agendamentos)
- **Semana 2:** Testes avançados (Pagamentos, Recibos, Notificações)
- **Semana 3:** Ajustes finais e validação
- **Semana 4:** Lançamento oficial

---

## 💡 DICAS IMPORTANTES

1. **Teste em diferentes dispositivos:** Desktop, tablet e celular (Safari, Chrome)
2. **Teste em diferentes navegadores:** Chrome, Safari, Firefox
3. **Teste com dados reais:** Use dados da 067 Vinhos para testes mais realistas
4. **Teste fluxos completos:** Crie diarista → Agende → Registre pagamento → Emita recibo
5. **Verifique notificações:** Confirme que todas as notificações WhatsApp chegam
6. **Teste com múltiplos usuários:** Verifique se os dados são compartilhados corretamente

---

## ❓ DÚVIDAS FREQUENTES

**P: O sistema é seguro?**  
R: Sim! O sistema usa autenticação OAuth da Manus e banco de dados criptografado.

**P: Meus dados serão perdidos?**  
R: Não! Todos os dados são salvos em banco de dados central e compartilhados entre usuários.

**P: Posso testar sem medo de quebrar algo?**  
R: Sim! Este é um ambiente de testes. Você pode criar, editar e deletar dados à vontade.

**P: E se eu acidentalmente deletar algo importante?**  
R: Não se preocupe! Temos backups. Apenas reporte o incidente.

---

## 🎉 OBRIGADO!

Agradecemos sua participação nos testes do STCD. Seu feedback é fundamental para melhorar o sistema e garantir que atenda perfeitamente às necessidades da 067 Vinhos.

**Juntos, vamos criar um sistema fantástico! 🚀**

---

**Equipe de Desenvolvimento**  
Sistema de Controle de Diaristas (STCD)  
067 Vinhos

