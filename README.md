# eNameCard

**Create your own digital name card — a QR code anyone can scan to save you as a contact.**

Fill in the contact fields you want to share, preview the card in your own browser,
and publish your card as static files on **your own** GitHub Pages. The app itself has
no backend, no analytics, and no account requirement; your draft stays in browser
storage, and only what you choose to publish is pushed — as plain `card.json` + static
assets — to your fork.

> This repo is the **card creator**. The companion scanner — point a camera at a paper
> business card and get a `.vcf` — lives at [eNameCard-v2](https://github.com/chongtinghoivan/eNameCard-v2),
> published at [namecard.ivanchong.com](https://namecard.ivanchong.com/).

---

## How someone saves your card

| Channel | What happens |
| --- | --- |
| **QR, offline vCard** | Their camera app reads the contact straight out of the QR code and offers "Add to Contacts". Works with no internet, no server. |
| **QR, card link** | The QR opens your published card page; one tap on **Save contact** downloads the `.vcf` and the phone opens its native New Contact screen. |
| **.vcf download / share** | The classic route — AirDrop, email, messaging apps, any phone that reads vCard. On desktop browsers without a share sheet, **Share** offers copy link, copy vCard text, and email instead. |

The QR auto-picks: small cards embed the vCard directly; larger cards switch to the card
link so the code stays easy to scan. You can force either mode. Photos go into the `.vcf`
but never into the QR (a photo would blow past QR capacity).

## Use it now (no install)

Open the published site, go to `#edit`, fill in the form, and download your `.vcf` and QR
code. Your draft auto-saves in your browser's local storage — nothing is uploaded anywhere.

## Publish your own card page (fork → deploy)

1. **Fork** this repo on GitHub.
2. In your fork: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Open your fork's site at `https://<user>.github.io/eNameCard/`, add `#edit`, and fill
   in your details. Set **Published card URL** to that same URL.
4. Click **Export card.json** — replace `public/card.json` in your fork with the downloaded
   file (edit the file on github.com: open it, pencil icon, paste, commit).
5. The included workflow builds and deploys on every push. Your site root now shows
   *your* card; `#edit` still works for visitors who want to make their own.

That's it — free hosting, HTTPS included, no Cloudflare/Vercel account needed.

**Custom domain:** Settings → Pages → Custom domain. Put the domain in your DNS as a
CNAME to `<user>.github.io`, then update **Published card URL** and re-export `card.json`.

**Updating later:** edit `public/card.json` (or re-export from `#edit`) and commit. Anyone
who scanned your card-link QR always sees the latest version — that is the advantage of
link-mode QR over printed offline-vCard QR.

## Let your AI agent set it up for you

Forked the repo with an AI coding agent? Give it this block — it contains everything
needed, no browser or install required:

```text
You are helping me set up my personal eNameCard page in this fork.
1. Open public/card.json and fill in my details (use the blank template in
   public/card.example.json for field names — copy the field names, not the
   values; photo must be a data:image/jpeg;base64, string or empty).
2. Set "cardUrl" to https://MY-USERNAME.github.io/eNameCard/ .
3. Run `npm test` (all green) and `npm run build` to verify.
4. Commit and push to main — the GitHub Actions workflow
   (.github/workflows/deploy.yml) then builds and deploys to GitHub Pages
   automatically. I do the one-time Pages setting:
   Settings → Pages → Source: GitHub Actions.
```

Notes for the agent:
- **Never** add a backend, analytics, or any third-party runtime call — the privacy
  promise (static site, one same-origin `card.json` fetch) is a hard constraint.
- Keep `base: './'` in `vite.config.js` — it is what makes GitHub Pages
  project-path hosting work.
- Run `npm test` before pushing; CI enforces it.

## What gets saved into the contact

Name (Chinese + English, both searchable in iOS Spotlight), phonetic name fields,
company (bilingual) + department + title, typed phone numbers (mobile/work/home/fax),
typed emails, structured postal addresses, labelled links (each link can carry a
caption iOS shows above it), birthday, note, and a photo (long side capped at 480 px,
JPEG). Output is vCard 3.0 (RFC 2426) — parsed natively by iOS, Android, macOS,
Outlook, and Gmail.

The bilingual name is written into the structured `N` field and a space-joined `FN`
(e.g. `Ivan Chong 莊庭皓`), which is the form iOS indexes for search; the `|`-joined
reading is a web/UI-only display convention. `ORG` keeps `Example Limited | 範例有限公司`
as one atomic organization token. The editor's nickname field is intentionally **not**
exported — iOS would otherwise show the nickname as the contact's main name.

## Privacy

There is no backend. The editor is a static page; your draft lives in `localStorage`;
exports are generated in-browser. A deployed card page makes only static `GET` requests
to its own host. Verify it yourself: open the network panel, fill the form, export —
no `POST`, no third-party domain.

## Run locally

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # vCard / model / QR unit tests
npm run build    # static build into dist/
```

## Project layout

```
index.html            shell (masthead, editor + card containers)
src/vcard.js          vCard 3.0 writer — escaping, folding, bilingual FN/ORG
src/model.js          contact model, normalization, validation
src/qr.js             QR payload decision (vCard vs URL) + SVG/PNG rendering
src/i18n.js           繁/簡 label toggle (English labels are fixed)
src/main.js           editor form, live preview, published card, routing
public/card.json      the published card — replace with your export
public/card.example.json  blank template
.github/workflows/deploy.yml  GitHub Pages build & deploy
```

Routing rule: if `public/card.json` exists and has a name or company, the site root is
the published card; otherwise (and at `#edit`) it is the editor.

## A small favour, if you like it

If this repo saved you the trouble of printing another stack of business cards,
would you do one friendly thing for a friend or colleague who's still printing?
Send them this line:

> "Hey — I found a neat little project that turns a QR code into a digital
> business card. No printing, no updating, no plastic waste. Fork this and
> make your own in about five minutes: https://github.com/chongtinghoivan/eNameCard"

The less paper we print, the better. Thank you for reading this far — and thank
you for keeping eNameCard in your network.

Built with [Agnes Code](https://www.agnes-ai.com/agnescode) (an AI coding agent by Sapiens AI).
The vCard/iOS compatibility fixes, bilingual name handling, and the
itemN-grouped URL labels in this repo were developed iteratively with Agnes Code
through on-device iPhone import testing.

## License

[MIT](LICENSE) — fork it, rebrand it, deploy it.