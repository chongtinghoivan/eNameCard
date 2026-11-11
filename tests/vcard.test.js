import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildVCard, escapeText, displayName, orgDisplay, normalizePipes,
  normalizeUrl, suggestedFileName, splitName,
} from '../src/vcard.js';
import { defaultCard, forOutput } from '../src/model.js';

function card(overrides = {}) {
  return { ...defaultCard(), ...overrides };
}

/** Unfold continuation lines, then split properties. */
function properties(vcard) {
  assert.ok(vcard.endsWith('\r\n'), 'CRLF terminated');
  const unfolded = vcard.replace(/\r\n /g, '');
  return unfolded.trim().split('\r\n');
}

test('minimal card has BEGIN/VERSION/END and CRLF endings', () => {
  const v = buildVCard(card());
  const lines = properties(v);
  assert.equal(lines[0], 'BEGIN:VCARD');
  assert.equal(lines[1], 'VERSION:3.0');
  assert.equal(lines.at(-1), 'END:VCARD');
  assert.ok(!v.includes('\n') || v.includes('\r\n'));
});

test('empty fields are omitted, not written as blanks', () => {
  const v = buildVCard(card());
  assert.ok(!v.includes('TITLE'));
  assert.ok(!v.includes('TEL'));
  assert.ok(!v.includes('ADR'));
  assert.ok(!v.includes('PHOTO'));
});

test('bilingual FN keeps both scripts searchable: "David Chan | 陳大文"', () => {
  const v = buildVCard(card({ nameLatin: 'David Chan', nameCJK: '陳大文' }));
  assert.ok(properties(v).includes('FN:David Chan | 陳大文'));
});

test('bilingual ORG is one atomic token with department unit', () => {
  const v = buildVCard(card({ orgLatin: 'Hang Seng Bank', orgCJK: '恒生銀行', department: 'IT' }));
  assert.ok(properties(v).includes('ORG:Hang Seng Bank | 恒生銀行;IT'));
});

test('N is structured and escaped; family/given derived when blank', () => {
  const c = forOutput(card({ nameCJK: '陳大文' }));
  const v = buildVCard(c);
  assert.ok(properties(v).includes('N:陳;大文;;;'));
});

test('bilingual card omits N so iOS falls back to FN display', () => {
  const c = forOutput(card({ nameCJK: '莊庭皓', nameLatin: 'Ivan Chong' }));
  const v = buildVCard(c);
  const props = properties(v);
  assert.ok(!props.some((p) => p.startsWith('N:')), 'N must be absent for bilingual card');
  assert.ok(props.includes('FN:Ivan Chong | 莊庭皓'));
});

test('TEXT escaping: backslash, semicolon, comma, newline', () => {
  assert.equal(escapeText('a;b,c\\d\ne'), 'a\\;b\\,c\\\\d\\ne');
  const v = buildVCard(card({ note: 'key;value, with\\slash' }));
  assert.ok(properties(v).includes('NOTE:key\\;value\\, with\\\\slash'));
});

test('long lines fold at 75 octets without splitting UTF-8', () => {
  const note = '中文字'.repeat(60);
  const v = buildVCard(card({ note }));
  for (const line of v.split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line.length}`);
  }
  const unfolded = v.replace(/\r\n /g, '');
  assert.ok(unfolded.includes(`NOTE:${note}`));
});

test('phones: typed, cleaned, first non-fax is PREF', () => {
  const v = buildVCard(card({
    phones: [
      { type: 'CELL', value: '+852 6123 4567' },
      { type: 'WORK', value: '+852-3123-4567' },
      { type: 'FAX', value: '+852 2123 4567' },
      { type: 'OTHER', value: '1234' },
    ],
  }));
  const lines = properties(v);
  assert.ok(lines.includes('TEL;TYPE=CELL,PREF:+85261234567'));
  assert.ok(lines.includes('TEL;TYPE=WORK:+85231234567'));
  assert.ok(lines.includes('TEL;TYPE=FAX:+85221234567'));
  assert.ok(lines.includes('TEL:1234'));
});

test('emails carry INTERNET plus type', () => {
  const v = buildVCard(card({
    emails: [{ type: 'WORK', value: 'd@x.com' }, { type: 'OTHER', value: 'e@x.com' }],
  }));
  const lines = properties(v);
  assert.ok(lines.includes('EMAIL;TYPE=INTERNET,WORK:d@x.com'));
  assert.ok(lines.includes('EMAIL;TYPE=INTERNET:e@x.com'));
});

test('address is structured ADR, empty components kept as empty slots', () => {
  const v = buildVCard(card({
    addresses: [{ type: 'WORK', street: '1 Queen\'s Road', city: 'Hong Kong', region: '', code: '', country: 'HK' }],
  }));
  assert.ok(properties(v).includes("ADR;TYPE=WORK:;;1 Queen's Road;Hong Kong;;;HK"));
});

test('all-empty address is omitted', () => {
  const v = buildVCard(card({ addresses: [{ type: 'WORK', street: '', city: '', region: '', code: '', country: '' }] }));
  assert.ok(!v.includes('ADR'));
});

test('URLs normalize to https', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('http://x.com'), 'http://x.com');
  const v = buildVCard(card({ urls: [{ label: 'Site', value: 'example.com' }] }));
  assert.ok(properties(v).includes('URL:https://example.com'));
});

test('BDAY only when ISO date', () => {
  assert.ok(buildVCard(card({ birthday: '1990-01-31' })).includes('BDAY:1990-01-31'));
  assert.ok(!buildVCard(card({ birthday: '31/01/1990' })).includes('BDAY'));
});

test('photo: valid JPEG data URL embedded base64, omitted for QR, invalid dropped', () => {
  const photo = `data:image/jpeg;base64,${Buffer.from('fakejpeg').toString('base64')}`;
  const full = buildVCard(card({ photo }));
  assert.ok(full.includes('PHOTO;ENCODING=b;TYPE=JPEG:'));
  const qr = buildVCard(card({ photo }), { photo: false });
  assert.ok(!qr.includes('PHOTO'));
  assert.ok(!buildVCard(card({ photo: 'data:image/svg+xml;base64,AAAA' })).includes('PHOTO'));
});

test('base64 photo folds without splitting the encoding', () => {
  const photo = `data:image/jpeg;base64,${Buffer.alloc(300, 7).toString('base64')}`;
  const v = buildVCard(card({ photo }));
  for (const line of v.split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75);
  }
  const unfolded = v.replace(/\r\n /g, '');
  assert.ok(unfolded.includes(photo.split(',')[1]));
});

test('normalizePipes folds full-width bars and collapses spacing', () => {
  assert.equal(normalizePipes('David｜陳大文'), 'David | 陳大文');
  assert.equal(normalizePipes('a  |  b'), 'a | b');
});

test('displayName falls back to family/given', () => {
  assert.equal(displayName({ family: 'Chan', given: 'Tai Man' }), 'Chan Tai Man');
  assert.equal(displayName({}), '');
});

test('orgDisplay joins bilingual org', () => {
  assert.equal(orgDisplay({ orgLatin: 'ACME', orgCJK: ' acme ' }), 'ACME | acme');
});

test('splitName: CJK surname-first, Latin last word family', () => {
  const c1 = { nameCJK: '歐陽大明', nameLatin: '' };
  splitName(c1);
  assert.equal(c1.family, '歐');
  assert.equal(c1.given, '陽大明');
  const c2 = { nameCJK: '', nameLatin: 'David (Dave) Chan' };
  splitName(c2);
  assert.equal(c2.family, 'Chan');
  assert.equal(c2.given, 'David');
  const c3 = { family: 'Explicit', nameCJK: '陳大文' };
  splitName(c3);
  assert.equal(c3.family, 'Explicit');
});

test('suggestedFileName sanitizes path-hostile characters', () => {
  assert.equal(suggestedFileName({ nameLatin: 'David Chan', nameCJK: '陳大文' }), 'David Chan 陳大文.vcf');
  assert.equal(suggestedFileName({ nameLatin: 'a/b:c*d' }), 'a b c d.vcf');
  assert.equal(suggestedFileName({}), 'contact.vcf');
});