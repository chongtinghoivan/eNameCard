/**
 * 繁/簡 script toggle for the app's Chinese labels, ported from eNameCard-v2.
 *
 * The UI is bilingual — every control reads "English · 中文". The English half
 * is fixed; only the Chinese half swaps script, and it swaps as a whole.
 * The mapping is a curated dictionary (not a fuzzy auto-converter) because the
 * two scripts are not character-for-character interchangeable.
 */

const I18N_KEY = 'enamecard.locale.v1';

/** Every Chinese string in the UI, keyed by a stable id. hant = 繁體, hans = 簡體. */
export const STRINGS = {
  tagline: { hant: '自製電子名片 · 一掃即存', hans: '自制电子名片 · 一扫即存' },
  trust: {
    hant: '沒有分析、沒有後端、沒有帳戶。草稿只存在你的瀏覽器裡；只有你主動發布的名片會存到「你自己的」GitHub Pages，以純靜態檔案形式公開。',
    hans: '没有分析、没有后端、没有账户。草稿只存在你的浏览器里；只有你主动发布的名片会存到「你自己的」GitHub Pages，以纯静态文件形式公开。',
  },
  'sec-name': { hant: '姓名', hans: '姓名' },
  'sec-work': { hant: '公司與職位', hans: '公司与职位' },
  'sec-phones': { hant: '電話', hans: '电话' },
  'sec-emails': { hant: '電郵', hans: '电邮' },
  'sec-addresses': { hant: '地址', hans: '地址' },
  'sec-links': { hant: '網址與社交連結', hans: '网址与社交链接' },
  'sec-extra': { hant: '生日與備註', hans: '生日与备注' },
  'sec-photo': { hant: '頭像', hans: '头像' },
  'sec-publish': { hant: '發佈', hans: '发布' },
  'name-cjk': { hant: '中文名', hans: '中文名' },
  'name-latin': { hant: '英文名', hans: '英文名' },
  family: { hant: '姓', hans: '姓' },
  given: { hant: '名', hans: '名' },
  middle: { hant: '中间名', hans: '中间名' },
  'phonetic-given': { hant: '名字拼音', hans: '名字拼音' },
  'phonetic-family': { hant: '姓氏拼音', hans: '姓氏拼音' },
  nickname: { hant: '暱稱', hans: '昵称' },
  'org-latin': { hant: '公司英文名', hans: '公司英文名' },
  'org-cjk': { hant: '公司中文名', hans: '公司中文名' },
  department: { hant: '部門', hans: '部门' },
  title: { hant: '職位', hans: '职位' },
  phone: { hant: '電話號碼', hans: '电话号码' },
  email: { hant: '電郵地址', hans: '电邮地址' },
  street: { hant: '街道', hans: '街道' },
  city: { hant: '城市', hans: '城市' },
  region: { hant: '州／省', hans: '州／省' },
  code: { hant: '郵遞區號', hans: '邮政编码' },
  country: { hant: '國家／地區', hans: '国家／地区' },
  'url-label': { hant: '標籤（如 LinkedIn）', hans: '标签（如 LinkedIn）' },
  url: { hant: '網址', hans: '网址' },
  birthday: { hant: '生日', hans: '生日' },
  note: { hant: '備註', hans: '备注' },
  'card-url': { hant: '名片發佈網址', hans: '名片发布网址' },
  'type-cell': { hant: '手機', hans: '手机' },
  'type-work': { hant: '公司', hans: '公司' },
  'type-home': { hant: '住宅', hans: '住宅' },
  'type-fax': { hant: '傳真', hans: '传真' },
  'type-other': { hant: '其他', hans: '其他' },
  add: { hant: '新增', hans: '新增' },
  remove: { hant: '移除', hans: '移除' },
  'download-vcf': { hant: '下載 .vcf', hans: '下载 .vcf' },
  'share-vcf': { hant: '分享聯絡人', hans: '分享联系人' },
  'share-options': { hant: '分享方式', hans: '分享方式' },
  'copy-link': { hant: '複製名片連結', hans: '复制名片链接' },
  'copy-vcard': { hant: '複製 vCard 文字', hans: '复制 vCard 文字' },
  'email-contact': { hant: '以電郵傳送', hans: '以电邮传送' },
  copied: { hant: '已複製', hans: '已复制' },
  'copy-manual': { hant: '請手動複製以下文字', hans: '请手动复制以下文字' },
  'download-qr-png': { hant: '下載 QR PNG', hans: '下载 QR PNG' },
  'download-qr-svg': { hant: '下載 QR SVG', hans: '下载 QR SVG' },
  'export-json': { hant: '匯出 card.json', hans: '导出 card.json' },
  'import-json': { hant: '匯入 card.json', hans: '导入 card.json' },
  'save-contact': { hant: '儲存聯絡人', hans: '储存联系人' },
  'create-own': { hant: '製作自己的電子名片', hans: '制作自己的电子名片' },
  'edit-copy': { hant: '編輯副本', hans: '编辑副本' },
  'view-card': { hant: '預覽名片', hans: '预览名片' },
  'back-to-edit': { hant: '返回編輯', hans: '返回编辑' },
  'choose-photo': { hant: '選擇頭像', hans: '选择头像' },
  'remove-photo': { hant: '移除頭像', hans: '移除头像' },
  'qr-mode': { hant: 'QR 內容', hans: 'QR 内容' },
  'qr-auto': { hant: '自動', hans: '自动' },
  'qr-vcard': { hant: '離線 vCard', hans: '离线 vCard' },
  'qr-url': { hant: '名片連結', hans: '名片链接' },
  'qr-hint-auto': {
    hant: '細名片直接編入 vCard，相機一掃即可加入通訊錄；超出負荷時改用名片連結。',
    hans: '小名片直接编入 vCard，相机一扫即可加入通讯录；超出负荷时改用名片链接。',
  },
  'qr-hint-vcard': {
    hant: 'QR 內藏完整 vCard，無需網絡即可掃描加入聯絡人（不含頭像）。',
    hans: 'QR 内藏完整 vCard，无需网络即可扫描加入联系人（不含头像）。',
  },
  'qr-hint-url': {
    hant: 'QR 指向已發佈的名片頁，印刷後仍可隨時更新內容。',
    hans: 'QR 指向已发布的名片页，印刷后仍可随时更新内容。',
  },
  'qr-fallback-size': {
    hant: 'vCard 超過 {bytes} 字元組，QR 太密難掃 — 已自動改用名片連結。',
    hans: 'vCard 超过 {bytes} 字符组，QR 太密难扫 — 已自动改用名片链接。',
  },
  'qr-fallback-too-large': {
    hant: 'vCard 超出 QR 容量上限 — 已改用名片連結。',
    hans: 'vCard 超出 QR 容量上限 — 已改用名片链接。',
  },
  'qr-fallback-no-url': {
    hant: '未設定名片網址 — 改為直接編入 vCard。',
    hans: '未设定名片网址 — 改为直接编入 vCard。',
  },
  'qr-bytes': { hant: 'vCard {bytes} 字元組', hans: 'vCard {bytes} 字符组' },
  'photo-hint': {
    hant: '頭像會縮細並存入 .vcf，但不會放入 QR（QR 容量有限）。',
    hans: '头像会缩小并存入 .vcf，但不会放入 QR（QR 容量有限）。',
  },
  'card-url-hint': {
    hant: '部署後填寫，例如 https://user.github.io/eNameCard/ —「名片連結」QR 會指向此網址。',
    hans: '部署后填写，例如 https://user.github.io/eNameCard/ —「名片链接」QR 会指向此网址。',
  },
  'publish-hint': {
    hant: '匯出 card.json，放入 fork 出來的 repo 的 public/，推上 GitHub 即成你的名片頁。',
    hans: '导出 card.json，放入 fork 出来的 repo 的 public/，推上 GitHub 即成你的名片页。',
  },
  'local-hint': {
    hant: '內容自動儲存在此瀏覽器，可隨時匯出備份。',
    hans: '内容自动储存在此浏览器，可随时导出备份。',
  },
  'preview-empty': { hant: '填寫左邊表格，名片即時預覽', hans: '填写左边表单，名片即时预览' },
  'card-empty': { hant: '這張名片未填寫任何資料', hans: '这张名片未填写任何资料' },
  'sample-banner': {
    hant: '這是示範名片 — 到 #edit 製作你自己的。',
    hans: '这是示范名片 — 到 #edit 制作你自己的。',
  },
  'import-error': { hant: '檔案不是有效的 card.json', hans: '档案不是有效的 card.json' },
  'qr-title': { hant: '掃描儲存聯絡人', hans: '扫描储存联系人' },
  'contact-preview': {
    hant: '聯絡人預覽',
    hans: '联系人预览',
  },
  'contact-preview-hint': {
    hant: '這些資料會出現在對方的手機聯絡人裡：姓名會同時顯示中文與英文（如「Ivan Chong 莊庭皓」），雙語都能搜尋；頭像、電話、電郵等其餘欄位也會一併存檔。QR 碼因容量限制不存頭像，需直接開啟名片連結或下載 .vcf 檔才能取得照片。',
    hans: '这些数据会出现在对方的手机通讯录里：姓名会同时显示中文与英文（如「Ivan Chong 莊庭皓」），双语都能搜索；头像、电话、邮箱等其余字段也会一并存档。QR 码因容量限制不存头像，需直接打开名片链接或下载 .vcf 文件才能取得照片。',
  },
  'bilingual-tip': {
    hant: '雙語姓名：同時填寫「英文名」與「中文名」兩欄；「姓」與「名」留空即可，系統會自動推斷。下載的 .vcf 中，英文讀音會一併存檔（phonetic fields），AI 與搜尋都能辨識。',
    hans: '双语姓名：同时填写「英文名」与「中文名」两栏；「姓」与「名」留空即可，系统会自动推断。下载的 .vcf 中，英文读音会一并存档（phonetic fields），AI 与搜索都能辨识。',
  },
  'photo-tips': {
    hant: '建議使用方形或直向照片（如自拍頭像）。極端橫長圖（長寬比超過 4:1，如簽名條、截圖）會被直接拒絕，不會存檔；請重新選擇頭像照。',
    hans: '建议使用方形或纵向照片（如自拍头像）。极端横长图（宽高比超过 4:1，如签名条、截图）会被直接拒绝，不会存档；请重新选择头像照。',
  },
  'photo-rejected': {
    hant: '照片已被拒絕：長寬比超過 4:1（太長或太窄）。請改用方形或直向頭像照，現有用照片不受影響。',
    hans: '照片已被拒绝：宽高比超过 4:1（太长或太窄）。请改用方形或纵向头像照，现用照片不受影响。',
  },
};

export const LOCALES = ['hant', 'hans'];

const BCP47 = { hant: 'zh-Hant', hans: 'zh-Hans' };

/** Read the stored preference; falls back to Traditional when absent or corrupt. */
export function loadLocale() {
  try {
    const v = localStorage.getItem(I18N_KEY);
    return LOCALES.includes(v) ? v : 'hant';
  } catch {
    return 'hant';
  }
}

/** The active locale; flipped by applyLocale() so t() follows the toggle. */
let locale = 'hant';

/** Subscribers fired after every applyLocale() — re-render JS-set text. */
const localeListeners = new Set();

export function onLocaleChange(listener) {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
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
    // A storage refusal should not block switching the visible script.
  }
}

/** Rewrite every [data-i18n] element to the requested script. */
export function applyLocale(next) {
  locale = LOCALES.includes(next) ? next : 'hant';
  const lang = BCP47[locale] || BCP47.hant;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const entry = STRINGS[el.getAttribute('data-i18n')];
    if (!entry) continue;
    el.textContent = entry[locale] ?? entry.hant;
    el.lang = lang;
  }
  for (const input of document.querySelectorAll('input[name="locale"]')) {
    input.checked = input.value === locale;
  }
  for (const listener of localeListeners) listener(locale);
}

/** Wire the masthead radio toggle; persists and applies on change. */
export function bindLocaleToggle() {
  applyLocale(loadLocale());
  for (const input of document.querySelectorAll('input[name="locale"]')) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      saveLocale(input.value);
      applyLocale(input.value);
    });
  }
}