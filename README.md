<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=1e3a8a&height=250&section=header&text=ExcelDraw&fontSize=70&fontAlignY=35&fontColor=ffffff&desc=Collaborative%20Whiteboard&descAlignY=55&descAlign=50" />
</p>

<div align="center">
  <p align="center">
    <a href="https://excel-draw-excel-front.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-View_App_Now-1e3a8a?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" />
  </p>
  
  <h2>✨ Instantly craft collaborative diagrams on the web ✨</h2>
  <p>Draw at the speed of thought with an infinite, zooming workspace built for teams.</p>
</div>

<br/>

<div align="center">
  <a href="https://excel-draw-excel-front.vercel.app/">
    <!-- NOTE: The image won't show until you place 'landing.png' inside the 'docs' folder and commit it! -->
    <img src="./docs/landing.png" alt="ExcelDraw Dashboard Interface" width="90%" style="border-radius: 16px; border: 2px solid #2d3748; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
  </a>
</div>

<br/>

<table align="center" border="0" width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🚀 Key Features</h3>
      <ul>
        <li>♾️ <b>Infinite Canvas:</b> A seamless workspace where your ideas can blossom without boundaries.</li>
        <li>⚡ <b>Real-Time Sync:</b> Custom WebSocket implementation for instant multi-user collaboration.</li>
        <li>🎨 <b>Cinematic UI:</b> Glassmorphism, deep dark-mode, and fluid Framer Motion animations.</li>
        <li>🔒 <b>Team Workspaces:</b> Create secure rooms, share links, and draw together.</li>
        <li>📦 <b>Monorepo Power:</b> Engineered with Turborepo for massive scalability.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">🛠️ Tech Architecture</h3>
      <ul>
        <li><b>Frontend:</b> Next.js 15, React 18, Tailwind, Radix UI</li>
        <li><b>State & Motion:</b> Zustand, Framer Motion</li>
        <li><b>Backend API:</b> Node.js, Express</li>
        <li><b>Real-time Engine:</b> WebSockets Server</li>
        <li><b>Data Layer:</b> Prisma ORM, PostgreSQL</li>
      </ul>
    </td>
  </tr>
</table>

<br/>

## 🌌 The Ecosystem

> *ExcelDraw is structured as a modern monorepo, separating frontend, backend, and real-time concerns into a highly optimized workspace.*

<div align="left">
<pre>
ExcelDraw/
├── <b>apps/</b>
│   ├── excel_front   <i>— Next.js App Router (The Canvas UI)</i>
│   ├── http-backend  <i>— Express REST API (Auth & Rooms)</i>
│   └── websockets    <i>— Realtime Server (State Synchronization)</i>
└── <b>packages/</b>
    ├── ui            <i>— Radix & Tailwind shared components</i>
    ├── database      <i>— Prisma schema & PostgreSQL connection</i>
    └── common        <i>— Zod schemas & shared types</i>
</pre>
</div>

<br/>

## 🏎️ Ignition

Follow these steps to spin up the entire ecosystem on your local machine.

```bash
# 1. Clone the repository
git clone https://github.com/sanyamhbtu/ExcelDraw.git

# 2. Install dependencies via pnpm (vital for monorepos)
pnpm install

# 3. Setup environment and push the database schema
cp .env.example .env
cd packages/database && pnpm prisma db push

# 4. Ignite all packages and apps simultaneously
pnpm dev
```

<br/>

<p align="center">
  <a href="https://excel-draw-excel-front.vercel.app/">
    <img src="https://img.shields.io/badge/Launch_Application-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=1e3a8a&height=100&section=footer" />
</p>
