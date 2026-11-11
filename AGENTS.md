# AGENTS.md — eNameCard

Operating contract for coding agents. Product context and user-facing docs: `README.md`.

## Commands (repo root, Node 20.19+)

- `npm test` — node:test over `tests/*.test.js`; no network, no browser needed.
- `npm run build` — Vite static build to `dist/`. `npm run dev` — dev server on :5173.
- CI (`.github/workflows/deploy.yml`) runs `npm ci && npm test && npm run build` on every push to `main`, then deploys to GitHub Pages. A push is a deploy — keep tests green before pushing.

## Non-negotiable product constraints

- **No backend, no third-party network calls.** The app is a static bundle; the only runtime fetch is same-origin `card.json`. Do not add analytics, CDNs, APIs, or upload endpoints. (Privacy promise in README.)
- **`base: './'` in vite.config.js stays.** Absolute base breaks GitHub Pages project-path hosting (`user.github.io/eNameCard/`).

## vCard writer (`src/vcard.js`) — RFC 2426, not string concatenation

- CRLF line endings; fold at 75 **octets** (never split a UTF-8 sequence); escape `\ ; ,` and newlines in TEXT values. `tests/vcard.test.js` pins this — run it after any writer change.
- Bilingual convention: `FN:David Chan | 陳大文` (Latin first, ASCII pipe), `ORG` likewise as one atomic token. Keep `normalizePipes()` behavior.
- Empty fields are omitted, never written blank. TEL values keep digits + leading `+` only.
- Photo: only `data:image/jpeg;base64,` from our canvas resizer; embedded as `PHOTO;ENCODING=b;TYPE=JPEG`, and **never** in QR payloads (`buildVCard(c, { photo: false })`).

## QR (`src/qr.js`)

- `qrcode.stringToBytes` is overridden with TextEncoder — the library default is Latin-1 and corrupts CJK. Do not remove.
- Auto mode: embed vCard only ≤ `QR_MAX_BYTES` (600 UTF-8 bytes), else encode the card URL. Hard ceiling 2331 bytes (byte mode, EC level M).

## UI conventions

- Bilingual labels: fixed English + `·` + Chinese via `bi(en, key)`; Chinese swaps 繁/簡 as a whole through the curated dictionary in `src/i18n.js`. Never use a fuzzy auto-converter; add new strings to `STRINGS`.
- User data into the DOM only via `textContent`; links through `normalizeUrl()` (forces http/https); photo `src` only after the JPEG data-URL whitelist in `normalizeCard()`.
- Routing: `public/card.json` with a name/org → published card at root; `#edit` (or no card.json) → editor. Draft persists in `localStorage['enamecard.card.v1']`.
- Share contact is always visible: native file share first, in-page fallback menu (copy link / copy vCard / email) when unsupported or rejected. Never gate it behind `canShare()` alone — desktop Chrome can report support yet reject `.vcf` files.

## Architecture docs

`docs/architecture/enamecard-flows.dot` (+ evidence/summary) is the data-flow map. Update it when routing, QR thresholds, or the deploy workflow change.