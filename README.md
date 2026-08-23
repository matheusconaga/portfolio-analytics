<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/Lang-English-blue?style=for-the-badge" alt="English"></a>
  <a href="README.pt.md"><img src="https://img.shields.io/badge/Lang-Português-green?style=for-the-badge" alt="Português"></a>
</p>

<h1 align="center">📊 Portfolio Analytics</h1>

<p align="center">
Custom full-stack web analytics platform for tracking visitors, sessions, interactions and engagement across my portfolio.
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
    <img src="https://img.shields.io/badge/🌐%20Live%20Dashboard-000000?style=for-the-badge"/>
  </a>
</p>

## 📌 About the Project

**Portfolio Analytics** is a custom full-stack web analytics platform built to monitor how visitors interact with my professional portfolio.

Instead of relying entirely on third-party analytics solutions, the platform implements its own event tracking, visitor identification, session management, engagement metrics and interaction monitoring.

The system collects anonymized behavioral data and transforms it into dashboards, project rankings and session summaries.

It also integrates with **n8n and Telegram** to automatically generate notifications when portfolio sessions are completed.

The public dashboard included in this repository exposes only aggregated and anonymized information, allowing recruiters and developers to explore the project without exposing private analytics data.

## ✅ Features

- Unique visitor tracking
- Session tracking
- Page view monitoring
- Portfolio section tracking
- GitHub repository click tracking
- Project demo click tracking
- Resume download tracking
- LinkedIn interaction tracking
- WhatsApp interaction tracking
- E-mail interaction tracking
- Session activity heartbeat
- Returning visitor identification
- Engagement metrics
- Project ranking
- Timeline analytics
- Public anonymized analytics dashboard
- Private analytics endpoints
- PostgreSQL persistence
- n8n webhook integration
- Telegram session notifications
- Render cold-start handling
- Responsive dashboard for desktop, tablet and mobile

## 🧱 System Architecture

```text
Portfolio Visitor
       ↓
React Portfolio
       ↓
Analytics Events
       ↓
Node.js / Express API
       ↓
Prisma
       ↓
PostgreSQL
       ↓
Analytics Aggregation
       ├──────────────→ Private Dashboard
       │
       ├──────────────→ Public Dashboard
       │
       └──────────────→ n8n Webhook
                              ↓
                          Telegram
```

## 📡 Analytics Flow

When a visitor accesses the portfolio, the frontend creates or restores a visitor identifier and starts an analytics session.

```text
Visitor opens portfolio
        ↓
Visitor ID
        ↓
Session created
        ↓
Page / section events
        ↓
Interaction events
        ↓
Activity heartbeat
        ↓
Session summary
        ↓
Analytics database
```

Visitor identifiers are stored locally in the browser while session information is associated with the current browsing session.

This allows the system to distinguish between:

- new visitors
- returning visitors
- individual browsing sessions

without requiring user accounts.

## 🖱 Tracked Events

The analytics system currently tracks events such as:

| Event | Description |
|---|---|
| `page_view` | Portfolio page visualization |
| `section_view` | Portfolio section visualization |
| `github_click` | Project GitHub repository access |
| `github_profile_click` | GitHub profile access |
| `demo_click` | Project live demo access |
| `resume_download` | Resume download |
| `linkedin_click` | LinkedIn profile access |
| `whatsapp_click` | WhatsApp contact interaction |
| `email_click` | E-mail interaction |
| `contact_click` | Contact section interaction |

## 📊 Public Analytics API

The project exposes a limited public analytics API used by the showcase dashboard.

These endpoints only return aggregated and anonymized information.

```text
GET /api/public/analytics/stats
GET /api/public/analytics/timeline
GET /api/public/analytics/projects
```

Supported periods:

```text
today
7d
30d
all
```

Example:

```http
GET /api/public/analytics/stats?period=7d
```

Response:

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

## 🔒 Public vs Private Analytics

The system separates public analytics from private monitoring.

### Public Dashboard

The public dashboard exposes metrics such as:

- visitors
- sessions
- page views
- project views
- interaction totals
- project rankings
- timeline data
- resume downloads
- GitHub interactions

### Private Analytics

Private endpoints can provide more detailed information such as:

- visitor behavior
- engagement
- traffic sources
- devices
- browsers
- access hours
- session activity
- conversion funnel
- detailed interactions

Private analytics endpoints require authentication.

## 📈 Public Dashboard

The repository includes a responsive React dashboard that consumes the public analytics API.

Main sections:

```text
Overview
   ↓
Analytics Timeline
   ↓
Project Ranking
   ↓
Interactions
   ↓
Technology Stack
```

The interface was designed to work across:

- desktop
- tablets
- mobile devices

The dashboard displays real anonymized data collected from the production portfolio.

## 🔔 n8n + Telegram Automation

Portfolio Analytics integrates with **n8n** through webhooks.

The automation generates session summaries containing information such as:

```text
New portfolio visit

Returning visitor

Source: Direct
Device: Desktop
Browser: Chrome

Viewed:
• Home
• Projects
• Technologies
• Experience
• Contact

Interactions:
• Clicked GitHub — DocFlow AI
• Opened demo — Asset Management
• Clicked WhatsApp
• Downloaded resume

Time on site: 1min 29s
```

Automation flow:

```text
Portfolio Session
       ↓
Analytics API
       ↓
Session Summary
       ↓
Webhook
       ↓
n8n
       ↓
Telegram Bot
```

## ⚡ Render Cold Start Handling

The backend and the n8n service are deployed independently.

Because free Render services may become inactive after periods without traffic, the frontend includes a service initialization strategy.

```text
Dashboard opened
       ↓
       ├────────────→ Analytics API health check
       │
       └────────────→ n8n warmup webhook
```

Both services begin initialization in parallel.

The dashboard waits only for the Analytics API before requesting real data, while n8n continues warming up independently.

This prevents the dashboard from being blocked by the automation service.

## 🗄 Database Model

The core analytics structure uses three entities:

```text
Visitor
   ↓
Session
   ↓
Event
```

### Visitor

Represents a unique browser visitor.

### Session

Represents a browsing session and stores:

- visitor reference
- start time
- last activity
- referrer
- user agent

### Event

Represents individual analytics events and stores:

- session reference
- event type
- page
- project slug
- metadata
- timestamp

## 💻 Running Locally

### Clone repository

```bash
git clone https://github.com/matheusconaga/portfolio-analytics.git

cd portfolio-analytics
```

### Install backend dependencies

```bash
npm install
```

### Configure backend environment

Create a `.env` file:

```env
DATABASE_URL=

JWT_SECRET=
ADMIN_PASSWORD_HASH=

FRONTEND_URL=http://localhost:5173
PUBLIC_ANALYTICS_URL=http://localhost:5173

N8N_VISIT_WEBHOOK_URL=
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run migrations

```bash
npx prisma migrate dev
```

### Start backend

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## 🖥 Running the Public Dashboard

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

```env
VITE_API_URL=http://localhost:3000

VITE_N8N_WARMUP_URL=
```

Run:

```bash
npm run dev
```

Dashboard:

```text
http://localhost:5173
```

## 🌐 Production

The project uses separate Render services while remaining inside the same GitHub repository.

```text
portfolio-analytics repository
        │
        ├── Backend
        │     └── Render Web Service
        │
        └── frontend/
              └── Render Static Site
```

Production database:

```text
PostgreSQL / Neon
```

Automation:

```text
n8n
 ↓
Telegram Bot
```

## 🛡 Privacy

The public dashboard was designed to expose only aggregated and anonymized analytics.

Information such as the following is not exposed through the public API:

- visitor IDs
- session IDs
- complete user agents
- raw referrers
- authentication data
- internal session metadata

The public interface focuses exclusively on metrics useful for demonstrating the analytics system.

## 📄 License

Copyright © 2026 Matheus Lula.

All rights reserved.

This project is available for portfolio and educational purposes only.

Unauthorized commercial use, distribution, or reproduction is prohibited.

## 👨‍💻 Author

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
<a href="https://portifoliomatheuslula.onrender.com/"><img src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=render&logoColor=white"/></a>
</div>