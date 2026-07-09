import GameManager from './gameManager.js?v=1.030';
import Drawing from './drawing.js?v=1.030';

const S = GameManager.S;
const CROPS = GameManager.CROPS;
const ANIM = GameManager.ANIM;
const ROWS = 5;
const COLS = 10;

window.plantMode = null;
window.harvestModeActive = false;
window.pesticideModeActive = false;
window.lastPlantClick = -1;
window.selR = -1;
window.selC = -1;
window.tutorialStepDone = false;
window.tutorialMinimized = false;

const BUILDING_MAX_LEVEL = 10;
const UPGRADE_COST = { ahır: 500, kümes: 400, kuyu: 600, degirmen: 800, fırın: 700, sutislem: 700, peynirfab: 800, salçafab: 600 };
const UPGRADE_DESC = {
  ahır: { name: 'Ahır', effect: l => `+${l} hayvan kapasitesi, +${l * 2} lt süt/sağım`, icon: '🐄' },
  kümes: { name: 'Kümes', effect: l => `+${l} tavuk kapasitesi, +${l} yumurta/gün`, icon: '🐔' },
  kuyu: { name: 'Kuyu', effect: l => `Sulama süresi -${l * 2} dk (min ${Math.max(10, 40 - l * 3)} dk)`, icon: '💧' },
  degirmen: { name: 'Değirmen', effect: l => `Öğütme hızı x${(1 + l * 0.1).toFixed(1)}`, icon: '⚙️' },
  fırın: { name: 'Fırın', effect: l => `Pişirme hızı x${(1 + l * 0.1).toFixed(1)}`, icon: '🔥' },
  sutislem: { name: 'Süt İşleme', effect: l => `Verimlilik +${l * 10}%`, icon: '🫙' },
  peynirfab: { name: 'Peynir Fabrikası', effect: l => `Verimlilik +${l * 10}%`, icon: '🧀' },
  salçafab: { name: 'Salça Fabrikası', effect: l => `Verimlilik +${l * 10}%`, icon: '🍅' }
};
function getUpgradeCost(key) { let lv = S.buildingLevel ? S.buildingLevel[key] || 1 : 1; return Math.floor(UPGRADE_COST[key] * lv * 1.5); }

const MISSION_TEMPLATES = [
  { type: 'harvest', crop: 'DOMATES', target: 6, text: '6 kg Domates topla' }, { type: 'harvest', crop: 'PATATES', target: 8, text: '8 kg Patates topla' },
  { type: 'harvest', crop: 'SALATALIK', target: 5, text: '5 kg Salatalık topla' }, { type: 'harvest', crop: 'MARUL', target: 4, text: '4 kg Marul topla' },
  { type: 'harvest', crop: 'BIBER', target: 5, text: '5 kg Biber topla' }, { type: 'harvest', crop: 'PATLICAN', target: 4, text: '4 kg Patlıcan topla' },
  { type: 'harvest', crop: 'MISIR', target: 6, text: '6 kg Mısır topla' }, { type: 'harvest', crop: 'KABAK', target: 5, text: '5 kg Kabak topla' },
  { type: 'harvest', crop: 'SOGAN', target: 7, text: '7 kg Soğan topla' },
  { type: 'animal', animal: 'YUMURTA', target: 10, text: '10 yumurta topla' }, { type: 'animal', animal: 'SUT', target: 5, text: '5 litre süt topla' },
  { type: 'sell', target: 100, text: '100 TL değerinde ürün sat' }, { type: 'plant', target: 3, text: '3 fidan dik' }, { type: 'water', target: 5, text: '5 kez sulama yap' }
];

const TUTORIAL_STEPS = {
  bread: [
    { title: 'Birlikte Ekmek Üretelim Mi?', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Buğdaydan ekmeğe uzanan yolculuğa hazır mısın?', action: null, speak: 'Birlikte ekmek üretelim mi?' },
    { title: 'Adım 1: Tarla İnşa Et', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Önce tesislerden tarla inşa et.', action: 'build_grid', speak: 'Önce tesislerden tarla inşa et.' },
    { title: 'Adım 2: Tarlayı Sür', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Şimdi traktörle tarlayı sür.', action: 'plow', speak: 'Şimdi traktörle tarlayı sür.' },
    { title: 'Adım 3: Buğday Ek', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Tarlaya tıkla, buğday tohumu ek.', action: 'plant_bugday', speak: 'Şimdi tarlaya buğday ek.' },
    { title: 'Adım 4: Kuyu İnşa Et', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Sulama için kuyu inşa et (Tesislerden).', action: 'build_kuyu', speak: 'Sulama için kuyu inşa et.' },
    { title: 'Adım 5: Sulama Yap', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Kuyuya tıkla, sulamayı başlat.', action: 'water', speak: 'Kuyuya tıkla, sulamayı başlat.' },
    { title: 'Adım 6: Hasat Et', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Buğday büyüdü! Hasat et.', action: 'harvest_bugday', speak: 'Buğday büyüdü! Hasat et.' },
    { title: 'Adım 7: Değirmen İnşa Et', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Buğdayı un yapmak için değirmen inşa et (Tesislerden).', action: 'build_degirmen', speak: 'Buğdayı un yapmak için değirmen inşa et.' },
    { title: 'Adım 8: Değirmende Öğüt', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Değirmene tıkla, buğdayı un haline getir.', action: 'grind', speak: 'Buğdayı değirmende öğüt, un olsun.' },
    { title: 'Adım 9: Fırın İnşa Et', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Ekmeği pişirmek için fırın inşa et (Tesislerden).', action: 'build_fırın', speak: 'Ekmeği pişirmek için fırın inşa et.' },
    { title: 'Adım 10: Fırında Pişir', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Fırına tıkla, unu ekmek haline getir!', action: 'bake', speak: 'Unu fırında pişir, ekmek olsun!' },
    { title: 'Tebrikler! 🎉', chain: ['🏗', '🌾', '💧', '⚙', '🏭', '📦', '🔥', '🍞'], desc: 'Ekmeği başardın! Buğdaydan ekmeğe tüm yolu gördün.', action: null, speak: 'Tebrikler! Ekmeği başarıyla ürettin!' }
  ],
  egg: [
    { title: 'Yumurta Üretelim! 🥚', chain: ['🐔', '🥚'], desc: 'Tavuklar yumurta üretir. Haydi kümes kuralım!', action: null, speak: 'Yumurta üretelim! Tavuklar yumurta yapar.' },
    { title: 'Adım 1: Kümes İnşa Et', chain: ['🐔', '🥚'], desc: 'Önce tesislerden kümes inşa et.', action: 'build_kümes', speak: 'Önce tesislerden kümes inşa et.' },
    { title: 'Adım 2: Tavuk Satın Al', chain: ['🐔', '🥚'], desc: 'Kümese tıkla, tavuk satın al.', action: 'buy_chicken', speak: 'Kümese tıkla, tavuk satın al.' },
    { title: 'Adım 3: Yumurta Topla', chain: ['🐔', '🥚'], desc: 'Tavuklar yumurta bıraktı! Kümese tıkla, yumurtaları topla.', action: 'collect_egg', speak: 'Tavuklar yumurta bıraktı! Kümese tıkla, yumurtaları topla.' },
    { title: 'Tebrikler! 🎉', chain: ['🐔', '🥚'], desc: 'Yumurtaları başardın! Tavuklar her gün yumurta bırakır.', action: null, speak: 'Tebrikler! Yumurtaları başarıyla topladın!' }
  ],
  milk: [
    { title: 'Süt Sağalım! 🥛', chain: ['🐄', '🥛'], desc: 'İnekler süt verir. Haydi ahır kuralım!', action: null, speak: 'Süt sağalım! İnekler süt verir.' },
    { title: 'Adım 1: Ahır İnşa Et', chain: ['🐄', '🥛'], desc: 'Önce tesislerden ahır inşa et.', action: 'build_ahir', speak: 'Önce tesislerden ahır inşa et.' },
    { title: 'Adım 2: İnek Satın Al', chain: ['🐄', '🥛'], desc: 'Ahıra tıkla, inek satın al.', action: 'buy_cow', speak: 'Ahıra tıkla, inek satın al.' },
    { title: 'Adım 3: Süt Sağ', chain: ['🐄', '🥛'], desc: 'İnekler süt verdi! Ahıra tıkla, sütü sağ.', action: 'collect_milk', speak: 'İnekler süt verdi! Ahıra tıkla, sütü sağ.' },
    { title: 'Tebrikler! 🎉', chain: ['🐄', '🥛'], desc: 'Sütü başardın! İnekler günde 2-3 kez süt verir.', action: null, speak: 'Tebrikler! Sütü başarıyla sağdın!' }
  ],
  butter: [
    { title: 'Tereyağı Üretelim! 🧈', chain: ['🥛', '🧈'], desc: 'Sütten tereyağı üretmek için süt işleme tesisi lazım.', action: null, speak: 'Tereyağı üretelim! Sütten tereyağı yapılır.' },
    { title: 'Adım 1: Süt İşleme Tesisi İnşa Et', chain: ['🥛', '🧈'], desc: 'Önce tesislerden süt işleme tesisi inşa et.', action: 'build_sutislem', speak: 'Önce tesislerden süt işleme tesisi inşa et.' },
    { title: 'Adım 2: Süt Topla', chain: ['🥛', '🧈'], desc: 'Süt için önce ineklere ihtiyacın var. Ahır kur, inek al, süt sağ.', action: 'collect_milk', speak: 'Süt için önce ineklere ihtiyacın var. Süt sağ.' },
    { title: 'Adım 3: Tereyağı Üret', chain: ['🥛', '🧈'], desc: 'Süt İşleme Tesisi\'ne tıkla, tereyağı üret.', action: 'make_butter', speak: 'Süt İşleme Tesisi\'ne tıkla, tereyağı üret.' },
    { title: 'Tebrikler! 🎉', chain: ['🥛', '🧈'], desc: 'Tereyağını başardın! Sütten tereyağı yapımını gördün.', action: null, speak: 'Tebrikler! Tereyağını başarıyla ürettin!' }
  ],
  cheese: [
    { title: 'Peynir Üretelim! 🧀', chain: ['🥛', '🧀'], desc: 'Sütten peynir üretmek için peynir fabrikası lazım.', action: null, speak: 'Peynir üretelim! Sütten peynir yapılır.' },
    { title: 'Adım 1: Peynir Fabrikası İnşa Et', chain: ['🥛', '🧀'], desc: 'Önce tesislerden peynir fabrikası inşa et.', action: 'build_peynirfab', speak: 'Önce tesislerden peynir fabrikası inşa et.' },
    { title: 'Adım 2: Süt Topla', chain: ['🥛', '🧀'], desc: 'Peynir için süt lazım. İneklerden süt sağ.', action: 'collect_milk', speak: 'Peynir için süt lazım. Süt sağ.' },
    { title: 'Adım 3: Peynir Üret', chain: ['🥛', '🧀'], desc: 'Peynir Fabrikası\'na tıkla, peynir üret.', action: 'make_cheese', speak: 'Peynir Fabrikası\'na tıkla, peynir üret.' },
    { title: 'Tebrikler! 🎉', chain: ['🥛', '🧀'], desc: 'Peyniri başardın! 3 sütten 2 peynir yapılır.', action: null, speak: 'Tebrikler! Peyniri başarıyla ürettin!' }
  ],
  yogurt: [
    { title: 'Yoğurt Üretelim! 🫙', chain: ['🥛', '🫙'], desc: 'Sütten yoğurt üretmek için süt işleme tesisi lazım.', action: null, speak: 'Yoğurt üretelim! Sütten yoğurt yapılır.' },
    { title: 'Adım 1: Süt İşleme Tesisi İnşa Et', chain: ['🥛', '🫙'], desc: 'Önce tesislerden süt işleme tesisi inşa et.', action: 'build_sutislem', speak: 'Önce tesislerden süt işleme tesisi inşa et.' },
    { title: 'Adım 2: Süt Topla', chain: ['🥛', '🫙'], desc: 'Yoğurt için süt lazım. İneklerden süt sağ.', action: 'collect_milk', speak: 'Yoğurt için süt lazım. Süt sağ.' },
    { title: 'Adım 3: Yoğurt Üret', chain: ['🥛', '🫙'], desc: 'Süt İşleme Tesisi\'ne tıkla, yoğurt üret.', action: 'make_yogurt', speak: 'Süt İşleme Tesisi\'ne tıkla, yoğurt üret.' },
    { title: 'Tebrikler! 🎉', chain: ['🥛', '🫙'], desc: 'Yoğurdu başardın! 2 sütten 2 yoğurt yapılır.', action: null, speak: 'Tebrikler! Yoğurdu başarıyla ürettin!' }
  ],
  salca: [
    { title: 'Salça Üretelim! 🍅', chain: ['🌱', '🍅', 'salça'], desc: 'Domateslerden salça üretmek için salça fabrikası lazım.', action: null, speak: 'Salça üretelim! Domateslerden salça yapılır.' },
    { title: 'Adım 1: Tarla & Domates Ek', chain: ['🌱', '🍅', 'salça'], desc: 'Tarla kur, sür, domates ek ve sulamayı unutma!', action: 'plant_domates', speak: 'Tarla kur, domates ek.' },
    { title: 'Adım 2: Domates Hasat Et', chain: ['🌱', '🍅', 'salça'], desc: 'Domatesler büyüdü! Hasat et.', action: 'harvest_domates', speak: 'Domatesler büyüdü! Hasat et.' },
    { title: 'Adım 3: Salça Fabrikası İnşa Et', chain: ['🌱', '🍅', 'salça'], desc: 'Önce tesislerden salça fabrikası inşa et.', action: 'build_salçafab', speak: 'Önce tesislerden salça fabrikası inşa et.' },
    { title: 'Adım 4: Salça Üret', chain: ['🌱', '🍅', 'salça'], desc: 'Salça Fabrikası\'na tıkla, 4 domatesten 1 salça üret.', action: 'make_salca', speak: 'Salça Fabrikası\'na tıkla, salça üret.' },
    { title: 'Tebrikler! 🎉', chain: ['🌱', '🍅', 'salça'], desc: 'Salçayı başardın! Domatesten salça yapımını gördün.', action: null, speak: 'Tebrikler! Salçayı başarıyla ürettin!' }
  ],
  tomato: [
    { title: 'Domates Ekelim! 🌱', chain: ['🌱', '💧', '🍅'], desc: 'Domates ekmeyi ve büyütmeyi öğrenelim!', action: null, speak: 'Domates ekelim!' },
    { title: 'Adım 1: Tarla İnşa Et', chain: ['🌱', '💧', '🍅'], desc: 'Önce tesislerden tarla inşa et.', action: 'build_grid', speak: 'Önce tesislerden tarla inşa et.' },
    { title: 'Adım 2: Tarlayı Sür', chain: ['🌱', '💧', '🍅'], desc: 'Şimdi traktörle tarlayı sür.', action: 'plow', speak: 'Şimdi traktörle tarlayı sür.' },
    { title: 'Adım 3: Domates Ek', chain: ['🌱', '💧', '🍅'], desc: 'Tarlaya tıkla, domates tohumu ek.', action: 'plant_domates', speak: 'Şimdi tarlaya domates ek.' },
    { title: 'Adım 4: Sulama Yap', chain: ['🌱', '💧', '🍅'], desc: 'Kuyu varsa kuyuya tıkla, yoksa tesislerden kuyu inşa et.', action: 'water', speak: 'Sulamayı unutma!' },
    { title: 'Adım 5: Hasat Et', chain: ['🌱', '💧', '🍅'], desc: 'Domatesler büyüdü! Hasat et.', action: 'harvest_domates', speak: 'Domatesler büyüdü! Hasat et.' },
    { title: 'Tebrikler! 🎉', chain: ['🌱', '💧', '🍅'], desc: 'Domatesleri başardın! Ekimden hasadı gördün.', action: null, speak: 'Tebrikler! Domatesleri başarıyla hasat ettin!' }
  ]
};

const ACTION_LABELS = {
  build_grid: '🏘 Tesislerden tarla satın al', plow: '🚜 Traktörü aktifle, tarlaya tıkla',
  plant_bugday: '🌱 Tarlaya tıkla, buğday ek', build_kuyu: '🏘 Tesislerden kuyu satın al',
  water: '💧 Kuyuya tıkla, sulama başlat', harvest_bugday: '🌾 Büyüyen buğdaya tıkla, hasat et',
  build_degirmen: '🏘 Tesislerden değirmen satın al', grind: '⚙ Değirmene tıkla, un üret',
  build_fırın: '🏘 Tesislerden fırın satın al', bake: '🔥 Fırına tıkla, ekmek pişir',
  build_kümes: '🏘 Tesislerden kümes satın al', buy_chicken: '🐔 Kümesden tavuk satın al',
  collect_egg: '🥚 Kümese tıkla, yumurta topla',
  build_ahir: '🏘 Tesislerden ahır satın al', buy_cow: '🐄 Ahırdan inek satın al',
  collect_milk: '🥛 Ahıra tıkla, süt sağı',
  build_sutislem: '🏘 Tesislerden süt işleme satın al', make_yogurt: '🫙 Süt İşleme\'ye tıkla, yoğurt üret',
  build_peynirfab: '🏘 Tesislerden peynir fabrikası satın al', make_cheese: '🧀 Peynir Fabrikası\'na tıkla, peynir üret',
  make_butter: '🧈 Süt İşleme\'ye tıkla, tereyağı üret',
  plant_domates: '🌱 Tarlaya tıkla, domates ek', harvest_domates: '🍅 Büyüyen domatese tıkla, hasat et',
  build_salçafab: '🏘 Tesislerden salça fabrikası satın al', make_salca: '🍅 Salça Fabrikası\'na tıkla, salça üret'
};

const FOOD_GUIDES = [
  { id: 'bread', icon: '🍞', name: 'Ekmek', color: '#d4a040' },
  { id: 'egg', icon: '🥚', name: 'Yumurta', color: '#f5deb3' },
  { id: 'milk', icon: '🥛', name: 'Süt', color: '#e3f2fd' },
  { id: 'butter', icon: '🧈', name: 'Tereyağı', color: '#fff3e0' },
  { id: 'cheese', icon: '🧀', name: 'Peynir', color: '#fdd835' },
  { id: 'yogurt', icon: '🫙', name: 'Yoğurt', color: '#f3e5f5' },
  { id: 'salca', icon: '🍅', name: 'Salça', color: '#ffcdd2' },
  { id: 'tomato', icon: '🌱', name: 'Domates', color: '#c8e6c9' }
];

const SEASONS = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
const WEATHER_ICONS = { güneşli: '\u2600\uFE0F', bulutlu: '\u2601\uFE0F', yağmurlu: '\uD83C\uDF27\uFE0F', karlı: '\u2744\uFE0F' };
const BUILDING_NAMES = { ahır: 'AHİR', kümes: 'KÜMES', degirmen: 'DEĞİRMEN', kuyu: 'KUYU', grid: 'TARLA', fırın: 'FIRIN', sutislem: 'SÜT İŞLEME', peynirfab: 'PEYNİR FAB', salçafab: 'SALÇA FAB' };
const BUILDING_PRICES = { ahır: 2500, kümes: 1500, degirmen: 3000, kuyu: 2000, grid: 100, fırın: 2500, sutislem: 3500, peynirfab: 4000, salçafab: 3000 };
const SELL_RATIO = 0.6;
const GRID_LINKED_KUYU = true;

let longPressTimer = null;
let longPressPos = { x: 0, y: 0 };
let mouseDownTime = 0;
let mouseDownPos = { x: 0, y: 0 };
let dragStartedThisClick = false;

function getP(r, c) { return S.plots.find(p => p.r === r && p.c === c); }

function isStepDone(action) {
  if (action === 'build_grid') return S.built.grid;
  if (action === 'plow') return S.plowed.length > 0;
  if (action === 'plant_bugday') return S.plots.some(p => p.crop === 'BUGDAY');
  if (action === 'build_kuyu') return S.built.kuyu;
  if (action === 'water') return S.plots.some(p => p.crop && p.w);
  if (action === 'harvest_bugday') return (S.inv.BUGDAY || 0) > 0;
  if (action === 'build_degirmen') return S.built.degirmen;
  if (action === 'grind') return (S.invUN || 0) > 0;
  if (action === 'build_fırın') return S.built.fırın;
  if (action === 'bake') return (S.invEKMEK || 0) > 0;
  if (action === 'build_kümes') return S.built.kümes;
  if (action === 'buy_chicken') return S.ch > 0;
  if (action === 'collect_egg') return (S.inv.YUMURTA || 0) > 0;
  if (action === 'build_ahir') return S.built.ahır;
  if (action === 'buy_cow') return S.co > 0;
  if (action === 'collect_milk') return (S.inv.SUT || 0) > 0;
  if (action === 'build_sutislem') return S.built.sutislem;
  if (action === 'make_yogurt') return (S.inv.YOGURT || 0) > 0;
  if (action === 'build_peynirfab') return S.built.peynirfab;
  if (action === 'make_cheese') return (S.inv.PEYNIR || 0) > 0;
  if (action === 'make_butter') return (S.inv.TEREYAGI || 0) > 0;
  if (action === 'plant_domates') return S.plots.some(p => p.crop === 'DOMATES');
  if (action === 'harvest_domates') return (S.inv.DOMATES || 0) > 0;
  if (action === 'build_salçafab') return S.built.salçafab;
  if (action === 'make_salca') return (S.inv.SALCA || 0) > 0;
  return false;
}

const UIManager = {
  openM: function(id) {
    document.getElementById('m' + id.charAt(0).toUpperCase() + id.slice(1)).classList.add('active');
    UIManager.renderM(id);
  },

  closeM: function(id) {
    let el = document.getElementById('m' + id.charAt(0).toUpperCase() + id.slice(1));
    if (el) el.classList.remove('active');
  },

  renderM: function(id) {
    if (id === 'shop') {
      let l = document.getElementById('shopList'); l.innerHTML = '';
      let tohumDiv = document.createElement('div'); tohumDiv.style.cssText = 'color:#ffe082;font-weight:bold;margin-bottom:5px;font-size:13px';
      tohumDiv.innerHTML = '&#127793; Tohumlar'; l.appendChild(tohumDiv);
      let grid = document.createElement('div'); grid.className = 'catalog-grid';
      Object.entries(CROPS).forEach(([k, cr]) => {
        let d = document.createElement('div'); d.className = 'catalog-item';
        let cv = document.createElement('canvas'); cv.width = 50; cv.height = 50;
        Drawing.drawMiniCrop(cv.getContext('2d'), k, 50);
        d.appendChild(cv);
        let nm = document.createElement('div'); nm.className = 'catalog-name'; nm.textContent = cr.name; d.appendChild(nm);
        let pr = document.createElement('div'); pr.className = 'catalog-price'; pr.textContent = cr.buy + ' TL'; d.appendChild(pr);
        let det = document.createElement('div'); det.className = 'catalog-detail';
        det.innerHTML = `<b>${cr.name}</b><span>Max: ${cr.mk}kg</span><span>Hasat: ${cr.harvestInt} gun</span>`;
        d.appendChild(det);
        d.onclick = () => UIManager.buySeed(k, cr);
        grid.appendChild(d);
      });
      l.appendChild(grid);
      let hayvanDiv = document.createElement('div'); hayvanDiv.style.cssText = 'color:#ffe082;font-weight:bold;margin:10px 0 5px;font-size:13px';
      hayvanDiv.innerHTML = '&#128004; Hayvanlar'; l.appendChild(hayvanDiv);
      let agrid = document.createElement('div'); agrid.className = 'animal-grid';
      Object.entries(ANIM).forEach(([k, a]) => {
        let d = document.createElement('div'); d.className = 'animal-card';
        let cv = document.createElement('canvas'); cv.width = 60; cv.height = 50;
        Drawing.drawMiniAnimal(cv.getContext('2d'), k, 60);
        d.appendChild(cv);
        let nm = document.createElement('div'); nm.className = 'ac-name'; nm.textContent = a.name; d.appendChild(nm);
        let info = document.createElement('div'); info.className = 'ac-info'; info.textContent = a.prod + ' | Yem: ' + a.feed + 'TL'; d.appendChild(info);
        let pr = document.createElement('div'); pr.className = 'ac-price'; pr.textContent = a.price + ' TL'; d.appendChild(pr);
        d.onclick = () => UIManager.buyA(k); agrid.appendChild(d);
      });
      l.appendChild(agrid);
    }
    if (id === 'animal') {
      let l = document.getElementById('animalList'); l.innerHTML = '';
      let agrid = document.createElement('div'); agrid.className = 'animal-grid';
      Object.entries(ANIM).forEach(([k, a]) => {
        let cnt = k === 'TAVUK' ? S.ch : k === 'INEK' ? S.co : S.sh;
        let cap = k === 'TAVUK' ? 5 + (S.buildingLevel.kümes || 1) : 3 + (S.buildingLevel.ahır || 1);
        let d = document.createElement('div'); d.className = 'animal-card';
        let cv = document.createElement('canvas'); cv.width = 60; cv.height = 50;
        Drawing.drawMiniAnimal(cv.getContext('2d'), k, 60);
        d.appendChild(cv);
        let nm = document.createElement('div'); nm.className = 'ac-name'; nm.textContent = a.name; d.appendChild(nm);
        let info = document.createElement('div'); info.className = 'ac-info';
        info.innerHTML = `${cnt}/${cap}<br>${a.prod} | Her ${a.int} gun`; d.appendChild(info);
        let btn = document.createElement('button'); btn.style.cssText = 'margin-top:4px;background:#5a8c3a;color:#fff;border:1px solid #8bc34a;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:bold';
        btn.textContent = `Satın al ${a.price} TL`; btn.onclick = () => UIManager.buyA(k); d.appendChild(btn);
        agrid.appendChild(d);
      });
      l.appendChild(agrid);
    }
    if (id === 'storage') {
      let cap = 500 + S.st.DEPO * 200, used = Object.values(S.inv).reduce((a, b) => a + b, 0);
      document.getElementById('storBar').innerHTML = `<div style="font-size:12px;color:#ccc">${used.toFixed(0)} / ${cap} kg</div><div class="sbar"><div class="sfill" style="width:${Math.min(100, used / cap * 100)}%"></div></div>`;
      let l = document.getElementById('storList'); l.innerHTML = '';
      let grid = document.createElement('div'); grid.className = 'catalog-grid';
      [{ k: 'DOMATES', n: 'Domates', u: 'kg' }, { k: 'PATATES', n: 'Patates', u: 'kg' }, { k: 'SALATALIK', n: 'Salatalık', u: 'kg' }, { k: 'MARUL', n: 'Marul', u: 'kg' }, { k: 'BIBER', n: 'Biber', u: 'kg' }, { k: 'PATLICAN', n: 'Patlıcan', u: 'kg' }, { k: 'MISIR', n: 'Mısır', u: 'kg' }, { k: 'KABAK', n: 'Kabak', u: 'kg' }, { k: 'SOGAN', n: 'Soğan', u: 'kg' }, { k: 'BUGDAY', n: 'Buğday', u: 'kg' }, { k: 'YUMURTA', n: 'Yumurta', u: 'adet' }, { k: 'SUT', n: 'Süt', u: 'litre' }, { k: 'YUN', n: 'Yün', u: 'adet' }, { k: 'UN', n: 'Un', u: 'kg' }, { k: 'EKMEK', n: 'Ekmek', u: 'adet' }, { k: 'YOGURT', n: 'Yoğurt', u: 'kg' }, { k: 'PEYNIR', n: 'Peynir', u: 'kg' }, { k: 'TEREYAGI', n: 'Tereyağı', u: 'kg' }, { k: 'SALCA', n: 'Salça', u: 'kg' }].forEach(it => {
        let amt = it.k === 'UN' ? (S.invUN || 0) : it.k === 'EKMEK' ? (S.invEKMEK || 0) : (S.inv[it.k] || 0);
        let d = document.createElement('div'); d.className = 'catalog-item';
        d.style.opacity = amt > 0 ? 1 : 0.3;
        let cv = document.createElement('canvas'); cv.width = 50; cv.height = 50;
        let ctx = cv.getContext('2d');
        if (['YUMURTA', 'SUT', 'YUN', 'UN', 'EKMEK'].includes(it.k)) Drawing.drawMiniProduct(ctx, it.k, 50);
        else Drawing.drawMiniCrop(ctx, it.k, 50);
        d.appendChild(cv);
        let nm = document.createElement('div'); nm.className = 'catalog-name'; nm.textContent = it.n; d.appendChild(nm);
        let pr = document.createElement('div'); pr.className = 'catalog-price';
        pr.textContent = amt > 0 ? amt.toFixed(0) + ' ' + it.u : 'Boş'; pr.style.color = amt > 0 ? '#8bc34a' : '#666'; d.appendChild(pr);
        grid.appendChild(d);
      });
      l.appendChild(grid);
      if (!grid.children.length) l.innerHTML = '<div style="text-align:center;color:#666;padding:15px">&#128230; Depo boş!</div>';
    }
  },

  closeAllModals: function() { ['plant', 'plot', 'shop', 'animal', 'storage', 'whole', 'tesisler'].forEach(m => UIManager.closeM(m)); },

  openPlantM: function(r, c) {
    let l = document.getElementById('plantList'); l.innerHTML = ''; let isWinter = S.sea === 3;
    let tip = document.createElement('div'); tip.style.cssText = 'color:#ffe082;font-size:11px;margin-bottom:6px;padding:4px 8px;background:rgba(0,0,0,0.3);border-radius:4px';
    tip.textContent = 'Tohum seç → tarlalara tıkla → boş yere tıkla = bitir'; l.appendChild(tip);
    let grid = document.createElement('div'); grid.className = 'catalog-grid';
    Object.entries(CROPS).forEach(([k, cr]) => {
      let ok = !isWinter;
      let d = document.createElement('div'); d.className = 'catalog-item';
      let cv = document.createElement('canvas'); cv.width = 50; cv.height = 50;
      Drawing.drawMiniCrop(cv.getContext('2d'), k, 50);
      d.appendChild(cv);
      let nm = document.createElement('div'); nm.className = 'catalog-name'; nm.textContent = cr.name; d.appendChild(nm);
      let pr = document.createElement('div'); pr.className = 'catalog-price'; pr.textContent = cr.buy + ' TL'; d.appendChild(pr);
      let det = document.createElement('div'); det.className = 'catalog-detail';
      det.innerHTML = `<b>${cr.name}</b><span>Max: ${cr.mk}kg</span><span>Hasat: ${cr.harvestInt}</span>${isWinter ? '<span style="color:#ef5350">Kışın ekilmez!</span>' : ''}`;
      d.appendChild(det);
      if (!ok) { d.style.opacity = '.3'; d.style.cursor = 'not-allowed' }
      else d.onclick = () => { if (S.money < cr.buy) { toast('Yeterli paran yok!'); return } window.plantMode = k; UIManager.closeM('plant'); window.lastPlantClick = -1; toast(`${cr.name} ekim modu! Tarlalara tıkla. Çıkmak için boş yere tıkla.`); window.draw(); };
      grid.appendChild(d);
    });
    l.appendChild(grid); UIManager.openM('plant');
  },

  openPlotM: function(r, c) {
    let p = getP(r, c), cr = CROPS[p.crop]; if (!cr) return;
    let age = (p.age / 365).toFixed(1), ib = p.w ? Math.min(.2, S.st.SULAMA * .04) : 0, pb = p.p ? Math.min(.2, S.st.ICLAMA * .04) : 0;
    let g = Math.min(1, (p.age / 365) / cr.my), y = cr.mk * g * cr.sea[S.sea];
    if (!p.w) y = 0; if (p.crop === 'BUGDAY') y = Math.min(y, 1);
    if (p.w) y *= (1 + ib); if (p.p) y *= (1 + pb);
    y = Math.max(y, y > 0 ? 0.1 : 0); let ys = y.toFixed(1);
    let harvestText = ''; let canHarvest = p.nextHarvest <= 0;
    if (!canHarvest) { let hrs = Math.floor(p.nextHarvest / 60); let mins = p.nextHarvest % 60; harvestText = `<div>Siradaki hasat: <b>${hrs}sa ${mins}dk</b></div>` }
    else { harvestText = `<div style="color:#8bc34a;font-weight:bold">Hasat hazir!</div>` }
    document.getElementById('plotT').textContent = cr.name;
    let hc = p.harvestCount || 0; let mh = cr.maxHarvest || 1;
    document.getElementById('plotI').innerHTML = `<div>Yas: <b>${age} yil</b></div><div>Tahmini: <b>${ys} kg</b></div>${harvestText}<div>Hasat: <b>${mh === 1 ? 'Tek seferlik' : (mh - hc) + '/' + mh + ' kaldi'}</b></div><div>Sulama: <b>${p.w ? 'Evet' : 'Yok'}</b></div><div>İlaçlama: <b>${p.p ? 'Evet' : 'Yok'}</b></div>`;
    let bH = document.getElementById('bH'); bH.disabled = !canHarvest; bH.style.opacity = canHarvest ? 1 : .4;
    document.getElementById('bW').disabled = p.w; document.getElementById('bW').style.opacity = p.w ? .4 : 1;
    document.getElementById('bP').disabled = p.p; document.getElementById('bP').style.opacity = p.p ? .4 : 1; UIManager.openM('plot');
  },

  updateHUD: function() {
    let ck = document.getElementById('clock'); ck.textContent = `${String(S.h).padStart(2, '0')}:${String(S.m).padStart(2, '0')}`;
    document.getElementById('hDay').textContent = S.day;
    let ss = document.getElementById('hSeason'); ss.textContent = SEASONS[S.sea];
    document.getElementById('hYear').textContent = S.yr;
    document.getElementById('hMoney').textContent = S.money.toLocaleString() + ' TL';
    document.getElementById('hWhole').textContent = S.whArr ? 'Toptancı burada!' : `Toptancı: ${String(S.whH).padStart(2, '0')}:${String(S.whM).padStart(2, '0')}`;
    let wNames = { güneşli: 'Güneşli', bulutlu: 'Bulutlu', yağmurlu: 'Yağmurlu', karlı: 'Karlı' };
    document.getElementById('hWeather').textContent = WEATHER_ICONS[S.weather] + ' ' + wNames[S.weather];
    let windIcon = S.windSpeed < 5 ? '&#127794;' : S.windSpeed < 10 ? '&#127796;' : '&#127744;';
    document.getElementById('hWind').innerHTML = windIcon + ' Rüzgar: ' + S.windSpeed + ' km/h';
  },

  toast: function(m) { let t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); },

  openTesisler: function() {
    let grid = document.getElementById('tesisGrid'); grid.innerHTML = '';
    let tesisFiyat = { Ev: 0, Ahır: 2500, Kümes: 1500, Değirmen: 3000, Kuyu: 2000, Tarla: 100, Fırın: 2500, 'Süt İşleme': 3500, 'Peynir Fab': 4000, 'Salça Fab': 3000 };
    let tesisKey = { Ev: 'ev', Ahır: 'ahır', Kümes: 'kümes', Değirmen: 'degirmen', Kuyu: 'kuyu', Tarla: 'grid', Fırın: 'fırın', 'Süt İşleme': 'sutislem', 'Peynir Fab': 'peynirfab', 'Salça Fab': 'salçafab' };
    let tesisler = [
      { name: 'Ev', fn: Drawing.drawHouseToCanvas, bg: '#8d6e63', free: true },
      { name: 'Tarla', fn: Drawing.drawGridToCanvas, bg: '#6d4c41' },
      { name: 'Ahır', fn: Drawing.drawBarnToCanvas, bg: '#8B2500' },
      { name: 'Kümes', fn: Drawing.drawKümesToCanvas, bg: '#8B6914' },
      { name: 'Değirmen', fn: Drawing.drawWindmillToCanvas, bg: '#e8e0d0' },
      { name: 'Kuyu', fn: Drawing.drawWellToCanvas, bg: '#29b6f6' },
      { name: 'Fırın', fn: Drawing.drawFırınToCanvas, bg: '#d84315' },
      { name: 'Süt İşleme', fn: Drawing.drawSutIslemToCanvas, bg: '#42a5f5' },
      { name: 'Peynir Fab', fn: Drawing.drawPeynirFabToCanvas, bg: '#fdd835' },
      { name: 'Salça Fab', fn: Drawing.drawSalcaFabToCanvas, bg: '#e53935' }
    ];
    tesisler.forEach(t => {
      let d = document.createElement('div'); d.className = 'tesis-item';
      let cv = document.createElement('canvas'); cv.width = 80; cv.height = 80;
      let cx = cv.getContext('2d');
      t.fn(cx, 80);
      d.appendChild(cv);
      let sp = document.createElement('span'); sp.textContent = t.name; d.appendChild(sp);
      if (!t.free) {
        let key = tesisKey[t.name];
        let built = S.built[key];
        let info = document.createElement('div'); info.style.cssText = 'font-size:10px;margin-top:3px;';
        if (built) { info.style.color = '#81c784'; info.textContent = 'İnşa Edildi' }
        else { info.style.color = '#ef9a9a'; info.textContent = tesisFiyat[t.name] + ' TL' }
        d.appendChild(info);
        if (!built) {
          let btn = document.createElement('button'); btn.style.cssText = 'background:#5a8c3a;color:#fff;border:1px solid #8bc34a;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:10px;font-weight:bold;margin-top:4px';
          btn.textContent = 'Satın al ' + tesisFiyat[t.name] + ' TL';
          btn.onclick = function(e) { e.stopPropagation(); UIManager.buyBuilding(key, tesisFiyat[t.name], t.name) };
          d.appendChild(btn);
        } else {
            let lv = S.buildingLevel ? S.buildingLevel[key] || 1 : 1;
            let lvDiv = document.createElement('div'); lvDiv.style.cssText = 'font-size:11px;color:#ffeb3b;margin-top:3px;font-weight:bold';
            lvDiv.textContent = 'Seviye: ' + lv + '/' + BUILDING_MAX_LEVEL;
            d.appendChild(lvDiv);
            if (key !== 'grid' && lv < BUILDING_MAX_LEVEL) {
              let cost = getUpgradeCost(key);
              let desc = UPGRADE_DESC[key] ? UPGRADE_DESC[key].effect(lv + 1) : '';
              let upgBtn = document.createElement('button'); upgBtn.style.cssText = 'background:#6a1b9a;color:#fff;border:1px solid #ab47bc;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:10px;font-weight:bold;margin-top:3px';
              upgBtn.textContent = '⬆ Geliştir ' + cost.toLocaleString() + ' TL';
              upgBtn.title = desc;
              upgBtn.onclick = function(e) { e.stopPropagation(); UIManager.upgradeBuilding(key); UIManager.openTesisler() };
              d.appendChild(upgBtn);
            } else if (key !== 'grid' && lv >= BUILDING_MAX_LEVEL) {
              let maxDiv = document.createElement('div'); maxDiv.style.cssText = 'font-size:10px;color:#ffd54f;margin-top:3px;font-weight:bold';
              maxDiv.textContent = '⭐ Maks Seviye!';
              d.appendChild(maxDiv);
            }
            let moveBtn = document.createElement('button'); moveBtn.style.cssText = 'background:#5d4037;color:#ffe082;border:1px solid #c8956c;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:10px;font-weight:bold;margin-top:4px';
            moveBtn.textContent = '📍 Taşıma Modu';
            moveBtn.onclick = function(e) { e.stopPropagation(); UIManager.closeM('tesisler'); UIManager.startDrag(key) };
            d.appendChild(moveBtn);
          }
        }
      grid.appendChild(d);
    });
    let rl = S.roadLevel || 0;
    let roadNames = ['Toprak Yol', 'Taş Yol', 'Asfalt Yol'];
    let roadCosts = [0, 3000, 8000];
    let nextNames = ['', 'Taş Yol', 'Asfalt Yol'];
    let rd = document.createElement('div'); rd.className = 'tesis-item';
    let rcv = document.createElement('canvas'); rcv.width = 80; rcv.height = 80;
    let rcx = rcv.getContext('2d');
    Drawing.drawRoadTesisToCanvas(rcx, 80);
    rd.appendChild(rcv);
    let rsp = document.createElement('span'); rsp.textContent = 'Yol Kalitesi'; rd.appendChild(rsp);
    let rlv = document.createElement('div'); rlv.style.cssText = 'font-size:11px;color:#ffeb3b;margin-top:3px;font-weight:bold';
    rlv.textContent = roadNames[rl] + ' (' + rl + '/2)';
    rd.appendChild(rlv);
    if (rl < 2) {
      let cost = roadCosts[rl + 1];
      let ubtn = document.createElement('button'); ubtn.style.cssText = 'background:#6a1b9a;color:#fff;border:1px solid #ab47bc;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:10px;font-weight:bold;margin-top:3px';
      ubtn.textContent = '⬆ ' + nextNames[rl + 1] + ' Yap ' + cost.toLocaleString() + ' TL';
      ubtn.onclick = function(e) { e.stopPropagation(); window.upgradeRoad(); UIManager.openTesisler() };
      rd.appendChild(ubtn);
    } else {
      let mx = document.createElement('div'); mx.style.cssText = 'font-size:10px;color:#ffd54f;margin-top:3px;font-weight:bold';
      mx.textContent = '⭐ Maksimum!';
      rd.appendChild(mx);
    }
    grid.appendChild(rd);
    document.getElementById('mTesisler').classList.add('active');
  },

  toggleMissions: function() { let box = document.getElementById('missionBox'); box.classList.toggle('show'); },

  renderMissions: function() {
    let l = document.getElementById('missionList'); l.innerHTML = '';
    S.missions.forEach((m, i) => {
      let prog = Math.min(S.missionProgress[i] || 0, m.target); let done = prog >= m.target;
      let d = document.createElement('div'); d.className = 'mi' + (done ? ' done' : '');
      d.innerHTML = `<span class="check"></span>${m.text} (${prog}/${m.target})`;
      if (done && !m.rewarded) { S.money += 100; m.rewarded = true; UIManager.toast('Görev tamamlandı! +100 TL') } l.appendChild(d);
    });
  },

  generateMissions: function() {
    S.missions = []; S.missionProgress = {}; let shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < shuffled.length; i++) { let m = shuffled[i]; S.missions.push({ ...m }); S.missionProgress[i] = 0; }
  },

  checkMissions: function() {
    S.missions.forEach((m, i) => {
      if (S.missionProgress[i] >= m.target) return;
      if (m.type === 'harvest') { S.missionProgress[i] = S.dailyHarvest[m.crop] || 0 }
      else if (m.type === 'animal') { S.missionProgress[i] = S.dailyAnimal[m.animal] || 0 }
      else if (m.type === 'sell') { S.missionProgress[i] = S.dailySold }
      else if (m.type === 'plant') { S.missionProgress[i] = S.plantCount }
      else if (m.type === 'water') { S.missionProgress[i] = S.waterCount }
    });
    UIManager.renderMissions();
  },

  renderTutorial: function() {
    let type = S.tutorial.type || 'bread';
    let steps = TUTORIAL_STEPS[type];
    if (!steps) return;
    let t = steps[S.tutorial.step];
    if (!t) return;
    document.getElementById('tutorialOverlay').style.display = 'flex';
    document.getElementById('tutorialTitle').textContent = t.title;
    let chainEl = document.getElementById('tutorialChain');
    chainEl.innerHTML = '';
    t.chain.forEach((icon, i) => {
      if (i > 0) { let arr = document.createElement('span'); arr.className = 'tc-arrow'; arr.textContent = '→'; chainEl.appendChild(arr) }
      let item = document.createElement('div');
      item.className = 'tc-item';
      if (i < S.tutorial.step) item.classList.add('done');
      else if (i === S.tutorial.step) item.classList.add('active');
      item.textContent = icon;
      chainEl.appendChild(item);
    });
    let btn = document.getElementById('tutorialBtn');
    if (S.tutorial.step === 0) { btn.textContent = 'Başla!'; btn.style.display = 'inline-block' }
    else if (S.tutorial.step >= steps.length - 1) { btn.style.display = 'none' }
    else if (window.tutorialStepDone) { btn.textContent = 'Sonraki Adım'; btn.style.display = 'inline-block' }
    else { btn.style.display = 'none' }
    let stepEl = document.getElementById('tutorialStep');
    let stepNum = document.getElementById('stepNum');
    let stepText = document.getElementById('stepText');
    let totalSteps = steps.length - 2;
    if (S.tutorial.step > 0 && S.tutorial.step < steps.length - 1) {
      stepEl.style.display = 'block';
      stepNum.textContent = 'Adım ' + S.tutorial.step + '/' + totalSteps;
      stepText.innerHTML = t.desc;
      if (t.action) {
        let actLabel = ACTION_LABELS[t.action] || '';
        if (actLabel) stepText.innerHTML += '<br><span class="step-action">' + actLabel + '</span>';
      }
    } else { stepEl.style.display = 'none' }
  },

  openTutorial: function() {
    if (!S.tutorial) S.tutorial = { active: true, step: 0, type: null, completed: false };
    S.tutorial.active = true;
    window.tutorialStepDone = false; window.tutorialMinimized = false;
    let box = document.getElementById('tutorialBox');
    if (box) { box.classList.remove('minimized') }
    let minBtn = document.getElementById('tutorialMinBtn');
    if (minBtn) { minBtn.textContent = '➖' }
    document.getElementById('tutorialOverlay').style.display = 'flex';
    document.getElementById('tutorialStep').style.display = 'none';
    UIManager.showProductSelector();
  },

  showProductSelector: function() {
    document.getElementById('tutorialTitle').textContent = '📚 Üretim Rehberi — Ürün Seç';
    document.getElementById('tutorialChain').innerHTML = '';
    document.getElementById('tutorialBtn').style.display = 'none';
    document.getElementById('tutorialStep').style.display = 'none';
    let chainEl = document.getElementById('tutorialChain');
    chainEl.style.display = 'grid'; chainEl.style.gridTemplateColumns = 'repeat(4,1fr)'; chainEl.style.gap = '8px';
    FOOD_GUIDES.forEach(fg => {
      let d = document.createElement('div');
      d.style.cssText = 'width:100%;aspect-ratio:1;border-radius:10px;border:2px solid ' + fg.color + ';background:rgba(0,0,0,0.3);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.15s;font-size:11px;color:' + fg.color + ';padding:4px';
      d.innerHTML = '<span style="font-size:28px">' + fg.icon + '</span><span>' + fg.name + '</span>';
      d.onmouseenter = () => d.style.transform = 'scale(1.08)';
      d.onmouseleave = () => d.style.transform = 'scale(1)';
      d.onclick = () => UIManager.startSpecificTutorial(fg.id);
      chainEl.appendChild(d);
    });
  },

  startSpecificTutorial: function(type) {
    if (!TUTORIAL_STEPS[type]) { UIManager.toast('Bu ürün için rehber henüz hazır değil!'); return }
    S.tutorial.type = type; S.tutorial.step = 0; S.tutorial.completed = false;
    window.tutorialStepDone = false;
    let chainEl = document.getElementById('tutorialChain');
    chainEl.style.display = 'flex'; chainEl.style.gridTemplateColumns = ''; chainEl.style.gap = '';
    UIManager.skipCompletedSteps(); UIManager.renderTutorial();
    let st = TUTORIAL_STEPS[type][S.tutorial.step];
    if (st) speakTR(st.speak);
  },

  closeTutorial: function() {
    document.getElementById('tutorialOverlay').style.display = 'none';
    document.getElementById('tutorialStep').style.display = 'none';
    speechSynthesis.cancel();
    S.tutorial.active = false; S.tutorial.type = null;
  },

  checkTutorialAction: function(action) {
    if (!S.tutorial || !S.tutorial.active || !S.tutorial.type) return;
    let steps = TUTORIAL_STEPS[S.tutorial.type];
    if (!steps) return;
    let current = steps[S.tutorial.step];
    if (!current || current.action !== action) return;
    window.tutorialStepDone = true;
    UIManager.toast('✅ Tamamlandı! Devam et...');
    let btn = document.getElementById('tutorialBtn');
    if (btn) { btn.textContent = 'Sonraki Adım'; btn.style.display = 'inline-block'; }
    speakTR('Tamamlandı!');
  },

  skipCompletedSteps: function() {
    let type = S.tutorial.type || 'bread';
    let steps = TUTORIAL_STEPS[type];
    if (!steps) return;
    while (S.tutorial.step < steps.length - 1) {
      let st = steps[S.tutorial.step];
      if (!st) break;
      if (st.action && isStepDone(st.action)) { S.tutorial.step++; window.tutorialStepDone = false; continue }
      if (S.tutorial.step > 0 && !st.action) { S.tutorial.step++; window.tutorialStepDone = false; continue }
      break;
    }
  },

  tutorialNext: function() {
    let type = S.tutorial.type || 'bread';
    let steps = TUTORIAL_STEPS[type];
    if (!steps) return;
    if (S.tutorial.step === 0) {
      S.tutorial.step = 1; window.tutorialStepDone = false;
      UIManager.skipCompletedSteps(); UIManager.renderTutorial();
      let st = steps[S.tutorial.step]; if (st) speakTR(st.speak);
    } else if (S.tutorial.step < steps.length - 1) {
      S.tutorial.step++; window.tutorialStepDone = false;
      UIManager.skipCompletedSteps(); UIManager.renderTutorial();
      let st = steps[S.tutorial.step]; if (st) speakTR(st.speak);
    }
  },

  toggleTutorialMinimize: function() {
    window.tutorialMinimized = !window.tutorialMinimized;
    let box = document.getElementById('tutorialBox');
    let minBtn = document.getElementById('tutorialMinBtn');
    if (window.tutorialMinimized) {
      box.classList.add('minimized');
      minBtn.textContent = '➕';
    } else {
      box.classList.remove('minimized');
      minBtn.textContent = '➖';
    }
  },

  showLoginTab: function(t) {
    document.querySelectorAll('.login-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('loginForm').style.display = t === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = t === 'register' ? 'block' : 'none';
    document.querySelectorAll('.login-tab')[t === 'login' ? 0 : 1].classList.add('active');
    document.getElementById('loginErr').style.display = 'none';
    document.getElementById('regErr').style.display = 'none';
  },

  showErr: function(id, msg) {
    let e = document.getElementById(id); e.textContent = msg; e.style.display = 'block';
  },

  activateTraktör: function() {
    S.tractorActive = !S.tractorActive; window.harvestModeActive = false; window.plantMode = null; window.pesticideModeActive = false;
    UIManager.toast(S.tractorActive ? 'Traktör aktif! Sürülmüş tarlalara tıkla.' : 'Traktör kapatıldı');
  },

  plowArea: function(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    let idx = r * COLS + c;
    if (S.plowed.includes(idx)) { UIManager.toast('Bu kare zaten sürülmüş!'); return }
    S.plowed.push(idx);
    let p = getP(r, c); if (p) p.plowTimer = 60;
    UIManager.advanceTime(); window.draw();
    let allPlowed = true;
    for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) { if (!S.plowed.includes(rr * COLS + cc)) allPlowed = false }
    if (allPlowed) { S.tractorActive = false; UIManager.toast('Tüm tarla sürüldü! Traktör kapatıldı.'); }
  },

  harvestP: function() {
    let p = getP(window.selR, window.selC); if (!p || !p.crop) return;
    if (p.nextHarvest > 0) { UIManager.toast('Hasat için bekleyin!'); return } let cr = CROPS[p.crop]; if (!cr) return;
    let ib = p.w ? Math.min(.2, S.st.SULAMA * .04) : 0, pb = p.p ? Math.min(.2, S.st.ICLAMA * .04) : 0;
    let g = Math.min(1, (p.age / 365) / cr.my); let y = cr.mk * g * cr.sea[S.sea];
    if (!p.w) y = 0;
    if (p.crop === 'BUGDAY') y = Math.min(y, 1);
    if (p.w) y *= (1 + ib); if (p.p) y *= (1 + pb);
    y = Math.max(y, y > 0 ? 0.1 : 0);
    let cap = 500 + S.st.DEPO * 200, used = Object.values(S.inv).reduce((a, b) => a + b, 0);
    if (y > 0 && (used + y) <= cap) {
      S.inv[p.crop] = (S.inv[p.crop] || 0) + y; S.dailyHarvest[p.crop] = (S.dailyHarvest[p.crop] || 0) + y;
      p.harvestCount = (p.harvestCount || 0) + 1; let mh = cr.maxHarvest || 1;
      if (p.harvestCount >= mh) { let cn = cr.name; p.crop = null; p.age = 0; p.w = false; p.p = false; p.nextHarvest = 0; p.harvestCount = 0; UIManager.toast(`${cn} bitkiniz tükendi! Yeni tohum ek.`) }
      else { p.age += 5; p.w = false; p.p = false; p.nextHarvest = p.crop === 'BUGDAY' ? 120 : 480; UIManager.toast(`${cr.name} hasat edildi! +${y.toFixed(1)} kg (Kalan: ${mh - p.harvestCount})`) }
      if (p.crop && p.crop === 'BUGDAY') UIManager.checkTutorialAction('harvest_bugday');
    } else if (y > 0) { UIManager.toast('Depo dolu!') }
    window.harvestModeActive = true; UIManager.closeM('plot'); UIManager.toast('Hasat modu! Diğer hazır tarlalara tıkla. Çıkmak için boş yere tıkla.'); window.draw(); UIManager.checkMissions();
  },

  waterP: function() {
    let p = getP(window.selR, window.selC); if (p && !p.w) { p.w = true; p.wetTimer = 1080; S.waterCount++; UIManager.advanceTime(); UIManager.closeM('plot'); UIManager.toast('Sulama yapıldı! 18 saat geçerli.'); window.draw(); UIManager.checkMissions(); }
  },

  pestP: function() {
    let p = getP(window.selR, window.selC); if (p && !p.p) { if (S.money < 50) { UIManager.toast('İlaçlama için 50 TL gerekli!'); return } S.money -= 50; p.p = true; UIManager.advanceTime(); UIManager.closeM('plot'); window.pesticideModeActive = true; S.tractorActive = false; window.harvestModeActive = false; window.plantMode = null; UIManager.toast('İlaçlama yapıldı! Diğer ilaçlanmamış tarlalara tıkla.'); window.draw(); UIManager.updateHUD(); }
  },

  removeC: function() {
    let p = getP(window.selR, window.selC); if (p) { if (S.money < 50) { UIManager.toast('50 TL gerekli!'); return } S.money -= 50; p.crop = null; p.age = 0; p.w = false; p.p = false; p.nextHarvest = 0; UIManager.closeM('plot'); UIManager.toast('Söküldü! -50 TL'); window.draw(); }
  },

  buyA: function(k) {
    let a = ANIM[k]; if (S.money < a.price) { UIManager.toast('Yeterli paran yok!'); return }
    if (k === 'TAVUK') {
      if (!S.built.kümes) { UIManager.toast('Önce kümes inşa et!'); return }
      let cap = 5 + (S.buildingLevel.kümes || 1); if (S.ch >= cap) { UIManager.toast('Kümes dolu!'); return } S.ch++;
      UIManager.checkTutorialAction('buy_chicken');
    } else if (k === 'INEK') {
      if (!S.built.ahır) { UIManager.toast('Önce ahır inşa et!'); return }
      let cap = 3 + (S.buildingLevel.ahır || 1); if (S.co >= cap) { UIManager.toast('Ahır dolu!'); return } S.co++;
      UIManager.checkTutorialAction('buy_cow');
    } else if (k === 'KOYUN') {
      if (!S.built.ahır) { UIManager.toast('Önce ahır inşa et!'); return }
      let cap = 3 + (S.buildingLevel.ahır || 1); if (S.sh >= cap) { UIManager.toast('Ahır dolu!'); return } S.sh++;
    }
    S.money -= a.price; UIManager.toast(`${a.name} alındı!`); UIManager.updateHUD(); window.draw(); UIManager.renderM('animal');
  },

  buySeed: function(k, cr) {
    window.plantMode = k; UIManager.closeM('shop'); window.lastPlantClick = -1; UIManager.toast(`${cr.name} ekim modu! Tarlalara tıkla. Çıkmak için boş yere tıkla.`); window.draw();
  },

  buyBuilding: function(k, price, name) {
    try {
      if (S.built[k]) { UIManager.toast('Zaten inşa edildi!'); return }
      if (S.money < price) { UIManager.toast('Yeterli paran yok! (' + price + ' TL)'); return }
      S.money -= price; S.built[k] = true;
      if (k === 'grid') {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          if (!S.plots.find(p => p.r === r && p.c === c)) S.plots.push({ r, c, crop: null, age: 0, w: false, p: false, nextHarvest: 0, harvestCount: 0, plowTimer: 1080, wetTimer: 0 });
          if (!S.plowed.includes(r * COLS + c)) S.plowed.push(r * COLS + c);
        }
      }
      S.animateBuilding = { key: k, t: Date.now() };
      UIManager.closeM('tesisler');
      UIManager.updateHUD(); window.draw();
      if (k === 'grid') {
        UIManager.checkTutorialAction('build_grid');
      } else {
        UIManager.toast(BUILDING_NAMES[k] + ' inşa edildi! Taşıma Modu ile yerini değiştirebilirsin.');
      }
      if (k === 'kuyu') UIManager.checkTutorialAction('build_kuyu');
      if (k === 'degirmen') UIManager.checkTutorialAction('build_degirmen');
      if (k === 'fırın') UIManager.checkTutorialAction('build_fırın');
      if (k === 'kümes') UIManager.checkTutorialAction('build_kümes');
      if (k === 'ahır') UIManager.checkTutorialAction('build_ahir');
      if (k === 'sutislem') UIManager.checkTutorialAction('build_sutislem');
      if (k === 'peynirfab') UIManager.checkTutorialAction('build_peynirfab');
      if (k === 'salçafab') UIManager.checkTutorialAction('build_salçafab');
    } catch (e) {
      UIManager.toast('Hata oluştu: ' + e.message);
    }
  },

  upgradeBuilding: function(k) {
    if (!S.built[k]) { UIManager.toast('Önce inşa et!'); return }
    let lv = S.buildingLevel[k] || 1;
    if (lv >= BUILDING_MAX_LEVEL) { UIManager.toast('Maks seviyeye ulaşıldı!'); return }
    let cost = getUpgradeCost(k);
    if (S.money < cost) { UIManager.toast('Yeterli paran yok! (' + cost.toLocaleString() + ' TL)'); return }
    S.money -= cost; S.buildingLevel[k] = lv + 1;
    UIManager.toast(UPGRADE_DESC[k].name + ' seviye ' + (lv + 1) + ' oldu!');
    UIManager.updateHUD(); window.draw();
  },

  genWhole: function() { S.whH = 12 + Math.floor(Math.random() * 4); S.whM = Math.floor(Math.random() * 6) * 10; },
  checkWhole: function() { if (S.whArr || S.whDis) return; if (S.h > S.whH || (S.h === S.whH && S.m >= S.whM)) { S.whArr = true; UIManager.showWhole(); } },
  showWhole: function() {
    let keys = Object.keys(CROPS).concat(['YUMURTA', 'SUT', 'YUN']); let wk = keys[Math.floor(Math.random() * keys.length)];
    let wkgs = wk === 'YUMURTA' ? Math.floor(2 + S.ch * 2) : wk === 'SUT' ? Math.floor(1 + S.co * 2) : wk === 'YUN' ? Math.floor(1 + S.sh) : Math.floor(3 + Math.random() * 15);
    let bp = CROPS[wk] ? CROPS[wk].sell : wk === 'YUMURTA' ? ANIM.TAVUK.sell : ANIM.INEK.sell;
    let pr = Math.round(bp * (.8 + Math.random() * .4)); let nm = CROPS[wk] ? CROPS[wk].name : wk === 'YUMURTA' ? 'Yumurta' : 'Süt';
    S.curW = { crop: wk, kg: wkgs, price: pr, name: nm }; setTimeout(() => UIManager.showWholeDlg(), 500);
  },
  showWholeDlg: function() {
    let w = S.curW; if (!w) return; let av = S.inv[w.crop] || 0, tot = Math.round(w.kg * w.price);
    let unit = w.crop === 'YUMURTA' ? 'adet' : w.crop === 'SUT' ? 'litre' : w.crop === 'YUN' ? 'adet' : 'kg';
    document.getElementById('wholeI').innerHTML = `<div style="text-align:center;font-size:15px;margin-bottom:6px"><b>${w.name}</b> arıyorum!</div>
      <div style="font-size:13px">Miktar: <b>${w.kg} ${unit}</b></div><div style="font-size:13px">Fiyat: <b>${w.price} TL/${unit}</b></div>
      <div style="font-size:15px;margin-top:4px">Toplam: <b style="color:#8bc34a">${tot.toLocaleString()} TL</b></div>
      <div style="font-size:13px">Sende: <b>${av.toFixed(0)} ${unit}</b></div>`;
    let b = document.getElementById('btnSell'); if (av >= w.kg) { b.textContent = `Sat (${tot.toLocaleString()} TL)`; b.disabled = false; b.style.opacity = 1 }
    else { b.textContent = 'Yetersiz stok'; b.disabled = true; b.style.opacity = .4 } UIManager.openM('whole');
  },
  sellW: function() {
    let w = S.curW; if (!w) return; let av = S.inv[w.crop] || 0; if (av < w.kg) return;
    let unit = w.crop === 'YUMURTA' ? 'adet' : w.crop === 'SUT' ? 'litre' : w.crop === 'YUN' ? 'adet' : 'kg';
    S.inv[w.crop] -= w.kg; S.money += Math.round(w.kg * w.price); S.totalSold += Math.round(w.kg * w.price); S.dailySold += Math.round(w.kg * w.price);
    UIManager.toast(`${w.kg} ${unit} ${w.name} satıldı! +${Math.round(w.kg * w.price).toLocaleString()} TL`); UIManager.dismissW(); UIManager.checkMissions();
  },
  dismissW: function() { S.whDis = true; S.curW = null; UIManager.closeM('whole'); UIManager.updateHUD(); },

  advanceTime: function() {
    S.m += 10; while (S.m >= 60) { S.m -= 60; S.h++ } if (S.h >= 22) { UIManager.newDay(); return }
    if (S.irrigating) {
      if (S.h > S.irrigEndH || (S.h === S.irrigEndH && S.m >= S.irrigEndM)) {
        S.irrigating = false;
        let elapsedMin = (S.h - S.irrigStartH) * 60 + (S.m - S.irrigStartM);
        if (elapsedMin >= 40) {
          S.plots.forEach(p => { p.w = true; p.wetTimer = 1080 });
          UIManager.toast('Sulama tamamlandı! Tarla sulandı. (' + elapsedMin + ' dk)');
        } else {
          UIManager.toast('Sulama süreyi tamamlamadı! (' + elapsedMin + ' dk < 40 dk) Sulanmadı.');
        }
      }
    }
    Object.keys(S.lastHarvestTime).forEach(k => { if (S.lastHarvestTime[k] > 0) S.lastHarvestTime[k]-- });
    S.plots.forEach(p => {
      if (p.crop && p.nextHarvest > 0) p.nextHarvest = Math.max(0, p.nextHarvest - 10);
      if (p.w && p.wetTimer > 0) { p.wetTimer -= 10; if (p.wetTimer <= 0) { p.w = false; p.wetTimer = 0 } }
      if (S.plowed.includes(p.r * COLS + p.c) && !p.crop) {
        if (!p.plowTimer) p.plowTimer = 60;
        p.plowTimer -= 10;
        if (p.plowTimer <= 0) {
          let idx = p.r * COLS + p.c; let pi = S.plowed.indexOf(idx); if (pi >= 0) S.plowed.splice(pi, 1);
          p.plowTimer = 60;
        }
      }
    });
    UIManager.checkWhole(); UIManager.updateHUD(); UIManager.checkMissions();
    let plotModal = document.getElementById('mPlot');
    if (plotModal && plotModal.classList.contains('active') && window.selR >= 0) {
      let sp = getP(window.selR, window.selC);
      if (sp && sp.crop) UIManager.openPlotM(window.selR, window.selC);
    }
  },

  newDay: function() {
    S.h = 6; S.m = 0; S.day++; if (S.day > 90) { S.day = 1; S.sea = (S.sea + 1) % 4; if (S.sea === 0) S.yr++ }
    GameManager.harvest(); GameManager.feedAnimals(); UIManager.genWhole(); S.whArr = false; S.whDis = false;
    Object.keys(S.dailyHarvest).forEach(k => S.dailyHarvest[k] = 0);
    S.dailyAnimal.YUMURTA = 0; S.dailyAnimal.SUT = 0; S.dailySold = 0;
    S.plantCount = 0; S.waterCount = 0;
    window.sutCount = 0; window.yumurtaCount = 0;
    GameManager.changeWeather();
    document.getElementById('infoPanel').textContent = FACTS[Math.floor(Math.random() * FACTS.length)];
    document.getElementById('infoPanel').style.opacity = '1'; setTimeout(() => { document.getElementById('infoPanel').style.opacity = '0' }, 20000);
    UIManager.generateMissions(); UIManager.updateHUD(); UIManager.renderMissions();
  },

  getBuildingAt: function(mx, my) {
    let sc = window.screenToScene(mx, my); let sx = sc.x, sy = sc.y;
    let keys = Object.keys(BUILDING_NAMES);
    for (let i = keys.length - 1; i >= 0; i--) {
      let k = keys[i];
      if (k === 'grid') {
        if (!S.built.grid) continue;
        if (sx >= window.GX && sx <= window.GX + COLS * (window.GRID_CL||window.CL) && sy >= window.GY && sy <= window.GY + ROWS * (window.GRID_CL||window.CL)) return k;
      } else if (k === 'kuyu') {
        if (!S.built.kuyu) continue;
        if (typeof window.wellS === 'undefined') continue;
        if (Math.abs(sx - window.wellX) < window.wellS * 0.7 && Math.abs(sy - window.wellY) < window.wellS * 0.7) return k;
      } else if (k === 'ahır') {
        if (!S.built.ahır) continue;
        if (typeof window.barnS === 'undefined') continue;
        if (Math.abs(sx - window.barnX) < window.barnS * 0.7 && Math.abs(sy - window.barnY) < window.barnS * 0.7) return k;
      } else if (k === 'kümes') {
        if (!S.built.kümes) continue;
        if (typeof window.kümesS === 'undefined') continue;
        if (Math.abs(sx - window.kümesX) < window.kümesS * 0.7 && Math.abs(sy - window.kümesY) < window.kümesS * 0.7) return k;
      } else if (k === 'degirmen') {
        if (!S.built.degirmen) continue;
        if (typeof window.wmS === 'undefined') continue;
        if (Math.abs(sx - window.wmX) < window.wmS * 0.7 && Math.abs(sy - window.wmY) < window.wmS * 0.7) return k;
      } else if (k === 'fırın') {
        if (!S.built.fırın) continue;
        if (typeof window.firinS === 'undefined') continue;
        if (Math.abs(sx - window.firinX) < window.firinS * 0.7 && Math.abs(sy - window.firinY) < window.firinS * 0.7) return k;
      } else if (k === 'sutislem') {
        if (!S.built.sutislem) continue;
        if (typeof window.sutIslemS === 'undefined') continue;
        if (Math.abs(sx - window.sutIslemX) < window.sutIslemS * 0.7 && Math.abs(sy - window.sutIslemY) < window.sutIslemS * 0.7) return k;
      } else if (k === 'peynirfab') {
        if (!S.built.peynirfab) continue;
        if (typeof window.peynirS === 'undefined') continue;
        if (Math.abs(sx - window.peynirX) < window.peynirS * 0.7 && Math.abs(sy - window.peynirY) < window.peynirS * 0.7) return k;
      } else if (k === 'salçafab') {
        if (!S.built.salçafab) continue;
        if (typeof window.salcaS === 'undefined') continue;
        if (Math.abs(sx - window.salcaX) < window.salcaS * 0.7 && Math.abs(sy - window.salcaY) < window.salcaS * 0.7) return k;
      }
    }
    return null;
  },

  startDrag: function(key) {
    S.dragging = key;
    UIManager.toast('Binayı sürükle bırakın. ESC ile iptal.');
  },

  cancelDrag: function() {
    if (!S.dragging) return;
    S.dragging = null;
    S.buildingMenu = null;
    UIManager.toast('Taşıma iptal edildi.');
    window.draw();
  },

  finishDrag: function() {
    try {
      if (!S.dragging) { return; }
      let key = S.dragging;
      let pos = UIManager.getBuildingCenter(key);
      if (!pos) { UIManager.cancelDrag(); return }
      let valid = UIManager.isValidPlacement(key, pos.x, pos.y);
      if (!valid) {
        UIManager.toast('Geçersiz konum! Başka bir yere bırakın.');
        return;
      }
      S.buildingPos[key] = { x: pos.x, y: pos.y };
      if (key === 'grid' && GRID_LINKED_KUYU && S.built.kuyu) {
        let defKuyu = UIManager.getDefaultKuyuPos();
        if (!S.buildingPos.kuyu) {
          S.buildingPos.kuyu = { x: defKuyu.x, y: defKuyu.y };
        }
        S.buildingPos.kuyu.x = pos.x + defKuyu.dx;
        S.buildingPos.kuyu.y = pos.y + defKuyu.dy;
      }
      S.dragging = null;
      window.wasPanning = true;
      UIManager.toast(BUILDING_NAMES[key] + ' yerleştirildi!');
      window.draw();
    } catch (e) {
      UIManager.toast('Hata oluştu: ' + e.message);
    }
  },

  getBuildingCenter: function(key) {
    if (!S.dragging) return null;
    return { x: S.dragX, y: S.dragY };
  },

  getDefaultKuyuPos: function() {
    let gcx = window.GX + COLS * (window.GRID_CL||window.CL) / 2;
    let gbottom = window.GY + ROWS * (window.GRID_CL||window.CL);
    let mwy = window.H - 48 - window.CL * 1.2;
    let ky = Math.min(gbottom + window.CL * 1.5, mwy);
    return { x: gcx, y: ky, dx: 0, dy: Math.min(gbottom + window.CL * 1.5, mwy) - window.GY };
  },

  isValidPlacement: function(key, x, y) {
    let pad = window.CL * 0.5;
    if (x < pad || x > window.W - pad || y < pad || y > window.H - 48 - pad) { return false; }
    let hx = (function () {
      let hs = window.CL * (window.ISLANDSCAPE ? 2.8 : 2.0);
      let hg = window.CL * 1.2;
      let hvx = Math.min(window.GX - hg, window.W * 0.16 + hs);
      hvx = Math.max(hs + window.CL * 0.3, hvx);
      return hvx;
    })();
    let hy = window.sceneTop;
    if (key !== 'grid' && Math.abs(x - hx) < window.CL * 3 && Math.abs(y - hy) < window.CL * 3) return false;
    if (key !== 'grid') {
      if (S.built.grid && x > window.GX - (window.GRID_CL||window.CL) * 2 && x < window.GX + COLS * (window.GRID_CL||window.CL) + (window.GRID_CL||window.CL) * 2 && y > window.GY - (window.GRID_CL||window.CL) * 2 && y < window.GY + ROWS * (window.GRID_CL||window.CL) + (window.GRID_CL||window.CL) * 2) return false;
    }
    if (key === 'grid') {
      if (x < (window.GRID_CL||window.CL) * 2 || x + COLS * (window.GRID_CL||window.CL) > window.W - (window.GRID_CL||window.CL) * 2) return false;
      if (y < window.sceneTop + (window.GRID_CL||window.CL) || y + ROWS * (window.GRID_CL||window.CL) > window.H - 48 - (window.GRID_CL||window.CL) * 2) return false;
    }
    return true;
  },

  sellBuilding: function(key) {
    let price = BUILDING_PRICES[key] || 0;
    let refund = Math.floor(price * SELL_RATIO);
    if (!S.built[key]) { UIManager.toast('Bu bina inşa edilmemiş!'); return }
    S.built[key] = false;
    S.money += refund;
    S.buildingPos[key] = null;
    if (key === 'grid') {
      S.plots = []; S.plowed = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) S.plots.push({ r, c, crop: null, age: 0, w: false, p: false, nextHarvest: 0, harvestCount: 0, plowTimer: 1080, wetTimer: 0 });
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) S.plowed.push(r * COLS + c);
      S.irrigating = false; S.sel = -1;
    }
    S.buildingMenu = null; S.dragging = null;
    UIManager.toast(BUILDING_NAMES[key] + ' satıldı! +' + refund + ' TL');
    UIManager.updateHUD(); window.draw();
  },

  showBuildingMenu: function(key, mx, my) {
    S.buildingMenu = { key: key, x: mx, y: my };
    window.draw();
  },

  drawBuildingMenu: function() {
    if (!S.buildingMenu) return;
    let m = S.buildingMenu;
    let bx = m.x - 60, by = m.y - 90;
    if (bx < 10) bx = 10; if (bx + 120 > window.W - 10) bx = window.W - 130;
    if (by < 10) by = m.y + 10;
    window.X.fillStyle = 'rgba(40,25,10,0.95)';
    window.X.strokeStyle = '#c8956c'; window.X.lineWidth = 2;
    window.X.beginPath(); window.X.roundRect(bx, by, 120, 80, 8); window.X.fill(); window.X.stroke();
    window.X.fillStyle = '#ffe082'; window.X.font = 'bold 11px "Nunito",Arial,sans-serif'; window.X.textAlign = 'center';
    window.X.fillText(BUILDING_NAMES[m.key], bx + 60, by + 16);
    let items = [
      { text: '📍 Kaydır', y: by + 30, action: 'drag' },
      { text: '🗑 Kaldır (' + Math.floor((BUILDING_PRICES[m.key] || 0) * SELL_RATIO) + ' TL)', y: by + 50, action: 'sell' },
      { text: '✖ İptal', y: by + 70, action: 'cancel' }
    ];
    items.forEach(it => {
      window.X.fillStyle = '#d7ccc8'; window.X.font = '11px "Nunito",Arial,sans-serif'; window.X.textAlign = 'center';
      window.X.fillText(it.text, bx + 60, it.y + 3);
    });
    S.buildingMenu.items = items;
  },

  handleCanvasClick: function(e) {
    if (S.dragging || S.buildingMenu || window.wasPanning) { window.wasPanning = false; return }
    window.wasPanning = false;
    let mx = e.clientX, my = e.clientY;
    let sc = window.screenToScene(mx, my);
    let gx = sc.x - window.GX, gy = sc.y - window.GY;
    let c = Math.floor(gx / window.CL), r = Math.floor(gy / window.CL);

    if (typeof window.barnX !== 'undefined') {
      let bDx = sc.x - window.barnX, bDy = sc.y - window.barnY;
      if (Math.abs(bDx) < window.barnS * 0.6 && Math.abs(bDy) < window.barnS * 0.6) {
        if (!S.built.ahır) { UIManager.toast('Önce ahır inşa et!'); return }
        if (S.co > 0) {
          if (window.sutCount >= 2) { UIManager.toast('Bugün zaten 2 kez süt sağıldı! Yarın tekrar dene.'); return }
          if (S.pickup) { UIManager.toast('Başka bir pickup yolda!'); return }
          let sut = Math.min(S.co, 3) * 2;
          let hx=window.houseX,hy=window.houseY,bx=window.barnX,by=window.barnY;
          S.pickup = {
            type: 'milk',
            path:[{x:hx,y:hy},{x:bx,y:hy},{x:bx,y:by}],
            progress: 0, speed: 0.003,
            returning: false,
            amount: sut
          };
          UIManager.toast(`${sut} lt süt toplanıyor...`);
          return
        } else { UIManager.toast('Ahırda inek yok!'); return }
      }
    }
    if (typeof window.kümesX !== 'undefined') {
      let kDx = sc.x - window.kümesX, kDy = sc.y - window.kümesY;
      if (Math.abs(kDx) < window.kümesS * 0.6 && Math.abs(kDy) < window.kümesS * 0.6) {
        if (!S.built.kümes) { UIManager.toast('Önce kümes inşa et!'); return }
        if (S.ch > 0) {
          if (window.yumurtaCount >= 1) { UIManager.toast('Bugün zaten yumurta toplandı! Yarın tekrar dene.'); return }
          if (S.pickup) { UIManager.toast('Başka bir pickup yolda!'); return }
          let yumurta = Math.min(S.ch, 6);
          let hx=window.houseX,hy=window.houseY,kx=window.kümesX,ky=window.kümesY;
          S.pickup = {
            type: 'egg',
            path:[{x:hx,y:hy},{x:kx,y:hy},{x:kx,y:ky}],
            progress: 0, speed: 0.003,
            returning: false,
            amount: yumurta
          };
          UIManager.toast(`${yumurta} yumurta toplanıyor...`);
          return
        } else { UIManager.toast('Kümeste tavuk yok!'); return }
      }
    }
    if (typeof window.wellX !== 'undefined') {
      let wDx = sc.x - window.wellX, wDy = sc.y - window.wellY;
      if (Math.abs(wDx) < window.wellS * 0.6 && Math.abs(wDy) < window.wellS * 0.6) {
        if (!S.built.kuyu) { UIManager.toast('Önce kuyu inşa et!'); return }
        let kuyuLv = S.buildingLevel.kuyu || 1;
        let irrigTime = Math.max(10, 40 - kuyuLv * 3);
        if (S.irrigating) {
          let elapsedMin = (S.h - S.irrigStartH) * 60 + (S.m - S.irrigStartM);
          if (elapsedMin < irrigTime) {
            S.irrigating = false;
            UIManager.toast('Sulama iptal edildi! ' + irrigTime + ' dk altında kaldığı için sulanmadı.');
          } else {
            S.irrigating = false;
            S.plots.forEach(p => { p.w = true; p.wetTimer = 1080 });
            UIManager.toast('Sulama durduruldu! Tarla sulandı. (' + elapsedMin + ' dk)');
          }
          UIManager.advanceTime(); window.draw(); return
        } else {
          S.irrigating = true;
          S.irrigStartH = S.h; S.irrigStartM = S.m;
          let totalMin = S.h * 60 + S.m + irrigTime;
          S.irrigEndH = Math.floor(totalMin / 60); S.irrigEndM = totalMin % 60;
          if (S.irrigEndH >= 22) { S.irrigEndH = 21; S.irrigEndM = 50 }
          UIManager.toast('Sulama başlatıldı! (' + irrigTime + ' dk gerekli)');
          UIManager.checkTutorialAction('water');
          UIManager.advanceTime(); window.draw(); return
        }
      }
    }

    if (typeof window.wmX !== 'undefined') {
      let dDx = sc.x - window.wmX, dDy = sc.y - window.wmY;
      if (S.built.degirmen && Math.abs(dDx) < window.wmS * 0.6 && Math.abs(dDy) < window.wmS * 0.6) {
        let bugday = S.inv.BUGDAY || 0;
        let wmLv = S.buildingLevel.degirmen || 1;
        let wmCost = Math.max(1, 3 - Math.floor(wmLv / 4));
        let wmBonus = Math.random() < ((wmLv - 1) * 0.1) ? 1 : 0;
        if (bugday < wmCost) { UIManager.toast('Değirmen için en az ' + wmCost + ' buğday gerekli! (Mevcut: ' + bugday + ')'); return }
        S.inv.BUGDAY -= wmCost; S.invUN = (S.invUN || 0) + 1 + wmBonus;
        UIManager.toast(wmCost + ' Buğday → ' + (1 + wmBonus) + ' Un! (Toplam un: ' + S.invUN + ')');
        UIManager.checkTutorialAction('grind'); UIManager.advanceTime(); window.draw(); return
      }
    }
    if (typeof window.firinX !== 'undefined') {
      let fDx = sc.x - window.firinX, fDy = sc.y - window.firinY;
      if (S.built.fırın && Math.abs(fDx) < window.firinS * 0.6 && Math.abs(fDy) < window.firinS * 0.6) {
        let un = S.invUN || 0;
        let fLv = S.buildingLevel.fırın || 1;
        let fBonus = Math.random() < ((fLv - 1) * 0.1) ? 1 : 0;
        if (un < 1) { UIManager.toast('Fırın için en az 1 un gerekli! (Mevcut: ' + un + ')'); return }
        S.invUN -= 1; S.invEKMEK = (S.invEKMEK || 0) + 1 + fBonus;
        UIManager.toast('1 Un → ' + (1 + fBonus) + ' Ekmek pişirildi! (Toplam ekmek: ' + S.invEKMEK + ')');
        UIManager.checkTutorialAction('bake'); UIManager.advanceTime(); window.draw(); return
      }
    }

    if (typeof window.sutIslemX !== 'undefined') {
      let sDx = sc.x - window.sutIslemX, sDy = sc.y - window.sutIslemY;
      if (S.built.sutislem && Math.abs(sDx) < window.sutIslemS * 0.6 && Math.abs(sDy) < window.sutIslemS * 0.6) {
        let sut = S.inv.SUT || 0;
        if (sut < 2) { UIManager.toast('Süt İşleme için en az 2 lt süt gerekli! (Mevcut: ' + sut + ')'); return }
        let choice = prompt('Süt İşleme:\n1 = 2 lt Süt → 2 kg Yoğurt\n2 = 2 lt Süt → 1 kg Tereyağı\nSeçiminiz (1 veya 2):');
        if (choice === '1') {
          S.inv.SUT -= 2; S.inv.YOGURT = (S.inv.YOGURT || 0) + 2;
          UIManager.toast('2 lt Süt → 2 kg Yoğurt! (Toplam: ' + (S.inv.YOGURT || 0) + ')');
          UIManager.checkTutorialAction('make_yogurt');
        } else if (choice === '2') {
          S.inv.SUT -= 2; S.inv.TEREYAGI = (S.inv.TEREYAGI || 0) + 1;
          UIManager.toast('2 lt Süt → 1 kg Tereyağı! (Toplam: ' + (S.inv.TEREYAGI || 0) + ')');
          UIManager.checkTutorialAction('make_butter');
        } else { return }
        UIManager.advanceTime(); window.draw(); return
      }
    }
    if (typeof window.peynirX !== 'undefined') {
      let pDx = sc.x - window.peynirX, pDy = sc.y - window.peynirY;
      if (S.built.peynirfab && Math.abs(pDx) < window.peynirS * 0.6 && Math.abs(pDy) < window.peynirS * 0.6) {
        let sut = S.inv.SUT || 0;
        if (sut < 3) { UIManager.toast('Peynir için en az 3 lt süt gerekli! (Mevcut: ' + sut + ')'); return }
        S.inv.SUT -= 3; S.inv.PEYNIR = (S.inv.PEYNIR || 0) + 2;
        UIManager.toast('3 lt Süt → 2 kg Peynir! (Toplam: ' + (S.inv.PEYNIR || 0) + ')');
        UIManager.checkTutorialAction('make_cheese'); UIManager.advanceTime(); window.draw(); return
      }
    }
    if (typeof window.salcaX !== 'undefined') {
      let slDx = sc.x - window.salcaX, slDy = sc.y - window.salcaY;
      if (S.built.salçafab && Math.abs(slDx) < window.salcaS * 0.6 && Math.abs(slDy) < window.salcaS * 0.6) {
        let dom = S.inv.DOMATES || 0;
        if (dom < 4) { UIManager.toast('Salça için en az 4 kg domates gerekli! (Mevcut: ' + dom + ')'); return }
        S.inv.DOMATES -= 4; S.inv.SALCA = (S.inv.SALCA || 0) + 1;
        UIManager.toast('4 kg Domates → 1 kg Salça! (Toplam: ' + (S.inv.SALCA || 0) + ')');
        UIManager.checkTutorialAction('make_salca'); UIManager.advanceTime(); window.draw(); return
      }
    }

    if (!S.built.grid) { if (!S.buildingMenu) UIManager.toast('Önce tarla inşa et! (Tesislerden)'); return }
    if (S.tractorActive) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) { S.tractorActive = false; UIManager.toast('Traktör kapatıldı.'); window.draw(); return }
      UIManager.plowArea(r, c); UIManager.checkTutorialAction('plow'); window.draw(); return
    }

    if (window.pesticideModeActive) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) { window.pesticideModeActive = false; UIManager.toast('İlaçlama modu kapatıldı.'); window.draw(); return }
      let p = getP(r, c);
      if (!p || !p.crop) { UIManager.toast('Burada ekin yok!'); return }
      if (p.p) { UIManager.toast('Bu tarla zaten ilaçlanmış!'); return }
      if (S.money < 50) { UIManager.toast('İlaçlama için 50 TL gerekli!'); return }
      S.money -= 50; p.p = true; UIManager.advanceTime();
      UIManager.toast('İlaçlama yapıldı! Böcekler temizlendi. -50 TL'); window.draw(); return
    }

    if (window.plantMode) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) { window.plantMode = null; UIManager.toast('Ekim modu kapatıldı.'); window.draw(); return }
      let p = getP(r, c);
      if (!p || p.crop) { UIManager.toast('Bu hücrede zaten ekin var!'); return }
      if (!S.plowed.includes(r * COLS + c)) { UIManager.toast('Önce traktörle sür!'); return }
      let cr = CROPS[window.plantMode];
      if (!cr) { window.plantMode = null; return }
      if (S.money < cr.buy) { UIManager.toast('Yeterli paran yok! (' + cr.buy + ' TL)'); return }
      S.money -= cr.buy; p.crop = window.plantMode; p.age = 0; p.w = false; p.p = false; p.nextHarvest = window.plantMode === 'BUGDAY' ? 120 : 480; p.harvestCount = 0; S.plantCount++;
      UIManager.toast(`${cr.name} ekildi! (+${cr.buy} TL)`);
      if (window.plantMode === 'BUGDAY') UIManager.checkTutorialAction('plant_bugday');
      if (window.plantMode === 'DOMATES') UIManager.checkTutorialAction('plant_domates');
      window.draw(); return;
    }

    if (window.harvestModeActive) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) { window.harvestModeActive = false; UIManager.toast('Hasat modu kapatıldı.'); window.draw(); return }
      let p = getP(r, c);
      if (!p || !p.crop) { UIManager.toast('Burada ekin yok!'); return }
      if (p.nextHarvest > 0) { let hrs = Math.floor(p.nextHarvest / 60); let mins = p.nextHarvest % 60; UIManager.toast(`Henüz hazır değil! (${hrs}sa ${mins}dk)`); return }
      let cr = CROPS[p.crop]; if (!cr) return;
      let ib = p.w ? Math.min(.2, S.st.SULAMA * .04) : 0, pb = p.p ? Math.min(.2, S.st.ICLAMA * .04) : 0;
      let g = Math.min(1, (p.age / 365) / cr.my); let y = cr.mk * g * cr.sea[S.sea];
      if (!p.w) y = 0;
      if (p.crop === 'BUGDAY') y = Math.min(y, 1);
      if (p.w) y *= (1 + ib); if (p.p) y *= (1 + pb);
      y = Math.max(y, y > 0 ? 0.1 : 0);
      let cap = 500 + S.st.DEPO * 200, used = Object.values(S.inv).reduce((a, b) => a + b, 0);
      if ((used + y) <= cap) {
        S.inv[p.crop] = (S.inv[p.crop] || 0) + y; S.dailyHarvest[p.crop] = (S.dailyHarvest[p.crop] || 0) + y;
        p.harvestCount = (p.harvestCount || 0) + 1; let mh = cr.maxHarvest || 1;
        if (p.harvestCount >= mh) { let cn = cr.name; p.crop = null; p.age = 0; p.w = false; p.p = false; p.nextHarvest = 0; p.harvestCount = 0; UIManager.toast(`${cn} bitkiniz tükendi! Yeni tohum ek.`) }
        else { p.age += 5; p.w = false; p.p = false; p.nextHarvest = p.crop === 'BUGDAY' ? 120 : 480; UIManager.toast(`${cr.name} hasat edildi! +${y.toFixed(1)} kg (Kalan: ${mh - p.harvestCount})`) }
        if (p.crop && p.crop === 'BUGDAY') UIManager.checkTutorialAction('harvest_bugday');
        if (p.crop && p.crop === 'DOMATES') UIManager.checkTutorialAction('harvest_domates');
      } else { UIManager.toast('Depo dolu!') }
      window.draw(); return;
    }

    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) { UIManager.closeAllModals(); window.lastPlantClick = -1; S.sel = -1; window.selR = -1; window.selC = -1; window.draw(); return }
    S.sel = r * COLS + c; let p = getP(r, c);
    if (!p.crop) {
      if (!S.plowed.includes(r * COLS + c)) { UIManager.toast('Önce traktörle sür!'); return }
      let idx = r * COLS + c;
      if (window.lastPlantClick === idx && document.getElementById('mPlant').classList.contains('active')) { UIManager.closeM('plant'); window.lastPlantClick = -1; window.draw(); return }
      window.lastPlantClick = idx; UIManager.openPlantM(r, c);
    } else { window.lastPlantClick = -1; window.selR = r; window.selC = c; UIManager.openPlotM(r, c); } window.draw();
  },

  handleKeyDown: function(e) {
    if (e.key === 'Escape') {
      if (S.dragging) { UIManager.cancelDrag() }
      else if (S.buildingMenu) { S.buildingMenu = null }
      else { UIManager.closeAllModals(); S.tractorActive = false; window.pesticideModeActive = false; window.lastPlantClick = -1; S.sel = -1; window.selR = -1; window.selC = -1; window.plantMode = null; window.harvestModeActive = false }
      window.draw();
    }
    if (e.key === '+' || e.key === '=') { window.zoomTarget = Math.min(3, window.zoomTarget + 0.2); window.zoomCX = window.W / 2; window.zoomCY = window.H / 2; window.panX = 0; window.panY = 0; window.draw() }
    if (e.key === '-') { window.zoomTarget = Math.max(0.5, window.zoomTarget - 0.2); window.zoomCX = window.W / 2; window.zoomCY = window.H / 2; window.panX = 0; window.panY = 0; window.draw() }
    if (e.key === '0') { window.zoomTarget = 1; window.zoomCX = window.W / 2; window.zoomCY = window.H / 2; window.panX = 0; window.panY = 0; window.draw() }
  },

  handleMouseDown: function(e) {
    let mx = e.clientX, my = e.clientY;
    mouseDownTime = Date.now();
    mouseDownPos = { x: mx, y: my };
    window.isPanning = false; window.panStartX = mx; window.panStartY = my; window.panStartPX = window.panX; window.panStartPY = window.panY;
    if (S.buildingMenu) {
      let m = S.buildingMenu;
      let bx = m.x - 60, by = m.y - 90;
      if (by < 10) by = m.y + 10;
      if (mx > bx && mx < bx + 120 && m.items) {
        for (let it of m.items) {
          if (my > it.y - 8 && my < it.y + 10) {
            if (it.action === 'drag') { S.buildingMenu = null; UIManager.startDrag(m.key); dragStartedThisClick = true }
            else if (it.action === 'sell') UIManager.sellBuilding(m.key);
            else { S.buildingMenu = null; window.draw() }
            return;
          }
        }
      }
      S.buildingMenu = null; window.draw(); return;
    }
    longPressTimer = setTimeout(() => {
      if (!window.isPanning) { let b = UIManager.getBuildingAt(mx, my); if (b) { UIManager.showBuildingMenu(b, mx, my) } }
    }, 500);
  },

  handleMouseMove: function(e) {
    let mx = e.clientX, my = e.clientY;
    if (S.dragging) {
      e.preventDefault();
      let sc = window.screenToScene(mx, my); S.dragX = sc.x; S.dragY = sc.y;
      window.draw();
      return;
    }
    if (mouseDownTime > 0 && !window.isPanning && !S.buildingMenu) {
      let dx = mx - window.panStartX, dy = my - window.panStartY;
      if (Math.sqrt(dx * dx + dy * dy) > 8) {
        window.isPanning = true; clearTimeout(longPressTimer); longPressTimer = null;
      }
    }
    if (window.isPanning) {
      e.preventDefault();
      window.panX = window.panStartPX + (mx - window.panStartX); window.panY = window.panStartPY + (my - window.panStartY);
      window.draw();
    } else if (mouseDownTime > 0 && !S.buildingMenu && Date.now() - mouseDownTime > 300) {
      let dx = mx - mouseDownPos.x, dy = my - mouseDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(longPressTimer); longPressTimer = null;
        let b = UIManager.getBuildingAt(mouseDownPos.x, mouseDownPos.y);
        if (b) { mouseDownTime = 0; UIManager.startDrag(b); let sc = window.screenToScene(mx, my); S.dragX = sc.x; S.dragY = sc.y; window.draw() }
      }
    }
  },

  handleMouseUp: function(e) {
    window.wasPanning = window.isPanning;
    mouseDownTime = 0; window.isPanning = false;
    clearTimeout(longPressTimer); longPressTimer = null;
    if (S.dragging && !dragStartedThisClick) { UIManager.finishDrag() }
    dragStartedThisClick = false;
  },

  handleTouchStart: function(e) {
    if (e.touches.length === 2) {
      clearTimeout(longPressTimer); longPressTimer = null;
      let t1 = e.touches[0], t2 = e.touches[1];
      window.pinchDist0 = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      window.pinchZoom0 = window.zoomTarget;
      window.zoomCX = (t1.clientX + t2.clientX) / 2;
      window.zoomCY = (t1.clientY + t2.clientY) / 2;
      mouseDownTime = 0; window.isPanning = false; return;
    }
    let t = e.touches[0]; let mx = t.clientX, my = t.clientY;
    mouseDownTime = Date.now(); mouseDownPos = { x: mx, y: my };
    window.isPanning = false; window.panStartX = mx; window.panStartY = my; window.panStartPX = window.panX; window.panStartPY = window.panY;
    if (S.dragging) { return }
    if (S.buildingMenu) {
      let m = S.buildingMenu;
      let bx = m.x - 60, by = m.y - 90;
      if (by < 10) by = m.y + 10;
      if (mx > bx && mx < bx + 120 && m.items) {
        for (let it of m.items) {
          if (my > it.y - 8 && my < it.y + 10) {
            if (it.action === 'drag') { S.buildingMenu = null; UIManager.startDrag(m.key); dragStartedThisClick = true }
            else if (it.action === 'sell') UIManager.sellBuilding(m.key);
            else { S.buildingMenu = null; window.draw() }
            return;
          }
        }
      }
      S.buildingMenu = null; window.draw(); return;
    }
    longPressTimer = setTimeout(() => {
      if (!window.isPanning) { let b = UIManager.getBuildingAt(mx, my); if (b) { UIManager.showBuildingMenu(b, mx, my) } }
    }, 500);
  },

  handleTouchMove: function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      let t1 = e.touches[0], t2 = e.touches[1];
      let dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      let newZoom = Math.max(0.5, Math.min(3, window.pinchZoom0 * (dist / window.pinchDist0)));
      window.zoomTarget = newZoom;
      window.zoomCX = (t1.clientX + t2.clientX) / 2;
      window.zoomCY = (t1.clientY + t2.clientY) / 2;
      window.draw(); return;
    }
    let t = e.touches[0]; let mx = t.clientX, my = t.clientY;
    if (S.dragging) {
      e.preventDefault();
      let sc = window.screenToScene(mx, my); S.dragX = sc.x; S.dragY = sc.y;
      window.draw(); return;
    }
    if (mouseDownTime > 0 && !window.isPanning && !S.buildingMenu) {
      let dx = mx - window.panStartX, dy = my - window.panStartY;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        window.isPanning = true; clearTimeout(longPressTimer); longPressTimer = null;
      }
    }
    if (window.isPanning) {
      e.preventDefault();
      window.panX = window.panStartPX + (mx - window.panStartX); window.panY = window.panStartPY + (my - window.panStartY);
      window.draw();
    } else if (mouseDownTime > 0 && !S.buildingMenu && Date.now() - mouseDownTime > 300) {
      let dx = mx - mouseDownPos.x, dy = my - mouseDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(longPressTimer); longPressTimer = null;
        let b = UIManager.getBuildingAt(mouseDownPos.x, mouseDownPos.y);
        if (b) { mouseDownTime = 0; UIManager.startDrag(b); let sc = window.screenToScene(mx, my); S.dragX = sc.x; S.dragY = sc.y; window.draw() }
      }
    }
  },

  handleTouchEnd: function(e) {
    window.wasPanning = window.isPanning;
    mouseDownTime = 0; window.isPanning = false;
    clearTimeout(longPressTimer); longPressTimer = null;
    if (S.dragging && !dragStartedThisClick) { UIManager.finishDrag() }
    dragStartedThisClick = false;
  },

  handleWheel: function(e) {
    e.preventDefault();
    let delta = e.deltaY > 0 ? -0.15 : 0.15;
    window.zoomTarget = Math.max(0.5, Math.min(3, window.zoomTarget + delta));
    window.zoomCX = e.clientX; window.zoomCY = e.clientY;
    window.draw();
  },

  speakTR: function(text) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    let u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR'; u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
};

function speakTR(text) { UIManager.speakTR(text); }

const FACTS = ['Bir tavuk yılda ~250 yumurta verir.', 'İnekler günde 8-10 lt süt verebilir.', 'Marulun %95\'i sudur.', 'Patates dünyanın en önemli gıdasıdır.', 'Salatalık yazın çok yetiştirir.', 'Tarlayi sulamak ürünu %20 artırır.', 'İlaçlama bocekleri engeller.', 'Biber C vitamini açısından zengindir.', 'Mısır lif bakımından faydalıdır.', 'Kabak omega-3 içerir.', 'Soğan antibakteriyel özelliğe sahiptir.', 'Patlıcan kalp sağlığına iyi gelir.', 'Rüzgar değirmeni enerji üretir!', 'Sera kış bile ekim yapmaya olanak sağlar.'];

window.showLoginTab = UIManager.showLoginTab;
window.openM = UIManager.openM;
window.closeM = UIManager.closeM;
window.openTesisler = UIManager.openTesisler;
window.toggleMissions = UIManager.toggleMissions;
window.openTutorial = UIManager.openTutorial;
window.closeTutorial = UIManager.closeTutorial;
window.toggleTutorialMinimize = UIManager.toggleTutorialMinimize;
window.tutorialNext = UIManager.tutorialNext;
window.advanceTime = UIManager.advanceTime;
window.activateTraktör = UIManager.activateTraktör;
window.harvestP = UIManager.harvestP;
window.waterP = UIManager.waterP;
window.pestP = UIManager.pestP;
window.removeC = UIManager.removeC;
window.sellW = UIManager.sellW;
window.dismissW = UIManager.dismissW;
window.toggleTutorialMinimize = UIManager.toggleTutorialMinimize;

export default UIManager;
