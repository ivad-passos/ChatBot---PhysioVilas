# PhysioVilas Chatbot — Pacote 1

Chatbot de triagem e FAQ para o WhatsApp da PhysioVilas.
Roda 100% local com um simulador web — sem banco de dados, sem conta Meta.

## Pré-requisitos

- [Node.js](https://nodejs.org/) v22 LTS ou superior
- npm v10 ou superior

## Setup local

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd physiovilas-chatbot

# 2. Instale as dependências
npm install

# 3. Rode os testes
npm test
```

## Rodando o simulador

```bash
npm run dev
```

Acesse **http://localhost:3022** no navegador. O simulador permite trocar mensagens com o bot sem necessidade de conta WhatsApp ou banco de dados.

> `npm run dev` compila o TypeScript e inicia o servidor em uma única etapa.

## Scripts disponíveis

| Comando              | O que faz                                      |
|----------------------|------------------------------------------------|
| `npm run dev`        | Compila e sobe o servidor (desenvolvimento)    |
| `npm run build`      | Compila TypeScript → `dist/`                   |
| `npm start`          | Inicia o servidor a partir de `dist/` já compilado |
| `npm test`           | Executa todos os testes (modo CI)              |
| `npm run test:watch` | Testes em modo watch                           |

## Estrutura de pastas

```
src/
├── channels/
│   ├── IChatChannel.ts         # Contrato de canal (Fase 1) — NÃO ALTERAR
│   └── webSimulator/           # Simulador web local (Fase 2)
│       ├── WebSimulatorChannel.ts
│       └── server.ts           # Express + WebSocket, porta 3000
├── core/
│   ├── tipos.ts                # Tipos de domínio: Sessao, Mensagem, Triagem
│   ├── repositorioMemoria.ts   # Estado em memória (sem banco)
│   └── orquestrador.ts         # Lógica central (Fase 5)
├── modules/
│   ├── faq/                    # Módulo de FAQ (Fase 3)
│   └── triagem/                # Módulo de triagem (Fase 4)
├── config/
│   └── faqs.json               # Perguntas e respostas (editável sem recompilar)
└── main.ts
web/                            # Frontend do simulador (HTML/CSS/JS)
tests/
├── unit/
└── integration/
```

## Fases de implementação

| Fase | Status | Objetivo |
|------|--------|----------|
| Fase 0 | ✅ | Fundação (repo + testes rodando) |
| Fase 1 | ✅ | Contrato de canal (`IChatChannel` + tipos de domínio) |
| Fase 2 | ✅ | Simulador web visual (Express + WebSocket) |
| Fase 3 | ⬜ | Módulo FAQ (`matchFaq`, plugado no simulador) |
| Fase 4 | ⬜ | Módulo de triagem (máquina de estados) |
| Fase 5 | ⬜ | Orquestrador integrado (une FAQ + triagem) |

> Fases 3 e 4 são desenvolvidas em paralelo. A Fase 5 só começa após ambas estarem prontas.

## Equipe

Código: Davi Serra Passos, Luiz Gustavo Santos Cunha, Maria Luiza Queiroz
Prazo Pacote 1: 10/06/2026
