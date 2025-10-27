import { ENV } from './_core/env';

interface WhatsAppMessage {
  to: string;
  body: string;
  priority?: 'high' | 'normal';
}

/**
 * Enviar mensagem WhatsApp via UltraMsg
 */
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<boolean> {
  try {
    if (!ENV.ultramsgApiUrl || !ENV.ultramsgInstanceId || !ENV.ultramsgApiToken) {
      console.warn('[WhatsApp] Credenciais do UltraMsg não configuradas');
      return false;
    }

    // Construir URL corretamente
    // A URL da UltraMsg deve ser: https://api.ultramsg.com/instance{instanceId}/messages/chat
    const baseUrl = ENV.ultramsgApiUrl.endsWith('/') ? ENV.ultramsgApiUrl : ENV.ultramsgApiUrl + '/';
    const url = `${baseUrl}messages/chat`;
    
    console.log('[WhatsApp] URL:', url);
    console.log('[WhatsApp] Instance ID:', ENV.ultramsgInstanceId);
    console.log('[WhatsApp] Enviando mensagem para:', message.to);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: ENV.ultramsgApiToken,
        to: message.to,
        body: message.body,
        priority: message.priority || 'normal',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WhatsApp] Erro ao enviar mensagem:', response.status, response.statusText, errorText);
      return false;
    }

    const data = await response.json();
    console.log('[WhatsApp] Mensagem enviada com sucesso:', data);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar mensagem:', error);
    return false;
  }
}

/**
 * Notificar coordenador sobre novo agendamento
 */
export async function notifyCoordinatorNewScheduling(
  diaristaName: string,
  especialidade: string,
  address: string,
  dataInicio: string,
  dataFim: string,
  amount: string
): Promise<boolean> {
  const message = `
🗓️ *NOVO AGENDAMENTO CONFIRMADO*

👩 *Diarista:* ${diaristaName}
💼 *Especialidade:* ${especialidade}
📍 *Operação:* ${address}
📅 *Período:* ${dataInicio} até ${dataFim}
💵 *Valor a Receber:* ${amount}

Agendamento registrado no sistema.
  `.trim();

  // Enviar para Nunes (Coordenador) com prioridade
  const nunes = '5567999583290'; // 67 99958-3290
  const sent = await sendWhatsAppMessage({
    to: nunes,
    body: message,
    priority: 'high',
  });

  // Enviar cópia para Alan, Bárbara e Samuel
  const ccList = [
    '5567999820888', // Alan: 67 99982-0888
    '5521972061271', // Bárbara: 21 97206-1271
    '5567999277878', // Samuel: 67 99927-7878
  ];

  for (const phone of ccList) {
    await sendWhatsAppMessage({
      to: phone,
      body: `📁 *[CÓPIA]* ${message}`,
    });
  }

  return sent;
}

/**
 * Notificar diarista sobre novo agendamento
 */
export async function notifyDiaristaNewScheduling(
  diaristaPhone: string,
  especialidade: string,
  address: string,
  dataInicio: string,
  dataFim: string,
  amount: string,
  description?: string
): Promise<boolean> {
  const message = `
✅ *NOVO AGENDAMENTO CONFIRMADO*

💼 *Especialidade:* ${especialidade}
📍 *Operação:* ${address}
📅 *Período:* ${dataInicio} até ${dataFim}
${description ? `📄 *Descrição:* ${description}` : ''}
💵 *Valor a Receber:* ${amount}

Confirme seu comparecimento respondendo a esta mensagem. 🙏
  `.trim();

  return await sendWhatsAppMessage({
    to: diaristaPhone,
    body: message,
    priority: 'high',
  });
}

/**
 * Notificar sobre pagamento realizado
 */
export async function notifyPaymentMade(
  diaristaName: string,
  diaristaPhone: string,
  amount: string,
  paymentMethod: string,
  date: string
): Promise<boolean> {
  const messageToCoordinator = `
💰 *PAGAMENTO REALIZADO*

*Diarista:* ${diaristaName}
*Valor:* ${amount}
*Método:* ${paymentMethod}
*Data:* ${date}

✨ Que haja prosperidade e abundância para todos! ✨
  `.trim();

  const messageToDiarista = `
✅ *PAGAMENTO CONFIRMADO*

Seu pagamento de ${amount} foi realizado com sucesso!
*Método:* ${paymentMethod}
*Data:* ${date}

✨ Que haja prosperidade e abundância em sua vida! ✨
Obrigado pelo seu trabalho! 🙏
  `.trim();

  // Notificar coordenador
  const nunes = '5567999583290';
  const coordinatorNotified = await sendWhatsAppMessage({
    to: nunes,
    body: messageToCoordinator,
  });

  // Notificar diarista
  const diaristaNotified = await sendWhatsAppMessage({
    to: diaristaPhone,
    body: messageToDiarista,
    priority: 'high',
  });

  return coordinatorNotified && diaristaNotified;
}

/**
 * Notificar sobre avaliação recebida
 */
export async function notifyDiaristaRating(
  diaristaName: string,
  diaristaPhone: string,
  rating: number,
  comment?: string
): Promise<boolean> {
  const stars = '⭐'.repeat(rating);
  const message = `
${stars} *NOVA AVALIAÇÃO RECEBIDA*

Você recebeu uma avaliação de ${rating} estrelas!
${comment ? `*Comentário:* ${comment}` : ''}

Continue com o excelente trabalho!
  `.trim();

  return await sendWhatsAppMessage({
    to: diaristaPhone,
    body: message,
  });
}

