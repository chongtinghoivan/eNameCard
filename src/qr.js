import qrcode from 'qrcode-generator';
import { buildVCard } from './vcard.js';
import { forOutput } from './model.js';

// The library's default byte encoder is Latin-1; vCards carry UTF-8 (CJK names).
qrcode.stringToBytes = (s) => Array.from(new TextEncoder().encode(s));

/** Above this, phone cameras start struggling with dense QR on screens. */
export const QR_MAX_BYTES = 600;
/** Absolute ceiling: QR byte mode, error correction M, version 40. */
const QR_HARD_MAX = 2331;

export function utf8Bytes(text) {
  return new TextEncoder().encode(text).length;
}

/**
 * Decide what the QR encodes.
 * - 'vcard': the contact itself — scans work offline, camera → Add Contact.
 *   The photo is never embedded (it would dwarf the QR capacity).
 * - 'url': the published card page — updatable after printing, any length.
 * - 'auto': vcard when it fits comfortably, otherwise url.
 * Returns { kind, text, bytes, fallback } where fallback explains an
 * involuntary switch ('size' | 'too-large') so the UI can say why.
 */
export function qrPayload(card, mode, pageUrl) {
  const vcard = buildVCard(forOutput(card), { photo: false });
  const bytes = utf8Bytes(vcard);
  const url = String(pageUrl || '').trim();
  const urlPayload = () => ({ kind: 'url', text: url, bytes: utf8Bytes(url), fallback: null });

  if (mode === 'url') {
    if (!url) return { kind: 'vcard', text: vcard, bytes, fallback: 'no-url' };
    return urlPayload();
  }
  if (mode === 'vcard') {
    if (bytes > QR_HARD_MAX) return { ...urlPayload(), fallback: 'too-large' };
    return { kind: 'vcard', text: vcard, bytes, fallback: null };
  }
  if (bytes <= QR_MAX_BYTES || !url) return { kind: 'vcard', text: vcard, bytes, fallback: null };
  return { ...urlPayload(), fallback: 'size' };
}

/** Scalable SVG with a white quiet zone — stays scannable in dark mode. */
export function qrSvg(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
}

/** PNG for printing; browser-only (uses canvas). */
export function qrPngDataUrl(text, size = 640) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const margin = 4;
  const scale = size / (count + margin * 2);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(Math.round((col + margin) * scale), Math.round((row + margin) * scale),
          Math.ceil(scale), Math.ceil(scale));
      }
    }
  }
  return canvas.toDataURL('image/png');
}