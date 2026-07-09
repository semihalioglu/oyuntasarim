import StorageManager from './storageManager.js?v=1.037';
const GameManager={
ROWS:5,COLS:10,
SEASONS:['İlkbahar','Yaz','Sonbahar','Kış'],
FACTS:['Bir tavuk yılda ~250 yumurta verir.','İnekler günde 8-10 lt süt verebilir.','Marulun %95\'i sudur.','Patates dünyanın en önemli gıdasıdır.','Salatalık yazın çok yetiştirir.','Tarlayi sulamak ürünu %20 artırır.','İlaçlama bocekleri engeller.','Biber C vitamini açısından zengindir.','Mısır lif bakımından faydalıdır.','Kabak omega-3 içerir.','Soğan antibakteriyel özelliğe sahiptir.','Patlıcan kalp sağlığına iyi gelir.','Rüzgar değirmeni enerji üretir!','Sera kış bile ekim yapmaya olanak sağlar.'],
CROPS:{
DOMATES:{name:'Domates',my:1,mk:1.2,buy:8,sell:9,sea:[.3,1,.7,0],col:['#c62828','#e53935'],harvestInt:3,maxHarvest:3},
PATATES:{name:'Patates',my:1,mk:1.0,buy:6,sell:7,sea:[.5,.9,1,0],col:['#6d4c41','#8d6e63'],harvestInt:3,maxHarvest:3},
SALATALIK:{name:'Salatalık',my:1,mk:1.0,buy:10,sell:10,sea:[.4,1,.8,0],col:['#2e7d32','#43a047'],harvestInt:3,maxHarvest:3},
MARUL:{name:'Marul',my:0.5,mk:0.8,buy:12,sell:12,sea:[.7,1,.5,0],col:['#558b2f','#7cb342'],harvestInt:3,maxHarvest:2},
BIBER:{name:'Biber',my:1,mk:1.0,buy:9,sell:10,sea:[.3,1,.6,0],col:['#c62828','#ff5722'],harvestInt:3,maxHarvest:3},
PATLICAN:{name:'Patlıcan',my:1.2,mk:1.0,buy:11,sell:12,sea:[.2,1,.7,0],col:['#4a148c','#6a1b9a'],harvestInt:3,maxHarvest:3},
MISIR:{name:'Mısır',my:1,mk:1.0,buy:7,sell:8,sea:[.4,1,.8,0],col:['#f9a825','#fdd835'],harvestInt:3,maxHarvest:1},
KABAK:{name:'Kabak',my:1,mk:0.8,buy:8,sell:9,sea:[.3,1,.7,0],col:['#e65100','#ff9800'],harvestInt:3,maxHarvest:2},
SOGAN:{name:'Soğan',my:0.8,mk:0.8,buy:5,sell:6,sea:[.5,.9,1,.1],col:['#8d6e63','#a1887f'],harvestInt:3,maxHarvest:1},
BUGDAY:{name:'Buğday',my:0.8,mk:1.0,buy:4,sell:5,sea:[.6,.9,.3,0],col:['#d4a017','#c68f00'],harvestInt:4,maxHarvest:1}
},
ANIM:{TAVUK:{name:'Tavuk',price:50,int:2,adet:3,prod:'Yumurta',feed:15,sell:2,unit:'adet'},INEK:{name:'İnek',price:200,int:10,litre:8,prod:'Süt',feed:45,sell:12,unit:'litre'},KOYUN:{name:'Koyun',price:150,int:3,adet:1,prod:'Yün',feed:25,sell:8,unit:'adet'}},
BUILDING_MAX_LEVEL:10,
UPGRADE_COST:{ahır:500,kümes:400,kuyu:600,degirmen:800,fırın:700,sutislem:700,peynirfab:800,salçafab:600},
UPGRADE_DESC:{
  ahır:{name:'Ahır',effect:l=>`+${l} hayvan kapasitesi, +${l*2} lt süt/sağım`,icon:'🐄'},
  kümes:{name:'Kümes',effect:l=>`+${l} tavuk kapasitesi, +${l} yumurta/gün`,icon:'🐔'},
  kuyu:{name:'Kuyu',effect:l=>`Sulama süresi -${l*2} dk (min ${Math.max(10,40-l*3)} dk)`,icon:'💧'},
  degirmen:{name:'Değirmen',effect:l=>`Öğütme hızı x${(1+l*0.1).toFixed(1)}`,icon:'⚙️'},
  fırın:{name:'Fırın',effect:l=>`Pişirme hızı x${(1+l*0.1).toFixed(1)}`,icon:'🔥'},
  sutislem:{name:'Süt İşleme',effect:l=>`Verimlilik +${l*10}%`,icon:'🫙'},
  peynirfab:{name:'Peynir Fabrikası',effect:l=>`Verimlilik +${l*10}%`,icon:'🧀'},
  salçafab:{name:'Salça Fabrikası',effect:l=>`Verimlilik +${l*10}%`,icon:'🍅'}
},
MISSION_TEMPLATES:[
  {type:'harvest',crop:'DOMATES',target:6,text:'6 kg Domates topla'},{type:'harvest',crop:'PATATES',target:8,text:'8 kg Patates topla'},
  {type:'harvest',crop:'SALATALIK',target:5,text:'5 kg Salatalık topla'},{type:'harvest',crop:'MARUL',target:4,text:'4 kg Marul topla'},
  {type:'harvest',crop:'BIBER',target:5,text:'5 kg Biber topla'},{type:'harvest',crop:'PATLICAN',target:4,text:'4 kg Patlıcan topla'},
  {type:'harvest',crop:'MISIR',target:6,text:'6 kg Mısır topla'},{type:'harvest',crop:'KABAK',target:5,text:'5 kg Kabak topla'},
  {type:'harvest',crop:'SOGAN',target:7,text:'7 kg Soğan topla'},
  {type:'animal',animal:'YUMURTA',target:10,text:'10 yumurta topla'},{type:'animal',animal:'SUT',target:5,text:'5 litre süt topla'},
  {type:'sell',target:100,text:'100 TL değerinde ürün sat'},{type:'plant',target:3,text:'3 fidan dik'},{type:'water',target:5,text:'5 kez sulama yap'}
],
WEATHERS:['güneşli','bulutlu','yağmurlu','karlı'],
WEATHER_ICONS:{güneşli:'\u2600\uFE0F',bulutlu:'\u2601\uFE0F',yağmurlu:'\uD83C\uDF27\uFE0F',karlı:'\u2744\uFE0F'},
TUTORIAL_STEPS:{
  bread:[
    {title:'Birlikte Ekmek Üretelim Mi?',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Buğdaydan ekmeğe uzanan yolculuğa hazır mısın?',action:null,speak:'Birlikte ekmek üretelim mi?'},
    {title:'Adım 1: Tarla İnşa Et',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Önce tesislerden tarla inşa et.',action:'build_grid',speak:'Önce tesislerden tarla inşa et.'},
    {title:'Adım 2: Tarlayı Sür',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Şimdi traktörle tarlayı sür.',action:'plow',speak:'Şimdi traktörle tarlayı sür.'},
    {title:'Adım 3: Buğday Ek',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Tarlaya tıkla, buğday tohumu ek.',action:'plant_bugday',speak:'Şimdi tarlaya buğday ek.'},
    {title:'Adım 4: Kuyu İnşa Et',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Sulama için kuyu inşa et (Tesislerden).',action:'build_kuyu',speak:'Sulama için kuyu inşa et.'},
    {title:'Adım 5: Sulama Yap',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Kuyuya tıkla, sulamayı başlat.',action:'water',speak:'Kuyuya tıkla, sulamayı başlat.'},
    {title:'Adım 6: Hasat Et',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Buğday büyüdü! Hasat et.',action:'harvest_bugday',speak:'Buğday büyüdü! Hasat et.'},
    {title:'Adım 7: Değirmen İnşa Et',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Buğdayı un yapmak için değirmen inşa et (Tesislerden).',action:'build_degirmen',speak:'Buğdayı un yapmak için değirmen inşa et.'},
    {title:'Adım 8: Değirmende Öğüt',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Değirmene tıkla, buğdayı un haline getir.',action:'grind',speak:'Buğdayı değirmende öğüt, un olsun.'},
    {title:'Adım 9: Fırın İnşa Et',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Ekmeği pişirmek için fırın inşa et (Tesislerden).',action:'build_fırın',speak:'Ekmeği pişirmek için fırın inşa et.'},
    {title:'Adım 10: Fırında Pişir',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Fırına tıkla, unu ekmek haline getir!',action:'bake',speak:'Unu fırında pişir, ekmek olsun!'},
    {title:'Tebrikler! 🎉',chain:['🏗','🌾','💧','⚙','🏭','📦','🔥','🍞'],desc:'Ekmeği başardın! Buğdaydan ekmeğe tüm yolu gördün.',action:null,speak:'Tebrikler! Ekmeği başarıyla ürettin!'}
  ],
  egg:[
    {title:'Yumurta Üretelim! 🥚',chain:['🐔','🥚'],desc:'Tavuklar yumurta üretir. Haydi kümes kuralım!',action:null,speak:'Yumurta üretelim! Tavuklar yumurta yapar.'},
    {title:'Adım 1: Kümes İnşa Et',chain:['🐔','🥚'],desc:'Önce tesislerden kümes inşa et.',action:'build_kümes',speak:'Önce tesislerden kümes inşa et.'},
    {title:'Adım 2: Tavuk Satın Al',chain:['🐔','🥚'],desc:'Kümese tıkla, tavuk satın al.',action:'buy_chicken',speak:'Kümese tıkla, tavuk satın al.'},
    {title:'Adım 3: Yumurta Topla',chain:['🐔','🥚'],desc:'Tavuklar yumurta bıraktı! Kümese tıkla, yumurtaları topla.',action:'collect_egg',speak:'Tavuklar yumurta bıraktı! Kümese tıkla, yumurtaları topla.'},
    {title:'Tebrikler! 🎉',chain:['🐔','🥚'],desc:'Yumurtaları başardın! Tavuklar her gün yumurta bırakır.',action:null,speak:'Tebrikler! Yumurtaları başarıyla topladın!'}
  ],
  milk:[
    {title:'Süt Sağalım! 🥛',chain:['🐄','🥛'],desc:'İnekler süt verir. Haydi ahır kuralım!',action:null,speak:'Süt sağalım! İnekler süt verir.'},
    {title:'Adım 1: Ahır İnşa Et',chain:['🐄','🥛'],desc:'Önce tesislerden ahır inşa et.',action:'build_ahir',speak:'Önce tesislerden ahır inşa et.'},
    {title:'Adım 2: İnek Satın Al',chain:['🐄','🥛'],desc:'Ahıra tıkla, inek satın al.',action:'buy_cow',speak:'Ahıra tıkla, inek satın al.'},
    {title:'Adım 3: Süt Sağ',chain:['🐄','🥛'],desc:'İnekler süt verdi! Ahıra tıkla, sütü sağ.',action:'collect_milk',speak:'İnekler süt verdi! Ahıra tıkla, sütü sağ.'},
    {title:'Tebrikler! 🎉',chain:['🐄','🥛'],desc:'Sütü başardın! İnekler günde 2-3 kez süt verir.',action:null,speak:'Tebrikler! Sütü başarıyla sağdın!'}
  ],
  butter:[
    {title:'Tereyağı Üretelim! 🧈',chain:['🥛','🧈'],desc:'Sütten tereyağı üretmek için süt işleme tesisi lazım.',action:null,speak:'Tereyağı üretelim! Sütten tereyağı yapılır.'},
    {title:'Adım 1: Süt İşleme Tesisi İnşa Et',chain:['🥛','🧈'],desc:'Önce tesislerden süt işleme tesisi inşa et.',action:'build_sutislem',speak:'Önce tesislerden süt işleme tesisi inşa et.'},
    {title:'Adım 2: Süt Topla',chain:['🥛','🧈'],desc:'Süt için önce ineklere ihtiyacın var. Ahır kur, inek al, süt sağ.',action:'collect_milk',speak:'Süt için önce ineklere ihtiyacın var. Süt sağ.'},
    {title:'Adım 3: Tereyağı Üret',chain:['🥛','🧈'],desc:'Süt İşleme Tesisi\'ne tıkla, tereyağı üret.',action:'make_butter',speak:'Süt İşleme Tesisi\'ne tıkla, tereyağı üret.'},
    {title:'Tebrikler! 🎉',chain:['🥛','🧈'],desc:'Tereyağını başardın! Sütten tereyağı yapımını gördün.',action:null,speak:'Tebrikler! Tereyağını başarıyla ürettin!'}
  ],
  cheese:[
    {title:'Peynir Üretelim! 🧀',chain:['🥛','🧀'],desc:'Sütten peynir üretmek için peynir fabrikası lazım.',action:null,speak:'Peynir üretelim! Sütten peynir yapılır.'},
    {title:'Adım 1: Peynir Fabrikası İnşa Et',chain:['🥛','🧀'],desc:'Önce tesislerden peynir fabrikası inşa et.',action:'build_peynirfab',speak:'Önce tesislerden peynir fabrikası inşa et.'},
    {title:'Adım 2: Süt Topla',chain:['🥛','🧀'],desc:'Peynir için süt lazım. İneklerden süt sağ.',action:'collect_milk',speak:'Peynir için süt lazım. Süt sağ.'},
    {title:'Adım 3: Peynir Üret',chain:['🥛','🧀'],desc:'Peynir Fabrikası\'na tıkla, peynir üret.',action:'make_cheese',speak:'Peynir Fabrikası\'na tıkla, peynir üret.'},
    {title:'Tebrikler! 🎉',chain:['🥛','🧀'],desc:'Peyniri başardın! 3 sütten 2 peynir yapılır.',action:null,speak:'Tebrikler! Peyniri başarıyla ürettin!'}
  ],
  yogurt:[
    {title:'Yoğurt Üretelim! 🫙',chain:['🥛','🫙'],desc:'Sütten yoğurt üretmek için süt işleme tesisi lazım.',action:null,speak:'Yoğurt üretelim! Sütten yoğurt yapılır.'},
    {title:'Adım 1: Süt İşleme Tesisi İnşa Et',chain:['🥛','🫙'],desc:'Önce tesislerden süt işleme tesisi inşa et.',action:'build_sutislem',speak:'Önce tesislerden süt işleme tesisi inşa et.'},
    {title:'Adım 2: Süt Topla',chain:['🥛','🫙'],desc:'Yoğurt için süt lazım. İneklerden süt sağ.',action:'collect_milk',speak:'Yoğurt için süt lazım. Süt sağ.'},
    {title:'Adım 3: Yoğurt Üret',chain:['🥛','🫙'],desc:'Süt İşleme Tesisi\'ne tıkla, yoğurt üret.',action:'make_yogurt',speak:'Süt İşleme Tesisi\'ne tıkla, yoğurt üret.'},
    {title:'Tebrikler! 🎉',chain:['🥛','🫙'],desc:'Yoğurdu başardın! 2 sütten 2 yoğurt yapılır.',action:null,speak:'Tebrikler! Yoğurdu başarıyla ürettin!'}
  ],
  salca:[
    {title:'Salça Üretelim! 🍅',chain:['🌱','🍅','salça'],desc:'Domateslerden salça üretmek için salça fabrikası lazım.',action:null,speak:'Salça üretelim! Domateslerden salça yapılır.'},
    {title:'Adım 1: Tarla & Domates Ek',chain:['🌱','🍅','salça'],desc:'Tarla kur, sür, domates ek ve sulamayı unutma!',action:'plant_domates',speak:'Tarla kur, domates ek.'},
    {title:'Adım 2: Domates Hasat Et',chain:['🌱','🍅','salça'],desc:'Domatesler büyüdü! Hasat et.',action:'harvest_domates',speak:'Domatesler büyüdü! Hasat et.'},
    {title:'Adım 3: Salça Fabrikası İnşa Et',chain:['🌱','🍅','salça'],desc:'Önce tesislerden salça fabrikası inşa et.',action:'build_salçafab',speak:'Önce tesislerden salça fabrikası inşa et.'},
    {title:'Adım 4: Salça Üret',chain:['🌱','🍅','salça'],desc:'Salça Fabrikası\'na tıkla, 4 domatesten 1 salça üret.',action:'make_salca',speak:'Salça Fabrikası\'na tıkla, salça üret.'},
    {title:'Tebrikler! 🎉',chain:['🌱','🍅','salça'],desc:'Salçayı başardın! Domatesten salça yapımını gördün.',action:null,speak:'Tebrikler! Salçayı başarıyla ürettin!'}
  ],
  tomato:[
    {title:'Domates Ekelim! 🌱',chain:['🌱','💧','🍅'],desc:'Domates ekmeyi ve büyütmeyi öğrenelim!',action:null,speak:'Domates ekelim!'},
    {title:'Adım 1: Tarla İnşa Et',chain:['🌱','💧','🍅'],desc:'Önce tesislerden tarla inşa et.',action:'build_grid',speak:'Önce tesislerden tarla inşa et.'},
    {title:'Adım 2: Tarlayı Sür',chain:['🌱','💧','🍅'],desc:'Şimdi traktörle tarlayı sür.',action:'plow',speak:'Şimdi traktörle tarlayı sür.'},
    {title:'Adım 3: Domates Ek',chain:['🌱','💧','🍅'],desc:'Tarlaya tıkla, domates tohumu ek.',action:'plant_domates',speak:'Şimdi tarlaya domates ek.'},
    {title:'Adım 4: Sulama Yap',chain:['🌱','💧','🍅'],desc:'Kuyu varsa kuyuya tıkla, yoksa tesislerden kuyu inşa et.',action:'water',speak:'Sulamayı unutma!'},
    {title:'Adım 5: Hasat Et',chain:['🌱','💧','🍅'],desc:'Domatesler büyüdü! Hasat et.',action:'harvest_domates',speak:'Domatesler büyüdü! Hasat et.'},
    {title:'Tebrikler! 🎉',chain:['🌱','💧','🍅'],desc:'Domatesleri başardın! Ekimden hasadı gördün.',action:null,speak:'Tebrikler! Domatesleri başarıyla hasat ettin!'}
  ]
},
ACTION_LABELS:{
  build_grid:'🏘 Tesislerden tarla satın al',plow:'🚜 Traktörü aktifle, tarlaya tıkla',
  plant_bugday:'🌱 Tarlaya tıkla, buğday ek',build_kuyu:'🏘 Tesislerden kuyu satın al',
  water:'💧 Kuyuya tıkla, sulama başlat',harvest_bugday:'🌾 Büyüyen buğdaya tıkla, hasat et',
  build_degirmen:'🏘 Tesislerden değirmen satın al',grind:'⚙ Değirmene tıkla, un üret',
  build_fırın:'🏘 Tesislerden fırın satın al',bake:'🔥 Fırına tıkla, ekmek pişir',
  build_kümes:'🏘 Tesislerden kümes satın al',buy_chicken:'🐔 Kümesden tavuk satın al',
  collect_egg:'🥚 Kümese tıkla, yumurta topla',
  build_ahir:'🏘 Tesislerden ahır satın al',buy_cow:'🐄 Ahırdan inek satın al',
  collect_milk:'🥛 Ahıra tıkla, süt sağı',
  build_sutislem:'🏘 Tesislerden süt işleme satın al',make_yogurt:'🫙 Süt İşleme\'ye tıkla, yoğurt üret',
  build_peynirfab:'🏘 Tesislerden peynir fabrikası satın al',make_cheese:'🧀 Peynir Fabrikası\'na tıkla, peynir üret',
  make_butter:'🧈 Süt İşleme\'ye tıkla, tereyağı üret',
  plant_domates:'🌱 Tarlaya tıkla, domates ek',harvest_domates:'🍅 Büyüyen domatese tıkla, hasat et',
  build_salçafab:'🏘 Tesislerden salça fabrikası satın al',make_salca:'🍅 Salça Fabrikası\'na tıkla, salça üret'
},
FOOD_GUIDES:[
  {id:'bread',icon:'🍞',name:'Ekmek',color:'#d4a040'},
  {id:'egg',icon:'🥚',name:'Yumurta',color:'#f5deb3'},
  {id:'milk',icon:'🥛',name:'Süt',color:'#e3f2fd'},
  {id:'butter',icon:'🧈',name:'Tereyağı',color:'#fff3e0'},
  {id:'cheese',icon:'🧀',name:'Peynir',color:'#fdd835'},
  {id:'yogurt',icon:'🫙',name:'Yoğurt',color:'#f3e5f5'},
  {id:'salca',icon:'🍅',name:'Salça',color:'#ffcdd2'},
  {id:'tomato',icon:'🌱',name:'Domates',color:'#c8e6c9'}
],
BUILDING_NAMES:{ahır:'AHİR',kümes:'KÜMES',degirmen:'DEĞİRMEN',kuyu:'KUYU',grid:'TARLA',fırın:'FIRIN',sutislem:'SÜT İŞLEME',peynirfab:'PEYNİR FAB',salçafab:'SALÇA FAB'},
BUILDING_PRICES:{ahır:2500,kümes:1500,degirmen:3000,kuyu:2000,grid:100,fırın:2500,sutislem:3500,peynirfab:4000,salçafab:3000},
ROAD_LEVEL_NAMES:['Toprak Yol','Taş Yol','Asfalt Yol'],
ROAD_UPGRADE_COST:[0,3000,8000],
GRID_LINKED_KUYU:true,
SELL_RATIO:0.6,
SAVE_VERSION:12,

S:{
  money:100000,day:1,sea:0,yr:1,h:6,m:0,
  plots:[],inv:{},st:{SULAMA:1,ICLAMA:1,DEPO:1,KUMES:1,AHIR:1},
  ch:0,co:0,sh:0,sel:-1,
  whH:12,whM:30,whArr:false,whDis:false,curW:null,
  plowed:[],tractorActive:false,
  missions:[],missionProgress:{},
  lastHarvestTime:{},plantCount:0,waterCount:0,totalSold:0,
  dailyHarvest:{},dailyAnimal:{},dailySold:0,
  weather:'güneşli',weatherTimer:0,windSpeed:5,
  irrigating:false,irrigStartH:0,irrigStartM:0,irrigEndH:0,irrigEndM:0,
  irrigDrops:[],
  built:{degirmen:false,kuyu:false,ahır:false,kümes:false,grid:false,fırın:false,sutislem:false,peynirfab:false,salçafab:false},
  buildingLevel:{ahır:1,kümes:1,kuyu:1,degirmen:1,fırın:1,sutislem:1,peynirfab:1,salçafab:1},
  buildingPos:{grid:null,kuyu:null,ahır:null,kümes:null,degirmen:null,fırın:null,sutislem:null,peynirfab:null,salçafab:null},
  roadLevel:0,
  dragging:null,dragOffset:{x:0,y:0},
  longPressTimer:null,buildingMenu:null,animateBuilding:null,
  pickup:null,
  tutorial:{active:false,step:0,type:'bread',completed:false},invUN:0,invEKMEK:0
},

init(){
  const S=this.S;
  const{ROWS,COLS,CROPS}=this;
  Object.keys(CROPS).forEach(k=>{S.inv[k]=0;S.dailyHarvest[k]=0});S.inv.YUMURTA=0;S.inv.SUT=0;S.inv.YUN=0;S.inv.YOGURT=0;S.inv.PEYNIR=0;S.inv.TEREYAGI=0;S.inv.SALCA=0;S.dailyAnimal.YUMURTA=0;S.dailyAnimal.SUT=0;S.dailyAnimal.YUN=0;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)S.plots.push({r,c,crop:null,age:0,w:false,p:false,nextHarvest:0,harvestCount:0,plowTimer:1080,wetTimer:0});
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)S.plowed.push(r*COLS+c);
},

resetState(){
  const S=this.S;
  S.money=100000;S.day=1;S.sea=0;S.yr=1;S.h=6;S.m=0;
  S.plots=[];S.plowed=[];S.inv={};S.st={SULAMA:1,ICLAMA:1,DEPO:1,KUMES:1,AHIR:1};
  S.ch=0;S.co=0;S.sh=0;S.sel=-1;
  S.whH=12;S.whM=30;S.whArr=false;S.whDis=false;S.curW=null;
  S.tractorActive=false;S.missions=[];S.missionProgress={};
  S.lastHarvestTime={};S.plantCount=0;S.waterCount=0;S.totalSold=0;
  S.dailyHarvest={};S.dailyAnimal={};S.dailySold=0;
  S.weather='güneşli';S.weatherTimer=0;S.windSpeed=5;
  S.irrigating=false;S.irrigStartH=0;S.irrigStartM=0;S.irrigEndH=0;S.irrigEndM=0;S.irrigDrops=[];
  S.pickup=null;
  S.built={degirmen:false,kuyu:false,ahır:false,kümes:false,grid:false,fırın:false,sutislem:false,peynirfab:false,salçafab:false};
  S.buildingLevel={ahır:1,kümes:1,kuyu:1,degirmen:1,fırın:1,sutislem:1,peynirfab:1,salçafab:1};
  S.buildingPos={grid:null,kuyu:null,ahır:null,kümes:null,degirmen:null,fırın:null,sutislem:null,peynirfab:null,salçafab:null};
  S.roadLevel=0;S.dragging=null;S.dragOffset={x:0,y:0};
  S.longPressTimer=null;S.buildingMenu=null;S.animateBuilding=null;
  S.tutorial={active:false,step:0,type:'bread',completed:false};S.invUN=0;S.invEKMEK=0;
  this.init();
},

getP(r,c){return this.S.plots.find(p=>p.r===r&&p.c===c)},

getUpgradeCost(key){
  const S=this.S;
  const{UPGRADE_COST}=this;
  let lv=S.buildingLevel?S.buildingLevel[key]||1:1;
  return Math.floor(UPGRADE_COST[key]*lv*1.5);
},

advanceTime(){
  const S=this.S;
  const{ROWS,COLS,CROPS}=this;
  S.m+=10;while(S.m>=60){S.m-=60;S.h++}if(S.h>=22){this.newDay();return}
  if(S.irrigating){
    if(S.h>S.irrigEndH||(S.h===S.irrigEndH&&S.m>=S.irrigEndM)){
      S.irrigating=false;
      let elapsedMin=(S.h-S.irrigStartH)*60+(S.m-S.irrigStartM);
      if(elapsedMin>=40){
        S.plots.forEach(p=>{p.w=true;p.wetTimer=1080});
        window.toast('Sulama tamamlandı! Tarla sulandı. ('+elapsedMin+' dk)');
      }else{
        window.toast('Sulama süreyi tamamlamadı! ('+elapsedMin+' dk < 40 dk) Sulanmadı.');
      }
    }
  }
  Object.keys(S.lastHarvestTime).forEach(k=>{if(S.lastHarvestTime[k]>0)S.lastHarvestTime[k]--});
  S.plots.forEach(p=>{
    if(p.crop&&p.nextHarvest>0)p.nextHarvest=Math.max(0,p.nextHarvest-10);
    if(p.w&&p.wetTimer>0){p.wetTimer-=10;if(p.wetTimer<=0){p.w=false;p.wetTimer=0}}
    if(S.plowed.includes(p.r*COLS+p.c)&&!p.crop){
      if(!p.plowTimer)p.plowTimer=60;
      p.plowTimer-=10;
      if(p.plowTimer<=0){
        let idx=p.r*COLS+p.c;let pi=S.plowed.indexOf(idx);if(pi>=0)S.plowed.splice(pi,1);
        p.plowTimer=60;
      }
    }
  });
  this.checkWhole();window.updateHUD();this.checkMissions();
  let plotModal=document.getElementById('mPlot');
  if(plotModal&&plotModal.classList.contains('active')&&window.selR>=0){
    let sp=this.getP(window.selR,window.selC);
    if(sp&&sp.crop)window.openPlotM(window.selR,window.selC);
  }
},

changeWeather(){
  const S=this.S;
  const{WEATHERS}=this;
  let weights;
  if(S.sea===0)weights=[0.35,0.3,0.25,0.1];
  else if(S.sea===1)weights=[0.5,0.2,0.2,0.1];
  else if(S.sea===2)weights=[0.2,0.35,0.3,0.15];
  else weights=[0.1,0.25,0.2,0.45];
  let r=Math.random(),cum=0;
  for(let i=0;i<WEATHERS.length;i++){cum+=weights[i];if(r<cum){S.weather=WEATHERS[i];break}}
  window.rainDrops=[];window.snowFlakes=[];
  if(S.weather==='yağmurlu')for(let i=0;i<150;i++)window.rainDrops.push({x:Math.random()*window.W,y:Math.random()*window.H,spd:4+Math.random()*4});
  if(S.weather==='karlı')for(let i=0;i<80;i++)window.snowFlakes.push({x:Math.random()*window.W,y:Math.random()*window.H,r:1+Math.random()*2,spd:1+Math.random()*2});
  if(S.weather==='güneşli')S.windSpeed=3+Math.floor(Math.random()*5);
  else if(S.weather==='bulutlu')S.windSpeed=5+Math.floor(Math.random()*8);
  else if(S.weather==='yağmurlu')S.windSpeed=8+Math.floor(Math.random()*12);
  else S.windSpeed=2+Math.floor(Math.random()*4);
},

harvest(){
  const S=this.S;
  const{ROWS,COLS,CROPS}=this;
  let ib=Math.min(.2,S.st.SULAMA*.04),pb=Math.min(.2,S.st.ICLAMA*.04);
  let cap=500+S.st.DEPO*200,used=Object.values(S.inv).reduce((a,b)=>a+b,0);
  S.plots.forEach(p=>{if(!p.crop||p.nextHarvest>0)return;let cr=CROPS[p.crop];if(!cr)return;
    let age=p.age/365,g=Math.min(1,age/cr.my);let y=cr.mk*g*cr.sea[S.sea];
  if(!p.w)y=0;
  if(p.crop==='BUGDAY')y=Math.min(y,1);
  y/=3;if(p.w)y*=(1+ib);if(p.p)y*=(1+pb);
    if(y>0&&(used+y)<=cap){S.inv[p.crop]=(S.inv[p.crop]||0)+y;S.dailyHarvest[p.crop]=(S.dailyHarvest[p.crop]||0)+y;used+=y}
    p.age++;p.w=false;p.p=false;p.wetTimer=0;p.nextHarvest=p.crop==='BUGDAY'?120:480;
  });
},

feedAnimals(){
  const S=this.S;
  const{ANIM}=this;
  S.money-=(S.ch*ANIM.TAVUK.feed+S.co*ANIM.INEK.feed+S.sh*ANIM.KOYUN.feed);
  let kumLv=S.buildingLevel?S.buildingLevel.kümes||1:1;
  let ahirLv=S.buildingLevel?S.buildingLevel.ahır||1:1;
  if(S.day%ANIM.TAVUK.int===0&&S.ch>0){let a=S.ch*(ANIM.TAVUK.adet+Math.floor(kumLv/3));S.inv.YUMURTA=(S.inv.YUMURTA||0)+a;S.dailyAnimal.YUMURTA=(S.dailyAnimal.YUMURTA||0)+a;this.checkTutorialAction('collect_egg')}
  if(S.day%ANIM.INEK.int===0&&S.co>0){let a=S.co*(ANIM.INEK.litre+ahirLv*2);S.inv.SUT=(S.inv.SUT||0)+a;S.dailyAnimal.SUT=(S.dailyAnimal.SUT||0)+a;this.checkTutorialAction('collect_milk')}
  if(S.day%ANIM.KOYUN.int===0&&S.sh>0){let a=S.sh*(ANIM.KOYUN.adet+Math.floor(ahirLv/3));S.inv.YUN=(S.inv.YUN||0)+a;S.dailyAnimal.YUN=(S.dailyAnimal.YUN||0)+a}
},

newDay(){
  const S=this.S;
  const{FACTS}=this;
  S.h=6;S.m=0;S.day++;if(S.day>90){S.day=1;S.sea=(S.sea+1)%4;if(S.sea===0)S.yr++}
  this.harvest();this.feedAnimals();this.genWhole();S.whArr=false;S.whDis=false;
  Object.keys(S.dailyHarvest).forEach(k=>S.dailyHarvest[k]=0);
  S.dailyAnimal.YUMURTA=0;S.dailyAnimal.SUT=0;S.dailySold=0;
  S.plantCount=0;S.waterCount=0;
  window.sutCount=0;window.yumurtaCount=0;
  this.changeWeather();
  document.getElementById('infoPanel').textContent=FACTS[Math.floor(Math.random()*FACTS.length)];
  document.getElementById('infoPanel').style.opacity='1';setTimeout(()=>{document.getElementById('infoPanel').style.opacity='0'},20000);
  this.generateMissions();window.updateHUD();this.renderMissions();
},

generateMissions(){
  const S=this.S;
  const{MISSION_TEMPLATES}=this;
  S.missions=[];S.missionProgress={};let shuffled=[...MISSION_TEMPLATES].sort(()=>Math.random()-0.5);
  for(let i=0;i<3&&i<shuffled.length;i++){let m=shuffled[i];S.missions.push({...m});S.missionProgress[i]=0}
},

checkMissions(){
  const S=this.S;
  S.missions.forEach((m,i)=>{if(S.missionProgress[i]>=m.target)return;
  if(m.type==='harvest'){S.missionProgress[i]=S.dailyHarvest[m.crop]||0}
  else if(m.type==='animal'){S.missionProgress[i]=S.dailyAnimal[m.animal]||0}
  else if(m.type==='sell'){S.missionProgress[i]=S.dailySold}
  else if(m.type==='plant'){S.missionProgress[i]=S.plantCount}
  else if(m.type==='water'){S.missionProgress[i]=S.waterCount}});
  this.renderMissions();
},

renderMissions(){
  const S=this.S;
  let l=document.getElementById('missionList');l.innerHTML='';
  S.missions.forEach((m,i)=>{let prog=Math.min(S.missionProgress[i]||0,m.target);let done=prog>=m.target;
    let d=document.createElement('div');d.className='mi'+(done?' done':'');
    d.innerHTML=`<span class="check"></span>${m.text} (${prog}/${m.target})`;
    if(done&&!m.rewarded){S.money+=100;m.rewarded=true;window.toast('Görev tamamlandı! +100 TL')}l.appendChild(d)})
},

genWhole(){this.S.whH=12+Math.floor(Math.random()*4);this.S.whM=Math.floor(Math.random()*6)*10},

checkWhole(){
  const S=this.S;
  if(S.whArr||S.whDis)return;if(S.h>S.whH||(S.h===S.whH&&S.m>=S.whM)){S.whArr=true;this.showWhole()}
},

showWhole(){
  const S=this.S;
  const{CROPS,ANIM}=this;
  let keys=Object.keys(CROPS).concat(['YUMURTA','SUT','YUN']);let wk=keys[Math.floor(Math.random()*keys.length)];
  let wkgs=wk==='YUMURTA'?Math.floor(2+S.ch*2):wk==='SUT'?Math.floor(1+S.co*2):wk==='YUN'?Math.floor(1+S.sh):Math.floor(3+Math.random()*15);
  let bp=CROPS[wk]?CROPS[wk].sell:wk==='YUMURTA'?ANIM.TAVUK.sell:ANIM.INEK.sell;
  let pr=Math.round(bp*(.8+Math.random()*.4));let nm=CROPS[wk]?CROPS[wk].name:wk==='YUMURTA'?'Yumurta':'Süt';
  S.curW={crop:wk,kg:wkgs,price:pr,name:nm};setTimeout(()=>this.showWholeDlg(),500)
},

showWholeDlg(){
  const S=this.S;
  const{CROPS}=this;
  let w=S.curW;if(!w)return;let av=S.inv[w.crop]||0,tot=Math.round(w.kg*w.price);
  let unit=w.crop==='YUMURTA'?'adet':w.crop==='SUT'?'litre':w.crop==='YUN'?'adet':'kg';
  document.getElementById('wholeI').innerHTML=`<div style="text-align:center;font-size:15px;margin-bottom:6px"><b>${w.name}</b> arıyorum!</div>
    <div style="font-size:13px">Miktar: <b>${w.kg} ${unit}</b></div><div style="font-size:13px">Fiyat: <b>${w.price} TL/${unit}</b></div>
    <div style="font-size:15px;margin-top:4px">Toplam: <b style="color:#8bc34a">${tot.toLocaleString()} TL</b></div>
    <div style="font-size:13px">Sende: <b>${av.toFixed(0)} ${unit}</b></div>`;
  let b=document.getElementById('btnSell');if(av>=w.kg){b.textContent=`Sat (${tot.toLocaleString()} TL)`;b.disabled=false;b.style.opacity=1}
  else{b.textContent='Yetersiz stok';b.disabled=true;b.style.opacity=.4}window.openM('whole')
},

sellW(){
  const S=this.S;
  const{CROPS}=this;
  let w=S.curW;if(!w)return;let av=S.inv[w.crop]||0;if(av<w.kg)return;
  let unit=w.crop==='YUMURTA'?'adet':w.crop==='SUT'?'litre':w.crop==='YUN'?'adet':'kg';
  S.inv[w.crop]-=w.kg;S.money+=Math.round(w.kg*w.price);S.totalSold+=Math.round(w.kg*w.price);S.dailySold+=Math.round(w.kg*w.price);
  window.toast(`${w.kg} ${unit} ${w.name} satıldı! +${Math.round(w.kg*w.price).toLocaleString()} TL`);this.dismissW();this.checkMissions()
},

dismissW(){this.S.whDis=true;this.S.curW=null;window.closeM('whole');window.updateHUD()},

plowArea(r,c){
  const S=this.S;
  const{ROWS,COLS}=this;
  if(r<0||r>=ROWS||c<0||c>=COLS)return;
  let idx=r*COLS+c;
  if(S.plowed.includes(idx)){window.toast('Bu kare zaten sürülmüş!');return}
  S.plowed.push(idx);
  let p=this.getP(r,c);if(p)p.plowTimer=60;
  this.advanceTime();window.draw();
  let allPlowed=true;
  for(let rr=0;rr<ROWS;rr++)for(let cc=0;cc<COLS;cc++){if(!S.plowed.includes(rr*COLS+cc))allPlowed=false}
  if(allPlowed){S.tractorActive=false;window.toast('Tüm tarla sürüldü! Traktör kapatıldı.')}
},

buyA(k){
  const S=this.S;
  const{ANIM}=this;
  let a=ANIM[k];if(S.money<a.price){window.toast('Yeterli paran yok!');return}
  if(k==='TAVUK'){
    if(!S.built.kümes){window.toast('Önce kümes inşa et!');return}
    let cap=5+(S.buildingLevel.kümes||1);if(S.ch>=cap){window.toast('Kümes dolu!');return}S.ch++;
    this.checkTutorialAction('buy_chicken');
  }else if(k==='INEK'){
    if(!S.built.ahır){window.toast('Önce ahır inşa et!');return}
    let cap=3+(S.buildingLevel.ahır||1);if(S.co>=cap){window.toast('Ahır dolu!');return}S.co++;
    this.checkTutorialAction('buy_cow');
  }else if(k==='KOYUN'){
    if(!S.built.ahır){window.toast('Önce ahır inşa et!');return}
    let cap=3+(S.buildingLevel.ahır||1);if(S.sh>=cap){window.toast('Ahır dolu!');return}S.sh++}
  S.money-=a.price;window.toast(`${a.name} alındı!`);window.updateHUD();window.draw();window.renderM('animal')
},

buySeed(k,cr){
  window.plantMode=k;window.closeM('shop');window.lastPlantClick=-1;window.toast(`${cr.name} ekim modu! Tarlalara tıkla. Çıkmak için boş yere tıkla.`);window.draw()
},

buyBuilding(k,price,name){
  const S=this.S;
  const{ROWS,COLS,CROPS,BUILDING_NAMES}=this;
  try {
    if(S.built[k]){window.toast('Zaten inşa edildi!');return}
    if(S.money<price){window.toast('Yeterli paran yok! ('+price+' TL)');return}
    S.money-=price;S.built[k]=true;
    if(k==='grid'){
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
        if(!S.plots.find(p=>p.r===r&&p.c===c))S.plots.push({r,c,crop:null,age:0,w:false,p:false,nextHarvest:0,harvestCount:0,plowTimer:1080,wetTimer:0});
        if(!S.plowed.includes(r*COLS+c))S.plowed.push(r*COLS+c);
      }
    }
    S.animateBuilding={key:k,t:Date.now()};
    window.closeM('tesisler');
    window.updateHUD();window.draw();
    if(k==='grid'){
      this.checkTutorialAction('build_grid');
    }else{
      window.toast(BUILDING_NAMES[k]+' inşa edildi! Taşıma Modu ile yerini değiştirebilirsin.');
    }
    if(k==='kuyu')this.checkTutorialAction('build_kuyu');
    if(k==='degirmen')this.checkTutorialAction('build_degirmen');
    if(k==='fırın')this.checkTutorialAction('build_fırın');
    if(k==='kümes')this.checkTutorialAction('build_kümes');
    if(k==='ahır')this.checkTutorialAction('build_ahir');
    if(k==='sutislem')this.checkTutorialAction('build_sutislem');
    if(k==='peynirfab')this.checkTutorialAction('build_peynirfab');
    if(k==='salçafab')this.checkTutorialAction('build_salçafab');
  } catch(e) {
    window.toast('Hata: ' + e.message);
  }
},

upgradeBuilding(k){
  const S=this.S;
  const{BUILDING_MAX_LEVEL,UPGRADE_DESC}=this;
  if(!S.built[k]){window.toast('Önce inşa et!');return}
  let lv=S.buildingLevel[k]||1;
  if(lv>=BUILDING_MAX_LEVEL){window.toast('Maks seviyeye ulaşıldı!');return}
  let cost=this.getUpgradeCost(k);
  if(S.money<cost){window.toast('Yeterli paran yok! ('+cost.toLocaleString()+' TL)');return}
  S.money-=cost;S.buildingLevel[k]=lv+1;
  window.toast(UPGRADE_DESC[k].name+' seviye '+(lv+1)+' oldu!');
  window.updateHUD();window.draw();
},

harvestP(){
  const S=this.S;
  const{CROPS}=this;
  let p=this.getP(window.selR,window.selC);if(!p||!p.crop)return;
  if(p.nextHarvest>0){window.toast('Hasat için bekleyin!');return}let cr=CROPS[p.crop];if(!cr)return;
  let ib=p.w?Math.min(.2,S.st.SULAMA*.04):0,pb=p.p?Math.min(.2,S.st.ICLAMA*.04):0;
  let g=Math.min(1,(p.age/365)/cr.my);let y=cr.mk*g*cr.sea[S.sea];
  if(!p.w)y=0;
  if(p.crop==='BUGDAY')y=Math.min(y,1);
  if(p.w)y*=(1+ib);if(p.p)y*=(1+pb);
  y=Math.max(y,y>0?0.1:0);
  let cap=500+S.st.DEPO*200,used=Object.values(S.inv).reduce((a,b)=>a+b,0);
  if(y>0&&(used+y)<=cap){S.inv[p.crop]=(S.inv[p.crop]||0)+y;S.dailyHarvest[p.crop]=(S.dailyHarvest[p.crop]||0)+y;
    p.harvestCount=(p.harvestCount||0)+1;let mh=cr.maxHarvest||1;
    if(p.harvestCount>=mh){let cn=cr.name;p.crop=null;p.age=0;p.w=false;p.p=false;p.nextHarvest=0;p.harvestCount=0;window.toast(`${cn} bitkiniz tükendi! Yeni tohum ek.`)}
    else{p.age+=5;p.w=false;p.p=false;p.nextHarvest=p.crop==='BUGDAY'?120:480;window.toast(`${cr.name} hasat edildi! +${y.toFixed(1)} kg (Kalan: ${mh-p.harvestCount})`)}
    if(p.crop&&p.crop==='BUGDAY')this.checkTutorialAction('harvest_bugday')}
  else if(y>0){window.toast('Depo dolu!')}
  window.harvestModeActive=true;window.closeM('plot');window.toast('Hasat modu! Diğer hazır tarlalara tıkla. Çıkmak için boş yere tıkla.');window.draw();this.checkMissions()
},

waterP(){
  const S=this.S;
  let p=this.getP(window.selR,window.selC);if(p&&!p.w){p.w=true;p.wetTimer=1080;S.waterCount++;this.advanceTime();window.closeM('plot');window.toast('Sulama yapıldı! 18 saat geçerli.');window.draw();this.checkMissions()}
},

pestP(){
  const S=this.S;
  let p=this.getP(window.selR,window.selC);if(p&&!p.p){if(S.money<50){window.toast('İlaçlama için 50 TL gerekli!');return}S.money-=50;p.p=true;this.advanceTime();window.closeM('plot');window.pesticideModeActive=true;S.tractorActive=false;window.harvestModeActive=false;S.plantMode=null;window.toast('İlaçlama yapıldı! Diğer ilaçlanmamış tarlalara tıkla.');window.draw();window.updateHUD()}
},

removeC(){
  let p=this.getP(window.selR,window.selC);if(p){if(this.S.money<50){window.toast('50 TL gerekli!');return}this.S.money-=50;p.crop=null;p.age=0;p.w=false;p.p=false;p.nextHarvest=0;window.closeM('plot');window.toast('Söküldü! -50 TL');window.draw()}
},

checkTutorialAction(action){
  const S=this.S;
  const{TUTORIAL_STEPS}=this;
  if(!S.tutorial||!S.tutorial.active||!S.tutorial.type)return;
  let steps=TUTORIAL_STEPS[S.tutorial.type];
  if(!steps)return;
  let current=steps[S.tutorial.step];
  if(!current||current.action!==action)return;
  window.tutorialStepDone=true;
  window.toast('✅ Tamamlandı! Devam et...');
  let btn=document.getElementById('tutorialBtn');
  btn.textContent='Sonraki Adım';btn.style.display='inline-block';
  window.speakTR('Tamamlandı!');
},

isStepDone(action){
  const S=this.S;
  if(action==='build_grid')return S.built.grid;
  if(action==='plow')return S.plowed.length>0;
  if(action==='plant_bugday')return S.plots.some(p=>p.crop==='BUGDAY');
  if(action==='build_kuyu')return S.built.kuyu;
  if(action==='water')return S.plots.some(p=>p.crop&&p.w);
  if(action==='harvest_bugday')return(S.inv.BUGDAY||0)>0;
  if(action==='build_degirmen')return S.built.degirmen;
  if(action==='grind')return(S.invUN||0)>0;
  if(action==='build_fırın')return S.built.fırın;
  if(action==='bake')return(S.invEKMEK||0)>0;
  if(action==='build_kümes')return S.built.kümes;
  if(action==='buy_chicken')return S.ch>0;
  if(action==='collect_egg')return(S.inv.YUMURTA||0)>0;
  if(action==='build_ahir')return S.built.ahır;
  if(action==='buy_cow')return S.co>0;
  if(action==='collect_milk')return(S.inv.SUT||0)>0;
  if(action==='build_sutislem')return S.built.sutislem;
  if(action==='make_yogurt')return(S.inv.YOGURT||0)>0;
  if(action==='build_peynirfab')return S.built.peynirfab;
  if(action==='make_cheese')return(S.inv.PEYNIR||0)>0;
  if(action==='make_butter')return(S.inv.TEREYAGI||0)>0;
  if(action==='plant_domates')return S.plots.some(p=>p.crop==='DOMATES');
  if(action==='harvest_domates')return(S.inv.DOMATES||0)>0;
  if(action==='build_salçafab')return S.built.salçafab;
  if(action==='make_salca')return(S.inv.SALCA||0)>0;
  return false;
},

sellBuilding(key){
  const S=this.S;
  const{BUILDING_PRICES,BUILDING_NAMES,SELL_RATIO,ROWS,COLS}=this;
  let price=BUILDING_PRICES[key]||0;
  let refund=Math.floor(price*SELL_RATIO);
  if(!S.built[key]){window.toast('Bu bina inşa edilmemiş!');return}
  S.built[key]=false;
  S.money+=refund;
  S.buildingPos[key]=null;
  if(key==='grid'){
    S.plots=[];S.plowed=[];
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)S.plots.push({r,c,crop:null,age:0,w:false,p:false,nextHarvest:0,harvestCount:0,plowTimer:1080,wetTimer:0});
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)S.plowed.push(r*COLS+c);
    S.irrigating=false;S.sel=-1;
  }
  S.buildingMenu=null;S.dragging=null;
  window.toast(BUILDING_NAMES[key]+' satıldı! +'+refund+' TL');
  window.updateHUD();window.draw();
},

upgradeRoad(){
  const S=this.S;
  const{ROAD_LEVEL_NAMES,ROAD_UPGRADE_COST}=this;
  let lv=S.roadLevel||0;
  if(lv>=2){window.toast('Yollar zaten maksimum seviyede!');return}
  let cost=ROAD_UPGRADE_COST[lv+1];
  if(!cost){window.toast('Daha fazla geliştirilemez!');return}
  if(S.money<cost){window.toast('Yeterli paran yok! ('+cost+' TL)');return}
  S.money-=cost;
  S.roadLevel=lv+1;
  window.toast(ROAD_LEVEL_NAMES[S.roadLevel]+' yapıldı! Yollar iyileştirildi. ('+ROAD_LEVEL_NAMES[S.roadLevel]+')');
  window.updateHUD();window.draw();
},

isValidPlacement(key,x,y){
  const{ROWS,COLS}=this;
  let pad=window.CL*0.5;
  if(x<pad||x>window.W-pad||y<pad||y>window.H-48-pad)return false;
  let hx=(function(){
    let hs=window.CL*(window.ISLANDSCAPE?2.8:2.0);
    let hg=window.CL*1.2;
    let hvx=Math.min(window.GX-hg,window.W*0.16+hs);
    hvx=Math.max(hs+window.CL*0.3,hvx);
    return hvx;
  })();
  let hy=window.sceneTop;
  if(key!=='grid'&&Math.abs(x-hx)<window.CL*3&&Math.abs(y-hy)<window.CL*3)return false;
  let GCL=window.GRID_CL||window.CL;
  if(key!=='grid'){
    if(S.built.grid&&x>window.GX-GCL*2&&x<window.GX+COLS*GCL+GCL*2&&y>window.GY-GCL*2&&y<window.GY+ROWS*GCL+GCL*2)return false;
  }
  if(key==='grid'){
    if(x<GCL*2||x+COLS*GCL>window.W-GCL*2)return false;
    if(y<window.sceneTop+GCL||y+ROWS*GCL>window.H-48-GCL*2)return false;
  }
  return true;
},

getDefaultKuyuPos(){
  const{COLS,ROWS}=this;
  let GCL=window.GRID_CL||window.CL;
  let gcx=window.GX+COLS*GCL/2;
  let gbottom=window.GY+ROWS*GCL;
  let mwy=window.H-48-window.CL*1.2;
  let ky=Math.min(gbottom+window.CL*1.5,mwy);
  return{x:gcx,y:ky,dx:0,dy:Math.min(gbottom+window.CL*1.5,mwy)-window.GY};
},

getBuildingAt(mx,my){
  const S=this.S;
  const{ROWS,COLS,BUILDING_NAMES}=this;
  let sc=window.screenToScene(mx,my);let sx=sc.x,sy=sc.y;
  let keys=Object.keys(BUILDING_NAMES);
  for(let i=keys.length-1;i>=0;i--){
    let k=keys[i];
    if(k==='grid'){
      if(!S.built.grid)continue;
      let GCL=window.GRID_CL||window.CL;
      if(sx>=window.GX&&sx<=window.GX+COLS*GCL&&sy>=window.GY&&sy<=window.GY+ROWS*GCL)return k;
    }else if(k==='kuyu'){
      if(!S.built.kuyu)continue;
      if(typeof window.wellS==='undefined')continue;
      if(Math.abs(sx-window.wellX)<window.wellS*0.7&&Math.abs(sy-window.wellY)<window.wellS*0.7)return k;
    }else if(k==='ahır'){
      if(!S.built.ahır)continue;
      if(typeof window.barnS==='undefined')continue;
      if(Math.abs(sx-window.barnX)<window.barnS*0.7&&Math.abs(sy-window.barnY)<window.barnS*0.7)return k;
    }else if(k==='kümes'){
      if(!S.built.kümes)continue;
      if(typeof window.kümesS==='undefined')continue;
      if(Math.abs(sx-window.kümesX)<window.kümesS*0.7&&Math.abs(sy-window.kümesY)<window.kümesS*0.7)return k;
    }else if(k==='degirmen'){
      if(!S.built.degirmen)continue;
      if(typeof window.wmS==='undefined')continue;
      if(Math.abs(sx-window.wmX)<window.wmS*0.7&&Math.abs(sy-window.wmY)<window.wmS*0.7)return k;
    }else if(k==='fırın'){
      if(!S.built.fırın)continue;
      if(typeof window.firinS==='undefined')continue;
      if(Math.abs(sx-window.firinX)<window.firinS*0.7&&Math.abs(sy-window.firinY)<window.firinS*0.7)return k;
    }else if(k==='sutislem'){
      if(!S.built.sutislem)continue;
      if(typeof window.sutIslemS==='undefined')continue;
      if(Math.abs(sx-window.sutIslemX)<window.sutIslemS*0.7&&Math.abs(sy-window.sutIslemY)<window.sutIslemS*0.7)return k;
    }else if(k==='peynirfab'){
      if(!S.built.peynirfab)continue;
      if(typeof window.peynirS==='undefined')continue;
      if(Math.abs(sx-window.peynirX)<window.peynirS*0.7&&Math.abs(sy-window.peynirY)<window.peynirS*0.7)return k;
    }else if(k==='salçafab'){
      if(!S.built.salçafab)continue;
      if(typeof window.salcaS==='undefined')continue;
      if(Math.abs(sx-window.salcaX)<window.salcaS*0.7&&Math.abs(sy-window.salcaY)<window.salcaS*0.7)return k;
    }
  }
  return null;
},

startDrag(key){
  this.S.dragging=key;
  window.toast('Binayı sürükle bırakın. ESC ile iptal.');
},

cancelDrag(){
  if(!this.S.dragging)return;
  this.S.dragging=null;
  this.S.buildingMenu=null;
  window.toast('Taşıma iptal edildi.');
  window.draw();
},

finishDrag(){
  const S=this.S;
  const{BUILDING_NAMES,GRID_LINKED_KUYU}=this;
  if(!S.dragging)return;
  let key=S.dragging;
  let pos=this.getBuildingCenter(key);
  if(!pos){this.cancelDrag();return}
  if(!this.isValidPlacement(key,pos.x,pos.y)){
    window.toast('Geçersiz konum! Başka bir yere bırakın.');
    return;
  }
  S.buildingPos[key]={x:pos.x,y:pos.y};
  if(key==='grid'&&GRID_LINKED_KUYU&&S.built.kuyu){
    let defKuyu=this.getDefaultKuyuPos();
    if(!S.buildingPos.kuyu){
      S.buildingPos.kuyu={x:defKuyu.x,y:defKuyu.y};
    }
    S.buildingPos.kuyu.x=pos.x+defKuyu.dx;
    S.buildingPos.kuyu.y=pos.y+defKuyu.dy;
  }
  S.dragging=null;
  window.wasPanning=true;
  window.toast(BUILDING_NAMES[key]+' yerleştirildi!');
  window.draw();
},

getBuildingCenter(key){
  if(!this.S.dragging)return null;
  return{x:this.S.dragX,y:this.S.dragY};
},

showBuildingMenu(key,mx,my){
  this.S.buildingMenu={key:key,x:mx,y:my};
  window.draw();
},

async save(){
  let user=StorageManager.Auth.getUser()||'default';
  await StorageManager.Data.save(user,this.S);
},

async load(){
  const S=this.S;
  const{ROWS,COLS,CROPS}=this;
  let user=StorageManager.Auth.getUser()||'default';
  let l=await StorageManager.Data.load(user);
  if(l){
    Object.assign(S,l);if(!S.dailyHarvest)S.dailyHarvest={};if(!S.dailyAnimal)S.dailyAnimal={};
    if(S.dailySold===undefined)S.dailySold=0;
    if(!S.built)S.built={degirmen:false,kuyu:false,ahır:false,kümes:false,grid:false,fırın:false,sutislem:false,peynirfab:false,salçafab:false};
    if(S.built.grid===undefined)S.built.grid=false;
    if(S.built.fırın===undefined)S.built.fırın=false;
    if(!S.buildingPos)S.buildingPos={grid:null,kuyu:null,ahır:null,kümes:null,degirmen:null,fırın:null,sutislem:null,peynirfab:null,salçafab:null};
    if(!S.buildingLevel)S.buildingLevel={ahır:1,kümes:1,kuyu:1,degirmen:1,fırın:1,sutislem:1,peynirfab:1,salçafab:1};
    if(!S.tutorial)S.tutorial={active:false,step:0,type:'bread',completed:false};
    if(S.invUN===undefined)S.invUN=0;
    if(S.invEKMEK===undefined)S.invEKMEK=0;
    S.dragging=null;S.buildingMenu=null;
    Object.keys(CROPS).forEach(k=>{if(S.dailyHarvest[k]===undefined)S.dailyHarvest[k]=0});
    if(S.dailyAnimal.YUMURTA===undefined)S.dailyAnimal.YUMURTA=0;
    if(S.dailyAnimal.SUT===undefined)S.dailyAnimal.SUT=0;
    if(S.dailyAnimal.YUN===undefined)S.dailyAnimal.YUN=0;
    S.plots.forEach(p=>{if(p.plowTimer===undefined)p.plowTimer=60;if(p.wetTimer===undefined)p.wetTimer=0});
  }
}

};
export default GameManager;
