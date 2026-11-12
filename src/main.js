import { buildVCard, displayName, orgDisplay, normalizeUrl, suggestedFileName } from './vcard.js';
import {
  defaultCard, normalizeCard, forOutput, hasContent, addressText,
  emptyPhone, emptyEmail, emptyAddress, emptyUrl,
  PHONE_TYPES, EMAIL_TYPES, ADDRESS_TYPES,
} from './model.js';
import { qrPayload, qrSvg, qrPngDataUrl, QR_MAX_BYTES } from './qr.js';
import { t, onLocaleChange, bindLocaleToggle } from './i18n.js';
import './style.css';

const STORE_KEY = 'enamecard.card.v1';

let card = loadStored();
let published = null;
let qrMode = 'auto';

const editorView = document.getElementById('editor-view');
const cardView = document.getElementById('card-view');
const form = document.getElementById('card-form');
const previewPanel = document.getElementById('preview-panel');

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalizeCard(JSON.parse(raw));
  } catch {
    // Corrupt storage falls through to a fresh card.
  }
  return defaultCard();
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(card));
  } catch {
    // Storage full or refused — the export button remains the way out.
  }
}

/** Bilingual label: fixed English half + script-swapping Chinese half. */
function bi(en, key) {
  return `${en} · ${t(key)}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ------------------------------------------------------------------ form */

const SECTIONS = [
  {
    id: 'name', en: 'Name', key: 'sec-name',
    fields: [
      { key: 'nameCJK', en: 'Chinese name', i18n: 'name-cjk', ph: '陳大文' },
      { key: 'nameLatin', en: 'English name', i18n: 'name-latin', ph: 'David Chan' },
      { key: 'family', en: 'Family name', i18n: 'family', ac: 'family-name' },
      { key: 'given', en: 'Given name', i18n: 'given', ac: 'given-name' },
      { key: 'middle', en: 'Middle name', i18n: 'middle', ac: 'additional-name' },
      { key: 'phoneticGiven', en: 'Phonetic given', i18n: 'phonetic-given' },
      { key: 'phoneticFamily', en: 'Phonetic family', i18n: 'phonetic-family' },
      { key: 'nickname', en: 'Nickname', i18n: 'nickname', ac: 'nickname' },
    ],
  },
  {
    id: 'work', en: 'Company & role', key: 'sec-work',
    fields: [
      { key: 'orgLatin', en: 'Company (English)', i18n: 'org-latin', ac: 'organization', ph: 'Example Limited' },
      { key: 'orgCJK', en: 'Company (Chinese)', i18n: 'org-cjk', ph: '範例有限公司' },
      { key: 'department', en: 'Department', i18n: 'department' },
      { key: 'title', en: 'Job title', i18n: 'title', ac: 'organization-title' },
    ],
  },
];

const TYPE_KEYS = { CELL: 'type-cell', WORK: 'type-work', HOME: 'type-home', FAX: 'type-fax', OTHER: 'type-other' };
const TYPE_EN = { CELL: 'Mobile', WORK: 'Work', HOME: 'Home', FAX: 'Fax', OTHER: 'Other' };

function typeSelect(types, value, label) {
  const select = el('select');
  select.setAttribute('aria-label', label);
  for (const type of types) {
    const option = el('option', '', bi(type[0] + type.slice(1).toLowerCase(), TYPE_KEYS[type]));
    option.value = type;
    select.append(option);
  }
  select.value = value;
  return select;
}

function fieldInput(field) {
  const input = el(field.tag === 'textarea' ? 'textarea' : 'input');
  if (field.tag !== 'textarea') input.type = field.type || 'text';
  if (field.ac) input.autocomplete = field.ac;
  if (field.ph) input.placeholder = field.ph;
  input.value = card[field.key] || '';
  input.addEventListener('input', () => {
    card[field.key] = input.value;
    persist();
    updatePreview();
  });
  return input;
}

function labeledField(field) {
  const label = el('label', 'field');
  label.append(el('span', 'label-text', bi(field.en, field.i18n)), fieldInput(field));
  return label;
}

function section(titleEn, titleKey) {
  const fieldset = el('fieldset', 'card-panel');
  fieldset.append(el('legend', '', bi(titleEn, titleKey)));
  return fieldset;
}

function renderForm() {
  form.textContent = '';

  if (published) {
    const nav = el('p', 'editor-nav');
    const back = el('a', '', `← ${bi('View published card', 'view-card')}`);
    back.href = '#card';
    nav.append(back);
    form.append(nav);
  }

  for (const sec of SECTIONS) {
    const fieldset = section(sec.en, sec.key);
    for (const field of sec.fields) fieldset.append(labeledField(field));
    // Name section: add a bilingual-contact guidance block so users understand
    // how their form inputs map to what shows up on the other person's phone.
    if (sec.id === 'name') {
      fieldset.append(el('p', 'hint', bi(
        'What your contacts will see on their phone:', 'contact-preview-hint')));
      fieldset.append(el('p', 'hint', bi(
        'Fill in both "English name" and "Chinese name" for a bilingual display ("Ivan Chong | 莊庭皓"). Leave "Family name" and "Given name" empty — the app derives them automatically.',
        'bilingual-tip')));
      fieldset.append(el('p', 'hint', bi(
        'Use a square or portrait photo (e.g. a headshot). Wide banner images become too narrow for a contact avatar.',
        'photo-tips')));
    }
    form.append(fieldset);
  }

  form.append(repeatableSection('phones', 'Phone numbers', 'sec-phones', PHONE_TYPES, emptyPhone, [
    { key: 'value', en: 'Number', i18n: 'phone', type: 'tel', ac: 'tel', ph: '+852 6123 4567' },
  ]));
  form.append(repeatableSection('emails', 'Email addresses', 'sec-emails', EMAIL_TYPES, emptyEmail, [
    { key: 'value', en: 'Email', i18n: 'email', type: 'email', ac: 'email', ph: 'david@example.com' },
  ]));
  form.append(repeatableSection('addresses', 'Addresses', 'sec-addresses', ADDRESS_TYPES, emptyAddress, [
    { key: 'street', en: 'Street', i18n: 'street', ac: 'street-address' },
    { key: 'city', en: 'City', i18n: 'city', ac: 'address-level2' },
    { key: 'region', en: 'State / province', i18n: 'region', ac: 'address-level1' },
    { key: 'code', en: 'Postal code', i18n: 'code', ac: 'postal-code' },
    { key: 'country', en: 'Country / region', i18n: 'country', ac: 'country' },
  ]));
  form.append(repeatableSection('urls', 'Links', 'sec-links', null, emptyUrl, [
    { key: 'label', en: 'Label', i18n: 'url-label', ph: 'LinkedIn' },
    { key: 'value', en: 'URL', i18n: 'url', type: 'url', ph: 'https://example.com' },
  ]));

  const extra = section('Birthday & note', 'sec-extra');
  extra.append(labeledField({ key: 'birthday', en: 'Birthday', i18n: 'birthday', type: 'date', ac: 'bday' }));
  extra.append(labeledField({ key: 'note', en: 'Note', i18n: 'note', tag: 'textarea' }));
  form.append(extra);

  form.append(photoSection());
  form.append(publishSection());
}

/** One section of repeatable rows: phones, emails, addresses, urls. */
function repeatableSection(key, titleEn, titleKey, types, makeEmpty, fields) {
  const fieldset = section(titleEn, titleKey);
  const rows = el('div', 'rows');
  fieldset.append(rows);

  function renderRows() {
    rows.textContent = '';
    card[key].forEach((item, index) => {
      const row = el('div', 'row');
      if (types) {
        const select = typeSelect(types, item.type, titleEn);
        select.addEventListener('change', () => {
          item.type = select.value;
          persist();
          updatePreview();
        });
        row.append(select);
      }
      for (const field of fields) {
        const input = el('input');
        input.type = field.type || 'text';
        if (field.ac) input.autocomplete = field.ac;
        if (field.ph) input.placeholder = field.ph;
        input.setAttribute('aria-label', bi(field.en, field.i18n));
        input.value = item[field.key] || '';
        input.addEventListener('input', () => {
          item[field.key] = input.value;
          persist();
          updatePreview();
        });
        row.append(input);
      }
      const remove = el('button', 'row-remove', '✕');
      remove.type = 'button';
      remove.setAttribute('aria-label', bi('Remove', 'remove'));
      remove.addEventListener('click', () => {
        card[key].splice(index, 1);
        if (!card[key].length) card[key].push(makeEmpty());
        persist();
        renderRows();
        updatePreview();
      });
      row.append(remove);
      rows.append(row);
    });
  }
  renderRows();

  const add = el('button', 'row-add', `+ ${bi('Add', 'add')}`);
  add.type = 'button';
  add.addEventListener('click', () => {
    card[key].push(makeEmpty(types ? types[0] : undefined));
    persist();
    renderRows();
    const inputs = rows.querySelectorAll('.row:last-child input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });
  fieldset.append(add);
  return fieldset;
}

function photoSection() {
  const fieldset = section('Photo', 'sec-photo');
  const file = el('input');
  file.type = 'file';
  file.accept = 'image/*';
  file.hidden = true;
  file.addEventListener('change', async () => {
    if (file.files && file.files[0]) await processPhoto(file.files[0]);
    file.value = '';
    remove.hidden = !card.photo;
  });
  const choose = el('button', '', bi('Choose photo', 'choose-photo'));
  choose.type = 'button';
  choose.addEventListener('click', () => file.click());
  const remove = el('button', '', bi('Remove', 'remove-photo'));
  remove.type = 'button';
  remove.hidden = !card.photo;
  remove.addEventListener('click', () => {
    card.photo = '';
    persist();
    remove.hidden = true;
    updatePreview();
  });
  const hint = el('p', 'hint', bi('Resized into the .vcf, never into the QR (capacity).', 'photo-hint'));
  fieldset.append(choose, remove, file, hint);
  return fieldset;
}

function publishSection() {
  const fieldset = section('Publishing', 'sec-publish');
  fieldset.append(labeledField({
    key: 'cardUrl', en: 'Published card URL', i18n: 'card-url', type: 'url',
    ph: 'https://user.github.io/eNameCard/',
  }));
  fieldset.append(el('p', 'hint', bi(
    'Fill in after deploying — the "Card link" QR points here.', 'card-url-hint')));
  fieldset.append(el('p', 'hint', bi(
    'Export card.json into your fork\'s public/ folder and push — that is your card page.', 'publish-hint')));
  return fieldset;
}

async function processPhoto(file) {
  try {
    const bitmap = await createImageBitmap(file);
    // Reject extremely wide/tall images (e.g. banners, screenshots) that would
    // produce unusable thumbnails when shrunk to fit 480 px on the long side.
    if (Math.max(bitmap.width, bitmap.height) / Math.min(bitmap.width, bitmap.height) > 4) {
      bitmap.close();
      return;
    }
    const scale = Math.min(1, 480 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    card.photo = canvas.toDataURL('image/jpeg', 0.85);
    persist();
    updatePreview();
  } catch {
    // Unreadable image — keep the previous photo.
  }
}

/* ------------------------------------------------------------- card view */

function initials(c) {
  const name = displayName(c) || orgDisplay(c) || '?';
  return name.trim().charAt(0).toUpperCase();
}

function contactRow(label, text, href) {
  const li = el('li', 'contact-row');
  li.append(el('span', 'contact-label', label));
  if (href) {
    const a = el('a', '', text);
    a.href = href;
    if (href.startsWith('http')) a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
  } else {
    li.append(el('span', '', text));
  }
  return li;
}

function renderCardInto(container, c) {
  container.textContent = '';
  const article = el('article', 'ncard card-panel');

  const head = el('div', 'ncard-head');
  if (c.photo) {
    const img = el('img', 'ncard-photo');
    img.src = c.photo;
    img.alt = '';
    head.append(img);
  } else {
    head.append(el('div', 'ncard-avatar', initials(c)));
  }
  const name = displayName(c);
  const role = [c.title, orgDisplay(c)].filter((v) => (v || '').trim()).join(' · ');
  const headText = el('div', 'ncard-headtext');
  headText.append(el('h2', 'ncard-name', name || t('card-empty')));
  if (role) headText.append(el('p', 'ncard-role', role));
  head.append(headText);
  article.append(head);

  const rows = el('ul', 'contact-rows');
  for (const p of c.phones) {
    if (!p.value.trim()) continue;
    rows.append(contactRow(bi(TYPE_EN[p.type] || 'Other', TYPE_KEYS[p.type] || 'type-other'), p.value.trim(),
      `tel:${p.value.replace(/[^+\d]/g, '')}`));
  }
  for (const e of c.emails) {
    if (!e.value.trim()) continue;
    rows.append(contactRow(bi(TYPE_EN[e.type] || 'Other', TYPE_KEYS[e.type] || 'type-other'), e.value.trim(), `mailto:${e.value.trim()}`));
  }
  for (const a of c.addresses) {
    const text = addressText(a);
    if (!text) continue;
    rows.append(contactRow(bi(TYPE_EN[a.type], TYPE_KEYS[a.type]), text,
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`));
  }
  for (const u of c.urls) {
    if (!u.value.trim()) continue;
    const href = normalizeUrl(u.value);
    rows.append(contactRow(u.label.trim() || 'URL', u.value.trim(), href));
  }
  if (c.birthday) rows.append(contactRow(bi('Birthday', 'birthday'), c.birthday));
  if (rows.children.length) article.append(rows);
  if (c.note.trim()) article.append(el('p', 'ncard-note', c.note.trim()));

  container.append(article);
}

/* ------------------------------------------------------------------- QR */

let previewEls = null;

function buildPreviewPanel() {
  previewPanel.textContent = '';
  const sticky = el('div', 'preview-sticky');

  const previewCard = el('div');
  previewCard.id = 'preview-card';
  sticky.append(previewCard);

  const qrPanel = el('div', 'qr-panel card-panel');
  qrPanel.append(el('h3', '', bi('QR code', 'qr-title')));
  const modes = el('div', 'qr-modes');
  for (const [value, en, key] of [['auto', 'Auto', 'qr-auto'], ['vcard', 'Offline vCard', 'qr-vcard'], ['url', 'Card link', 'qr-url']]) {
    const label = el('label', '');
    const radio = el('input');
    radio.type = 'radio';
    radio.name = 'qrmode';
    radio.value = value;
    radio.checked = value === qrMode;
    radio.addEventListener('change', () => {
      if (radio.checked) {
        qrMode = value;
        updatePreview();
      }
    });
    label.append(radio, el('span', '', bi(en, key)));
    modes.append(label);
  }
  qrPanel.append(modes);
  const qrBox = el('div', 'qr-box');
  qrBox.id = 'qr-box';
  const qrHint = el('p', 'hint');
  qrHint.id = 'qr-hint';
  const qrBytes = el('p', 'hint qr-bytes');
  qrBytes.id = 'qr-bytes';
  const pngBtn = el('button', '', bi('Download PNG', 'download-qr-png'));
  pngBtn.type = 'button';
  pngBtn.addEventListener('click', () => {
    const p = currentPayload();
    if (!p) return;
    const a = el('a');
    a.href = qrPngDataUrl(p.text);
    a.download = 'enamecard-qr.png';
    a.click();
  });
  const svgBtn = el('button', '', bi('Download SVG', 'download-qr-svg'));
  svgBtn.type = 'button';
  svgBtn.addEventListener('click', () => {
    const p = currentPayload();
    if (!p) return;
    download(new Blob([qrSvg(p.text)], { type: 'image/svg+xml' }), 'enamecard-qr.svg');
  });
  const btnRow = el('div', 'btn-row');
  btnRow.append(pngBtn, svgBtn);
  qrPanel.append(qrBox, qrHint, qrBytes, btnRow);
  sticky.append(qrPanel);

  const actions = el('div', 'actions card-panel');
  const vcfBtn = el('button', 'primary', bi('Download .vcf', 'download-vcf'));
  vcfBtn.type = 'button';
  vcfBtn.addEventListener('click', () => downloadVcf(card));
  actions.append(vcfBtn);
  actions.append(shareButton(() => card, 'Share contact', () => card.cardUrl.trim() || location.href.split('#')[0]));
  const exportBtn = el('button', '', bi('Export card.json', 'export-json'));
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => {
    download(new Blob([JSON.stringify(card, null, 2) + '\n'], { type: 'application/json' }), 'card.json');
  });
  const importBtn = el('button', '', bi('Import card.json', 'import-json'));
  importBtn.type = 'button';
  const importFile = el('input');
  importFile.type = 'file';
  importFile.accept = 'application/json,.json';
  importFile.hidden = true;
  importBtn.addEventListener('click', () => importFile.click());
  const importStatus = el('p', 'hint');
  importFile.addEventListener('change', async () => {
    if (!importFile.files || !importFile.files[0]) return;
    try {
      card = normalizeCard(JSON.parse(await importFile.files[0].text()));
      persist();
      renderForm();
      updatePreview();
      importStatus.textContent = '';
    } catch {
      importStatus.textContent = t('import-error');
    }
    importFile.value = '';
  });
  actions.append(exportBtn, importBtn, importFile, importStatus);
  actions.append(el('p', 'hint', bi('Auto-saved in this browser; export a backup anytime.', 'local-hint')));
  sticky.append(actions);

  previewPanel.append(sticky);
  previewEls = { previewCard, qrBox, qrHint, qrBytes };
}

function currentPayload() {
  const out = forOutput(card);
  if (!hasContent(out)) return null;
  const pageUrl = card.cardUrl.trim() || location.href.split('#')[0];
  return qrPayload(card, qrMode, pageUrl);
}

function updatePreview() {
  if (!previewEls) return;
  const out = forOutput(card);
  renderCardInto(previewEls.previewCard, out);
  const p = currentPayload();
  if (!p) {
    previewEls.qrBox.textContent = '';
    previewEls.qrHint.textContent = bi('Fill in the form to preview your card.', 'preview-empty');
    previewEls.qrBytes.textContent = '';
    return;
  }
  previewEls.qrBox.innerHTML = qrSvg(p.text);
  let hint = t(`qr-hint-${qrMode}`);
  if (p.fallback === 'size') hint = t('qr-fallback-size', { bytes: QR_MAX_BYTES });
  else if (p.fallback === 'too-large') hint = t('qr-fallback-too-large');
  else if (p.fallback === 'no-url') hint = t('qr-fallback-no-url');
  previewEls.qrHint.textContent = hint;
  previewEls.qrBytes.textContent = p.kind === 'vcard' ? t('qr-bytes', { bytes: p.bytes }) : p.text;
}

/* --------------------------------------------------------------- actions */

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = el('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function vcfFile(c) {
  return new File([buildVCard(forOutput(c))], suggestedFileName(forOutput(c)), { type: 'text/vcard' });
}

function downloadVcf(c) {
  download(new Blob([buildVCard(forOutput(c))], { type: 'text/vcard;charset=utf-8' }), suggestedFileName(forOutput(c)));
}

function canShareVcf() {
  if (!navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([''], 'x.vcf', { type: 'text/vcard' })] });
  } catch {
    return false;
  }
}

async function shareVcf(c, anchor, getLink) {
  if (canShareVcf()) {
    try {
      await navigator.share({ files: [vcfFile(c)], title: displayName(forOutput(c)) });
      return;
    } catch (err) {
      // AbortError = user closed the share sheet. Anything else (desktop
      // Chrome rejects .vcf files) falls through to the in-page menu.
      if (err && err.name === 'AbortError') return;
    }
  }
  openShareMenu(c, anchor, getLink());
}

/* ------------------------------------------------------------- share menu */

let closeShareMenu = null;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API refused — legacy selection copy.
    const ta = el('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function openShareMenu(c, anchor, link) {
  if (closeShareMenu) closeShareMenu();
  const out = forOutput(c);
  const menu = el('div', 'share-menu');
  menu.setAttribute('aria-label', bi('Share options', 'share-options'));

  const close = (restoreFocus) => {
    menu.remove();
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', onScroll, true);
    anchor.setAttribute('aria-expanded', 'false');
    if (restoreFocus) anchor.focus();
    closeShareMenu = null;
  };
  const onOutside = (e) => {
    if (!menu.contains(e.target) && !anchor.contains(e.target)) close(false);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close(true);
  };
  const onScroll = (e) => {
    if (!menu.contains(e.target)) close(false);
  };

  const item = (label, onClick) => {
    const b = el('button', '', label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    menu.append(b);
    return b;
  };
  const copyItem = (label, text) => {
    const b = item(label, async () => {
      if (await copyText(text)) {
        b.textContent = bi('Copied', 'copied');
        b.classList.add('copied');
        setTimeout(() => {
          b.textContent = label;
          b.classList.remove('copied');
        }, 1600);
      } else {
        let box = menu.querySelector('.manual-copy');
        if (!box) {
          box = el('div', 'manual-copy');
          box.append(el('p', 'hint', bi('Copy the text below manually.', 'copy-manual')));
          box.append(el('textarea'));
          menu.append(box);
        }
        const ta = box.querySelector('textarea');
        ta.readOnly = true;
        ta.rows = 4;
        ta.value = text;
        ta.focus();
        ta.select();
      }
    });
    return b;
  };

  copyItem(bi('Copy card link', 'copy-link'), link);
  copyItem(bi('Copy vCard text', 'copy-vcard'), buildVCard(out));
  const email = el('a', '', bi('Send by email', 'email-contact'));
  const name = displayName(out);
  email.href = `mailto:?subject=${encodeURIComponent(`Contact: ${name}`)}&body=${encodeURIComponent(`${name}\n${link}`)}`;
  email.addEventListener('click', () => close(false));
  menu.append(email);

  document.body.append(menu);
  const rect = anchor.getBoundingClientRect();
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - mw - 8))}px`;
  menu.style.top = rect.bottom + mh + 12 > window.innerHeight && rect.top > mh
    ? `${rect.top - mh - 6}px`
    : `${rect.bottom + 6}px`;

  document.addEventListener('pointerdown', onOutside, true);
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('scroll', onScroll, true);
  anchor.setAttribute('aria-expanded', 'true');
  closeShareMenu = close;
  menu.querySelector('button').focus();
}

function shareButton(getCard, labelEn, getLink) {
  const b = el('button', '', bi(labelEn, 'share-vcf'));
  b.type = 'button';
  b.setAttribute('aria-expanded', 'false');
  b.addEventListener('click', () => {
    if (closeShareMenu) {
      closeShareMenu(false);
      return;
    }
    shareVcf(getCard(), b, getLink);
  });
  return b;
}

/* -------------------------------------------------------- published card */

function renderPublished() {
  const c = published.card;
  document.title = `${displayName(forOutput(c))} — eNameCard`;
  cardView.textContent = '';

  if (published.sample) {
    cardView.append(el('p', 'sample-banner', bi('This is a sample card — make it yours at #edit.', 'sample-banner')));
  }

  const wrap = el('div', 'published-wrap');
  const cardHost = el('div');
  renderCardInto(cardHost, forOutput(c));
  wrap.append(cardHost);

  const actions = el('div', 'btn-row published-actions');
  const save = el('button', 'primary', bi('Save contact', 'save-contact'));
  save.type = 'button';
  save.addEventListener('click', () => downloadVcf(c));
  actions.append(save);
  actions.append(shareButton(() => c, 'Share', () => location.href.split('#')[0]));
  wrap.append(actions);

  const qrPanel = el('div', 'qr-panel card-panel');
  qrPanel.append(el('h3', '', bi('Scan to save my contact', 'qr-title')));
  const pageUrl = location.href.split('#')[0];
  const p = qrPayload(c, 'auto', pageUrl);
  const qrBox = el('div', 'qr-box');
  qrBox.innerHTML = qrSvg(p.text);
  qrPanel.append(qrBox);
  qrPanel.append(el('p', 'hint', p.kind === 'vcard' ? t('qr-hint-vcard') : t('qr-hint-url')));
  wrap.append(qrPanel);

  const footer = el('div', 'published-footer');
  const editCopy = el('button', '', bi('Edit a copy', 'edit-copy'));
  editCopy.type = 'button';
  editCopy.addEventListener('click', () => {
    card = normalizeCard(c);
    persist();
    location.hash = '#edit';
  });
  const own = el('a', '', bi('Create your own eNameCard', 'create-own'));
  own.href = 'https://github.com/chongtinghoivan/eNameCard';
  own.rel = 'noopener';
  footer.append(editCopy, own);
  wrap.append(footer);

  cardView.append(wrap);
}

/* ----------------------------------------------------------------- boot */

async function fetchPublished() {
  try {
    const res = await fetch('card.json', { cache: 'no-cache' });
    if (!res.ok) return null;
    if (!(res.headers.get('content-type') || '').includes('json')) return null;
    const raw = await res.json();
    const c = normalizeCard(raw);
    if (!hasContent(c)) return null;
    return { card: c, sample: raw.sample === true };
  } catch {
    return null;
  }
}

function route() {
  if (closeShareMenu) closeShareMenu();
  const wantEditor = location.hash === '#edit' || !published;
  editorView.hidden = !wantEditor;
  cardView.hidden = wantEditor;
  if (wantEditor) {
    document.title = 'eNameCard — create your own digital name card';
    renderForm();
    buildPreviewPanel();
    updatePreview();
  } else {
    renderPublished();
  }
}

async function boot() {
  form.addEventListener('submit', (e) => e.preventDefault());
  published = await fetchPublished();
  bindLocaleToggle();
  onLocaleChange(route);
  window.addEventListener('hashchange', route);
  route();
}

boot();