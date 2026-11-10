import { splitName } from './vcard.js';

export const PHONE_TYPES = ['CELL', 'WORK', 'HOME', 'FAX', 'OTHER'];
export const EMAIL_TYPES = ['WORK', 'HOME', 'OTHER'];
export const ADDRESS_TYPES = ['WORK', 'HOME'];

export function emptyPhone(type = 'CELL') {
  return { type, value: '' };
}
export function emptyEmail(type = 'WORK') {
  return { type, value: '' };
}
export function emptyAddress(type = 'WORK') {
  return { type, street: '', city: '', region: '', code: '', country: '' };
}
export function emptyUrl() {
  return { label: '', value: '' };
}

export function defaultCard() {
  return {
    nameCJK: '',
    nameLatin: '',
    family: '',
    given: '',
    middle: '',
    phoneticGiven: '',
    phoneticFamily: '',
    nickname: '',
    orgLatin: '',
    orgCJK: '',
    department: '',
    title: '',
    phones: [emptyPhone()],
    emails: [emptyEmail()],
    addresses: [emptyAddress()],
    urls: [emptyUrl()],
    birthday: '',
    note: '',
    photo: '',
    cardUrl: '',
  };
}

const STRING_FIELDS = [
  'nameCJK', 'nameLatin', 'family', 'given', 'middle', 'phoneticGiven', 'phoneticFamily',
  'nickname', 'orgLatin', 'orgCJK', 'department', 'title', 'birthday', 'note', 'photo', 'cardUrl',
];

function str(v) {
  return typeof v === 'string' ? v : '';
}

function pickType(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/**
 * Coerce arbitrary parsed JSON (import file, public/card.json) into the model.
 * Unknown keys are dropped, wrong types fall back to defaults — a malformed
 * card.json degrades to an empty card instead of throwing.
 */
export function normalizeCard(raw) {
  const c = defaultCard();
  if (!raw || typeof raw !== 'object') return c;
  for (const key of STRING_FIELDS) c[key] = str(raw[key]);
  if (Array.isArray(raw.phones)) {
    c.phones = raw.phones
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({ type: pickType(p.type, PHONE_TYPES, 'OTHER'), value: str(p.value) }));
  }
  if (Array.isArray(raw.emails)) {
    c.emails = raw.emails
      .filter((e) => e && typeof e === 'object')
      .map((e) => ({ type: pickType(e.type, EMAIL_TYPES, 'OTHER'), value: str(e.value) }));
  }
  if (Array.isArray(raw.addresses)) {
    c.addresses = raw.addresses
      .filter((a) => a && typeof a === 'object')
      .map((a) => ({
        type: pickType(a.type, ADDRESS_TYPES, 'WORK'),
        street: str(a.street), city: str(a.city), region: str(a.region),
        code: str(a.code), country: str(a.country),
      }));
  }
  if (Array.isArray(raw.urls)) {
    c.urls = raw.urls
      .filter((u) => u && typeof u === 'object')
      .map((u) => ({ label: str(u.label), value: str(u.value) }));
  }
  if (!c.phones.length) c.phones = [emptyPhone()];
  if (!c.emails.length) c.emails = [emptyEmail()];
  if (!c.addresses.length) c.addresses = [emptyAddress()];
  if (!c.urls.length) c.urls = [emptyUrl()];
  if (!/^data:image\/jpeg;base64,/.test(c.photo)) c.photo = '';
  if (c.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(c.birthday)) c.birthday = '';
  return c;
}

/** True when the card has at least a name or an organization to show. */
export function hasContent(c) {
  return Boolean(
    (c.nameCJK || '').trim() || (c.nameLatin || '').trim() ||
    (c.family || '').trim() || (c.given || '').trim() ||
    (c.orgLatin || '').trim() || (c.orgCJK || '').trim(),
  );
}

/** Clean copy ready for vCard output: trims strings, derives family/given. */
export function forOutput(c) {
  const out = normalizeCard(c);
  splitName(out);
  out.phones = out.phones.filter((p) => p.value.trim());
  out.emails = out.emails.filter((e) => e.value.trim());
  out.urls = out.urls.filter((u) => u.value.trim());
  out.addresses = out.addresses.filter((a) =>
    [a.street, a.city, a.region, a.code, a.country].some((v) => v.trim()));
  return out;
}

/** Address parts joined for display and maps links. */
export function addressText(a) {
  return [a.street, a.city, a.region, a.code, a.country]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .join(', ');
}