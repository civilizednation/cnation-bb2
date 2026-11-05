(() => {
  'use strict';

  const KEY = 'cnation-bungopang2-web-v2';
  const ROOT = 'Assets/';
  const catalog = window.BOP_ASSETS || [];
  const clips = window.BOP_ANIMS || {};
  const app = document.getElementById('app');
  const hud = document.getElementById('hud');
  const toast = document.getElementById('toast');
  const soundButton = document.getElementById('sound-toggle');
  const catalogButton = document.getElementById('catalog-toggle');
  const soundFiles = {
    chicken: [`${ROOT}Art/Animals/Chicken/Audio/Chicken-001.wav`, `${ROOT}Art/Animals/Chicken/Audio/Chicken-002.wav`],
    cow: [`${ROOT}Art/Animals/Cow/Audio/Cow-001.wav`, `${ROOT}Art/Animals/Cow/Audio/Cow-002.wav`],
    pig: [`${ROOT}Art/Animals/Piggy/Audio/Pig-001.wav`, `${ROOT}Art/Animals/Piggy/Audio/Pig-002.wav`]
  };
  const cropData = {
    carrot: { name: '당근', emoji: '🥕', steps: 4, yield: 2, icon: `${ROOT}Art/Crops/Carrot/Sprites/Sprite_Carrot_icon.png`, seed: `${ROOT}Art/Crops/Carrot/Sprites/Sprite_Carrot_seedbag.png`, image: n => `${ROOT}Art/Crops/Carrot/Sprites/Sprite_Carrot_0${n - 1}.png` },
    corn: { name: '옥수수', emoji: '🌽', steps: 5, yield: 3, icon: `${ROOT}Art/Crops/Corn/Sprites/Sprite_Corn_icon.png`, seed: `${ROOT}Art/Crops/Corn/Sprites/Sprite_Corn_seedbag.png`, image: n => `${ROOT}Art/Crops/Corn/Sprites/Sprite_Corn_0${n}.png` },
    wheat: { name: '밀', emoji: '🌾', steps: 5, yield: 3, icon: `${ROOT}Art/Crops/Wheat/Sprites/Sprite_Wheat_icon.png`, seed: `${ROOT}Art/Crops/Wheat/Sprites/Sprite_Wheat_seedbag.png`, image: n => `${ROOT}Art/Crops/Wheat/Sprites/Sprite_Wheat_0${n}.png` }
  };
  const recipes = [
    { name: '정통 단팥', egg: 1, milk: 0, carrot: 0, price: 100, perfect: 120, icon: `${ROOT}Sprites/Tycoon/RedBeans.png`, day: 1, level: 1 },
    { name: '우유 슈크림', egg: 1, milk: 1, carrot: 0, price: 180, perfect: 220, icon: `${ROOT}Sprites/Tycoon/sucream.png`, day: 2, level: 1 },
    { name: '유기농 당근', egg: 1, milk: 1, carrot: 2, price: 320, perfect: 400, icon: cropData.carrot.icon, day: 3, level: 1 },
    { name: '황금 특선 세트', egg: 2, milk: 2, carrot: 3, price: 550, perfect: 700, icon: `${ROOT}Sprites/Tycoon/14_20240413014734.png`, day: 1, level: 3 }
  ];
  const fishSprites = [
    `${ROOT}Sprites/Tycoon/1.png`, `${ROOT}Sprites/Tycoon/2.png`,
    `${ROOT}Sprites/Tycoon/3.png`, `${ROOT}Sprites/Tycoon/14_20240413014734.png`
  ];
  const animalImages = {
    chicken: 'web/converted/Art/Animals/Chicken/PSD/PSD_Chicken.png',
    cow: 'web/converted/Art/Animals/Cow/PSD/PSD_Cow.png',
    pig: 'web/converted/Art/Animals/Piggy/PSD/PSD_Piggy.png'
  };
  const characterImages = {
    farmer: 'web/converted/Art/Characters/PSD/Farmer/PSD_character_farming.png',
    boy: 'web/converted/Art/Characters/PSD/Boy/PSD_character_boy.png',
    boy2: 'web/converted/Art/Characters/PSD/Boy2/PSD_character_boy2.png'
  };
  const marketImage = 'web/converted/Art/Environment/Market/PSD/PSD_Market.png';
  const scarecrowImage = 'web/converted/Art/Environment/Scarecrow/PSD/PSD_Scarecow.png';
  const moldImage = 'web/assets/mold.png';
  const stickerImages = catalog.filter(a => a.web && a.path.startsWith('Assets/Sprites/Sticker/')).map(a => a.web);
  const decorImages = catalog.filter(a => a.web && a.path.startsWith('Assets/Art/Environment/') && /\.png$/i.test(a.path) && !/_normal|_mask|_n\./i.test(a.path)).map(a => a.web);
  const interiorImages = catalog.filter(a => a.web && a.path.startsWith('Assets/Art/Interior/') && /\.png$/i.test(a.path) && !/_normal|_mask|_n\./i.test(a.path)).map(a => a.web);
  const cutsceneImages = Array.from({ length: 35 }, (_, i) => `${ROOT}Sprites/Cutting/${String(i + 1).padStart(2, '0')}.png`);
  const clipNames = Object.keys(clips);
  let timerHandle;
  let toastHandle;
  let book = null;
  let chosenGallery = null;

  function fresh() {
    const now = Date.now();
    return {
      phase: 'title', day: 1, gold: 0, reputation: 0, egg: 2, milk: 0,
      carrot: 0, corn: 0, wheat: 0, fieldSize: 3, moldCount: 4, stallLevel: 1,
      cowOwned: false, pigOwned: false, seed: 'carrot', selected: 4,
      player: { x: 1, y: 1, dir: 'front', skin: 'farmer', clip: 'Anim_character_idle_front', until: 0 },
      tool: 'Anim_Tool_Hoe_Swing_front', harvestClip: 'Produce_anim', nextBlink: now + 10000,
      animalClip: { chicken: '', cow: '', pig: '' },
      animalUntil: { chicken: 0, cow: 0, pig: 0 },
      crops: Array.from({ length: 36 }, () => ({ stage: -2, kind: 'carrot', next: 0, watered: false })),
      molds: Array.from({ length: 9 }, () => ({ state: 'empty', recipe: 0, start: 0, perfect: false, clip: '' })),
      shelf: [], order: null, nextCustomer: now + 10000, nextEgg: now + 30000, nextMilk: now + 45000,
      recipe: 0, sold: 0, earned: 0, missed: 0, sound: true, backgroundAt: 0, sticker: 0, lastCustomerUntil: 0
    };
  }
  function load() {
    const base = fresh();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved || typeof saved !== 'object') return base;
      Object.assign(base, saved);
      if (!['title', 'farm', 'shop', 'result'].includes(base.phase)) base.phase = 'title';
      if (![3, 6].includes(base.fieldSize)) base.fieldSize = 3;
      if (![4, 6, 9].includes(base.moldCount)) base.moldCount = 4;
      if (!cropData[base.seed]) base.seed = 'carrot';
      if (!Array.isArray(base.crops) || base.crops.length !== 36) base.crops = fresh().crops;
      if (!Array.isArray(base.molds) || base.molds.length !== 9) base.molds = fresh().molds;
      if (!Array.isArray(base.shelf)) base.shelf = [];
      base.player = { ...fresh().player, ...(saved.player || {}) };
      base.animalClip = { ...fresh().animalClip, ...(saved.animalClip || {}) };
      base.animalUntil = { ...fresh().animalUntil, ...(saved.animalUntil || {}) };
      for (const key of ['gold', 'reputation', 'egg', 'milk', 'carrot', 'corn', 'wheat', 'sold', 'earned', 'missed']) base[key] = Math.max(0, Number(base[key]) || 0);
      base.day = Math.max(1, Number(base.day) || 1);
      return base;
    } catch { return base; }
  }
  let game = load();
  if (game.backgroundAt && game.phase === 'shop') {
    const gap = Math.max(0, Date.now() - game.backgroundAt);
    game.molds.forEach(m => { if (m.state === 'baking') m.start += gap; });
    if (game.order) game.order.deadline += gap;
  }
  game.backgroundAt = 0;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(game)); }
    catch { document.getElementById('save-state').textContent = '저장 불가'; }
  }
  function say(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastHandle);
    toastHandle = setTimeout(() => toast.classList.remove('show'), 3000);
  }
  function money(value) { return Math.floor(value).toLocaleString('ko-KR'); }
  function sec(ms) { return `${Math.max(0, Math.ceil(ms / 1000))}초`; }
  function sound(animal) {
    if (!game.sound || !soundFiles[animal]) return;
    const choices = soundFiles[animal];
    try { const audio = new Audio(choices[Math.floor(Math.random() * choices.length)]); audio.volume = .43; audio.play().catch(() => {}); }
    catch { /* Browsers may suppress sound until a gesture. */ }
  }
  function clipDuration(name) { return Math.max(.25, clips[name]?.duration || .6); }
  function motion(name) {
    if (/walk|run/i.test(name)) return 'walk';
    if (/planting|picking|tool_swing|Hoe_Swing/i.test(name)) return 'work';
    if (/water/i.test(name)) return 'water';
    if (/Flip/i.test(name)) return 'flip';
    if (/eating/i.test(name)) return 'eat';
    if (/blink/i.test(name)) return 'blink';
    if (/ruffle|Swing|Idle|idle/i.test(name)) return 'sway';
    if (/Produce|Harvest|Zoom/i.test(name)) return 'pop';
    return 'sway';
  }
  function clipPreviewImage(name) {
    const source = clips[name]?.path || '';
    if (source.includes('/Animals/Chicken/')) return animalImages.chicken;
    if (source.includes('/Animals/Cow/')) return animalImages.cow;
    if (source.includes('/Animals/Piggy/')) return animalImages.pig;
    if (source.includes('/Environment/Market/')) return marketImage;
    if (source.includes('/Environment/Scarecrow/')) return scarecrowImage;
    if (source.includes('/Environment/Bush/')) return `${ROOT}Art/Environment/Bush/Sprites/Sprite_Bush.png`;
    if (source.includes('/LampAndLantern/')) return `${ROOT}Art/Environment/Lamps/LampAndLantern/Sprites/Lantern/Sprite_Lantern.png`;
    if (source.includes('/Tools/Hoe/')) return `${ROOT}Art/Tools/Hoe/Sprites/hoe_icon.png`;
    if (source.includes('/Tools/Watercan/')) return `${ROOT}Art/Tools/Watercan/Sprites/Sprite_WaterCan_Icon.png`;
    if (source.includes('/Animation/Mold')) return moldImage;
    if (source.includes('/Crops/')) return cropData.carrot.icon;
    return characterImages.farmer;
  }
  function animAttrs(name) { return `data-clip="${name}" data-motion="${motion(name)}" style="--clip-duration:${clipDuration(name)}s"`; }
  function facingSuffix() { return game.player.dir === 'up' ? 'up' : game.player.dir === 'left' || game.player.dir === 'right' ? 'side' : 'front'; }
  function playPlayer(action) {
    const suffix = facingSuffix();
    const name = action === 'walk' ? (game.player.dir === 'up' ? 'Anim_character_walk_up' : game.player.dir === 'left' ? 'Anim_character_walk_side_L' : game.player.dir === 'right' ? 'Anim_character_walk_side' : 'Anim_character_walk_down')
      : action === 'idle' ? (suffix === 'front' ? 'Anim_character_idle_front' : `Anim_character_idle_${suffix}`)
      : `Anim_character_${action}_${suffix}`;
    game.player.clip = name;
    game.player.until = Date.now() + clipDuration(name) * 1000;
  }
  function toolClip(action) {
    const suffix = facingSuffix();
    if (action === 'tool_swing') return `Anim_Tool_Hoe_Swing_${suffix}`;
    return suffix === 'front' ? 'Anim_WaterCan_Front_Animation' : suffix === 'side' ? 'Anim_WaterCan_Side_Animation' : 'Anim_WaterCan_Up_Animation';
  }
  function animalClip(animal, action) {
    const name = animal === 'chicken' ? (action === 'run' ? 'Anim_Chicken_Run' : 'Anim_Chicken_Idle')
      : animal === 'cow' ? (action === 'walk' ? 'Anim_cow_walk' : 'Anim_cow_idle')
      : (action === 'walk' ? 'Anim_pig_walk' : 'Anim_pig_idle');
    game.animalClip[animal] = name;
    game.animalUntil[animal] = Date.now() + clipDuration(name) * 1000;
  }
  function unlocked(i) {
    const r = recipes[i];
    return game.day >= r.day && game.stallLevel >= r.level && (i !== 1 || game.cowOwned) && (i !== 2 || game.carrot > 0 || game.sold > 0);
  }
  function allowedOrders() { return recipes.map((_, i) => i).filter(unlocked); }
  function newOrder() {
    const options = allowedOrders();
    const index = options[(game.sold + game.missed + game.day - 1) % options.length];
    const now = Date.now();
    game.order = { recipe: index, deadline: now + 45000, customer: (game.sold + game.missed) % 2 };
    game.nextCustomer = now + 45000;
  }
  function addIncome(product) {
    const r = recipes[product.recipe];
    const amount = product.perfect ? r.perfect : r.price;
    game.gold += amount; game.earned += amount; game.sold++;
    game.reputation += product.perfect ? 2 : 1;
    game.sticker = (game.sticker + 1) % Math.max(1, stickerImages.length);
    game.order = null;
    game.nextCustomer = Date.now() + 2500;
    game.lastCustomerUntil = game.nextCustomer;
    say(`${r.name} 판매 +${money(amount)} G · 평판 상승!`);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(product.perfect ? 45 : 20);
  }
  function serveShelf() {
    if (!game.order) { say('손님이 오기를 기다려 주세요.'); return; }
    const index = game.shelf.findIndex(p => p.recipe === game.order.recipe);
    if (index < 0) { say('주문에 맞는 붕어빵을 먼저 구워 주세요.'); return; }
    addIncome(game.shelf.splice(index, 1)[0]);
  }
  function advance() {
    const now = Date.now();
    let changed = false;
    if (game.phase === 'farm') {
      for (const crop of game.crops) {
        const steps = cropData[crop.kind]?.steps || 4;
        while (crop.stage >= 0 && crop.stage < steps && now >= crop.next) {
          crop.stage++; crop.next += 15000; crop.watered = false; changed = true;
        }
      }
      if (now >= game.nextEgg) { game.egg += Math.min(10, Math.floor((now - game.nextEgg) / 30000) + 1); game.nextEgg = now + 30000; sound('chicken'); animalClip('chicken', 'run'); changed = true; }
      if (game.cowOwned && now >= game.nextMilk) { game.milk += Math.min(10, Math.floor((now - game.nextMilk) / 45000) + 1); game.nextMilk = now + 45000; sound('cow'); animalClip('cow', 'walk'); changed = true; }
    }
    if (game.phase === 'shop') {
      for (const mold of game.molds) if (mold.state === 'baking' && now - mold.start >= 8000) { mold.state = 'burnt'; changed = true; }
      if (game.order && now >= game.order.deadline) { game.order = null; game.missed++; game.reputation = Math.max(0, game.reputation - 1); game.nextCustomer = now + 2500; changed = true; say('손님이 기다리다 떠났어요.'); }
      if (!game.order && now >= game.nextCustomer) { newOrder(); changed = true; }
    }
    if (game.phase === 'farm' && now >= game.nextBlink && !game.player.until) {
      const blink = facingSuffix() === 'side' ? 'Anim_character_blink_side' : 'Anim_character_blink';
      game.player.clip = blink; game.player.until = now + clipDuration(blink) * 1000;
      game.nextBlink = now + 10000; changed = true;
    }
    if (game.player.until && now >= game.player.until) {
      if (game.player.clip.startsWith('Anim_character_walk_side')) {
        game.player.clip = game.player.dir === 'left' ? 'Anim_character_face_left' : 'Anim_character_face_right';
        game.player.until = now + clipDuration(game.player.clip) * 1000;
      } else { playPlayer('idle'); game.player.until = 0; }
      changed = true;
    }
    for (const animal of ['chicken', 'cow', 'pig']) if (game.animalUntil[animal] && now >= game.animalUntil[animal]) { animalClip(animal, 'idle'); game.animalUntil[animal] = 0; changed = true; }
    if (changed) { save(); render(); }
    else updateTimers();
  }

  function touchCrop(index) {
    if (index < 0 || index >= game.fieldSize * game.fieldSize) return;
    const crop = game.crops[index];
    const x = index % game.fieldSize, y = Math.floor(index / game.fieldSize);
    const dx = x - game.player.x, dy = y - game.player.y;
    game.player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'front');
    game.player.x = x; game.player.y = y; game.selected = index;
    const now = Date.now();
    if (crop.stage === -2) { crop.stage = -1; playPlayer('tool_swing'); game.tool = toolClip('tool_swing'); say('밭을 갈았습니다. 다시 눌러 씨앗을 심으세요.'); }
    else if (crop.stage === -1) { crop.stage = 0; crop.kind = game.seed; crop.next = now + 15000; playPlayer('planting'); say(`${cropData[crop.kind].name} 씨앗을 심었습니다.`); }
    else if (crop.stage >= cropData[crop.kind].steps) {
      const count = cropData[crop.kind].yield + (crop.kind === 'carrot' ? Math.floor(Math.random() * 2) : 0);
      game[crop.kind] += count; crop.stage = -1; crop.next = 0;
      playPlayer('picking'); game.harvestClip = 'Produce_anim'; game.gold += crop.kind === 'corn' ? 25 : crop.kind === 'wheat' ? 20 : 0;
      say(`${cropData[crop.kind].name} ${count}개를 수확했습니다!`);
    } else { crop.next = now + Math.max(1000, Math.ceil((crop.next - now) / 2)); crop.watered = true; playPlayer('water'); game.tool = toolClip('water'); say('물을 주어 남은 성장 시간이 절반으로 줄었습니다.'); }
    save(); render();
  }
  function touchMold(index) {
    const mold = game.molds[index];
    if (!mold) return;
    const now = Date.now();
    if (mold.state === 'empty') {
      const r = recipes[game.recipe];
      if (!unlocked(game.recipe)) { say('이 레시피는 아직 열리지 않았습니다.'); return; }
      if (game.egg < r.egg || game.milk < r.milk || game.carrot < r.carrot) { say('달걀·우유·당근 재료가 부족합니다.'); return; }
      game.egg -= r.egg; game.milk -= r.milk; game.carrot -= r.carrot;
      mold.recipe = game.recipe; mold.state = 'batter'; say('반죽을 부었습니다. 다시 눌러 앙금을 넣으세요.');
    } else if (mold.state === 'batter') { mold.state = 'filled'; say('앙금을 넣었습니다. 다시 눌러 틀을 뒤집으세요.'); }
    else if (mold.state === 'filled') { mold.state = 'baking'; mold.start = now; mold.clip = 'MoldFlipX'; say('뒤집었습니다! 5.0~7.5초에 틀을 열어 주세요.'); }
    else if (mold.state === 'baking') {
      const elapsed = (now - mold.start) / 1000;
      if (elapsed < 5) { say('설익었습니다. 조금 더 구워 주세요.'); return; }
      mold.state = elapsed >= 8 ? 'burnt' : 'ready'; mold.perfect = elapsed <= 7.5; mold.clip = 'MoldFlipReturn';
      say(mold.state === 'burnt' ? '타 버렸습니다. 눌러 버리세요.' : mold.perfect ? 'Perfect! 눌러 손님에게 제공하세요.' : '완성됐습니다. 눌러 제공하세요.');
    } else if (mold.state === 'ready') {
      const product = { recipe: mold.recipe, perfect: mold.perfect };
      mold.state = 'empty'; mold.start = 0; mold.clip = '';
      if (game.order && game.order.recipe === product.recipe) addIncome(product);
      else { game.shelf.push(product); say('주문과 달라 보온 매대에 놓았습니다.'); }
    } else { mold.state = 'empty'; mold.start = 0; mold.clip = ''; say('탄 붕어빵을 폐기했습니다.'); }
    save(); render();
  }

  function header() {
    hud.innerHTML = `<div class="hud-item"><img src="${ROOT}Art/UI/Sprite_clock_icon.png" alt="">Day <b>${game.day}</b></div><div class="hud-item"><img src="${ROOT}Art/UI/Sprite_coin_icon.png" alt=""><b>${money(game.gold)}</b> G</div><div class="hud-item"><img src="${cropData.carrot.icon}" alt=""><b>${game.carrot}</b></div><div class="hud-item">🥚 <b>${game.egg}</b></div><div class="hud-item">🥛 <b>${game.milk}</b></div><div class="hud-item">⭐ <b>${game.reputation}</b></div>`;
    soundButton.textContent = game.sound ? '♪' : '×';
    soundButton.title = game.sound ? '소리 끄기' : '소리 켜기';
    catalogButton.title = '원본 에셋 도감 열기';
  }
  function titleView() {
    return `<section class="screen title-screen"><div class="title-copy"><span class="eyebrow">BUNGOPANG · THE WEB GAME</span><h1>붕어빵 타이쿤<br><em>힐링 농장</em></h1><p class="lede">밭을 갈고 작물을 키워 재료를 모으세요. 손님의 주문에 맞춰 황금 붕어빵을 굽고, 수익으로 농장과 포장마차를 확장합니다.</p><div class="title-actions"><button class="primary" data-action="start">${game.day > 1 ? '이어서 플레이' : '게임 시작'} →</button><button class="secondary" data-action="reset">새 게임</button></div><p class="tip">원본 에셋 ${catalog.length}개 · 웹용 이미지 ${catalog.filter(a => a.web).length}개 · 애니메이션 클립 ${clipNames.length}개 등록</p></div><div class="title-art"><img src="${ROOT}Sprites/StartBackground.png" alt="원본 붕어빵 포장마차 일러스트" ${animAttrs('CameraZoom')}><img class="cutting-frame" src="${cutsceneImages[0]}" alt="원본 붕어빵 애니메이션 프레임"></div></section>`;
  }
  function decor(index) { return decorImages[(game.day * 3 + index) % decorImages.length] || marketImage; }
  function farmView() {
    const now = Date.now();
    const avatarClip = game.player.clip || 'Anim_character_idle_front';
    const plots = [];
    for (let y = 0; y < game.fieldSize; y++) for (let x = 0; x < game.fieldSize; x++) {
      const i = y * game.fieldSize + x, c = game.crops[i], crop = cropData[c.kind] || cropData.carrot;
      const ready = c.stage >= crop.steps;
      const label = c.stage === -2 ? '갈기' : c.stage === -1 ? '심기' : ready ? '수확!' : c.stage === 0 ? '씨앗' : `${crop.name} ${c.stage}/${crop.steps}`;
      const image = c.stage < 0 ? '' : `<img src="${c.stage === 0 ? crop.seed : crop.image(Math.min(c.stage, crop.steps))}" alt="">`;
      plots.push(`<button class="plot ${ready ? 'ready' : ''} ${c.watered ? 'watered' : ''} ${game.selected === i ? 'selected' : ''}" data-action="crop" data-index="${i}" aria-label="${i + 1}번 밭 ${label}">${image || '<span class="soil-mark">✦</span>'}<span class="plot-label">${label}</span>${c.stage >= 0 && !ready ? `<span class="plot-remaining" data-crop="${i}">${sec(c.next - now)}</span>` : ''}</button>`);
    }
    const seedButtons = Object.entries(cropData).map(([key, c]) => `<button class="seed-choice ${game.seed === key ? 'active' : ''}" data-action="seed" data-kind="${key}" aria-pressed="${game.seed === key}"><img src="${c.icon}" alt=""><span>${c.name}</span></button>`).join('');
    const ranch = [['chicken', '닭', '달걀 +1 / 30초', true], ['cow', '젖소', '우유 +1 / 45초', game.cowOwned], ['pig', '복돼지', '당근 1개 → 50 G', game.pigOwned]].map(([id, name, info, owned]) => {
      const clip = game.animalClip[id] || (id === 'chicken' ? 'Anim_Chicken_Idle' : id === 'cow' ? 'Anim_cow_idle' : 'Anim_pig_idle');
      return `<div class="ranch-card ${owned ? '' : 'locked'}"><img class="animal-art" ${animAttrs(clip)} src="${animalImages[id]}" alt="${name}"><div><b>${name}</b><span>${owned ? info : '밤 정산에서 입양'}</span></div>${owned ? `<button data-action="animal" data-kind="${id}">${id === 'pig' ? '먹이' : '교감'}</button>` : ''}</div>`;
    }).join('');
    return `<section class="screen farm-screen"><div class="phase-header"><div><span class="eyebrow">01 · FARM & RANCH</span><h2>농장과 목장</h2><p>밭 갈기 → 파종 → 물주기 → 수확. 작물을 고르고 밭을 누르세요.</p></div><div class="phase-step">Day ${game.day} · 농장</div></div><div class="game-grid"><div class="panel farm-panel"><div class="panel-head"><h3>🥕 밭 ${game.fieldSize}×${game.fieldSize}</h3><span>선택 작물: ${cropData[game.seed].name}</span></div><div class="panel-body"><div class="farm-scene-art"><img class="scene-market" src="${marketImage}" alt="농장 시장" ${animAttrs('Anim_Market_Idle')}><img class="scene-scarecrow" src="${scarecrowImage}" alt="허수아비" ${animAttrs('Anim_Idle')}><img class="scene-backdrop" src="${decor(0)}" alt=""><img class="scene-decor decor-left" src="${ROOT}Art/Environment/Bush/Sprites/Sprite_Bush.png" alt="" ${animAttrs('Anim_Bush_ruffle')}><img class="scene-decor decor-right" src="${ROOT}Art/Environment/Lamps/LampAndLantern/Sprites/Lantern/Sprite_Lantern.png" alt="" ${animAttrs('Anim_Lantern_Hanging_Swing')}><img class="player-avatar" src="${characterImages[game.player.skin]}" alt="플레이어" ${animAttrs(avatarClip)}></div><div class="seed-list">${seedButtons}</div><div class="plots ${game.fieldSize === 6 ? 'expanded' : ''}">${plots.join('')}</div><div class="farm-controls"><button data-action="move" data-dir="left" aria-label="왼쪽 이동">◀</button><button data-action="move" data-dir="up" aria-label="위로 이동">▲</button><button data-action="move" data-dir="front" aria-label="아래로 이동">▼</button><button data-action="move" data-dir="right" aria-label="오른쪽 이동">▶</button><button class="secondary" data-action="crop" data-index="${game.selected}">선택 밭 작업</button></div><p class="tip">성장 단계당 15초 · 물주기로 남은 시간 절반 · 당근 수확 2~3개</p></div></div><aside class="panel"><div class="panel-head"><h3>목장과 준비</h3><span class="muted">자동 생산</span></div><div class="panel-body"><div class="ranch-list">${ranch}</div><div class="tool-row"><img src="${game.tool.includes('WaterCan') ? `${ROOT}Art/Tools/Watercan/Sprites/Sprite_WaterCan_Icon.png` : `${ROOT}Art/Tools/Hoe/Sprites/hoe_icon.png`}" alt="현재 도구" ${animAttrs(game.tool)}><img src="${ROOT}Art/Tools/Watercan/Sprites/Sprite_WaterCan_Icon.png" alt="물뿌리개"><img src="${ROOT}Art/Tools/Basket/Prefabs/Sprite_Basket.png" alt="바구니" ${animAttrs(game.harvestClip)}></div><div class="side-actions"><button class="primary" data-action="open-shop">포장마차 영업 시작 →</button></div></div></aside></div></section>`;
  }

  function moldLabel(m, i, now) {
    const label = { empty: '빈 틀', batter: '반죽', filled: '앙금 완료', baking: '굽는 중', ready: m.perfect ? 'Perfect!' : '완성', burnt: '탔어요' }[m.state];
    const instruction = { empty: '눌러 반죽 붓기', batter: '눌러 앙금 넣기', filled: '눌러 굽기', baking: `<span data-mold="${i}">${((now - m.start) / 1000).toFixed(1)}초</span> · 5~7.5초에 열기`, ready: '눌러 제공', burnt: '눌러 폐기' }[m.state];
    return [label, instruction];
  }
  function shopView() {
    const now = Date.now();
    const recipeButtons = recipes.map((r, i) => `<button class="recipe ${game.recipe === i ? 'active' : ''} ${unlocked(i) ? '' : 'locked'}" data-action="recipe" data-index="${i}" aria-pressed="${game.recipe === i}"><img class="recipe-art" src="${r.icon}" alt=""><span class="recipe-copy"><span class="price">${r.price} G</span><b>${r.name}</b><small>🥚${r.egg} 🥛${r.milk} 🥕${r.carrot} · Perfect ${r.perfect} G</small></span></button>`).join('');
    const moldButtons = game.molds.slice(0, game.moldCount).map((m, i) => {
      const [label, instruction] = moldLabel(m, i, now);
      const fish = m.state === 'empty' ? '' : m.state === 'batter' ? fishSprites[0] : m.state === 'filled' ? fishSprites[1] : m.state === 'ready' && m.perfect ? fishSprites[3] : fishSprites[2];
      return `<button class="mold-slot ${m.state}" data-action="mold" data-index="${i}" ${m.clip ? animAttrs(m.clip) : ''} aria-label="${i + 1}번 틀 ${label}"><span class="mold-illustration"><img class="mold-art" src="${moldImage}" alt="">${fish ? `<img class="fish-art" src="${fish}" alt="">` : ''}</span><span><b>${label}</b><small>${instruction}</small></span>${m.state === 'baking' ? `<span class="mold-progress"><i data-progress="${i}" style="width:${Math.min(100, (now - m.start) / 80)}%"></i></span>` : ''}</button>`;
    }).join('');
    const customer = game.order ? `<div class="customer-card"><img src="${game.order.customer ? characterImages.boy2 : characterImages.boy}" alt="주문 손님" ${animAttrs(game.order.customer ? 'Anim_character_idle_side' : 'Anim_character_idle_front')}><div><b>손님 주문</b><strong>${recipes[game.order.recipe].name}</strong><span data-order="true">남은 시간 ${sec(game.order.deadline - now)}</span></div><img class="customer-sticker" src="${stickerImages[game.sticker % stickerImages.length]}" alt="손님 표정"></div>` : game.lastCustomerUntil > now ? `<div class="customer-card waiting"><img src="${characterImages.boy}" alt="붕어빵을 먹는 손님" ${animAttrs('Anim_character_eating')}>맛있게 먹고 있어요!</div>` : '<div class="customer-card waiting">다음 손님을 기다리는 중...</div>';
    const shelf = game.shelf.map((p, i) => `<span class="shelf-item"><img src="${p.perfect ? fishSprites[3] : fishSprites[2]}" alt="">${recipes[p.recipe].name}</span>`).join('') || '<span class="muted">보온 매대가 비어 있습니다.</span>';
    return `<section class="screen shop-screen"><div class="phase-header"><div><span class="eyebrow">02 · TYCOON</span><h2>붕어빵 포장마차</h2><p>주문에 맞춰 반죽 → 앙금 → 뒤집기 → 꺼내기를 진행하세요.</p></div><div class="phase-step">판매 ${game.sold}개 · 평판 ${game.reputation}</div></div><div class="game-grid shop-grid"><aside class="panel"><div class="panel-head"><h3>레시피</h3></div><div class="panel-body"><div class="recipe-list">${recipeButtons}</div><p class="tip">슈크림은 젖소 입양 후 Day 2, 당근은 Day 3, 황금 세트는 가게 Lv.3에 열립니다.</p></div></aside><div class="panel"><div class="panel-head"><h3>🔥 조리대</h3><span class="muted">${game.moldCount}구</span></div><div class="panel-body">${customer}<div class="mold-grid">${moldButtons}</div><div class="shelf"><b>보온 매대</b><div>${shelf}</div><button class="secondary" data-action="serve">주문 제공</button></div><div class="shop-footer"><p>5.0~7.5초 Perfect · 8초 이후 탄 붕어빵</p><button class="primary" data-action="close-shop">영업 종료 · 정산 →</button></div></div></div></div></section>`;
  }
  function resultView() {
    const upgrades = [
      { id: 'field', name: '밭 6×6 확장', cost: 300, disabled: game.fieldSize === 6 },
      { id: 'mold', name: game.moldCount === 4 ? '틀 6구 확장' : '틀 9구 확장', cost: game.moldCount === 4 ? 400 : 800, disabled: game.moldCount === 9 },
      { id: 'cow', name: '젖소 입양', cost: 200, disabled: game.cowOwned },
      { id: 'pig', name: '복돼지 입양', cost: 300, disabled: game.pigOwned },
      { id: 'stall', name: `가게 Lv.${Math.min(3, game.stallLevel + 1)}`, cost: game.stallLevel === 1 ? 500 : 900, disabled: game.stallLevel === 3 }
    ];
    const buttons = upgrades.map(u => `<button class="upgrade" data-action="upgrade" data-kind="${u.id}" ${u.disabled ? 'disabled' : ''}><span>${u.name}</span><b>${u.disabled ? '완료' : `${u.cost} G`}</b></button>`).join('');
    const room = `<div class="night-room">${Array.from({ length: 3 }, (_, i) => `<img src="${interiorImages[(game.day * 3 + i) % interiorImages.length]}" alt="밤의 가게 장식">`).join('')}</div>`;
    return `<section class="screen result-screen"><div class="result-card"><span class="eyebrow">03 · DAILY REPORT</span><h2>Day ${game.day} 정산</h2><img class="result-fish" src="${fishSprites[3]}" alt="황금 붕어빵"><div class="result-amount">+${money(game.earned)} G</div><div class="result-stats"><div>판매<b>${game.sold}개</b></div><div>놓친 주문<b>${game.missed}건</b></div><div>평판<b>${game.reputation}</b></div></div>${room}<div class="upgrades"><h3>밤의 업그레이드</h3>${buttons}</div><button class="primary" data-action="next-day">다음 날 농장으로 →</button></div></section>`;
  }

  function galleryView() {
    const group = book?.group || 'All';
    const tab = book?.tab || 'images';
    const page = book?.page || 0;
    const groups = ['All', ...new Set(catalog.filter(a => a.web).map(a => a.group))];
    const filters = groups.map(g => `<button class="catalog-filter ${g === group ? 'active' : ''}" data-action="gallery-group" data-group="${g}">${g}</button>`).join('');
    let items, total;
    if (tab === 'images') {
      const images = catalog.filter(a => a.web && (group === 'All' || a.group === group));
      total = images.length;
      items = images.slice(page * 24, (page + 1) * 24).map(a => `<button class="catalog-item" data-action="gallery-image" data-path="${a.path}"><img src="${a.web}" alt=""><span>${a.path.split('/').pop()}</span></button>`).join('');
    } else if (tab === 'animations') {
      total = clipNames.length;
      items = clipNames.slice(page * 24, (page + 1) * 24).map(name => `<button class="catalog-clip" data-action="gallery-clip" data-name="${name}"><b>${name}</b><small>${clips[name].duration.toFixed(2)}초 · ${clips[name].loop ? '반복' : '1회'}</small></button>`).join('');
    } else {
      total = catalog.length;
      items = catalog.slice(page * 24, (page + 1) * 24).map(a => `<div class="catalog-file"><b>${a.path.split('/').pop()}</b><small>${a.path}</small></div>`).join('');
    }
    const preview = chosenGallery ? `<div class="catalog-preview"><button data-action="gallery-clear" aria-label="미리보기 닫기">×</button>${chosenGallery.image ? `<img src="${chosenGallery.image}" alt="선택한 원본 이미지">` : `<img src="${clipPreviewImage(chosenGallery.clip)}" alt="애니메이션 동작 미리보기" ${animAttrs(chosenGallery.clip)}>`}<p>${chosenGallery.label}</p></div>` : '';
    return `<section class="screen catalog-screen"><div class="phase-header"><div><span class="eyebrow">SOURCE ASSET LIBRARY</span><h2>원본 에셋 도감</h2><p>웹에서 볼 수 있는 그림과 Unity 파일의 출처를 확인하고 애니메이션 동작을 미리 볼 수 있습니다.</p></div><button class="secondary" data-action="close-gallery">게임으로 돌아가기</button></div><div class="catalog-tabs"><button data-action="gallery-tab" data-tab="images" class="${tab === 'images' ? 'active' : ''}">이미지 ${catalog.filter(a => a.web).length}</button><button data-action="gallery-tab" data-tab="animations" class="${tab === 'animations' ? 'active' : ''}">동작 ${clipNames.length}</button><button data-action="gallery-tab" data-tab="files" class="${tab === 'files' ? 'active' : ''}">전체 파일 ${catalog.length}</button></div>${tab === 'images' ? `<div class="catalog-filters">${filters}</div>` : ''}<div class="catalog-grid ${tab}">${items}</div><div class="catalog-pages"><button data-action="gallery-page" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>이전</button><span>${page + 1} / ${Math.max(1, Math.ceil(total / 24))}</span><button data-action="gallery-page" data-page="${page + 1}" ${(page + 1) * 24 >= total ? 'disabled' : ''}>다음</button></div>${preview}</section>`;
  }
  function render() {
    header();
    app.innerHTML = book ? galleryView() : game.phase === 'farm' ? farmView() : game.phase === 'shop' ? shopView() : game.phase === 'result' ? resultView() : titleView();
  }
  function updateTimers() {
    const now = Date.now();
    document.querySelectorAll('[data-crop]').forEach(el => { const c = game.crops[Number(el.dataset.crop)]; el.textContent = sec(c.next - now); });
    document.querySelectorAll('[data-mold]').forEach(el => {
      const m = game.molds[Number(el.dataset.mold)], elapsed = Math.max(0, (now - m.start) / 1000);
      el.textContent = `${elapsed.toFixed(1)}초`;
      const slot = el.closest('.mold-slot');
      if (slot) { slot.classList.toggle('sweet', elapsed >= 5 && elapsed <= 7.5); slot.classList.toggle('late', elapsed > 7.5); }
    });
    document.querySelectorAll('[data-progress]').forEach(el => { const m = game.molds[Number(el.dataset.progress)]; el.style.width = `${Math.min(100, (now - m.start) / 80)}%`; });
    const order = document.querySelector('[data-order]'); if (order && game.order) order.textContent = `남은 시간 ${sec(game.order.deadline - now)}`;
    const cutting = document.querySelector('.cutting-frame'); if (cutting) cutting.src = cutsceneImages[Math.floor(now / 110) % cutsceneImages.length];
  }

  function upgrade(kind) {
    const costs = { field: 300, mold: game.moldCount === 4 ? 400 : 800, cow: 200, pig: 300, stall: game.stallLevel === 1 ? 500 : 900 };
    if (game.gold < costs[kind]) { say(`${costs[kind]} G가 필요합니다.`); return; }
    const done = kind === 'field' && game.fieldSize === 6 || kind === 'mold' && game.moldCount === 9 || kind === 'cow' && game.cowOwned || kind === 'pig' && game.pigOwned || kind === 'stall' && game.stallLevel === 3;
    if (done) return;
    game.gold -= costs[kind];
    if (kind === 'field') game.fieldSize = 6;
    if (kind === 'mold') game.moldCount = game.moldCount === 4 ? 6 : 9;
    if (kind === 'cow') { game.cowOwned = true; game.nextMilk = Date.now() + 45000; }
    if (kind === 'pig') game.pigOwned = true;
    if (kind === 'stall') game.stallLevel++;
    say('업그레이드를 완료했습니다!');
  }
  app.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action, index = Number(button.dataset.index), kind = button.dataset.kind;
    if (action === 'start') { game.phase = 'farm'; game.nextEgg = Date.now() + 30000; game.nextMilk = Date.now() + 45000; say('밭을 갈고 씨앗을 심어 보세요.'); }
    else if (action === 'reset') { if (!window.confirm('저장된 웹 게임 진행을 삭제하고 새로 시작할까요?')) return; game = fresh(); say('새 게임을 시작했습니다.'); }
    else if (action === 'seed') game.seed = kind;
    else if (action === 'crop') { touchCrop(index); return; }
    else if (action === 'move') {
      const delta = { left: [-1, 0], right: [1, 0], up: [0, -1], front: [0, 1] }[button.dataset.dir];
      game.player.x = Math.max(0, Math.min(game.fieldSize - 1, game.player.x + delta[0]));
      game.player.y = Math.max(0, Math.min(game.fieldSize - 1, game.player.y + delta[1]));
      game.player.dir = button.dataset.dir; game.selected = game.player.y * game.fieldSize + game.player.x;
      playPlayer('walk');
    }
    else if (action === 'animal') {
      if (kind === 'pig') { if (game.carrot < 1) { say('복돼지에게 줄 당근이 필요합니다.'); return; } game.carrot--; game.gold += 50; game.reputation++; animalClip('pig', 'walk'); }
      else animalClip(kind, kind === 'chicken' ? 'run' : 'walk');
      sound(kind); say(kind === 'pig' ? '복돼지가 50 G를 찾았어요!' : '가축과 교감했습니다.');
    }
    else if (action === 'open-shop') { game.phase = 'shop'; if (!game.order) newOrder(); say('손님의 주문을 확인하고 붕어빵을 구우세요.'); }
    else if (action === 'recipe') { if (!unlocked(index)) { say('아직 열리지 않은 레시피입니다.'); return; } game.recipe = index; }
    else if (action === 'mold') { touchMold(index); return; }
    else if (action === 'serve') serveShelf();
    else if (action === 'close-shop') { game.phase = 'result'; game.order = null; say('오늘의 매출을 정산합니다.'); }
    else if (action === 'upgrade') upgrade(kind);
    else if (action === 'next-day') {
      game.day++; game.sold = 0; game.earned = 0; game.missed = 0; game.phase = 'farm';
      game.nextEgg = Date.now() + 30000; game.nextMilk = Date.now() + 45000;
      game.molds.forEach(m => { m.state = 'empty'; m.start = 0; });
      game.player.skin = game.stallLevel >= 2 && game.day % 2 === 0 ? 'boy' : 'farmer';
      say('새로운 하루가 시작됐습니다.');
    }
    else if (action === 'close-gallery') { book = null; chosenGallery = null; }
    else if (action === 'gallery-tab') { book.tab = button.dataset.tab; book.page = 0; chosenGallery = null; }
    else if (action === 'gallery-group') { book.group = button.dataset.group; book.page = 0; chosenGallery = null; }
    else if (action === 'gallery-page') { book.page = Number(button.dataset.page); chosenGallery = null; }
    else if (action === 'gallery-image') { const item = catalog.find(a => a.path === button.dataset.path); chosenGallery = { image: item.web, label: item.path }; }
    else if (action === 'gallery-clip') { chosenGallery = { clip: button.dataset.name, label: `${button.dataset.name} · ${clips[button.dataset.name].path}` }; }
    else if (action === 'gallery-clear') chosenGallery = null;
    save(); render();
  });
  soundButton.addEventListener('click', () => { game.sound = !game.sound; save(); header(); say(game.sound ? '소리를 켰습니다.' : '소리를 껐습니다.'); });
  catalogButton.addEventListener('click', () => { book = book ? null : { tab: 'images', group: 'All', page: 0 }; chosenGallery = null; render(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { game.backgroundAt = Date.now(); save(); return; }
    if (game.backgroundAt && game.phase === 'shop') {
      const gap = Math.max(0, Date.now() - game.backgroundAt);
      game.molds.forEach(m => { if (m.state === 'baking') m.start += gap; });
      if (game.order) game.order.deadline += gap;
    }
    game.backgroundAt = 0; save(); advance();
  });
  render();
  timerHandle = setInterval(advance, 100);
})();
