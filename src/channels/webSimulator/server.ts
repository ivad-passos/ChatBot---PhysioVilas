import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { WebSimulatorChannel } from './WebSimulatorChannel.js'
import { RepositorioEmMemoria } from '../../core/repositorioMemoria.js'
import type { Sessao } from '../../core/tipos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_DIR = join(__dirname, '../../../web')

export function criarServidor(porta = 3000) {
  const app = express()
  const httpServer = createServer(app)
  const wss = new WebSocketServer({ server: httpServer })

  const canal = new WebSimulatorChannel()
  const repositorio = new RepositorioEmMemoria()

  // Handler de mensagens — placeholder até a Fase 5 conectar o orquestrador
  canal.onMessageReceived(async (msg) => {
    let sessao = repositorio.buscar(msg.from)
    if (!sessao) {
      const novaSessao: Sessao = {
        identificadorUsuario: msg.from,
        etapaAtual: 'inicio',
        dadosParciais: {},
        mensagens: [],
      }
      repositorio.criar(novaSessao)
      sessao = novaSessao
    }

    sessao.mensagens.push({ origem: 'usuario', texto: msg.text, instante: new Date() })
    repositorio.atualizar(sessao)

    // Resposta placeholder — será substituída pelo orquestrador na Fase 5
    const resposta = 'Olá! Em breve responderei sua mensagem. 👋'
    sessao.mensagens.push({ origem: 'bot', texto: resposta, instante: new Date() })
    repositorio.atualizar(sessao)

    await canal.sendMessage(msg.from, resposta)
  })

  // Serve os arquivos estáticos do frontend
  app.use(express.static(WEB_DIR))

  // WebSocket — uma conexão por sessão
  wss.on('connection', (socket, req) => {
    const url = new URL(req.url ?? '/', `http://localhost:${porta}`)
    const sessionId = url.searchParams.get('sessionId') ?? `session-${Date.now()}`

    canal.registrarSocket(sessionId, socket)

    socket.on('message', async (data) => {
      try {
        const { text } = JSON.parse(data.toString()) as { text: string }
        await canal.receberMensagem(sessionId, text)
      } catch {
        // mensagem malformada — ignorar
      }
    })

    socket.on('close', () => {
      canal.removerSocket(sessionId)
    })
  })

  httpServer.listen(porta, () => {
    console.log(`PhysioVilas Simulador rodando em http://localhost:${porta}`)
  })

  return httpServer
}
