# CertDesk

Certificate studio with bulk email delivery via SMTP. Upload a certificate background image (PNG/JPG/WebP/PDF), import recipients from Excel/CSV, drag data columns onto the canvas as positioned text fields, then download all certificates as a ZIP or email each one as an attachment.

## Structure

```
certdesk/
├── frontend/    # React + Vite + Tailwind (white enterprise theme)
└── backend/     # Express + Nodemailer SMTP relay API
```

## Prerequisites

- Node.js v18+

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm start          # → http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # → http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Configuration

### Backend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API listen port |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS origins (empty = allow all) |
| `JSON_BODY_LIMIT` | `50mb` | Max request body size |

### Frontend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `/api` | Base path for API calls (uses Vite proxy in dev) |
| `API_PROXY_TARGET` | `http://localhost:3001` | Where Vite proxies `/api` requests |
| `PORT` | `5173` | Dev server port |

## API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/test-smtp` | POST | Verify SMTP credentials without sending |
| `/api/send-email` | POST | Send one certificate PNG attachment |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Zustand, Lucide icons |
| Excel parsing | SheetJS (xlsx) |
| ZIP generation | JSZip |
| PDF generation | jsPDF |
| Backend | Node.js, Express, Nodemailer |

## License

MIT
