import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qrPayload, qrSvg, utf8Bytes, QR_MAX_BYTES } from '../src/qr.js';
import { defaultCard } from '../src/model.js';

const URL = 'https://user.github.io/eNameCard/';

function card(overrides = {}) {
  return { ...defaultCard(), nameLatin: 'David Chan', nameCJK: '陳大文', ...overrides };
}

test('utf8Bytes counts CJK as 3 bytes', () => {
  assert.equal(utf8Bytes('陳'), 3);
  assert.equal(utf8Bytes('ab'), 2);
});

test('auto: small card embeds vCard, photo never included', () => {
  const p = qrPayload(card({ photo: 'data:image/jpeg;base64,AAAA' }), 'auto', URL);
  assert.equal(p.kind, 'vcard');
  assert.ok(p.text.startsWith('BEGIN:VCARD\r\n'));
  assert.ok(!p.text.includes('PHOTO'));
  assert.equal(p.fallback, null);
  assert.ok(p.bytes <= QR_MAX_BYTES);
});

test('auto: oversized card falls back to URL with reason', () => {
  const p = qrPayload(card({ note: 'x'.repeat(QR_MAX_BYTES) }), 'auto', URL);
  assert.equal(p.kind, 'url');
  assert.equal(p.text, URL);
  assert.equal(p.fallback, 'size');
});

test('forced vcard beyond QR hard ceiling falls back to URL', () => {
  const p = qrPayload(card({ note: 'x'.repeat(2400) }), 'vcard', URL);
  assert.equal(p.kind, 'url');
  assert.equal(p.fallback, 'too-large');
});

test('forced vcard without URL stays vcard even when dense', () => {
  const p = qrPayload(card({ note: 'x'.repeat(700) }), 'vcard', '');
  assert.equal(p.kind, 'vcard');
  assert.equal(p.fallback, null);
});

test('url mode encodes the page URL; empty URL falls back to vcard', () => {
  assert.equal(qrPayload(card(), 'url', URL).text, URL);
  const p = qrPayload(card(), 'url', '');
  assert.equal(p.kind, 'vcard');
  assert.equal(p.fallback, 'no-url');
});

test('auto without URL keeps vcard regardless of size', () => {
  const p = qrPayload(card({ note: 'x'.repeat(700) }), 'auto', '');
  assert.equal(p.kind, 'vcard');
});

test('qrSvg renders a scalable SVG with a viewBox', () => {
  const svg = qrSvg('BEGIN:VCARD\r\nVERSION:3.0\r\nFN:陳大文\r\nEND:VCARD\r\n');
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('viewBox='));
  assert.ok(svg.includes('</svg>'));
});

test('denser payloads produce more modules', () => {
  const small = qrSvg('hi').match(/viewBox="0 0 (\d+)/)[1];
  const large = qrSvg('x'.repeat(500)).match(/viewBox="0 0 (\d+)/)[1];
  assert.ok(Number(large) > Number(small));
});