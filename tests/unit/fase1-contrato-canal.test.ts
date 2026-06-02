import { describe, it, expect, vi } from 'vitest'
import type { IChatChannel, IncomingMessage } from '../../src/channels/IChatChannel.js'
import { RepositorioEmMemoria } from '../../src/core/repositorioMemoria.js'
import type { Sessao } from '../../src/core/tipos.js'

// ---------------------------------------------------------------------------
// Mock de IChatChannel — captura mensagens enviadas para asserção
// ---------------------------------------------------------------------------

class MockChannel implements IChatChannel {
  readonly mensagensEnviadas: Array<{ to: string; text: string }> = []
  private handler?: (msg: IncomingMessage) => Promise<void>

  onMessageReceived(handler: (msg: IncomingMessage) => Promise<void>): void {
    this.handler = handler
  }

  async sendMessage(to: string, text: string): Promise<void> {
    this.mensagensEnviadas.push({ to, text })
  }

  async simularMensagem(from: string, text: string): Promise<void> {
    await this.handler?.({ from, text })
  }
}

// ---------------------------------------------------------------------------
// Testes de IChatChannel
// ---------------------------------------------------------------------------

describe('Fase 1 — IChatChannel (mock)', () => {
  it('captura mensagens enviadas pelo bot', async () => {
    const canal = new MockChannel()
    canal.onMessageReceived(async (msg) => {
      await canal.sendMessage(msg.from, `Olá, ${msg.from}!`)
    })

    await canal.simularMensagem('paciente-1', 'oi')

    expect(canal.mensagensEnviadas).toHaveLength(1)
    expect(canal.mensagensEnviadas[0]).toEqual({ to: 'paciente-1', text: 'Olá, paciente-1!' })
  })

  it('registra múltiplas mensagens em ordem', async () => {
    const canal = new MockChannel()
    const recebidas: string[] = []

    canal.onMessageReceived(async (msg) => {
      recebidas.push(msg.text)
      await canal.sendMessage(msg.from, 'ok')
    })

    await canal.simularMensagem('u1', 'primeira')
    await canal.simularMensagem('u1', 'segunda')

    expect(recebidas).toEqual(['primeira', 'segunda'])
    expect(canal.mensagensEnviadas).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Testes do RepositorioEmMemoria
// ---------------------------------------------------------------------------

describe('Fase 1 — RepositorioEmMemoria', () => {
  const novaSessao = (id: string): Sessao => ({
    identificadorUsuario: id,
    etapaAtual: 'inicio',
    dadosParciais: {},
    mensagens: [],
  })

  it('ciclo create → get → update', () => {
    const repo = new RepositorioEmMemoria()
    const sessao = novaSessao('paciente-1')

    repo.criar(sessao)

    const encontrada = repo.buscar('paciente-1')
    expect(encontrada).toBeDefined()
    expect(encontrada?.etapaAtual).toBe('inicio')

    repo.atualizar({ ...sessao, etapaAtual: 'triagem' })
    expect(repo.buscar('paciente-1')?.etapaAtual).toBe('triagem')
  })

  it('buscar id inexistente retorna undefined', () => {
    const repo = new RepositorioEmMemoria()
    expect(repo.buscar('nao-existe')).toBeUndefined()
  })

  it('sessões de usuários diferentes são independentes', () => {
    const repo = new RepositorioEmMemoria()
    repo.criar(novaSessao('u1'))
    repo.criar(novaSessao('u2'))

    repo.atualizar({ ...novaSessao('u1'), etapaAtual: 'faq' })

    expect(repo.buscar('u1')?.etapaAtual).toBe('faq')
    expect(repo.buscar('u2')?.etapaAtual).toBe('inicio')
  })

  it('listarTodos retorna todas as sessões ativas', () => {
    const repo = new RepositorioEmMemoria()
    repo.criar(novaSessao('u1'))
    repo.criar(novaSessao('u2'))
    repo.criar(novaSessao('u3'))

    expect(repo.listarTodos()).toHaveLength(3)
  })

  it('remover elimina a sessão do repositório', () => {
    const repo = new RepositorioEmMemoria()
    repo.criar(novaSessao('u1'))
    repo.remover('u1')

    expect(repo.buscar('u1')).toBeUndefined()
  })
})
