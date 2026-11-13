import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STRINGS, LOCALES, t, getLocale, detectLocale, resolveInitialLocale,
} from '../src/i18n.js';

test('LOCALES is en / hant / hans', () => {
  assert.deepEqual(LOCALES, ['en', 'hant', 'hans']);
});

test('the 8 standalone-rendered strings carry an en value', () => {
  for (const k of [
    'card-empty', 'import-error', 'qr-bytes', 'qr-fallback-size',
    'qr-fallback-too-large', 'qr-fallback-no-url', 'qr-hint-vcard', 'qr-hint-url',
  ]) {
    assert.ok(typeof STRINGS[k].en === 'string' && STRINGS[k].en.length > 0, k);
  }
});

test('CJK values are curated, not auto-converted', () => {
  assert.equal(STRINGS.title.hant, '職位');
  assert.equal(STRINGS.title.hans, '职位');
  assert.equal(STRINGS['qr-hint-vcard'].hant,
    'QR 內藏完整 vCard，無需網絡即可掃描加入聯絡人（不含頭像）。');
});

test('detectLocale maps BCP-47 tags to supported locales', () => {
  assert.equal(detectLocale('zh-TW'), 'hant');
  assert.equal(detectLocale('zh-HK'), 'hant');
  assert.equal(detectLocale('zh-Hans'), 'hans');
  assert.equal(detectLocale('zh'), 'hans');
  assert.equal(detectLocale('en-US'), 'en');
  assert.equal(detectLocale('ja-JP'), 'en'); // un-translated -> English fallback
  assert.equal(detectLocale(''), 'en');
});

test('resolveInitialLocale: stored visitor choice beats owner pin', () => {
  // No localStorage in Node -> readStoredLocale() is null, so pinned applies.
  assert.equal(resolveInitialLocale('en'), 'en');
  assert.equal(resolveInitialLocale('hans'), 'hans');
});

test('resolveInitialLocale: corrupt/unknown pin falls back to detection', () => {
  assert.equal(resolveInitialLocale('not-a-locale'), 'en'); // detect of navigator (absent)
  assert.equal(resolveInitialLocale(''), 'en');
});

// t()/getLocale() reflect the active locale; default is hant in a fresh module.
test('t() defaults to Traditional and substitutes {bytes}', () => {
  assert.equal(getLocale(), 'hant');
  assert.equal(t('qr-bytes', { bytes: 120 }), 'vCard 120 字元組');
});

test('unknown key returns the key itself', () => {
  assert.equal(t('does-not-exist'), 'does-not-exist');
});
