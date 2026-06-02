import type { IChatChannel, IncomingMessage } from '../IChatChannel.js'
import type { WebSocket } from 'ws'

/**
 * Implementação de IChatChannel para o simulador web local.
 * Cada instância representa uma sessão (identificada por identificadorUsuario).
 * Não requer conta Meta, webhook real ou envio externo.
 */
export class WebSimulatorChannel implements IChatChannel {
  private handler?: (msg: IncomingMessage) => Promise<void>
  private readonly sockets = new Map<string, WebSocket>()

  onMessageReceived(handler: (msg: IncomingMessage) => Promise<void>): void {
    this.handler = handler
  }

  async sendMessage(to: string, text: string): Promise<void> {
    const socket = this.sockets.get(to)
    if (socket && socket.readyState === 1 /* OPEN */) {
      socket.send(JSON.stringify({ from: 'bot', text }))
    }
  }

  /** Chamado pelo servidor WebSocket quando uma mensagem chega do navegador. */
  async receberMensagem(from: string, text: string): Promise<void> {
    await this.handler?.({ from, text })
  }

  /** Registra o socket de uma sessão para que sendMessage possa entregá-la. */
  registrarSocket(identificadorUsuario: string, socket: WebSocket): void {
    this.sockets.set(identificadorUsuario, socket)
  }

  /** Remove o socket quando a conexão é encerrada. */
  removerSocket(identificadorUsuario: string): void {
    this.sockets.delete(identificadorUsuario)
  }
}
