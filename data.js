/* ============================================
   HUD COM - النسخة المطورة v10.0
   - شراء مباشر بدون سلة
   - جميع بيانات العميل اختيارية
   - إدارة كاملة للمحافظ (إضافة/تعديل/حذف)
   - الحقول الديناميكية للمنتجات
   - إعدادات الموقع (أرقام، قنوات، نبذة، عملة)
   - دعم تعدد العملات
   - كشف الزبون المتكرر
============================================ */

// ===== Firebase Configuration =====
const firebaseConfig = {
  apiKey: "AIzaSyCM0p9FlQVotlsakuzzsc0vXTfbFJ9dZAo",
  authDomain: "hud-com.firebaseapp.com",
  projectId: "hud-com",
  storageBucket: "hud-com.firebasestorage.app",
  messagingSenderId: "1072384599462",
  appId: "1:1072384599462:web:c27481228a7b7dcf635b67"
};

// ===== أرقام التواصل الرسمية (يتم تحديثها من لوحة التحكم) =====
const DEFAULT_WHATSAPP_NUMBER = "967783708724";
const DEFAULT_SUPPORT_NUMBER = "967712423773";
const DEFAULT_WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb8al5Y0LKZA4hbrLE19";

// متغيرات قابلة للتحديث من الإعدادات
let WHATSAPP_NUMBER = DEFAULT_WHATSAPP_NUMBER;
let SUPPORT_NUMBER = DEFAULT_SUPPORT_NUMBER;
let WHATSAPP_CHANNEL = DEFAULT_WHATSAPP_CHANNEL;

// ===== العملات =====
const CURRENCIES = {
  YER: { name: "ريال يمني", short: "ر.ي", flag: "🇾🇪" },
  SAR: { name: "ريال سعودي", short: "ر.س", flag: "🇸🇦" },
  USD: { name: "دولار", short: "$", flag: "🇺🇸" },
  AED: { name: "درهم إماراتي", short: "د.إ", flag: "🇦🇪" }
};
const DEFAULT_CURRENCY = "YER";

// إعدادات عرض العملة: "single" (عملة واحدة) أو "multi" (كل العملات معاً)
let CURRENCY_DISPLAY_MODE = "single";
let ACTIVE_CURRENCIES = ["YER", "SAR", "USD", "AED"];

// أسعار الصرف التقريبية (محدثة من الإعدادات)
let EXCHANGE_RATES = {
  YER: 1,        // الريال اليمني هو الأساس
  SAR: 0.0155,   // 1 ريال يمني = 0.0155 ريال سعودي تقريباً
  USD: 0.0040,
  AED: 0.0147
};

// ===== المحافظ الإلكترونية الافتراضية =====
const DEFAULT_WALLETS = [
  { id: 'krimi_jawali', name: 'كريمي جوالي', number: '', image: '', enabled: true, order: 1 },
  { id: 'mahfadti', name: 'محفظتي', number: '', image: '', enabled: true, order: 2 },
  { id: 'floosak', name: 'فلوسك', number: '', image: '', enabled: true, order: 3 },
  { id: 'jeeb', name: 'جيب', number: '', image: '', enabled: true, order: 4 },
  { id: 'mobile_money', name: 'موبايل موني', number: '', image: '', enabled: true, order: 5 },
  { id: 'cash', name: 'كاش', number: '', image: '', enabled: true, order: 6 },
  { id: 'one_cash', name: 'ون كاش', number: '', image: '', enabled: true, order: 7 }
];

// المحافظ النشطة (يتم تحديثها من localStorage)
let WALLETS = JSON.parse(JSON.stringify(DEFAULT_WALLETS));

// ===== إعدادات الموقع (تُحفظ في localStorage) =====
const SITE_SETTINGS_KEY = 'hud_site_settings';
const WALLETS_SETTINGS_KEY = 'hud_wallets_settings';

// الإعدادات الافتراضية
const DEFAULT_SITE_SETTINGS = {
  // أرقام التواصل
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  supportNumber: DEFAULT_SUPPORT_NUMBER,
  whatsappChannel: DEFAULT_WHATSAPP_CHANNEL,
  adminPhone: DEFAULT_WHATSAPP_NUMBER,

  // معلومات إضافية
  storeName: "هود كوم",
  storeSlogan: "المتجر الرقمي الأول في اليمن",

  // نبذة "من نحن"
  aboutEnabled: true,
  aboutText: "هود كوم هو متجرك الرقمي الأول في اليمن والوطن العربي. نقدم لك أفضل المنتجات الرقمية من اشتراكات وألعاب وبرامج وتصاميم ودورات بأسعار منافسة وتوصيل فوري وضمان كامل.",
  aboutPosition: "middle", // top, middle, bottom

  // إعدادات العملة
  currencyMode: "single", // single, multi
  activeCurrencies: ["YER", "SAR", "USD", "AED"],
  defaultCurrency: "YER",

  // إعدادات عامة
  showWatermark: true,
  watermarkOpacity: 0.15,
  enableReturningCustomer: true
};

let siteSettings = { ...DEFAULT_SITE_SETTINGS };

// ===== الحقول الديناميكية للمنتجات =====
const PRODUCT_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  ID: 'id',         // حقل ID مخصص
  LINK: 'link',     // حقل رابط
  NOTE: 'note',     // حقل ملاحظات للعميل
  EMAIL: 'email',
  PASSWORD: 'password'
};

const DEFAULT_PRODUCT_FIELDS = [
  { id: 'id', label: 'ID الخاص بك', type: 'text', required: true, placeholder: 'أدخل الـ ID' },
  { id: 'note', label: 'ملاحظات إضافية', type: 'text', required: false, placeholder: 'أي تفاصيل تريد إضافتها...' }
];

// ===== النوافذ المنبثقة المتعددة (Multi-step Popups) =====
const DEFAULT_POPUPS = [
  {
    id: 'popup-1',
    title: '⚠️ تنبيه مهم قبل الشراء',
    content: 'يرجى قراءة التعليمات التالية بعناية قبل إتمام عملية الشراء. هذا يضمن لك تجربة سلسة وسريعة.',
    image: '',
    buttonText: 'التالي',
    type: 'warning'
  },
  {
    id: 'popup-2',
    title: '🎮 كيفية إدخال البيانات',
    content: '1️⃣ افتح اللعبة على جهازك\n2️⃣ انسخ الـ ID الخاص بحسابك\n3️⃣ الصقه في خانة الـ ID في نموذج الشراء\n4️⃣ أكمل عملية الدفع وانتظر التوصيل الفوري',
    image: '',
    buttonText: 'متابعة الشراء',
    type: 'info'
  }
];

// ===== أيقونات SVG =====
const ICONS = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  broadcast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20l-2-10 6 4 3-8 3 8 6-4-2 10"/></svg>',
  percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  cart2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  creditCard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  user2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="6" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="18" r="1"/></svg>'
};

// ===== دالة الأيقونة =====
function icon(name, size){
  size = size || 20;
  const svg = ICONS[name];
  if(!svg) return '';
  return svg.replace('<svg', '<svg width="' + size + '" height="' + size + '"');
}

// ===== المتغيرات الأساسية =====
let categories = [];
let db = null;
let firebaseReady = false;
let firebaseLoading = true;

// ===== الطلب الحالي (للشراء المباشر) =====
let currentOrder = null;

// ===== النوافذ المنبثقة المتعددة الحالية =====
let currentPopups = [];
let currentPopupIndex = 0;

// ===== إدارة إعدادات الموقع =====
function loadSiteSettings(){
  try {
    const stored = localStorage.getItem(SITE_SETTINGS_KEY);
    if(stored){
      const parsed = JSON.parse(stored);
      siteSettings = { ...DEFAULT_SITE_SETTINGS, ...parsed };

      // تطبيق الإعدادات على المتغيرات العامة
      WHATSAPP_NUMBER = siteSettings.whatsappNumber || DEFAULT_WHATSAPP_NUMBER;
      SUPPORT_NUMBER = siteSettings.supportNumber || DEFAULT_SUPPORT_NUMBER;
      WHATSAPP_CHANNEL = siteSettings.whatsappChannel || DEFAULT_WHATSAPP_CHANNEL;

      CURRENCY_DISPLAY_MODE = siteSettings.currencyMode || 'single';
      ACTIVE_CURRENCIES = siteSettings.activeCurrencies || ['YER', 'SAR', 'USD', 'AED'];
    }
  } catch(e) {
    console.warn('تعذر تحميل إعدادات الموقع:', e);
    siteSettings = { ...DEFAULT_SITE_SETTINGS };
  }
}

function saveSiteSettings(newSettings){
  try {
    siteSettings = { ...siteSettings, ...newSettings };

    // تطبيق الإعدادات على المتغيرات العامة
    WHATSAPP_NUMBER = siteSettings.whatsappNumber || DEFAULT_WHATSAPP_NUMBER;
    SUPPORT_NUMBER = siteSettings.supportNumber || DEFAULT_SUPPORT_NUMBER;
    WHATSAPP_CHANNEL = siteSettings.whatsappChannel || DEFAULT_WHATSAPP_CHANNEL;

    CURRENCY_DISPLAY_MODE = siteSettings.currencyMode || 'single';
    ACTIVE_CURRENCIES = siteSettings.activeCurrencies || ['YER', 'SAR', 'USD', 'AED'];

    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(siteSettings));
    return true;
  } catch(e) {
    console.error('خطأ في حفظ الإعدادات:', e);
    return false;
  }
}

// ===== إدارة المحافظ (كاملة: إضافة، تعديل، حذف) =====
function loadWalletSettings(){
  try {
    const stored = localStorage.getItem(WALLETS_SETTINGS_KEY);
    if(stored){
      const parsed = JSON.parse(stored);
      // دمج الإعدادات المحفوظة مع الافتراضية
      WALLETS = DEFAULT_WALLETS.map(function(defaultWallet){
        const saved = parsed.find(function(w){ return w.id === defaultWallet.id; });
        return saved ? { ...defaultWallet, ...saved } : defaultWallet;
      });

      // إضافة المحافظ المخصصة الجديدة
      if(parsed.customWallets && Array.isArray(parsed.customWallets)){
        parsed.customWallets.forEach(function(cw){
          WALLETS.push(cw);
        });
      }
    }
  } catch(e) {
    console.warn('تعذر تحميل إعدادات المحافظ:', e);
    WALLETS = JSON.parse(JSON.stringify(DEFAULT_WALLETS));
  }
}

function saveWalletSettings(){
  try {
    // فصل المحافظ المخصصة عن الافتراضية
    const defaultIds = DEFAULT_WALLETS.map(function(w){ return w.id; });
    const customWallets = WALLETS.filter(function(w){
      return defaultIds.indexOf(w.id) === -1;
    });

    const data = {
      wallets: WALLETS.filter(function(w){ return defaultIds.indexOf(w.id) !== -1; }),
      customWallets: customWallets
    };

    localStorage.setItem(WALLETS_SETTINGS_KEY, JSON.stringify(data));
    return true;
  } catch(e) {
    console.error('خطأ في حفظ إعدادات المحافظ:', e);
    return false;
  }
}

// إضافة محفظة جديدة
function addWallet(wallet){
  try {
    if(!wallet.id){
      wallet.id = 'wallet_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    wallet.order = WALLETS.length + 1;
    if(typeof wallet.enabled === 'undefined') wallet.enabled = true;
    WALLETS.push(wallet);
    saveWalletSettings();
    return wallet;
  } catch(e) {
    console.error('خطأ في إضافة محفظة:', e);
    return null;
  }
}

// حذف محفظة
function deleteWallet(walletId){
  try {
    const defaultIds = DEFAULT_WALLETS.map(function(w){ return w.id; });
    if(defaultIds.indexOf(walletId) !== -1){
      // لا يمكن حذف المحافظ الافتراضية، فقط تعطيلها
      const wallet = WALLETS.find(function(w){ return w.id === walletId; });
      if(wallet){
        wallet.enabled = false;
        saveWalletSettings();
        return true;
      }
      return false;
    }

    WALLETS = WALLETS.filter(function(w){ return w.id !== walletId; });
    saveWalletSettings();
    return true;
  } catch(e) {
    console.error('خطأ في حذف محفظة:', e);
    return false;
  }
}

// تحديث محفظة
function updateWallet(walletId, updates){
  try {
    const wallet = WALLETS.find(function(w){ return w.id === walletId; });
    if(!wallet) return false;
    Object.assign(wallet, updates);
    saveWalletSettings();
    return true;
  } catch(e) {
    console.error('خطأ في تحديث محفظة:', e);
    return false;
  }
}

// الحصول على المحافظ المفعلة فقط
function getActiveWallets(){
  return WALLETS.filter(function(w){ return w.enabled !== false; })
    .sort(function(a, b){ return (a.order || 0) - (b.order || 0); });
}

// ===== إدارة صور المحافظ =====
function loadWalletImages(){
  try {
    WALLETS.forEach(function(w){
      const img = localStorage.getItem('hud_wallet_img_' + w.id);
      if(img) w.image = img;
    });
  } catch(e) {
    console.warn('تعذر تحميل صور المحافظ:', e);
  }
}

function saveWalletImage(id, imageData){
  try {
    localStorage.setItem('hud_wallet_img_' + id, imageData);
    const wallet = WALLETS.find(function(w){ return w.id === id; });
    if(wallet) wallet.image = imageData;
    return true;
  } catch(e) {
    console.error('خطأ في حفظ صورة المحفظة:', e);
    return false;
  }
}

function getWalletImage(id){
  const wallet = WALLETS.find(function(w){ return w.id === id; });
  return wallet ? wallet.image : '';
}

// ===== إدارة بيانات الزبون المتكرر =====
const LAST_ORDER_KEY = 'hud_last_order';
const CUSTOMER_DATA_KEY = 'hud_customer_data';

function hasPreviousOrder(){
  try {
    return localStorage.getItem(LAST_ORDER_KEY) !== null;
  } catch(e) {
    return false;
  }
}

function getPreviousCustomerData(){
  try {
    const data = localStorage.getItem(CUSTOMER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch(e) {
    return null;
  }
}

function saveCustomerData(data){
  try {
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(data));
    localStorage.setItem(LAST_ORDER_KEY, new Date().toISOString());
  } catch(e) {
    console.warn('تعذر حفظ بيانات العميل:', e);
  }
}

// ===== الحقول الديناميكية للمنتجات =====
function getProductFields(item){
  if(item && item.customFields && Array.isArray(item.customFields) && item.customFields.length > 0){
    return item.customFields;
  }
  return DEFAULT_PRODUCT_FIELDS;
}

// ===== النوافذ المنبثقة المتعددة =====
function getItemPopups(item){
  if(item && item.popups && Array.isArray(item.popups) && item.popups.length > 0){
    return item.popups;
  }
  return DEFAULT_POPUPS;
}

// ===== العملة =====
function getCurrencyName(code){
  const cur = CURRENCIES[code];
  return cur ? cur.name : CURRENCIES[DEFAULT_CURRENCY].name;
}

function getCurrencyShort(code){
  const cur = CURRENCIES[code];
  return cur ? cur.short : CURRENCIES[DEFAULT_CURRENCY].short;
}

function getCurrencyFlag(code){
  const cur = CURRENCIES[code];
  return cur ? cur.flag : '';
}

// تحويل السعر بين العملات
function convertPrice(amountInYER, targetCurrency){
  if(targetCurrency === 'YER') return amountInYER;
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return Math.round(amountInYER * rate);
}

// عرض السعر بتنسيق العملة
function formatPrice(amount, currencyCode){
  const cur = CURRENCIES[currencyCode];
  const formatted = amount.toLocaleString();
  return cur ? formatted + ' ' + cur.short : formatted + ' ' + currencyCode;
}

// عرض السعر بجميع العملات النشطة
function formatPriceMultiCurrency(amountInYER){
  const prices = ACTIVE_CURRENCIES.map(function(code){
    const converted = convertPrice(amountInYER, code);
    return formatPrice(converted, code);
  });
  return prices;
}

// ===== الحصول على قسم =====
function getCategory(id){
  if(!id || !categories || !Array.isArray(categories)) return null;
  return categories.find(function(c){ return c && c.id === id; });
}

// ===== تهيئة Firebase =====
async function initFirebase(){
  try {
    console.log('بدء تحميل Firebase...');
    const appModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const app = appModule.initializeApp(firebaseConfig);
    db = firestoreModule.getFirestore(app);

    window.firebaseDB = {
      db: db,
      collection: firestoreModule.collection,
      getDocs: firestoreModule.getDocs,
      doc: firestoreModule.doc,
      setDoc: firestoreModule.setDoc,
      deleteDoc: firestoreModule.deleteDoc,
      query: firestoreModule.query,
      where: firestoreModule.where,
      onSnapshot: firestoreModule.onSnapshot
    };

    console.log('Firebase متصل بنجاح');

    await loadCategoriesFromFirebase();

    firebaseReady = true;
    firebaseLoading = false;

    if(typeof onFirebaseReady === 'function'){
      onFirebaseReady();
    }

    return true;
  } catch(e) {
    console.error('خطأ Firebase:', e);
    firebaseReady = false;
    firebaseLoading = false;
    return false;
  }
}

// ===== تحميل الأقسام من Firebase =====
async function loadCategoriesFromFirebase(){
  if(!db || !window.firebaseDB){
    console.warn('قاعدة البيانات غير متصلة');
    return;
  }

  try {
    const { collection, getDocs } = window.firebaseDB;
    const snapshot = await getDocs(collection(db, 'categories'));

    categories = [];
    snapshot.forEach(function(doc){
      try {
        const data = doc.data();
        if(data){
          if(!data.items || !Array.isArray(data.items)){
            data.items = [];
          }
          data.items.forEach(function(item){
            if(!item.offers || !Array.isArray(item.offers)){
              item.offers = [];
            }
          });

          categories.push({ id: doc.id, ...data });
        }
      } catch(itemErr) {
        console.error('خطأ في معالجة قسم:', itemErr);
      }
    });

    console.log('تم تحميل ' + categories.length + ' قسم');
    return categories;
  } catch(e) {
    console.error('خطأ في تحميل البيانات:', e);
    categories = [];
    return [];
  }
}

// ===== حفظ قسم =====
async function saveCategoryToFirebase(category){
  if(!firebaseReady || !window.firebaseDB){
    console.warn('Firebase غير جاهز');
    return false;
  }

  try {
    const { doc, setDoc } = window.firebaseDB;
    await setDoc(doc(db, 'categories', category.id), category);
    console.log('تم حفظ القسم:', category.name);
    return true;
  } catch(e) {
    console.error('خطأ في الحفظ:', e);
    return false;
  }
}

// ===== حذف قسم =====
async function deleteCategoryFromFirebase(catId){
  if(!firebaseReady || !window.firebaseDB){
    return false;
  }

  try {
    const { doc, deleteDoc } = window.firebaseDB;
    await deleteDoc(doc(db, 'categories', catId));
    console.log('تم الحذف');
    return true;
  } catch(e) {
    console.error('خطأ في الحذف:', e);
    return false;
  }
}

// ===== تهيئة الإعدادات عند البدء =====
loadSiteSettings();
loadWalletSettings();
loadWalletImages();

// ===== بدء التشغيل =====
initFirebase();
