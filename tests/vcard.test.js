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

test('bilingual card without structured N: FN is a space-joined name (no pipe, stays searchable)', () => {
  const v = buildVCard(card({ nameLatin: 'David Chan', nameCJK: '陳大文' }));
  // A raw card (no N derived by splitName) must not fall back to the pipe,
  // which iOS does not index for search.
  assert.ok(properties(v).includes('FN:David Chan 陳大文'));
  assert.ok(!v.includes('FN:David Chan | 陳大文'));
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

test('bilingual card: combined "Latin CJK" name in N + FN, phonetic fields keep the Latin reading', () => {
  const c = forOutput(card({ nameCJK: '莊庭皓', nameLatin: 'Ivan Chong' }));
  const v = buildVCard(c);
  const props = properties(v);
  // iOS displays + indexes N, not the pipe-joined FN. splitName puts the
  // combined bilingual name in the given slot so both scripts show in the
  // contact list and both are findable in search.
  assert.ok(props.includes('N:;Ivan Chong 莊庭皓;;;'), `N must carry the combined name, got: ${props.filter((p) => p.startsWith('N:'))}`);
  assert.ok(props.includes('FN:Ivan Chong 莊庭皓'), 'FN mirrors the space-joined bilingual name (no pipe)');
  assert.ok(props.includes('X-PHONETIC-FIRST-NAME:Ivan'));
  assert.ok(props.includes('X-PHONETIC-LAST-NAME:Chong'));
  assert.ok(!props.some((p) => p.startsWith('NICKNAME')), 'NICKNAME must not steal the iOS display slot');
});

test('CJK-only card: N falls back to the CJK surname-first split', () => {
  const c = forOutput(card({ nameCJK: '陳大文', nameLatin: '' }));
  const v = buildVCard(c);
  assert.ok(properties(v).includes('N:陳;大文;;;'));
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

test('URLs normalize to https; labels become itemN groups (iOS link captions)', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('http://x.com'), 'http://x.com');
  const v = buildVCard(card({
    urls: [
      { label: 'LinkedIn', value: 'linkedin.com' },
      { label: '', value: 'plain.example' },
      { label: 'Tech Journal', value: 'x.com/journal.md' },
    ],
  }));
  const props = properties(v);
  // Apple's Address Book extension, grouped form: iOS shows the X-ABLabel
  // caption above the link. A/B testing on-device: the parameter form
  // (URL;X-ABLabel=...) is silently ignored; only itemN groups render.
  assert.ok(props.includes('item1.URL:https://linkedin.com'), 'labelled URL is item1');
  assert.ok(props.includes('item1.X-ABLabel:LinkedIn'));
  assert.ok(props.includes('item2.URL:https://x.com/journal.md'), 'second label group is item2');
  assert.ok(props.includes('item2.X-ABLabel:Tech Journal'));
  assert.ok(props.includes('URL:https://plain.example'), 'unlabelled link stays a plain URL');
});

test('URL group label escaping: vCard TEXT escapes keep the value well-formed', () => {
  const v = buildVCard(card({ urls: [{ label: 'a;b', value: 'example.com' }] }));
  const props = properties(v);
  assert.ok(props.includes('item1.URL:https://example.com'));
  assert.ok(props.includes('item1.X-ABLabel:a\\;b'), 'semicolon in a TEXT value is backslash-escaped');
});

test('URL group form folds at 75 octets like any property', () => {
  const v = buildVCard(card({ urls: [{ label: 'X', value: 'https://very-long-domain.example/' + 'a'.repeat(200) }] }));
  for (const line of v.split('\r\n')) {
    assert.ok(Buffer.byteLength(line) <= 75, `line over 75 octets: ${Buffer.byteLength(line)}`);
  }
  assert.ok(properties(v).some((l) => l.startsWith('item1.X-ABLabel:X')), 'group survives unfolding');
});

test('BDAY only when ISO date', () => {
  assert.ok(buildVCard(card({ birthday: '1990-01-31' })).includes('BDAY:1990-01-31'));
  assert.ok(!buildVCard(card({ birthday: '31/01/1990' })).includes('BDAY'));
});

test('photo: valid JPEG data URL embedded base64, omitted for QR, invalid dropped', () => {
  const photo = `data:image/jpeg;base64,${Buffer.from('fakejpeg').toString('base64')}`;
  const full = buildVCard(card({ photo }));
  // Canonical RFC 2426 / Apple-compatible form: ENCODING=BASE64 + TYPE=JPEG.
  assert.ok(full.includes('PHOTO;ENCODING=BASE64;TYPE=JPEG:'));
  const qr = buildVCard(card({ photo }), { photo: false });
  assert.ok(!qr.includes('PHOTO'));
  assert.ok(!buildVCard(card({ photo: 'data:image/svg+xml;base64,AAAA' })).includes('PHOTO'));
});

test('photo base64 is folded onto 75-octet lines (Apple/round-trip form), still byte-identical', () => {
  const b64 = Buffer.alloc(400, 7).toString('base64'); // long, forces folding
  const photo = `data:image/jpeg;base64,${b64}`;
  const v = buildVCard(card({ photo, note: '中文字'.repeat(60) }));
  // Every physical line is RFC-conformant: at most 75 octets.
  for (const line of v.split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line.length}`);
  }
  // The PHOTO property line uses the canonical header; base64 is folded onto
  // continuation lines (line 2+ begins with a single space), not one giant line.
  const lines = v.split('\r\n');
  const photoIdx = lines.findIndex((l) => l.startsWith('PHOTO;'));
  assert.ok(photoIdx >= 0, 'PHOTO line present');
  assert.ok(lines[photoIdx].startsWith('PHOTO;ENCODING=BASE64;TYPE=JPEG:'), 'canonical PHOTO header');
  assert.ok(lines[photoIdx + 1].startsWith(' '), 'base64 continues onto a folded line');
  // Unfolding the folded lines restores the exact base64 -> byte-identical JPEG.
  const unfolded = v.replace(/\r\n /g, '');
  assert.ok(unfolded.includes(`PHOTO;ENCODING=BASE64;TYPE=JPEG:${b64}`));
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

test('splitName: bilingual -> combined "Latin CJK" given slot + phonetic Latin', () => {
  // Bilingual card: iOS shows/searches the N field, so combine both scripts
  // into the given slot and mirror the Latin reading into phonetic fields.
  const c0 = { nameCJK: '莊庭皓', nameLatin: 'Ivan Chong' };
  splitName(c0);
  assert.equal(c0.family, '');
  assert.equal(c0.given, 'Ivan Chong 莊庭皓');
  assert.equal(c0.phoneticFamily, 'Chong');
  assert.equal(c0.phoneticGiven, 'Ivan');
  // No Latin, CJK surname-first fallback.
  const c1 = { nameCJK: '歐陽大明', nameLatin: '' };
  splitName(c1);
  assert.equal(c1.family, '歐');
  assert.equal(c1.given, '陽大明');
  // No CJK, Latin last-word family.
  const c2 = { nameCJK: '', nameLatin: 'David (Dave) Chan' };
  splitName(c2);
  assert.equal(c2.family, 'Chan');
  assert.equal(c2.given, 'David');
  // Explicit family/given are never overwritten.
  const c3 = { family: 'Explicit', nameCJK: '陳大文' };
  splitName(c3);
  assert.equal(c3.family, 'Explicit');
});

test('suggestedFileName sanitizes path-hostile characters', () => {
  assert.equal(suggestedFileName({ nameLatin: 'David Chan', nameCJK: '陳大文' }), 'David Chan 陳大文.vcf');
  assert.equal(suggestedFileName({ nameLatin: 'a/b:c*d' }), 'a b c d.vcf');
  assert.equal(suggestedFileName({}), 'contact.vcf');
});