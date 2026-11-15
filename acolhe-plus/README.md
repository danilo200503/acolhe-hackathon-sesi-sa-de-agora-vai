<div align="center">

# Acolhe+

**O futuro começa pelo cuidado.**

Plataforma de engajamento do trabalhador da indústria na Atenção Primária à Saúde (APS) do programa **SESI Saúde Acolhe**.

![React](https://img.shields.io/badge/React-18.3-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/status-protótipo%20funcional-0E7A55)

Equipe **Nexus** · Hackathon SESI Saúde · Novembro de 2026

</div>

---

## Sumário

1. [Contexto e problema](#1-contexto-e-problema)
2. [A solução](#2-a-solução)
3. [Perfis e funcionalidades](#3-perfis-e-funcionalidades)
4. [Arquitetura](#4-arquitetura)
5. [Stack tecnológica](#5-stack-tecnológica)
6. [Estrutura do projeto](#6-estrutura-do-projeto)
7. [Regras de negócio](#7-regras-de-negócio)
8. [Privacidade e LGPD](#8-privacidade-e-lgpd)
9. [Acessibilidade](#9-acessibilidade)
10. [Prevenção de erros e experiência de uso](#10-prevenção-de-erros-e-experiência-de-uso)
11. [Como executar](#11-como-executar)
12. [Deploy na Vercel](#12-deploy-na-vercel)
13. [O que é real, simulado e futuro](#13-o-que-é-real-simulado-e-futuro)
14. [Qualidade e verificações](#14-qualidade-e-verificações)
15. [Roadmap](#15-roadmap)
16. [Aviso](#16-aviso)

---

## 1. Contexto e problema

O SESI Saúde Acolhe oferece Atenção Primária à Saúde para trabalhadores da indústria, mas **cerca de 50% dos pacientes abandonam o acompanhamento**. As principais barreiras levantadas no desafio são:

- **Liberação do trabalho:** o trabalhador depende do líder para sair da linha de produção.
- **Horário e deslocamento:** uma consulta presencial pode tirar de 3 a 4 horas do turno.
- **Falta de propósito:** o cuidado é percebido como obrigação ou como "coisa de doente".
- **Falta de visibilidade:** a equipe de saúde não sabe *por que* o paciente faltou e reage tarde.

## 2. A solução

O Acolhe+ conecta **quatro públicos** em torno do mesmo plano de cuidado, atacando cada barreira:

| Barreira | Como o Acolhe+ responde |
|---|---|
| Liberação do trabalho | **Janela de disponibilidade** definida pela empresa por colaborador; o agendamento só oferece horários já liberados. O líder recebe apenas um *Passe Saúde* (horário, sem motivo). |
| Horário e deslocamento | Consultas **por vídeo na sala de saúde da empresa** (cerca de 30 min) e convites para **Google Agenda e Teams/Outlook**. |
| Falta de propósito | O trabalhador define um **objetivo de vida** ("Viajar e curtir com meus filhos") e acompanha **quanto falta** em metas mensuráveis. |
| Falta de visibilidade | Botão **"Não consegue ir agora?"**: o motivo chega à enfermagem, que vê uma **fila priorizada por risco de abandono**, com fatores explicáveis. |

## 3. Perfis e funcionalidades

**Não há login.** A tela inicial tem o botão **Iniciar**, que entra como colaborador(a), e atalhos para os outros perfis. Dentro do app, dá para alternar entre os quatro perfis pelo seletor **"Visualização"** no topo.

### Colaborador(a)
- **Início:** objetivo pessoal com progresso, próximo compromisso, trilha de cuidado e as tarefas pendentes.
- **Meu objetivo:** objetivo escrito livremente ou escolhido entre sugestões; metas editáveis (início, atual e alvo, com a opção "quanto menor, melhor").
- **Minha agenda:** próximos atendimentos e histórico, calendário, remarcação, cancelamento com *Desfazer*, agendamento em 4 passos e exportação para Google Agenda, Teams/Outlook ou `.ics`.
- **Minha saúde:** nível de cuidado, plano, medicamentos e alergias, evolução da pressão, além da aba **Documentos e exames** (resumos de consulta e atestados em PDF; envio de resultado de exame em PDF ou imagem de até 10 MB).
- **Meus dependentes:** vacinas, consultas e agendamento para filhos. Dependentes adultos dependem de autorização (LGPD).
- **Minha comunidade:** mural moderado, grupos e desafio entre equipes.
- **Minuto Saúde:** notícias, a página "O que o SESI faz" e o catálogo de serviços.
- **Conquistas, Privacidade** (consentimentos granulares) e **Ajuda** (simulação do atendimento por WhatsApp).
- **Modo simplificado automático** para pessoas com 60 anos ou mais.

### Enfermagem
- **Fila de cuidado** ordenada por risco de abandono, com os fatores do cálculo visíveis.
- **Novidades** enviadas pelos pacientes: barreiras relatadas e exames enviados.
- **Prontuário** com as abas Resumo, Anotações, Plano, Consultas, Exames e Atestados.
  - Anotações tipadas: Evolução, Observação, Contato e Alerta.
  - Registro de consulta com geração de PDF.
  - Emissão de atestado. O CID só é impresso com autorização do paciente.
  - Registro de condição crônica, que fixa o nível de cuidado.
- **Agenda e marcações** por dia, com nova marcação, presença e falta, e checagem de conflito de profissional e horário.

### Empresa / RH
- **Painel agregado**, sem nenhum dado clínico: participação, comparecimento, horas de produção preservadas e impacto estimado.
- **Colaboradores:** edição da **janela de disponibilidade** em grade semanal, com atalhos prontos e limite de atendimentos por semana.
- **Agenda da equipe:** Passes Saúde com exportação para Teams/Outlook e Google Agenda. O convite diz apenas "Compromisso de saúde".

### Instituto SESI
- **Indicadores** por período e unidade: vidas atendidas, adesão, comparecimento, atendimentos realizados e motivos de falta.
- **Gestão do Minuto Saúde:** publicação e remoção de serviços e notícias, refletidas na hora para os trabalhadores.

## 4. Arquitetura

```
┌──────────────────────────── Navegador ────────────────────────────┐
│                                                                    │
│  App (Shell, navegação por perfil)                                 │
│   ├── pages/*         telas por perfil                             │
│   ├── ui.tsx          Modal, ConfirmDialog, Toast, DocView, Logo   │
│   ├── cal.tsx         Google Agenda · Outlook/Teams · .ics         │
│   ├── valid.ts        CPF (dígitos verificadores) · datas          │
│   └── A11yPanel.tsx   preferências de acessibilidade               │
│                │                                                   │
│                ▼                                                   │
│  store.tsx  (React Context: estado global + ações de domínio)      │
│                │                                                   │
│                ▼                                                   │
│  data.ts   (tipos, dados semente fictícios, regras de cálculo)     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                 │  opcional: GET /api/health (ApiStatus.tsx)
                 ▼
     API Java 21 · Spring Boot 3 · PostgreSQL   ← integração futura
```

**Decisões de projeto**

- **Front-end autônomo.** O protótipo roda inteiro no navegador, com dados semente, o que garante uma demonstração estável e sem dependência de rede. A camada de dados fica isolada em `data.ts` e as ações em `store.tsx`, para que a troca pelo consumo da API seja local.
- **Estado com React Context**, sem biblioteca externa. As ações de domínio (`agendar`, `addNota`, `relatarBarreira` etc.) centralizam efeitos colaterais e devolvem funções de *desfazer* quando faz sentido.
- **Build em arquivo único.** Com `vite-plugin-singlefile`, o `dist/index.html` contém o app inteiro (JS, CSS e logo), o que permite abrir o protótipo mesmo sem internet.
- **Poucas dependências de execução:** só `react`, `react-dom` e `lucide-react` (ícones).

## 5. Stack tecnológica

| Camada | Tecnologia | Uso |
|---|---|---|
| UI | **React 18.3** | Componentes funcionais e hooks |
| Linguagem | **TypeScript 5.6** | Tipagem do domínio (`Evento`, `Paciente`, `Meta`, `Documento`…) |
| Build | **Vite 6** + `@vitejs/plugin-react` | Servidor de desenvolvimento e build de produção |
| Empacotamento | `vite-plugin-singlefile` | Gera um HTML único e portátil |
| Ícones | `lucide-react` | Ícones SVG acessíveis (`aria-hidden`) |
| Estilo | CSS próprio (design system) | Variáveis, Grid e Flexbox, *media queries*, CSS de impressão |
| Tipografia | Lexend | Fonte projetada para legibilidade |
| APIs do navegador | Web Speech API · Blob/File · `window.print` · `localStorage` | Leitura em voz alta · envio de exames · PDF · preferências de acessibilidade |
| Hospedagem | Vercel | Deploy contínuo a partir do GitHub |
| Back-end (futuro) | Java 21 · Spring Boot 3.4 · PostgreSQL · Docker | API REST já modelada no projeto completo |

## 6. Estrutura do projeto

```
acolhe-plus-frontend/
├── index.html              ponto de entrada (meta viewport, fonte)
├── vite.config.ts          React + build em arquivo único
├── vercel.json             configuração de deploy
├── package.json
└── src/
    ├── main.tsx            bootstrap do React
    ├── App.tsx             shell, menus por perfil, roteamento por estado
    ├── store.tsx           contexto global: estado, ações, toast, confirmação
    ├── data.ts             tipos, dados fictícios, score de risco, metas
    ├── ui.tsx              componentes reutilizáveis (Modal, ConfirmDialog, Toast, DocView…)
    ├── cal.tsx             links de calendário e geração de .ics
    ├── valid.ts            validação de CPF e data (pronta para o login real; hoje sem uso)
    ├── A11yPanel.tsx       painel de acessibilidade
    ├── ApiStatus.tsx       indicador de conexão com a API (opcional)
    ├── styles.css          design system e responsividade
    ├── assets/acolhe-logo.png
    └── pages/
        ├── Login.tsx       tela inicial (Iniciar), termos e LGPD
        ├── ColabInicio.tsx início, objetivo, "Não consegue ir agora?"
        ├── ColabAgenda.tsx agenda, agendamento, edição de objetivo e metas
        ├── ColabSaude.tsx  minha saúde, documentos e exames
        ├── ColabRede.tsx   dependentes, comunidade, Minuto Saúde
        ├── ColabMais.tsx   conquistas, privacidade, ajuda, sobre o protótipo
        ├── Enfermagem.tsx  fila, prontuário, anotações, marcações
        └── Empresa.tsx     painel, janela de disponibilidade, agenda, Instituto
```

## 7. Regras de negócio

### Nível de cuidado
| Nível | Nome | Retorno |
|---|---|---|
| 1 | Saúde em dia | a cada 6 meses |
| 2 | Acompanhar | a cada 6 meses |
| 3 | Cuidado próximo | a cada 3 meses |
| 4 | Atenção prioritária | combinado com a equipe |

> **Condição crônica ⇒ nível fixo 3.** Quando a enfermagem registra uma condição crônica (ex.: hipertensão), o nível deixa de ser editável. A evolução do paciente passa a ser acompanhada pelas **metas** e pelas **anotações**.

### Score de risco de abandono (fila da enfermagem)
É um cálculo **explicável**: cada fator aparece para a equipe com o seu peso. O resultado fica limitado entre 3 e 97.

| Fator | Peso |
|---|---|
| Retorno vencido | +15 a +35 (cresce com os dias de atraso) |
| Faltas nos últimos 6 meses | +12 por falta |
| Nenhuma missão em 14 dias / apenas 1 missão | +18 / +8 |
| Nível de cuidado 4 | +12 |
| Barreira relatada (inclui "Outro motivo" escrito pelo paciente) | +10 |
| Família participando | −10 |
| Missões em dia (3 ou mais) | −10 |

### Agendamento
- Só são oferecidos horários dentro da **janela de disponibilidade** da empresa.
- Exames e preventivos são **sempre presenciais**.
- O sistema bloqueia datas passadas, horários duplicados e clique duplo, e avisa quando já existe um atendimento do mesmo tipo marcado.
- Na enfermagem: não há atendimento aos domingos nem fora do horário de 7h às 19h, e o mesmo profissional não pode ter dois atendimentos no mesmo horário.

## 8. Privacidade e LGPD

- **Termos de uso e Política de Privacidade** disponíveis na tela inicial. Ao tocar em Iniciar, a pessoa é informada de que concorda com eles.
- **Minimização por perfil:**
  - a **empresa** vê apenas indicadores agregados e horários (Passe Saúde), **nunca** dados clínicos;
  - o **líder** vê "compromisso de saúde", sem tipo nem motivo;
  - as **anotações da enfermagem** são internas da equipe de saúde.
- **CID no atestado** só com autorização explícita do paciente.
- **Dependentes:** menores de 18 anos aparecem automaticamente; adultos precisam autorizar o compartilhamento.
- **Consentimentos granulares** podem ser revogados a qualquer momento na tela Privacidade.
- **Comunidade moderada:** bloqueia CPF, telefone e e-mail, termos ofensivos e exposição da saúde de terceiros.
- **Dados fictícios:** o protótipo não coleta nem envia dados pessoais.

## 9. Acessibilidade

Práticas baseadas nas diretrizes **WCAG 2.1**:

- Navegação completa por teclado, com **link "pular para o conteúdo"** e foco visível de alto contraste (`#FFB020`).
- **Diálogos acessíveis:**
  - `role="dialog"` ou `alertdialog`, com `aria-modal` e `aria-describedby`;
  - o foco fica preso dentro da janela e o `Esc` fecha somente a janela do topo;
  - ao fechar, o foco **volta ao elemento de origem**;
  - nas confirmações, o foco inicial fica na opção segura.
- **Mensagens anunciadas por leitor de tela:** sucesso em `role="status"` e erros em `role="alert"`; campos inválidos com `aria-invalid` e mensagem associada.
- **Painel de acessibilidade:**
  - tamanho do texto em 4 níveis, alto contraste e modo calmo (sem animações);
  - **leitura em voz alta** em pt-BR, com ajuste de velocidade;
  - interface simplificada (automática para 60 anos ou mais, ou manual).
- **Responsividade:** de 320 px a telas Full HD, com tabelas que viram cartões no celular e janelas que viram *bottom sheet*.

## 10. Prevenção de erros e experiência de uso

| Padrão | Onde é usado |
|---|---|
| **Confirmação com rótulos específicos** ("Cancelar agendamento" / "Manter agendamento") | Ações com consequência: cancelar, remover, descartar alterações, emitir atestado, registrar consulta, falta ou condição crônica, resgatar recompensa |
| **Desfazer** (aviso com botão de 8 s) | Agendar, cancelar, presença, falta, anotações, publicar ou remover conteúdo, salvar janela, permissões |
| **Sucesso direto, sem confirmação** | Ações simples e reversíveis, como salvar objetivo e metas |
| **Validação com orientação** | A mensagem explica como corrigir e **não apaga** o que foi preenchido |
| **Proteção contra envio duplicado** | Estados "Agendando…" e "Enviando…", com o botão desabilitado |
| **Entrada sem barreiras** | Um toque em **Iniciar**, sem cadastro, sem senha e sem dados pessoais |

## 11. Como executar

**Pré-requisito:** Node.js 20 ou superior (o arquivo `.node-version` indica 22).

```bash
npm install        # instala as dependências
npm run dev        # servidor local em http://localhost:5173
npm run build      # verificação de tipos + build de produção em dist/
npm run preview    # serve o build localmente
```

O `dist/index.html` é **autocontido**: pode ser aberto direto no navegador, sem servidor.

### Variável de ambiente (opcional)

| Variável | Exemplo | Efeito |
|---|---|---|
| `VITE_API_HOST` | `acolhe-api.onrender.com` | Ativa a verificação `GET /api/health` e mostra o status da API no rodapé |

Sem a variável, o app funciona em **modo demonstração** e o rodapé mostra "Modo demonstração (sem servidor)".

## 12. Deploy na Vercel

1. Envie o conteúdo desta pasta para um repositório no GitHub, com o `package.json` na raiz.
2. Na Vercel, abra **Add New → Project**, importe o repositório e clique em **Deploy**.
3. As configurações já vêm do `vercel.json`:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Cada *commit* na branch principal gera um novo deploy automaticamente.

> Se o site pedir login ao ser aberto, desative **Deployment Protection** em *Project → Settings*.

## 13. O que é real, simulado e futuro

O próprio app mostra essa separação no link **"O que é real e o que é simulado"**, no rodapé.

| Funciona no protótipo | Simulado | Integração futura |
|---|---|---|
| Agendamento com janela da empresa, remarcação e cancelamento | Sem login: "Iniciar" entra com uma usuária fictícia | API Spring Boot + PostgreSQL (já modelada) |
| Objetivo e metas com progresso calculado | Mensagens de WhatsApp, ligações e vouchers | Prontuário e agenda reais do SESI Saúde |
| Fila de risco explicável, prontuário, anotações e marcações | Autorização de dependentes adultos | WhatsApp Business oficial |
| PDFs de consulta e atestado (impressão do navegador) | Persistência: os dados voltam ao início ao recarregar | Libras com VLibras (gov.br) |
| Google Agenda, Teams/Outlook e `.ics` | | |
| Acessibilidade e responsividade | | Login com CPF e senha (validação de CPF já pronta em `valid.ts`) |

## 14. Qualidade e verificações

Verificações executadas durante o desenvolvimento, com navegador automatizado (Chromium via Playwright):

- **Fluxos de ponta a ponta:** 34 verificações, todas aprovadas, cobrindo:
  - tela inicial: entrada direta por "Iniciar" e pelos quatro perfis, termos acessíveis e "Sair" voltando ao início;
  - digitação contínua do objetivo com acentos, seleção e colagem, sem perda de foco;
  - confirmações, *Desfazer*, foco e teclado nos diálogos, e proteção contra clique duplo.
- **Responsividade:** as 17 telas sem rolagem horizontal em 320, 375, 414, 768, 1024 e 1280 px.
- **Proporção visual:** logo e ícones sem distorção de 1024 a 1920 px e com zoom de 100% a 200%.
- **Build:** `tsc -b` sem erros de tipo e instalação limpa (`npm ci`) validada.

> Os scripts de teste ficaram fora deste repositório. Não houve teste com leitores de tela reais (NVDA, TalkBack).

## 15. Roadmap

- [ ] Login real com CPF e senha (validação de CPF já implementada) e integração à API REST (agenda, prontuário).
- [ ] Persistência em PostgreSQL e trilha de auditoria de acesso a dados clínicos.
- [ ] Lembretes e conversas pelo WhatsApp Business.
- [ ] Integração com a agenda e o prontuário do SESI Saúde.
- [ ] Mensagens de erro junto ao campo em todos os formulários.
- [ ] Testes automatizados versionados no repositório e testes com leitores de tela.
- [ ] VLibras e auditoria formal de acessibilidade.

## 16. Aviso

Protótipo desenvolvido para o **Hackathon SESI Saúde**. Todos os nomes, empresas, números e dados de saúde são **fictícios**. **Não use dados reais de saúde nesta versão demonstrativa.** Os textos de Termos de uso e Política de Privacidade são modelos e dependem de revisão jurídica.

<div align="center">

**Equipe Nexus** · Acolhe+ · *O futuro começa pelo cuidado*

</div>
