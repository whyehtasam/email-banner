# Email Banner API

Production-ready Node.js Express API that serves a **random** banner image at `GET /email-banner` for use in email signatures (e.g. Outlook).

## Install

```bash
yarn install
```

Required packages (already in `package.json`):

- `express` – web server
- `helmet` – security headers
- `express-rate-limit` – 100 requests/minute per IP

## Folder structure

```
emai-banner/
├── package.json
├── server.js
├── README.md
└── public/
    └── banners/
        ├── banner1.jpg
        ├── banner2.jpg
        ├── banner3.jpg
        ├── banner4.jpg
        └── banner5.jpg
```

Place exactly these 5 JPEG files in `public/banners/`: `banner1.jpg` … `banner5.jpg`.

## Run

```bash
yarn start
```

Runs on `http://localhost:3000` (or `PORT` env var). Listens on `0.0.0.0` so it’s reachable via your host’s IP or a dev URL.

- **AWS workspace:** Run the server, make the port public, and use the dev URL (e.g. `https://xxxxx.vfs.cloud9.region.amazonaws.com`) in your signature: `<img src="https://YOUR-DEV-URL/email-banner" width="600" alt="" />`.
- **Production:** set `PORT` and run behind a reverse proxy (e.g. nginx).

## API

### `GET /email-banner`

- Returns one randomly chosen image from the 5 banners.
- **Content-Type:** `image/jpeg`
- **Caching:** disabled via `Cache-Control`, `Pragma`, `Expires` so email clients get a fresh image.

**Example (email signature):**

```html
<img src="https://yourcompany.com/email-banner" width="600" alt="" />
```

### `GET /health`

- Returns `200 OK`. Use for load balancer health checks.

## Security

- No user input for filenames; only whitelisted names are used.
- No directory listing; banners are served only via `/email-banner`.
- `helmet` for secure headers.
- Rate limit: 100 requests per minute per IP.
- Path resolution checked so responses stay inside `public/banners`.

## Errors

- Missing or unreadable banner → `500` with generic "Server error" (no path/details leaked).
