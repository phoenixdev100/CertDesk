<div align="center">

# CertDesk

**Design · Generate · Deliver Certificates**

A modern certificate studio - upload a template, import recipients, drag fields onto the canvas, style them, export or email.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)](https://tailwindcss.com)

</div>

---

<div align="center">

## Features

</div>

<table>
<tr>
<td width="50%" valign="top">

### Import
- PNG · JPG · WebP · GIF · PDF templates
- Drag & drop or browse
- Excel / CSV recipient import
- Auto-detect name & email columns

</td>
<td width="50%" valign="top">

### Canvas
- Drag columns onto certificate
- Mouse & touch support
- Resize handles on field corners
- Quick-remove button
- Zoom & auto-fit

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Styling
- 110+ fonts (6 categories)
- Bold · Italic · Underline
- Color picker with hex input
- Drop shadow controls
- Text transform (uppercase, titlecase)
- Alignment (left, center, right)

</td>
<td width="50%" valign="top">

### Export & Deliver
- PNG · PDF · JPEG formats
- Single certificate export
- Bulk ZIP export
- SMTP email delivery
- Rich-text email templates
- Variable substitution (`{{name}}`, `{{firstName}}`)
- Send progress & success/fail logs

</td>
</tr>
</table>

---

<div align="center">

## Quick Start

</div>

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm start          # → http://localhost:3001
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

<div align="center">

## Tech Stack

</div>

<div align="center">

| Layer | Technology |
|-------|------------|
| Frontend | React 18 · Vite 5 · Tailwind CSS 3 · Zustand · React Router |
| Export | JSZip · jsPDF · SheetJS (xlsx) |
| Backend | Node.js · Express · Nodemailer |

</div>

---

<div align="center">

## Project Structure

</div>

```
certdesk/
├── frontend/
│   └── src/
│       ├── pages/        # Landing + Studio routes
│       ├── components/   # Sidebar, canvas, modals, UI
│       ├── hooks/        # Renderer, drag, Excel import
│       ├── lib/          # Drawing, export, fonts, storage
│       ├── store/        # Zustand state
│       └── api/         # Email API client
│
├── backend/
│   └── src/
│       ├── routes/       # API endpoints
│       ├── controllers/  # Request handlers
│       ├── services/     # Mailer service
│       ├── middleware/   # Validation + errors
│       └── config.js     # Environment config
│
├── LICENSE
└── README.md
```

---

<div align="center">

## Configuration

</div>

<details>
<summary><b>Backend .env</b></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API listen port |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS origins (empty = all) |
| `JSON_BODY_LIMIT` | `50mb` | Max request body size |

</details>

<details>
<summary><b>Frontend .env</b></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `/api` | API base path (Vite proxy in dev) |
| `API_PROXY_TARGET` | `http://localhost:3001` | Proxy target |
| `PORT` | `5173` | Dev server port |

</details>

---

<div align="center">

## API Endpoints

</div>

<div align="center">

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | `GET` | Health check |
| `/api/test-smtp` | `POST` | Verify SMTP credentials |
| `/api/send-email` | `POST` | Send certificate email |

</div>

---

<div align="center">

## License

MIT © [Deepak](LICENSE)

---

Made with ❤️ by [Deepak](https://github.com/phoenixdev100)

</div>
