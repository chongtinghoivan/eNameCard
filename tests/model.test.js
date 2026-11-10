import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultCard, normalizeCard, forOutput, hasContent, addressText } from '../src/model.js';

test('normalizeCard of garbage returns a usable default card', () => {
  for (const raw of [null, undefined, 42, 'x', []]) {
    const c = normalizeCard(raw);
    assert.equal(c.phones.length, 1);
    assert.equal(c.emails.length, 1);
    assert.equal(c.addresses.length, 1);
    assert.equal(c.urls.length, 1);
    assert.equal(c.nameCJK, '');
  }
});

test('normalizeCard drops unknown keys and coerces wrong types', () => {
  const c = normalizeCard({ nameCJK: '陳大文', evil: '<script>', title: 42, phones: 'nope' });
  assert.equal(c.nameCJK, '陳大文');
  assert.ok(!('evil' in c));
  assert.equal(c.title, '');
  assert.equal(c.phones.length, 1);
});

test('normalizeCard filters malformed rows and clamps types', () => {
  const c = normalizeCard({
    phones: [null, { type: 'INVALID', value: '123' }, { value: 55 }],
    emails: [{ type: 'HOME', value: 'a@x.com' }],
    urls: [{ label: 'X', value: 'https://x.com' }, 7],
  });
  assert.deepEqual(c.phones, [{ type: 'OTHER', value: '123' }, { type: 'OTHER', value: '' }]);
  assert.deepEqual(c.emails, [{ type: 'HOME', value: 'a@x.com' }]);
  assert.deepEqual(c.urls, [{ label: 'X', value: 'https://x.com' }]);
});

test('photo whitelist: only JPEG data URLs survive', () => {
  assert.equal(normalizeCard({ photo: 'data:image/jpeg;base64,AAA' }).photo, 'data:image/jpeg;base64,AAA');
  assert.equal(normalizeCard({ photo: 'https://evil.example/x.jpg' }).photo, '');
  assert.equal(normalizeCard({ photo: 'data:image/png;base64,AAA' }).photo, '');
});

test('birthday must be ISO', () => {
  assert.equal(normalizeCard({ birthday: '1990-01-01' }).birthday, '1990-01-01');
  assert.equal(normalizeCard({ birthday: 'tomorrow' }).birthday, '');
});

test('hasContent requires a name or org', () => {
  assert.equal(hasContent(defaultCard()), false);
  assert.equal(hasContent(normalizeCard({ nameCJK: '陳' })), true);
  assert.equal(hasContent(normalizeCard({ orgLatin: 'ACME' })), true);
  assert.equal(hasContent(normalizeCard({ note: 'just a note' })), false);
});

test('forOutput strips empty rows and derives the name split', () => {
  const c = forOutput(normalizeCard({
    nameLatin: 'David Chan',
    phones: [{ type: 'CELL', value: '  ' }, { type: 'WORK', value: '123' }],
    urls: [{ label: '', value: '' }],
    addresses: [{ type: 'WORK', street: '', city: '', region: '', code: '', country: '' }],
  }));
  assert.equal(c.family, 'Chan');
  assert.equal(c.given, 'David');
  assert.equal(c.phones.length, 1);
  assert.equal(c.urls.length, 0);
  assert.equal(c.addresses.length, 0);
});

test('addressText joins non-empty parts', () => {
  assert.equal(addressText({ street: '1 Road', city: 'HK', region: '', code: '', country: 'HK' }), '1 Road, HK, HK');
  assert.equal(addressText({ street: '', city: '', region: '', code: '', country: '' }), '');
});