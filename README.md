# FileConverter

A full-stack file conversion platform built with React, TypeScript, Express and Sharp. The project prioritizes truthful conversion status, input validation and in-memory processing.

## Implemented conversions

- Images: PNG → JPG, JPG → PNG, WEBP → PNG, PNG/JPG → WEBP, BMP → PNG.
- Data: JSON → CSV, CSV → JSON, XML → JSON, JSON → XML.
- Text: UTF-8 text validation/normalization.
- Archives: ZIP extraction with path traversal checks, entry-count and expanded-size limits.

DOCX/PDF, PDF-to-image, HTML-to-PDF, XLSX and ZIP creation are not advertised as available yet. They require additional conversion engines and are intentionally deferred rather than simulated.

## Requirements

- Node.js 22+
- npm 10+

## Development

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4000  
Health: http://localhost:4000/api/health

## Commands

- `npm run dev` — frontend and API.
- `npm run typecheck` — TypeScript checks.
- `npm test` — API and conversion tests.
- `npm run build` — production builds.

## API

- `GET /api/health`
- `GET /api/conversions`
- `POST /api/convert/:id` — multipart form-data field: `file`.

Successful conversion responses include `X-Conversion-Verified: true`; the client requires this header and a non-empty response body before offering the download.

## Security notes

- Uploads are held in memory; no persistent upload directory is created.
- Default maximum upload size is 25 MB.
- Only registered extensions are accepted; image signatures are checked before image conversion.
- Sharp has a pixel limit to mitigate decompression bombs.
- ZIP extraction rejects absolute and parent-traversal paths, caps entries at 500 and expanded output at 100 MB.
- Helmet security headers and an explicit CORS origin are configured.
- Do not expose the API directly to untrusted public traffic without adding rate limiting, request timeouts, authentication/abuse controls and production observability.

## Docker

```bash
docker compose up --build
```

Web: http://localhost:8080  
API: http://localhost:4000

## Privacy and history

Files are processed in server memory and are not written to disk. The current conversion history is held in the browser session only; durable server-side history is intentionally not enabled.
