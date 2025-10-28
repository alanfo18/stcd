import { trpc } from './trpc';

export async function criarNotificacao(
  titulo: string,
  descricao?: string,
  tipo: 'diarista' | 'agendamento' | 'pagamento' | 'recibo' | 'seguranca' = 'agendamento',
  icone: string = '📋'
) {
  const cores: Record<string, string> = {
    diarista: 'blue',
    agendamento: 'purple',
    pagamento: 'green',
    recibo: 'yellow',
    seguranca: 'red',
  };

  const icones: Record<string, string> = {
    diarista: '👤',
    agendamento: '📅',
    pagamento: '💳',
    recibo: '📋',
    seguranca: '⚠️',
  };

  try {
    // Aqui você chamaria a API para criar a notificação
    // Por enquanto, apenas log
    console.log('Notificação criada:', {
      titulo,
      descricao,
      tipo,
      icone: icones[tipo] || icone,
      cor: cores[tipo],
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

export const notificacoes = {
  novaDiarista: (nome: string) =>
    criarNotificacao(
      `✅ Nova Diarista Cadastrada`,
      `${nome} foi adicionada ao sistema`,
      'diarista',
      '👤'
    ),

  novoAgendamento: (diarista: string, local: string) =>
    criarNotificacao(
      `📅 Novo Agendamento`,
      `${diarista} agendada para ${local}`,
      'agendamento',
      '📅'
    ),

  novoPagamento: (diarista: string, valor: string) =>
    criarNotificacao(
      `💳 Pagamento Registrado`,
      `${diarista} recebeu ${valor}`,
      'pagamento',
      '💳'
    ),

  novoRecibo: (diarista: string) =>
    criarNotificacao(
      `📋 Recibo Emitido`,
      `Recibo gerado para ${diarista}`,
      'recibo',
      '📋'
    ),

  acessoSeguranca: (localizacao: string) =>
    criarNotificacao(
      `⚠️ Acesso Detectado`,
      `Acesso do sistema detectado em ${localizacao}`,
      'seguranca',
      '⚠️'
    ),
};

