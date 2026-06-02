/**
 * Contrato estável de canal de mensagens — NÃO ALTERAR após Fase 1.
 *
 * Este contrato é compartilhado entre:
 *  - Pacote 1: WebSimulatorChannel (simulador local)
 *  - Pacote 2: WhatsAppChannel (API oficial do WhatsApp Business)
 *
 * Qualquer alteração aqui quebra a compatibilidade com o Pacote 2.
 */

export interface IncomingMessage {
  from: string
  text: string
}

export interface IChatChannel {
  onMessageReceived(handler: (msg: IncomingMessage) => Promise<void>): void
  sendMessage(to: string, text: string): Promise<void>
}
