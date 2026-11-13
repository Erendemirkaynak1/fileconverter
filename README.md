# FileConverter

A full-stack file conversion platform built with React, TypeScript, Express and Sharp. The project prioritizes truthful conversion status, input validation and in-memory processing.

## Implemented conversions

- Images: PNG → JPG, JPG → PNG, WEBP → PNG, PNG/JPG → WEBP, BMP → PNG.
- Data: JSON → CSV, CSV → JSON, XML → JSON, JSON → XML, XLSX → CSV, CSV → XLSX.
- Documents: DOCX → PDF, TXT → PDF, sanitized HTML → PDF, PDF → PNG pages (ZIP; up to 20 pages per file).
- Text: Markdown → sanitized HTML and UTF-8 text validation/normalization.
- Archives: ZIP extraction with path traversal checks, entry-count and expanded-size limits.
- Batch: convert up to 10 files in one request and download verified results as a ZIP archive (50 MB combined input limit).

DOCX/PDF, PDF-to-image, HTML-to-PDF and ZIP creation are not advertised as available yet. They require additional conversion engines and are intentionally deferred rather than simulated.

## Requirements

- Node.js 22+
- LibreOffice Writer and Poppler utilities (`pdfinfo`, `pdftoppm`) for document conversions when running outside Docker
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
- `POST /api/convert/:id/batch` — multipart form-data field: `files` (up to 10 files).

Successful conversion responses include `X-Conversion-Verified: true`; the client requires this header and a non-empty response body before offering the download.

## Security notes

- Uploads are held in memory; document conversions use isolated temporary directories that are removed in a `finally` cleanup path.
- Default maximum single-file upload size is 25 MB.
- Batch requests accept up to 10 files, 5 MB each, and 50 MB combined.
- Only registered extensions are accepted; image signatures are checked before image conversion.
- Sharp has a pixel limit to mitigate decompression bombs.
- DOCX/TXT/HTML to PDF uses LibreOffice in headless mode; PDF rasterization uses Poppler (`pdfinfo`/`pdftoppm`).
- Document conversion processes have execution timeouts; PDF-to-image is capped at 20 pages.
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

Uploads are not stored as user files. Document converters create short-lived isolated temporary workspaces and remove them after conversion. The browser stores the last eight conversion records in local storage; file contents are never stored in history. Durable server-side history is intentionally not enabled.
