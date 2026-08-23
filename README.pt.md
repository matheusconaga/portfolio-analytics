<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/Lang-English-blue?style=for-the-badge" alt="English"></a>
  <a href="README.pt.md"><img src="https://img.shields.io/badge/Lang-Português-green?style=for-the-badge" alt="Português"></a>
</p>

<h1 align="center">📊 Portfolio Analytics</h1>

<p align="center">
Plataforma fullstack própria de web analytics para monitoramento de visitantes, sessões, interações e engajamento no meu portfólio.
</p>

<p align="center">
  <img src="https://github.com/matheusconaga/portfolio-analytics/blob/main/assets/analytics.png?raw=true" width="800"/>
</p>

<p align="center">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
<img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge"/>
<img src="https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white"/>
<img src="https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white"/>

</p>

<p align="center">
  <a href="https://analytics-portfolio-s8pd.onrender.com/" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20Dashboard%20Online-000000?style=for-the-badge"/>
  </a>
</p>

## 📌 Sobre o Projeto

O **Portfolio Analytics** é uma plataforma fullstack própria de web analytics desenvolvida para monitorar como os visitantes interagem com meu portfólio profissional.

Em vez de depender exclusivamente de soluções de analytics de terceiros, o projeto implementa seu próprio sistema de rastreamento de eventos, identificação de visitantes, gerenciamento de sessões, métricas de engajamento e monitoramento de interações.

Os dados comportamentais coletados são anonimizados e transformados em dashboards, rankings de projetos e resumos de sessão.

O sistema também possui integração com **n8n e Telegram**, permitindo a geração automática de notificações quando uma sessão do portfólio é concluída.

O dashboard público disponível neste repositório apresenta apenas dados agregados e anonimizados, permitindo que recrutadores e desenvolvedores explorem o projeto sem acesso às informações privadas do analytics.

## ✅ Funcionalidades

- Rastreamento de visitantes únicos
- Rastreamento de sessões
- Monitoramento de page views
- Rastreamento de seções do portfólio
- Cliques em repositórios do GitHub
- Cliques em demonstrações dos projetos
- Downloads de currículo
- Cliques no LinkedIn
- Interações com WhatsApp
- Interações por e-mail
- Heartbeat de atividade da sessão
- Identificação de visitantes recorrentes
- Métricas de engajamento
- Ranking de projetos
- Timeline de acessos
- Dashboard público anonimizado
- Analytics privado autenticado
- Persistência em PostgreSQL
- Integração via webhook com n8n
- Notificações via Telegram
- Tratamento de cold start no Render
- Dashboard responsivo para desktop, tablet e mobile

## 🧱 Arquitetura do Sistema

```text
Visitante
    ↓
Portfólio React
    ↓
Eventos de Analytics
    ↓
API Node.js / Express
    ↓
Prisma
    ↓
PostgreSQL
    ↓
Agregação de Métricas
    ├──────────────→ Dashboard Privado
    │
    ├──────────────→ Dashboard Público
    │
    └──────────────→ Webhook n8n
                           ↓
                       Telegram
```

## 📡 Fluxo do Analytics

Quando um visitante acessa o portfólio, o frontend cria ou restaura um identificador de visitante e inicia uma nova sessão de analytics.

```text
Visitante acessa o portfólio
        ↓
Visitor ID
        ↓
Sessão criada
        ↓
Eventos de página / seção
        ↓
Eventos de interação
        ↓
Heartbeat de atividade
        ↓
Resumo da sessão
        ↓
Banco de Analytics
```

O identificador do visitante é armazenado localmente no navegador enquanto a sessão é associada à navegação atual.

Isso permite distinguir:

- novos visitantes
- visitantes recorrentes
- sessões individuais

sem exigir criação de conta.

## 🖱 Eventos Rastreados

O sistema atualmente monitora eventos como:

| Evento | Descrição |
|---|---|
| `page_view` | Visualização do portfólio |
| `section_view` | Visualização de uma seção |
| `github_click` | Acesso ao GitHub de um projeto |
| `github_profile_click` | Acesso ao perfil do GitHub |
| `demo_click` | Acesso à demonstração de um projeto |
| `resume_download` | Download do currículo |
| `linkedin_click` | Acesso ao LinkedIn |
| `whatsapp_click` | Interação com WhatsApp |
| `email_click` | Interação por e-mail |
| `contact_click` | Interação com a seção de contato |

## 📊 API Pública de Analytics

O projeto disponibiliza uma API pública limitada utilizada pelo dashboard de demonstração.

Esses endpoints retornam apenas informações agregadas e anonimizadas.

```text
GET /api/public/analytics/stats
GET /api/public/analytics/timeline
GET /api/public/analytics/projects
```

Períodos disponíveis:

```text
today
7d
30d
all
```

Exemplo:

```http
GET /api/public/analytics/stats?period=7d
```

Resposta:

```json
{
  "period": "7d",
  "overview": {
    "visitors": 21,
    "sessions": 36,
    "pageViews": 38,
    "projectViews": 8
  },
  "interactions": {
    "total": 7,
    "githubClicks": 3,
    "demoClicks": 1,
    "linkedinClicks": 1,
    "whatsappClicks": 1,
    "emailClicks": 0,
    "resumeDownloads": 1
  }
}
```

## 🔒 Analytics Público vs Privado

O sistema separa as métricas públicas dos dados utilizados para monitoramento interno.

### Dashboard Público

O dashboard público apresenta métricas como:

- visitantes
- sessões
- page views
- visualizações de projetos
- quantidade de interações
- ranking de projetos
- timeline de acessos
- downloads de currículo
- interações com GitHub

### Analytics Privado

Os endpoints privados podem fornecer informações mais detalhadas sobre:

- comportamento dos visitantes
- engajamento
- fontes de tráfego
- dispositivos
- navegadores
- horários de acesso
- atividade de sessão
- funil de conversão
- interações detalhadas

Os endpoints privados exigem autenticação.

## 📈 Dashboard Público

O repositório inclui um dashboard React responsivo que consome a API pública do projeto.

Principais áreas:

```text
Visão Geral
    ↓
Timeline
    ↓
Ranking de Projetos
    ↓
Interações
    ↓
Stack Tecnológica
```

A interface foi desenvolvida para funcionar em:

- desktop
- tablets
- dispositivos móveis

Os dados apresentados são reais e anonimizados, coletados diretamente do portfólio em produção.

## 🔔 Automação com n8n + Telegram

O Portfolio Analytics possui integração com **n8n** por meio de webhooks.

A automação gera resumos das sessões contendo informações como:

```text
Alguém visitou seu portfólio!

Visitante recorrente

Origem: Acesso direto
Dispositivo: Desktop
Navegador: Chrome

Visualizou:
• Home
• Projetos
• Tecnologias
• Experiência
• Contato

Interações:
• Clicou no GitHub — DocFlow AI
• Abriu a demonstração — Gestão Patrimonial
• Clicou no WhatsApp
• Baixou seu currículo

Tempo no site: 1min 29s
```

Fluxo da automação:

```text
Sessão do Portfólio
       ↓
Analytics API
       ↓
Resumo da Sessão
       ↓
Webhook
       ↓
n8n
       ↓
Telegram Bot
```

## ⚡ Tratamento de Cold Start no Render

O backend e o serviço do n8n são implantados separadamente.

Como serviços gratuitos do Render podem ficar inativos após períodos sem tráfego, o frontend possui uma estratégia de inicialização dos serviços.

```text
Dashboard acessado
       ↓
       ├────────────→ Health check da Analytics API
       │
       └────────────→ Webhook de warmup do n8n
```

Os dois serviços começam a inicialização em paralelo.

O dashboard aguarda apenas a API de Analytics ficar disponível antes de solicitar os dados reais, enquanto o n8n continua sua inicialização independentemente.

Dessa forma, o carregamento da interface não depende do serviço de automação.

## 🗄 Modelo de Dados

A estrutura principal do analytics utiliza três entidades:

```text
Visitor
   ↓
Session
   ↓
Event
```

### Visitor

Representa um visitante único identificado pelo navegador.

### Session

Representa uma sessão de navegação e armazena:

- referência do visitante
- horário de início
- última atividade
- referrer
- user agent

### Event

Representa cada evento registrado e armazena:

- referência da sessão
- tipo do evento
- página
- slug do projeto
- metadata
- timestamp

## 💻 Executando Localmente

### Clonar o repositório

```bash
git clone https://github.com/matheusconaga/portfolio-analytics.git

cd portfolio-analytics
```

### Instalar dependências do backend

```bash
npm install
```

### Configurar ambiente do backend

Criar:

```text
.env
```

```env
DATABASE_URL=

JWT_SECRET=
ADMIN_PASSWORD_HASH=

FRONTEND_URL=http://localhost:5173
PUBLIC_ANALYTICS_URL=http://localhost:5173

N8N_VISIT_WEBHOOK_URL=
```

### Gerar Prisma Client

```bash
npx prisma generate
```

### Executar migrations

```bash
npx prisma migrate dev
```

### Executar backend

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## 🖥 Executando o Dashboard Público

Em outro terminal:

```bash
cd frontend
```

Instalar dependências:

```bash
npm install
```

Criar:

```text
frontend/.env
```

```env
VITE_API_URL=http://localhost:3000

VITE_N8N_WARMUP_URL=
```

Executar:

```bash
npm run dev
```

Dashboard:

```text
http://localhost:5173
```

## 🌐 Produção

O projeto utiliza serviços separados no Render, mantendo backend e frontend dentro do mesmo repositório GitHub.

```text
portfolio-analytics
        │
        ├── Backend
        │     └── Render Web Service
        │
        └── frontend/
              └── Render Static Site
```

Banco de produção:

```text
PostgreSQL / Neon
```

Automação:

```text
n8n
 ↓
Telegram Bot
```

## 🛡 Privacidade

O dashboard público foi desenvolvido para apresentar apenas dados agregados e anonimizados.

Informações como as seguintes não são disponibilizadas pela API pública:

- IDs de visitantes
- IDs de sessão
- user agents completos
- referrers brutos
- dados de autenticação
- metadados internos das sessões

A interface pública é focada exclusivamente nas métricas necessárias para demonstrar o funcionamento do sistema.

## 📄 Licença

Copyright © 2026 Matheus Lula.

Todos os direitos reservados.

Este projeto está disponível apenas para fins de portfólio e educacionais.

O uso comercial, distribuição ou reprodução não autorizada é proibido.

## 👨‍💻 Autor

<p align="center">
  <img src="https://avatars.githubusercontent.com/matheusconaga" width="110px;" style="border-radius:50%;" />
</p>

<h3 align="center">Matheus Lula</h3>

<p align="center">
Full-Stack Developer • React • Flutter • FastAPI • AI & Automation
</p>

<div align="center">
<a href="mailto:matheusphillip170@gmail.com"><img src="https://img.shields.io/badge/Gmail-FF0000?style=for-the-badge&logo=gmail&logoColor=white"/></a>
<a href="https://www.linkedin.com/in/matheusconaga/"><img src="https://img.shields.io/badge/💼%20LinkedIn-0e76a8?style=for-the-badge&logo=linkedin"/></a>
<a href="https://portifoliomatheuslula.onrender.com/"><img src="https://img.shields.io/badge/Portfólio-000000?style=for-the-badge&logo=render&logoColor=white"/></a>
</div>