/**
 * Tipos de domínio da conversa — NÃO ALTERAR após Fase 1.
 * Todo o estado é mantido em memória durante a execução (sem persistência em disco).
 */

export interface Mensagem {
  origem: 'usuario' | 'bot'
  texto: string
  instante: Date
}

export type TipoDemanda = 'novo' | 'retorno' | 'duvida' | 'urgencia'
export type StatusTriagem = 'pendente' | 'transferida'

export interface Triagem {
  tipoDemanda: TipoDemanda
  dadosClinicos: Record<string, string>
  status: StatusTriagem
}

export interface Sessao {
  identificadorUsuario: string
  etapaAtual: string
  dadosParciais: Record<string, string>
  mensagens: Mensagem[]
  triagem?: Triagem
}
