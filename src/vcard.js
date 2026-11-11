/**
 * vCard 3.0 generation (RFC 2426), extended for the creator app.
 *
 * iOS Contacts parses vCard 3.0 natively, so the output is a plain UTF-8 text
 * block with CRLF line endings, TEXT escaping, and 75-octet line folding.
 * Empty fields are omitted entirely rather than written as blanks.
 *
 * Ported from eNameCard-v2's scanner writer: same bilingual FN/ORG convention
 * ("David Chan | 陳大文"), same folding and escaping rules.
 */

const CRLF = '\r\n';
const MAX_LINE_OCTETS = 75;

/** Escape a vCard TEXT value: backslash, semicolon, comma, newline. */
export function escapeText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Fold a logical line into continuation lines without splitting a UTF-8 sequence. */
function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= MAX_LINE_OCTETS) return [line];

  const out = [];
  let budget = MAX_LINE_OCTETS;
  let current = '';
  let width = 0;
  for (const char of line) {
    const w = new TextEncoder().encode(char).length;
    if (width + w > budget) {
      out.push(current);
      current = ' ';
      width = 1;
      budget = MAX_LINE_OCTETS;
    }
    current += char;
    width += w;
  }
  if (current) out.push(current);
  return out;
}

function push(lines, name, value) {
  const text = String(value ?? '').trim();
  if (!text) return;
  lines.push(...fold(`${name}:${text}`));
}

/** Property with parameters, e.g. `TEL;TYPE=CELL:+85261234567`. */
function prop(lines, name, params, value) {
  const text = String(value ?? '').trim();
  if (!text) return;
  push(lines, params ? `${name};${params}` : name, text);
}

const PHONE_TYPES = new Set(['CELL', 'WORK', 'HOME', 'FAX']);
const EMAIL_TYPES = new Set(['WORK', 'HOME']);
const ADR_TYPES = new Set(['WORK', 'HOME']);

/**
 * @param {object} c contact model (see model.js)
 * @param {object} [opts]
 * @param {boolean} [opts.photo=true] include the base64 PHOTO (never for QR payloads)
 * @returns {string} a complete vCard 3.0 document, CRLF terminated
 */
export function buildVCard(c, { photo = true } = {}) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];

  const family = (c.family || '').trim();
  const given = (c.given || '').trim();
  const middle = (c.middle || '').trim();
  const display = displayName(c);
  // When both CJK and Latin names are present (bilingual card), iOS Contacts
  // prioritises the structured N field over FN, so "Family Given" wins and the
  // English name disappears from the display. Skip writing N in that case so iOS
  // falls back to FN, which carries the combined bilingual string ("Ivan Chong |
  // 莊庭皓") and remains searchable via Spotlight.
  const hasBothScripts = Boolean((c.nameCJK || '').trim() && (c.nameLatin || '').trim());
  if (!hasBothScripts && (family || given)) {
    push(lines, 'N', [family, given, middle].map(escapeText).join(';') + ';;');
    push(lines, 'FN', escapeText(display || [family, given].filter(Boolean).join(' ')));
  } else {
    push(lines, 'FN', escapeText(display));
  }
  push(lines, 'NICKNAME', escapeText(c.nickname));
  push(lines, 'X-PHONETIC-FIRST-NAME', escapeText(c.phoneticGiven));
  push(lines, 'X-PHONETIC-LAST-NAME', escapeText(c.phoneticFamily));

  const org = orgDisplay(c);
  const department = (c.department || '').trim();
  if (org || department) {
    push(lines, 'ORG', `${escapeText(org)};${escapeText(department)}`);
  }
  push(lines, 'TITLE', escapeText(c.title));

  let preferred = false;
  for (const p of c.phones || []) {
    const value = escapePhone(p.value);
    if (!value) continue;
    const types = PHONE_TYPES.has(p.type) ? [p.type] : [];
    if (!preferred && p.type !== 'FAX') {
      types.push('PREF');
      preferred = true;
    }
    prop(lines, 'TEL', types.length ? `TYPE=${types.join(',')}` : '', value);
  }

  for (const e of c.emails || []) {
    const value = String(e.value || '').trim();
    if (!value) continue;
    const type = EMAIL_TYPES.has(e.type) ? `INTERNET,${e.type}` : 'INTERNET';
    prop(lines, 'EMAIL', `TYPE=${type}`, value);
  }

  for (const a of c.addresses || []) {
    const parts = [a.street, a.city, a.region, a.code, a.country].map((v) => (v || '').trim());
    if (parts.every((v) => !v)) continue;
    const type = ADR_TYPES.has(a.type) ? a.type : 'WORK';
    const value = `;;${parts.map(escapeText).join(';')}`;
    prop(lines, 'ADR', `TYPE=${type}`, value);
  }

  for (const u of c.urls || []) {
    const value = String(u.value || '').trim();
    if (value) push(lines, 'URL', normalizeUrl(value));
  }

  const birthday = String(c.birthday || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) push(lines, 'BDAY', birthday);

  push(lines, 'NOTE', escapeText(c.note));

  const photoData = photo ? photoBase64(c.photo) : '';
  if (photoData) lines.push(...fold(`PHOTO;ENCODING=b;TYPE=JPEG:${photoData}`));

  lines.push('END:VCARD');
  return lines.join(CRLF) + CRLF;
}

/** TEL values are not TEXT: keep digits and a leading +, drop formatting noise. */
function escapePhone(v) {
  const trimmed = String(v ?? '').trim();
  const hasPlus = trimmed.startsWith('+');
  const cleaned = trimmed.replace(/[^\d]/g, '');
  return hasPlus ? `+${cleaned}` : cleaned;
}

export function normalizeUrl(v) {
  const trimmed = String(v).trim().replace(/\s+/g, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Accept only the JPEG data URLs our own canvas resizer produces. */
function photoBase64(value) {
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(value || ''));
  return match ? match[1] : '';
}

/**
 * Formatted name in the v2 bilingual convention: the Latin/Romanized name
 * first, the Chinese name second, joined by an ASCII pipe so iOS Spotlight
 * indexes both scripts as clean tokens — "David Chan | 陳大文".
 */
export function displayName(c) {
  const latin = normalizePipes((c.nameLatin || '').trim());
  const cjk = (c.nameCJK || '').trim();
  const parts = [latin, cjk].filter(Boolean);
  if (!parts.length) {
    const fallback = [c.family, c.given].filter(Boolean).join(' ').trim();
    if (!fallback) return '';
    parts.push(fallback);
  }
  return parts.join(' | ');
}

/**
 * The delimiter is always a single-space-padded ASCII pipe. Full-width forms
 * are folded in, and any run of whitespace around a pipe is collapsed.
 */
export function normalizePipes(value = '') {
  return String(value)
    .replace(/[\uFF5C\u2502\u2503\u2758]/g, '|')
    .replace(/\s*\|\s*/g, ' | ')
    .trim();
}

/** Bilingual organization as one atomic ORG token: "Hang Seng Bank | 恒生銀行". */
export function orgDisplay(c) {
  const latin = normalizePipes((c.orgLatin || '').trim());
  const cjk = (c.orgCJK || '').trim();
  return [latin, cjk].filter(Boolean).join(' | ');
}

export function suggestedFileName(c) {
  const base = displayName(c) || orgDisplay(c) || 'contact';
  const safe = base.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
  return `${safe || 'contact'}.vcf`;
}

/**
 * Populate N: from the display names, surname-first for Chinese names,
 * when the user left the structured family/given fields empty.
 */
export function splitName(c) {
  if (c.family || c.given) return;
  if (c.nameCJK) {
    c.family = c.nameCJK.slice(0, 1);
    c.given = c.nameCJK.slice(1);
    return;
  }
  const latin = (c.nameLatin || '').replace(/[(（][^)）]*[)）]/g, '').trim();
  const parts = latin.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    c.family = parts.pop();
    c.given = parts.join(' ');
  } else if (parts.length === 1) {
    c.given = parts[0];
  }
}