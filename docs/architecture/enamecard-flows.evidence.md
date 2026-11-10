# Evidence index — enamecard-flows.dot

All nodes/edges are **current state, high confidence** unless marked. Verified by unit
tests (37 passing) and a browser E2E run on 2026-11-10 (form fill → preview → QR decode →
.vcf/card.json download → import → published card → edit-a-copy → photo upload).

| Node / edge | Evidence |
| --- | --- |
| UI: contact form (#edit) | `src/main.js` — `renderForm()`, `SECTIONS`, `repeatableSection()`; route rule in `route()` |
| Contact model | `src/model.js` — `defaultCard()`, `normalizeCard()`, `forOutput()`; `tests/model.test.js` |
| localStorage draft | `src/main.js` — `STORE_KEY = 'enamecard.card.v1'`, `persist()` on every input event |
| vCard 3.0 writer | `src/vcard.js` — `buildVCard()`; `tests/vcard.test.js` (escaping, 75-octet folding, CRLF, typed TEL/EMAIL/ADR, PHOTO) |
| QR renderer / auto rule | `src/qr.js` — `qrPayload()`, `QR_MAX_BYTES = 600`, hard ceiling 2331 B; `tests/qr.test.js` |
| QR actually scans | E2E: downloaded PNG decoded by OpenCV to the exact UTF-8 vCard incl. `FN:David Chan \| 陳大文` |
| .vcf download / share | `src/main.js` — `downloadVcf()`, `shareVcf()` (Web Share API files); E2E download verified |
| card.json export / import | `src/main.js` — export button, import file input → `normalizeCard()`; E2E round-trip verified |
| commit card.json (manual, dashed) | `README.md` — "Publish your own card page" steps 3–4; human step, hence dashed |
| GitHub Actions → Pages | `.github/workflows/deploy.yml` — push to main → `npm ci && npm test && npm run build` → `actions/deploy-pages@v4` |
| Published card page | `src/main.js` — `fetchPublished()` (content-type + `hasContent` guard), `renderPublished()`; sample `public/card.json` |
| Static GET only | No backend in repo; `fetch('card.json')` is the only runtime request besides static assets |
| Camera → Contacts (offline vCard) | iOS/Android native vCard-QR behavior; platform capability, not repo code — medium confidence until scanned on a real phone |
| URL QR → card page → Save contact | `renderPublished()` + `downloadVcf()`; E2E verified on desktop; phone import is platform behavior |
| TARGET: Wallet pass | `README.md` Roadmap — requires Apple Developer cert + server-side signing; explicitly **not implemented** in this repo (dashed, target state) |

## Known limitations

- Phone-camera → native contact import is platform behavior; verified by QR decode, not
  by a physical iPhone scan yet. Validate on a real device after first deploy.
- GitHub Pages workflow is committed but has not run on GitHub yet (repo still private
  at authoring time). First push will exercise it.