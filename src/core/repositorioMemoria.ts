/**
 * Repositório de sessões ativas em memória — NÃO ALTERAR a assinatura pública após Fase 1.
 *
 * Deliberadamente volátil: ao reiniciar o processo, todo o estado se perde.
 * Isso é aceito por escopo no Pacote 1 (prototipação).
 */

import type { Sessao } from './tipos.js'

export class RepositorioEmMemoria {
  private readonly sessoes = new Map<string, Sessao>()

  criar(sessao: Sessao): void {
    this.sessoes.set(sessao.identificadorUsuario, sessao)
  }

  buscar(identificadorUsuario: string): Sessao | undefined {
    return this.sessoes.get(identificadorUsuario)
  }

  atualizar(sessao: Sessao): void {
    this.sessoes.set(sessao.identificadorUsuario, sessao)
  }

  remover(identificadorUsuario: string): void {
    this.sessoes.delete(identificadorUsuario)
  }

  listarTodos(): Sessao[] {
    return Array.from(this.sessoes.values())
  }
}
