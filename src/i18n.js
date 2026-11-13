/**
 * UI locale for eNameCard: en / zh-Hant / zh-Hans.
 *
 * CJK locales render every control as "English - 中文"; the English locale
 * shows the English half only. The mapping is a curated dictionary (not a
 * fuzzy auto-converter) because scripts are not character-for-character
 * interchangeable. `en` values are present for the hint/error strings that
 * render via a standalone t() call; label keys go through bi() and take
 * their English from the literal at the call site.
 */

const I18N_KEY = 'enamecard.locale.v1';

/** All UI strings, keyed by a stable id. en = English, hant = 繁體, hans = 簡體. */
export const STRINGS = {
  "tagline": {
    "hant": "自製電子名片 · 一掃即存",
    "hans": "自制电子名片 · 一扫即存"
  },
  "trust": {
    "hant": "沒有分析、沒有後端、沒有帳戶。草稿只存在你的瀏覽器裡；只有你主動發布的名片會存到「你自己的」GitHub Pages，以純靜態檔案形式公開。",
    "hans": "没有分析、没有后端、没有账户。草稿只存在你的浏览器里；只有你主动发布的名片会存到「你自己的」GitHub Pages，以纯静态文件形式公开。"
  },
  "sec-name": {
    "en": "Name",
    "hant": "姓名",
    "hans": "姓名"
  },
  "sec-work": {
    "en": "Company & role",
    "hant": "公司與職位",
    "hans": "公司与职位"
  },
  "sec-phones": {
    "en": "Phone numbers",
    "hant": "電話",
    "hans": "电话"
  },
  "sec-emails": {
    "en": "Email addresses",
    "hant": "電郵",
    "hans": "电邮"
  },
  "sec-addresses": {
    "en": "Addresses",
    "hant": "地址",
    "hans": "地址"
  },
  "sec-links": {
    "en": "Links",
    "hant": "網址與社交連結",
    "hans": "网址与社交链接"
  },
  "sec-extra": {
    "en": "Birthday & note",
    "hant": "生日與備註",
    "hans": "生日与备注"
  },
  "sec-photo": {
    "en": "Photo",
    "hant": "頭像",
    "hans": "头像"
  },
  "sec-publish": {
    "en": "Publishing",
    "hant": "發佈",
    "hans": "发布"
  },
  "name-cjk": {
    "en": "Chinese name",
    "hant": "中文名",
    "hans": "中文名"
  },
  "name-latin": {
    "en": "English name",
    "hant": "英文名",
    "hans": "英文名"
  },
  "family": {
    "en": "Family name",
    "hant": "姓",
    "hans": "姓"
  },
  "given": {
    "en": "Given name",
    "hant": "名",
    "hans": "名"
  },
  "middle": {
    "en": "Middle name",
    "hant": "中间名",
    "hans": "中间名"
  },
  "phonetic-given": {
    "en": "Phonetic given",
    "hant": "名字拼音",
    "hans": "名字拼音"
  },
  "phonetic-family": {
    "en": "Phonetic family",
    "hant": "姓氏拼音",
    "hans": "姓氏拼音"
  },
  "nickname": {
    "en": "Nickname",
    "hant": "暱稱",
    "hans": "昵称"
  },
  "org-latin": {
    "en": "Company (English)",
    "hant": "公司英文名",
    "hans": "公司英文名"
  },
  "org-cjk": {
    "en": "Company (Chinese)",
    "hant": "公司中文名",
    "hans": "公司中文名"
  },
  "department": {
    "en": "Department",
    "hant": "部門",
    "hans": "部门"
  },
  "title": {
    "en": "Job title",
    "hant": "職位",
    "hans": "职位"
  },
  "phone": {
    "en": "Number",
    "hant": "電話號碼",
    "hans": "电话号码"
  },
  "email": {
    "en": "Email",
    "hant": "電郵地址",
    "hans": "电邮地址"
  },
  "street": {
    "en": "Street",
    "hant": "街道",
    "hans": "街道"
  },
  "city": {
    "en": "City",
    "hant": "城市",
    "hans": "城市"
  },
  "region": {
    "en": "State / province",
    "hant": "州／省",
    "hans": "州／省"
  },
  "code": {
    "en": "Postal code",
    "hant": "郵遞區號",
    "hans": "邮政编码"
  },
  "country": {
    "en": "Country / region",
    "hant": "國家／地區",
    "hans": "国家／地区"
  },
  "url-label": {
    "en": "Label",
    "hant": "標籤（如 LinkedIn）",
    "hans": "标签（如 LinkedIn）"
  },
  "url": {
    "en": "URL",
    "hant": "網址",
    "hans": "网址"
  },
  "birthday": {
    "en": "Birthday",
    "hant": "生日",
    "hans": "生日"
  },
  "note": {
    "en": "Note",
    "hant": "備註",
    "hans": "备注"
  },
  "card-url": {
    "en": "Published card URL",
    "hant": "名片發佈網址",
    "hans": "名片发布网址"
  },
  "type-cell": {
    "en": "Mobile",
    "hant": "手機",
    "hans": "手机"
  },
  "type-work": {
    "en": "Work",
    "hant": "公司",
    "hans": "公司"
  },
  "type-home": {
    "en": "Home",
    "hant": "住宅",
    "hans": "住宅"
  },
  "type-fax": {
    "en": "Fax",
    "hant": "傳真",
    "hans": "传真"
  },
  "type-other": {
    "en": "Other",
    "hant": "其他",
    "hans": "其他"
  },
  "add": {
    "en": "Add",
    "hant": "新增",
    "hans": "新增"
  },
  "remove": {
    "en": "Remove",
    "hant": "移除",
    "hans": "移除"
  },
  "download-vcf": {
    "en": "Download .vcf",
    "hant": "下載 .vcf",
    "hans": "下载 .vcf"
  },
  "share-vcf": {
    "hant": "分享聯絡人",
    "hans": "分享联系人"
  },
  "share-options": {
    "en": "Share options",
    "hant": "分享方式",
    "hans": "分享方式"
  },
  "copy-link": {
    "en": "Copy card link",
    "hant": "複製名片連結",
    "hans": "复制名片链接"
  },
  "copy-vcard": {
    "en": "Copy vCard text",
    "hant": "複製 vCard 文字",
    "hans": "复制 vCard 文字"
  },
  "email-contact": {
    "en": "Send by email",
    "hant": "以電郵傳送",
    "hans": "以电邮传送"
  },
  "copied": {
    "en": "Copied",
    "hant": "已複製",
    "hans": "已复制"
  },
  "copy-manual": {
    "en": "Copy the text below manually.",
    "hant": "請手動複製以下文字",
    "hans": "请手动复制以下文字"
  },
  "download-qr-png": {
    "en": "Download PNG",
    "hant": "下載 QR PNG",
    "hans": "下载 QR PNG"
  },
  "download-qr-svg": {
    "en": "Download SVG",
    "hant": "下載 QR SVG",
    "hans": "下载 QR SVG"
  },
  "export-json": {
    "en": "Export card.json",
    "hant": "匯出 card.json",
    "hans": "导出 card.json"
  },
  "import-json": {
    "en": "Import card.json",
    "hant": "匯入 card.json",
    "hans": "导入 card.json"
  },
  "save-contact": {
    "en": "Save contact",
    "hant": "儲存聯絡人",
    "hans": "储存联系人"
  },
  "create-own": {
    "en": "Create your own eNameCard",
    "hant": "製作自己的電子名片",
    "hans": "制作自己的电子名片"
  },
  "edit-copy": {
    "en": "Edit a copy",
    "hant": "編輯副本",
    "hans": "编辑副本"
  },
  "made-with": {
    "en": "Made with eNameCard",
    "hant": "以 eNameCard 製作",
    "hans": "以 eNameCard 制作"
  },
  "view-card": {
    "en": "View published card",
    "hant": "預覽名片",
    "hans": "预览名片"
  },
  "back-to-edit": {
    "hant": "返回編輯",
    "hans": "返回编辑"
  },
  "choose-photo": {
    "en": "Choose photo",
    "hant": "選擇頭像",
    "hans": "选择头像"
  },
  "remove-photo": {
    "en": "Remove",
    "hant": "移除頭像",
    "hans": "移除头像"
  },
  "qr-mode": {
    "hant": "QR 內容",
    "hans": "QR 内容"
  },
  "qr-auto": {
    "hant": "自動",
    "hans": "自动"
  },
  "qr-vcard": {
    "hant": "離線 vCard",
    "hans": "离线 vCard"
  },
  "qr-url": {
    "hant": "名片連結",
    "hans": "名片链接"
  },
  "qr-hint-auto": {
    "hant": "細名片直接編入 vCard，相機一掃即可加入通訊錄；超出負荷時改用名片連結。",
    "hans": "小名片直接编入 vCard，相机一扫即可加入通讯录；超出负荷时改用名片链接。"
  },
  "qr-hint-vcard": {
    "en": "The QR holds the full vCard - scan to add the contact, no internet needed (photo not included).",
    "hant": "QR 內藏完整 vCard，無需網絡即可掃描加入聯絡人（不含頭像）。",
    "hans": "QR 内藏完整 vCard，无需网络即可扫描加入联系人（不含头像）。"
  },
  "qr-hint-url": {
    "en": "The QR opens your published card page - the content can be updated any time after printing.",
    "hant": "QR 指向已發佈的名片頁，印刷後仍可隨時更新內容。",
    "hans": "QR 指向已发布的名片页，印刷后仍可随时更新内容。"
  },
  "qr-fallback-size": {
    "en": "vCard over {bytes} bytes - too dense for a QR code, so it now points to your card link.",
    "hant": "vCard 超過 {bytes} 字元組，QR 太密難掃 — 已自動改用名片連結。",
    "hans": "vCard 超过 {bytes} 字符组，QR 太密难扫 — 已自动改用名片链接。"
  },
  "qr-fallback-too-large": {
    "en": "vCard exceeds the QR capacity limit - it now points to your card link.",
    "hant": "vCard 超出 QR 容量上限 — 已改用名片連結。",
    "hans": "vCard 超出 QR 容量上限 — 已改用名片链接。"
  },
  "qr-fallback-no-url": {
    "en": "No card URL set - the QR embeds the vCard directly.",
    "hant": "未設定名片網址 — 改為直接編入 vCard。",
    "hans": "未设定名片网址 — 改为直接编入 vCard。"
  },
  "qr-bytes": {
    "en": "vCard {bytes} bytes",
    "hant": "vCard {bytes} 字元組",
    "hans": "vCard {bytes} 字符组"
  },
  "photo-hint": {
    "en": "Resized into the .vcf, never into the QR (capacity).",
    "hant": "頭像會縮細並存入 .vcf，但不會放入 QR（QR 容量有限）。",
    "hans": "头像会缩小并存入 .vcf，但不会放入 QR（QR 容量有限）。"
  },
  "card-url-hint": {
    "en": "Fill in after deploying — the \"Card link\" QR points here.",
    "hant": "部署後填寫，例如 https://user.github.io/eNameCard/ —「名片連結」QR 會指向此網址。",
    "hans": "部署后填写，例如 https://user.github.io/eNameCard/ —「名片链接」QR 会指向此网址。"
  },
  "publish-hint": {
    "en": "Export card.json into your fork\\'s public/ folder and push — that is your card page.",
    "hant": "匯出 card.json，放入 fork 出來的 repo 的 public/，推上 GitHub 即成你的名片頁。",
    "hans": "导出 card.json，放入 fork 出来的 repo 的 public/，推上 GitHub 即成你的名片页。"
  },
  "local-hint": {
    "en": "Auto-saved in this browser; export a backup anytime.",
    "hant": "內容自動儲存在此瀏覽器，可隨時匯出備份。",
    "hans": "内容自动储存在此浏览器，可随时导出备份。"
  },
  "preview-empty": {
    "en": "Fill in the form to preview your card.",
    "hant": "填寫左邊表格，名片即時預覽",
    "hans": "填写左边表单，名片即时预览"
  },
  "card-empty": {
    "en": "No card details yet",
    "hant": "這張名片未填寫任何資料",
    "hans": "这张名片未填写任何资料"
  },
  "sample-banner": {
    "en": "This is a sample card — make it yours at #edit.",
    "hant": "這是示範名片 — 到 #edit 製作你自己的。",
    "hans": "这是示范名片 — 到 #edit 制作你自己的。"
  },
  "import-error": {
    "en": "That file is not a valid card.json",
    "hant": "檔案不是有效的 card.json",
    "hans": "档案不是有效的 card.json"
  },
  "qr-title": {
    "en": "QR code",
    "hant": "掃描儲存聯絡人",
    "hans": "扫描储存联系人"
  },
  "contact-preview": {
    "hant": "聯絡人預覽",
    "hans": "联系人预览"
  },
  "contact-preview-hint": {
    "en": "What your contacts will see: the name shows both scripts combined (e.g. Ivan Chong 莊庭皓) and is searchable in either; the photo, phone and email are all saved. QR codes can\\u2019t carry the photo \\u2014 open the card link or download the .vcf to get the image.",
    "hant": "這些資料會出現在對方的手機聯絡人裡：姓名會同時顯示中文與英文（如「Ivan Chong 莊庭皓」），雙語都能搜尋；頭像、電話、電郵等其餘欄位也會一併存檔。QR 碼因容量限制不存頭像，需直接開啟名片連結或下載 .vcf 檔才能取得照片。",
    "hans": "这些数据会出现在对方的手机通讯录里：姓名会同时显示中文与英文（如「Ivan Chong 莊庭皓」），双语都能搜索；头像、电话、邮箱等其余字段也会一并存档。QR 码因容量限制不存头像，需直接打开名片链接或下载 .vcf 文件才能取得照片。"
  },
  "bilingual-tip": {
    "en": "Bilingual name: fill in both \"English name\" and \"Chinese name\"; leave \"Family name\" / \"Given name\" blank and the app works out the split. The .vcf also stores the English reading (phonetic fields) so AI and search can recognise it.",
    "hant": "雙語姓名：同時填寫「英文名」與「中文名」兩欄；「姓」與「名」留空即可，系統會自動推斷。下載的 .vcf 中，英文讀音會一併存檔（phonetic fields），AI 與搜尋都能辨識。",
    "hans": "双语姓名：同时填写「英文名」与「中文名」两栏；「姓」与「名」留空即可，系统会自动推断。下载的 .vcf 中，英文读音会一并存档（phonetic fields），AI 与搜索都能辨识。"
  },
  "photo-tips": {
    "en": "Use a square or portrait photo (e.g. a headshot). Extremely wide or tall images (over 4:1, like banners or screenshots) are rejected \\u2014 choose a headshot.",
    "hant": "建議使用方形或直向照片（如自拍頭像）。極端橫長圖（長寬比超過 4:1，如簽名條、截圖）會被直接拒絕，不會存檔；請重新選擇頭像照。",
    "hans": "建议使用方形或纵向照片（如自拍头像）。极端横长图（宽高比超过 4:1，如签名条、截图）会被直接拒绝，不会存档；请重新选择头像照。"
  },
  "photo-rejected": {
    "en": "Photo rejected: aspect ratio over 4:1 (too long or narrow). Use a square or portrait headshot — your current photo is unchanged.",
    "hant": "照片已被拒絕：長寬比超過 4:1（太長或太窄）。請改用方形或直向頭像照，現有用照片不受影響。",
    "hans": "照片已被拒绝：宽高比超过 4:1（太长或太窄）。请改用方形或纵向头像照，现用照片不受影响。"
  }
}
;

export const LOCALES = ['en', 'hant', 'hans'];

const BCP47 = { en: 'en', hant: 'zh-Hant', hans: 'zh-Hans' };

/**
 * The stored visitor choice, or null when absent/corrupt. Keeping this
 * separate (instead of a defaulting loadLocale) lets resolveInitialLocale tell
 * "never set" apart from "set to hant", so the owner pin / detection kick in.
 */
function readStoredLocale() {
  try {
    const v = localStorage.getItem(I18N_KEY);
    return LOCALES.includes(v) ? v : null;
  } catch {
    return null;
  }
}

/** Map a BCP-47 language tag (e.g. "zh-TW") to a supported locale. */
export function detectLocale(tag = '') {
  const l = String(tag || '').toLowerCase();
  if (l.startsWith('zh-hant') || l === 'zh-tw' || l === 'zh-hk' || l.startsWith('zh-mo')) return 'hant';
  if (l.startsWith('zh')) return 'hans';
  return 'en';
}

/**
 * Initial-locale precedence for a deployment:
 *   1. the visitor's explicit choice (stored) - they picked it, honour it
 *   2. the card owner's pinned locale (card.json uiLocale)
 *   3. browser detection, English for any language we do not translate yet
 */
export function resolveInitialLocale(pinned = '') {
  const stored = readStoredLocale();
  if (stored) return stored;
  if (LOCALES.includes(pinned)) return pinned;
  return detectLocale(typeof navigator !== 'undefined' ? navigator.language : '');
}

/** The active locale; flipped by applyLocale() so t()/bi() follow the switch. */
let locale = 'hant';

/** Subscribers fired after every applyLocale() - re-render JS-set text. */
const localeListeners = new Set();

export function onLocaleChange(listener) {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
}

/** The active locale id (e.g. "en", "hant", "hans"). */
export function getLocale() {
  return locale;
}

/** Look up the current locale's string, replacing {var} slots. */
export function t(key, vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return key;
  let text = entry[locale] ?? entry.hant;
  for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(value);
  return text;
}

export function saveLocale(value) {
  if (!LOCALES.includes(value)) return;
  try {
    localStorage.setItem(I18N_KEY, value);
  } catch {
    // A storage refusal should not block switching the visible language.
  }
}

/**
 * Apply a locale: rewrite every [data-i18n] element (the CJK half) and toggle
 * the .i18n-suffix wrappers (which carry the "·" separator + the CJK span).
 * In English the suffix is hidden so only the static English shows; in CJK the
 * suffix is visible and its inner span is rewritten to the locale's string.
 */
export function applyLocale(next) {
  locale = LOCALES.includes(next) ? next : 'hant';
  const lang = BCP47[locale] || BCP47.hant;
  const hide = locale === 'en';
  for (const suf of document.querySelectorAll('.i18n-suffix')) suf.style.display = hide ? 'none' : '';
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const entry = STRINGS[el.getAttribute('data-i18n')];
    if (!entry) continue;
    el.textContent = entry[locale] ?? entry.hant;
    el.lang = lang;
  }
  for (const sel of document.querySelectorAll('select[name="locale"]')) sel.value = locale;
  for (const input of document.querySelectorAll('input[name="locale"]')) input.checked = input.value === locale;
  for (const listener of localeListeners) listener(locale);
}

/**
 * Wire the masthead locale control (<select>; legacy radios still work),
 * applying the resolved initial locale (visitor choice → owner pin → detect).
 */
/**
 * Wire the masthead locale control (<select>; legacy radios still work),
 * applying the resolved initial locale (visitor choice → owner pin → detect).
 */
export function bindLocaleToggle(pinned = '') {
  applyLocale(resolveInitialLocale(pinned));
  for (const sel of document.querySelectorAll('select[name="locale"]')) {
    sel.addEventListener('change', () => {
      saveLocale(sel.value);
      applyLocale(sel.value);
    });
  }
  for (const input of document.querySelectorAll('input[name="locale"]')) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      saveLocale(input.value);
      applyLocale(input.value);
    });
  }
}
