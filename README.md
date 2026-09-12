# CertDesk

> Design, generate & deliver certificates — all in one place.

Upload a certificate template (PNG/JPG/WebP/PDF), import recipients from Excel/CSV, drag data columns onto the canvas as positioned text fields, style them with 110+ fonts, then export as PNG/PDF/JPEG or email each certificate via SMTP.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Zustand, React Router |
| Export | JSZip, jsPDF, SheetJS (xlsx) |
| Backend | Node.js, Express, Nodemailer |

---

## Quick Start

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

Open **http://localhost:5173** in your browser.

---

## Project Structure

```
certdesk/
├── frontend/    # React + Vite + Tailwind (white enterprise theme)
│   └── src/
│       ├── pages/        # Landing + Studio routes
│       ├── components/   # Sidebar, canvas, modals, UI primitives
│       ├── hooks/        # Canvas renderer, field drag, Excel import
│       ├── lib/          # Certificate drawing, export, fonts, storage
│       ├── store/        # Zustand state management
│       └── api/         # Email API client
│
├── backend/     # Express + Nodemailer SMTP relay API
│   └── src/
│       ├── routes/       # API endpoints
│       ├── controllers/  # Request handlers
│       ├── services/     # Mailer service
│       ├── middleware/   # Validation + error handling
│       └── config.js     # Environment config
│
├── .gitignore
├── LICENSE
└── README.md
```

---

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

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/test-smtp` | POST | Verify SMTP credentials without sending |
| `/api/send-email` | POST | Send one certificate as email attachment |

---

## Features

- **Import** — PNG, JPG, WebP, GIF, PDF templates
- **Excel/CSV** — Import recipients, auto-detect name & email columns
- **Canvas** — Drag columns onto certificate, position with mouse/touch
- **Styling** — 110+ fonts, bold, italic, underline, color, shadow, alignment, text transform
- **Field controls** — Resize handles, remove button, per-field typography
- **Export** — PNG, PDF, JPEG (single or bulk ZIP)
- **Email** — SMTP delivery with rich-text templates, variable substitution, progress tracking
- **Persistence** — Workspace auto-saves across refreshes (IndexedDB + localStorage)

---

## License

MIT © [Deepak](LICENSE)

---

<p align="center">Made with ❤️ by <a href="https://github.com/phoenixdev100">Deepak</a></p>
