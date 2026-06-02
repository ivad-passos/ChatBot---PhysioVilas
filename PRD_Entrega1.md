# PRD — Entrega 1: Módulos de Chatbot (FAQ + Triagem) com Simulador Local

**Projeto:** Reestruturação do Atendimento e Prototipação do Chatbot de Triagem (PhysioVilas)
**Pacote de Entregas:** 1
**Equipe:** Código — Davi Serra Passos, Luiz Gustavo Santos Cunha, Maria Luiza Queiroz
**Stack:** Node.js + TypeScript · estado em memória (sem banco de dados) · simulador de chat web local
**Prazo:** até 10/06/2026 · **Apresentação Parcial:** 17/06 a 01/07/2026
**Versão do documento:** 6.0 (simulador visual na Fase 2; histórico removido — capturado pela API do WhatsApp)
**Data:** 02/06/2026

---

## 1. Visão Geral

Este documento especifica a parte de **código** do Pacote de Entregas 1 do projeto PhysioVilas, conforme o Project Model Canvas. O escopo é estritamente limitado ao Pacote 1 — nada dos Pacotes 2 ou 3 deve ser incluído.

O Pacote 1 é de **prototipação**. A equipe de código entrega os módulos de lógica do chatbot (FAQs e triagem inicial) funcionando localmente, demonstrados por um **simulador de chat web** e validados por **testes automatizados**.

**Sem banco de dados.** O Canvas não menciona persistência no Pacote 1 e coloca "centralizar a base de dados" explicitamente no Pacote 3. Portanto, o Pacote 1 mantém todo o estado da conversa **em memória durante a sessão**. Nada é gravado em disco. O requisito do Canvas de que a transferência ao humano inclua o histórico completo da conversa é cumprido montando o histórico a partir do estado em memória no momento da transferência.

A integração com a API oficial do WhatsApp Business **pertence ao Pacote 2**. O Pacote 1 mantém o núcleo de lógica desacoplado do canal, atrás de uma interface, para que o Pacote 2 conecte a API real sem reescrever a lógica.

**Como usar este documento:** as fases na Seção 6 são ordenadas por dependência e devem ser implementadas em sequência. Cada fase termina em estado executável e verificável. Conclua e verifique uma fase antes de iniciar a próxima.

---

## 2. Plano Macro das Fases

Esta seção dá a visão de cima de todas as fases da Entrega 1 de uma só vez: o que cada uma entrega, do que depende e o que ela trava. A especificação detalhada de cada fase está na Seção 6.

### 2.1 Resumo das fases

| Fase   | Objetivo               | Depende de  | Entregável verificável                                       |
| ------ | ---------------------- | ----------- | -------------------------------------------------------------- |
| Fase 0 | Fundação do projeto  | —          | Repo executável, testes rodando, build sem erros              |
| Fase 1 | Contrato de canal      | Fase 0      | Interface `IChatChannel` definida e congelada                |
| Fase 2 | Simulador web visual   | Fase 1      | Interface de chat funcionando no navegador local (sem lógica) |
| Fase 3 | Módulo de FAQ         | Fase 2      | `matchFaq()` retorna a resposta correta por palavra-chave    |
| Fase 4 | Módulo de triagem     | Fase 2      | Coleta completa +`classificarDemanda()` correto              |
| Fase 5 | Orquestrador integrado | Fases 3 e 4 | Conversa ponta a ponta (FAQ + triagem) no simulador            |

### 2.2 Sequência e paralelismo

As fases não são todas sequenciais. Há um caminho de fundação que precisa ser feito em ordem, e depois um bloco que pode ser tocado em paralelo:

- **Caminho crítico (sequencial): Fase 0 → Fase 1 → Fase 2.** A fundação, o contrato de canal e o simulador visual precisam vir em ordem. O simulador é a base sobre a qual os módulos de lógica serão plugados.
- **Bloco paralelo: Fases 3 e 4.** Assim que a Fase 2 entrega o simulador visual, FAQ e triagem passam a ser independentes entre si e podem ser desenvolvidas ao mesmo tempo, em branches separadas, sem uma esperar a outra.
- **Convergência: Fase 5.** Só pode começar quando as Fases 3 e 4 estiverem prontas, pois é ela que une os dois módulos no orquestrador e entrega a conversa ponta a ponta.

### 2.3 Implicações práticas

- O gargalo de cronograma **não** é o número de fases, e sim fechar o caminho crítico (0 → 1 → 2) rapidamente — é ele que libera o trabalho paralelo.
- A **Fase 1 é o marco mais sensível**: ao congelar o contrato de canal, ela garante a compatibilidade futura com o Pacote 2. Por isso o contrato definido nela entra na lista "NÃO ALTERAR".
- A **Fase 2 (simulador visual) é a base prática**: permite validar a UX antes de investir na lógica, e serve de plataforma comum para as Fases 3 e 4 serem plugadas.
- As **dependências da equipe de Gestão e Fluxo do projeto** (conteúdo das FAQs, campos da triagem) alimentam as Fases 3 e 4. Como a estrutura é parametrizável, elas podem ser desenvolvidas com dados provisórios e receber o conteúdo final depois, sem refatoração.

---

## 3. Contexto (conforme Canvas)

A PhysioVilas é uma Clínica de Fisioterapia. O projeto visa modernizar e digitalizar a clínica, solucionando gargalos de atendimento. A frente de atendimento busca padronizar a comunicação no WhatsApp, reduzir o tempo de resposta e reduzir a dependência exclusiva de atendentes humanos para tarefas repetitivas e triagem inicial.

---

## 4. Escopo

### 4.1 Dentro do escopo

| #  | Funcionalidade                                                             | Origem                  |
| -- | -------------------------------------------------------------------------- | ----------------------- |
| F1 | Simulador de chat web local para demonstração (protótipo visual)        | Casca de prototipação |
| F2 | Módulo de respostas automáticas a FAQs                                   | Pacote 1                |
| F3 | Módulo de triagem inicial com recolha de informações clínicas básicas | Pacote 1                |
| F4 | Identificação do tipo de demanda (novo, retorno, dúvida, urgência)     | Requisito Canvas        |
| F5 | Núcleo de lógica desacoplado do canal (interface de E/S)                 | Habilita Pacote 2       |
| F6 | Suíte de testes automatizados                                             | Validação             |

> **Nota:** a montagem de histórico para transferência (anteriormente F4) foi removida do escopo do Pacote 1. O histórico de conversa será capturado pela API do WhatsApp no Pacote 2 — reimplementar isso no bot seria redundante.

### 4.2 Não-objetivos (fora do escopo — declarados positivamente)

- **NÃO** usar banco de dados ou qualquer persistência em disco → estado em memória; centralização de dados é Pacote 3
- **NÃO** integrar com a API oficial do WhatsApp Business → Pacote 2
- **NÃO** colocar o chatbot em produção no WhatsApp → Pacote 2
- **NÃO** implementar agendamento ou confirmação de consultas → Pacote 2
- **NÃO** implementar lembretes automáticos → Pacote 2
- **NÃO** integrar com o sistema de dados existente da clínica → Pacote 2
- **NÃO** implementar KPIs, dashboards ou relatórios → Pacote 3
- **NÃO** implementar exportação PDF/Excel → Pacote 3
- **NÃO** implementar retenção de 24 meses de dados → Pacote 3
- **NÃO** implementar autenticação de usuário, login ou painel administrativo (nenhuma fase requer)
- **NÃO** suportar outros canais (Instagram, Facebook, web público) → exclusão do Canvas
- **NÃO** desenvolver ERP ou sistema de agendamento do zero → exclusão do Canvas

> A restrição "uso exclusivo da API oficial do WhatsApp Business" permanece válida e se concretiza no Pacote 2. No Pacote 1, significa não construir nada dependente de gateway não-oficial; o simulador local é ferramenta de demonstração, não canal de produção.

---

## 5. Fase de Pesquisa (obrigatória antes de codar)

LLMs têm data de corte de conhecimento e podem referenciar bibliotecas/APIs desatualizadas. Antes de iniciar a Fase 0, validar online (data atual):

```
□ "WhatsApp Business Platform Cloud API" capacidades e modelo de mensagens (para preparar Pacote 2 sem retrabalho)
□ Versão estável atual do Node.js LTS e compatibilidade com TypeScript
□ Vitest vs Jest — versão atual recomendada para projeto Node+TS novo
```

> Decisão pendente registrada: o meio de acesso à API oficial (Meta Cloud API direta ou BSP) será decidido no início do Pacote 2, após esta pesquisa. No Pacote 1 nada depende dessa decisão.

---

## 6. Especificação Faseada (ordenada por dependência)

> Cada fase: objetivo único, requisitos numerados, critérios de aceite verificáveis e bloco NÃO ALTERAR. Concluir e verificar antes de avançar. Ao fim de cada fase, criar commit/checkpoint nomeado.

### Fase 0 — Fundação do projeto

**Objetivo:** repositório executável com pipeline de testes vazio funcionando.

**Requisitos:**

1. Inicializar projeto Node.js + TypeScript com a estrutura de pastas da Seção 7.
2. Configurar o runner de testes (Vitest ou Jest) com um teste trivial passando.
3. Criar `README.md` com passos de setup local.

**Critérios de aceite (verificáveis):**

- [X] `npm test` executa e o teste trivial passa (exit code 0).
- [X] `npm run build` (tsc) compila sem erros de tipo.
- [X] Clonar o repo e seguir o README leva a um ambiente funcional em máquina limpa.

**NÃO ALTERAR:** nada ainda (primeira fase).

**Checkpoint:** `fase-0-fundacao`

---

### Fase 1 — Interface de canal (contrato de E/S)

**Objetivo:** definir o contrato que desacopla a lógica do canal. É o ponto de extensão para o Pacote 2 e o marco que libera o trabalho paralelo.

**Requisitos:**

1. Definir a interface `IChatChannel`:
   ```typescript
   interface IncomingMessage { from: string; text: string; }
   interface IChatChannel {
     onMessageReceived(handler: (msg: IncomingMessage) => Promise<void>): void;
     sendMessage(to: string, text: string): Promise<void>;
   }
   ```
2. Definir os tipos de domínio da conversa, mantidos em memória (não persistidos):
   - `Sessao { identificadorUsuario, etapaAtual, dadosParciais, mensagens: Mensagem[] }`
   - `Mensagem { origem: 'usuario' | 'bot', texto, instante }`
   - `Triagem { tipoDemanda, dadosClinicos, status: 'pendente' | 'transferida' }`
3. Implementar um `RepositorioEmMemoria` (mapa em memória) para guardar sessões ativas durante a execução. É deliberadamente volátil: ao reiniciar o processo, o estado se perde.
4. Documentar no código que `IChatChannel` é contrato estável compartilhado entre Pacote 1 (simulador) e Pacote 2 (API oficial).

**Critérios de aceite (verificáveis):**

- [X] A interface e os tipos compilam e estão exportados.
- [X] Existe ao menos um mock de `IChatChannel` nos testes que captura mensagens enviadas para asserção.
- [X] `RepositorioEmMemoria` cria, busca e atualiza uma sessão; um teste comprova o ciclo create→get→update.
- [X] Nenhum módulo de lógica (Fases 2-4) importa nada específico de canal além de `IChatChannel`.

**🔒 NÃO ALTERAR (a partir desta fase):**

- A assinatura da interface `IChatChannel` e dos tipos `IncomingMessage`, `Sessao`, `Mensagem`, `Triagem`.
- A assinatura pública do `RepositorioEmMemoria`.

> Qualquer fase posterior que precise mudar estes contratos deve parar e sinalizar, não alterar silenciosamente. Mudar `IChatChannel` quebra a compatibilidade com o Pacote 2.

**Checkpoint:** `fase-1-contrato-canal`

---

### Fase 2 — Simulador web visual

**Objetivo:** construir a interface de chat no navegador com visual estilo WhatsApp, sem nenhuma lógica de FAQ ou triagem ainda. O foco é validar a UX e ter a plataforma pronta para receber os módulos de lógica nas fases seguintes.

**Requisitos:**

1. Implementar `WebSimulatorChannel` (implementação de `IChatChannel`) servindo uma página web local com balões de conversa e campo de envio.
2. O simulador roda 100% local: sem conta Meta, sem webhook real, sem envio externo.
3. O bot responde com uma mensagem fixa ("em breve responderei sua mensagem") — placeholder até a Fase 5 conectar o orquestrador.
4. Suportar múltiplas sessões simultâneas (identificadas por `identificadorUsuario`) sem mistura de estado.

**Critérios de aceite (verificáveis):**

- [X] Abrir o simulador no navegador local e enviar uma mensagem exibe o balão do usuário e a resposta placeholder do bot.
- [X] Duas sessões simultâneas (duas abas/identificadores) mantêm históricos visuais independentes.
- [X] O `WebSimulatorChannel` implementa `IChatChannel` — trocar a implementação não exige alterar nenhum módulo de lógica.

**🔒 NÃO ALTERAR:** `IChatChannel`, tipos de domínio, `RepositorioEmMemoria`.

**Checkpoint:** `fase-2-simulador-visual`

---

### Fase 3 — Módulo de FAQ

**Objetivo:** dado um texto de entrada, retornar a resposta de FAQ correspondente, a partir de configuração externa. Plugar o módulo no simulador visual da Fase 2.

**Requisitos:**

1. Carregar perguntas/respostas de `src/config/faqs.json` (conteúdo é insumo da **equipe de Gestão e Fluxo do projeto**; usar conjunto provisório enquanto não chega o oficial).
2. Implementar `matchFaq(texto: string): FaqResposta | null` com correspondência por palavra-chave, case-insensitive.
3. Quando não houver correspondência, retornar `null` (o orquestrador decide o fallback na Fase 5).
4. Permitir editar `faqs.json` sem alterar código de negócio.

**Critérios de aceite (verificáveis):**

- [ ] `matchFaq("qual o horário de funcionamento")` retorna a resposta de horário do `faqs.json` de teste.
- [ ] `matchFaq("HORÁRIO")` (maiúsculas) retorna a mesma resposta (case-insensitive).
- [ ] `matchFaq("xyz sem correspondência")` retorna `null`.
- [ ] Adicionar uma nova entrada ao `faqs.json` a torna disponível sem recompilar a lógica.
- [ ] Cobertura de testes do módulo `faq` ≥ 70%.

**🔒 NÃO ALTERAR:** `IChatChannel`, tipos de domínio, `RepositorioEmMemoria`, `WebSimulatorChannel`.

**Checkpoint:** `fase-3-faq`

---

### Fase 4 — Módulo de triagem (coleta + classificação)

**Objetivo:** conduzir a coleta sequencial dos dados clínicos básicos e classificar o tipo de demanda, mantendo o estado em memória. Plugar o módulo no simulador visual da Fase 2.

**Requisitos:**

1. Implementar uma máquina de estados de triagem que avança por etapas, atualizando `etapaAtual` e `dadosParciais` na sessão em memória (via `RepositorioEmMemoria`).
2. Os campos coletados são parametrizáveis (lista definida pela **equipe de Gestão e Fluxo do projeto**); ler de configuração, não fixar no código.
3. Implementar `classificarDemanda(...)` retornando um de: `novo`, `retorno`, `duvida`, `urgencia`.
4. Ao concluir a coleta, gerar uma `Triagem` em memória com `dadosClinicos` e `tipoDemanda`.
5. Validação de etapa inválida deve repetir a pergunta atual sem avançar.

**Critérios de aceite (verificáveis):**

- [ ] Dada uma sequência de respostas válidas, ao final a sessão contém uma `Triagem` com todos os campos parametrizados preenchidos.
- [ ] `classificarDemanda` retorna `urgencia` para entrada que indique urgência conforme regra definida, e o valor correto para os demais casos de teste.
- [ ] Resposta inválida numa etapa mantém `etapaAtual` inalterada (verificável no estado da sessão em memória).
- [ ] Cobertura de testes do módulo `triagem` ≥ 70%.

**🔒 NÃO ALTERAR:** `IChatChannel`, tipos de domínio, `RepositorioEmMemoria`, `WebSimulatorChannel`, módulo `faq`.

**Checkpoint:** `fase-4-triagem`

---

### Fase 5 — Orquestrador integrado

**Objetivo:** amarrar FAQ e triagem num fluxo coeso atrás do `IChatChannel`, entregando a conversa ponta a ponta no simulador.

**Requisitos:**

1. Implementar o orquestrador que recebe mensagens via `IChatChannel`, decide entre FAQ (Fase 3) e triagem (Fase 4), e responde.
2. Substituir a resposta placeholder do simulador (Fase 2) pela lógica real do orquestrador.
3. Suportar ≥ 5 sessões simultâneas sem mistura de estado.

**Critérios de aceite (verificáveis):**

- [ ] Enviar uma pergunta de FAQ no simulador retorna a resposta correta do `faqs.json`.
- [ ] Conduzir uma triagem completa pelo simulador resulta em uma `Triagem` concluída na sessão em memória.
- [ ] Duas sessões simultâneas (duas abas/identificadores) mantêm estados independentes — verificável por teste com 5 sessões paralelas sem corrupção de estado (atende RNF1).
- [ ] Trocar a implementação de canal não exige alterar nenhum módulo de lógica (demonstra desacoplamento).

**🔒 NÃO ALTERAR:** todos os contratos das fases anteriores.

**Checkpoint:** `fase-5-orquestrador`

---

## 7. Arquitetura Técnica

### 7.1 Estrutura de pastas

```
physiovilas-chatbot/
├── src/
│   ├── channels/
│   │   ├── IChatChannel.ts     # Contrato estável (Fase 1) — NÃO ALTERAR após definido
│   │   └── webSimulator/       # WebSimulatorChannel (Fase 2)
│   ├── core/
│   │   ├── tipos.ts            # Sessao, Mensagem, Triagem (Fase 1)
│   │   ├── repositorioMemoria.ts # Estado em memória (Fase 1)
│   │   └── orquestrador.ts     # Decide FAQ vs triagem (Fase 5)
│   ├── modules/
│   │   ├── faq/                # Fase 3
│   │   └── triagem/            # Fase 4
│   ├── config/
│   │   ├── faqs.json           # Insumo da equipe de Gestão e Fluxo do projeto
│   │   └── triagem.json        # Insumo da equipe de Gestão e Fluxo do projeto (campos clínicos da triagem)
│   └── main.ts
├── web/                        # Frontend do simulador
├── tests/{unit,integration}/
└── README.md
```

> Sem `docker-compose.yml`, sem `infra/db`, sem `.env` de banco: o Pacote 1 não tem banco de dados nem dependências de infraestrutura externa.

### 7.2 Itens de contrato estável (referência rápida do NÃO ALTERAR)

- `IChatChannel` e tipos associados `IncomingMessage` (definidos na Fase 1)
- Tipos de domínio `Sessao`, `Mensagem`, `Triagem` (Fase 1)
- Assinatura pública do `RepositorioEmMemoria`

---

## 8. Requisitos Não Funcionais (conforme Canvas, aplicáveis ao Pacote 1)

| #    | Requisito            | Critério (Canvas)                           | Verificação no Pacote 1                                                                                               |
| ---- | -------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| RNF1 | Concorrência        | ≥ 5 conversas simultâneas sem degradação | Teste de 5 sessões paralelas em memória (Fase 5)                                                                      |
| RNF2 | LGPD                 | Conformidade total no tratamento de dados    | Seção 9; sem dados pessoais em logs                                                                                   |
| RNF3 | Disponibilidade 24/7 | Operar 24h/7d, inclusive feriados            | A lógica não pode assumir restrição de horário; disponibilidade real é verificável só em produção (Pacote 2+) |

---

## 9. Conformidade com a LGPD

- Tratar apenas os dados estritamente necessários à triagem (minimização).
- Não registrar dados pessoais de pacientes em logs em texto claro.
- Como nada é persistido em disco no Pacote 1, não há base de dados de pacientes a proteger nesta fase; o estado em memória é descartado ao fim da execução.
- Política de retenção, consentimento e finalidade a alinhar com a **equipe de Gestão e Fluxo do projeto** / cliente (relevante a partir do Pacote 2, quando houver persistência).

---

## 10. Dependências e Riscos

### 10.1 Dependências externas

| Dependência                            | Responsável                         | Bloqueia                                                  |
| --------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| Conteúdo de FAQs (perguntas/respostas) | Equipe de Gestão e Fluxo do projeto | Conteúdo final da Fase 3 (lógica pode usar provisório) |
| Lista de campos clínicos da triagem    | Equipe de Gestão e Fluxo do projeto | Conteúdo final da Fase 4 (estrutura é parametrizável)  |
| Feedback da diretoria nas revisões     | Cliente                              | Cronograma (prazo de 5 dias úteis)                       |

> Tratar a integração com a API oficial como Pacote 2 remove o risco nº1 do Canvas (atraso na liberação da conta) do caminho crítico do Pacote 1.

### 10.2 Riscos do Pacote 1

| Risco                                                             | Mitigação                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Conteúdo da**equipe de Gestão e Fluxo do projeto** atrasa | Fases 3-4 usam conteúdo provisório; só o JSON/config muda depois, sem refatoração            |
| Estado em memória se perde ao reiniciar                          | Aceito por escopo (prototipação); para a demo, manter o processo ativo durante a apresentação |
| Acoplamento acidental ao simulador                                | Bloco NÃO ALTERAR sobre `IChatChannel`; CA de desacoplamento na Fase 5                         |
| Agente de IA expandir escopo além das fases                      | Seção 4.2 (não-objetivos) e blocos NÃO ALTERAR em cada fase                                   |

---

## 11. Glossário

| Termo                | Definição                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| Prototipação       | Módulos de lógica demonstráveis localmente, sem produção no canal real      |
| Estado em memória   | Dados da conversa mantidos apenas durante a execução; não gravados em disco   |
| Triagem              | Recolha de informações clínicas básicas + classificação do tipo de demanda |
| Tipo de demanda      | Classificação do paciente: novo, retorno, dúvida ou urgência                 |
| Escalada             | Transferência do atendimento do chatbot para um assistente humano               |
| Canal (IChatChannel) | Camada de E/S de mensagens; simulador no Pacote 1, API oficial no Pacote 2       |
| Fase                 | Unidade de trabalho ordenada por dependência, com saída verificável           |
| NÃO ALTERAR         | Contratos estáveis que fases posteriores não podem modificar silenciosamente   |
| G&F                  | Equipe de Gestão & Fluxo (processos, scripts, templates, protocolos)            |

---

*Documento alinhado ao Project Model Canvas (sem persistência no Pacote 1, conforme leitura estrita) e às práticas de especificação para desenvolvimento assistido por IA (spec-driven, faseado por dependência, critérios verificáveis, protection patterns) — PhysioVilas · Pacote 1 · Prazo 10/06/2026. Banco de dados pertence ao Pacote 3; integração com API oficial ao Pacote 2.*
