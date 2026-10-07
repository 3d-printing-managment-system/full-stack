# 3D Printing Management System (Full Stack)

Monorepo for operating a **3D printer farm**: manage printers and G-code jobs, track filament inventory and profiles, reorder the print queue, stream device events over **MQTT**, and monitor maintenance — with a modern React dashboard and a TypeScript REST API backed by **PostgreSQL**.

## Features

### Operations
- Printer registry, status, tags, and event history
- Print job lifecycle, G-code upload, and command logging
- Drag-and-drop **print queue** with ordering APIs
- Filament **profiles**, parts catalog, and stock **inventory** adjustments
- Maintenance logs and failure-oriented backend module naming (`3D-Printing-Failure-Detection`)

### Integrations
- **MQTT** listener for live printer telemetry
- **Cloudinary** for media/assets (backend)
- **Swagger** API documentation at `/api-docs`
- Optional **Google APIs** (backend dependency for extended workflows)

### Frontend (`front/3dprinters_management_system`)
- React 19 + Vite, Tailwind 4, Mantine & shadcn-style UI
- Dashboard, printer detail (G-code console), files, materials, print queue
- 3D preview stack (**Three.js** / React Three Fiber) for model visualization

### Backend (`back/3D-Printing-Failure-Detection`)
- Express 5 + TypeScript, **Prisma** ORM, PostgreSQL
- REST resources under `/api/*` (printers, jobs, queue, inventory, tags, etc.)
- Vitest for automated tests

## Repository layout

```
full-stack/
├── front/3dprinters_management_system/   # React SPA
└── back/3D-Printing-Failure-Detection/ # API, Prisma, MQTT
```

## Prerequisites

- Node.js 20+
- PostgreSQL database
- MQTT broker (for live printer messages; configure via env)

## Backend setup

```bash
cd back/3D-Printing-Failure-Detection
npm install
cp .env.example .env   # create and fill DATABASE_URL, MQTT_BROKER_URL, etc.
npx prisma migrate dev
npm run dev            # development with tsx watch
# npm start            # production: migrate + tsx server.ts
```

API default: **http://localhost:3000**  
Swagger UI: **http://localhost:3000/api-docs**

## Frontend setup

```bash
cd front/3dprinters_management_system
npm install
npm run dev
```

Point the frontend API base URL to your backend (see Vite env / axios config in the project).

## Main API groups

| Prefix | Purpose |
|--------|---------|
| `/api/printers` | Printer CRUD and control |
| `/api/print-jobs` | Jobs and file handling |
| `/api/queue` | Queue ordering and state |
| `/api/inventory` | Filament / stock |
| `/api/filament-profiles` | Material presets |
| `/api/parts` | Part definitions |
| `/api/printer-events` | Telemetry / events |
| `/api/maintenance-logs` | Service history |

## Tests

```bash
cd back/3D-Printing-Failure-Detection
npm run test:run
```

## Team note

Full-stack capstone-style project for **3D printing lab management** — suitable for portfolio/CV as a DevOps-aware web + IoT system.

## License

ISC (per package metadata)
