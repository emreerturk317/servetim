/* ===================================================
   Servetim — Main Application
   =================================================== */

// ─── State ───────────────────────────────────────────
let USD_TRY = 38.5;
let frozenRate = 38.5;
let rateInfo = {};
let donutChart = null;
let lineChart = null;
let currentPage = 'dashboard';
let toastTimer = null;

// ─── Init ─────────────────────────────────────────────
async function init() {
  // Load settings & apply language
  const settings = Storage.getSettings();
  i18n.setLanguage(settings.language);

  // Load frozen rate from storage
  frozenRate = Storage.getFrozenRate();

  // Fetch exchange rate in background (non-blocking)
  API.getUsdTryRate().then(r => {
    USD_TRY = r.rate;
    rateInfo = r;
    updateRateBadge();
    if (Storage.isInitialized()) renderDashboard();
  });

  if (!Storage.isInitialized()) {
    showSetup();
  } else {
    hideSetup();
    renderApp();
    checkMonthlyUpdatePrompt();
    tryShowReminderNotification();
  }

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ─── Setup Wizard ─────────────────────────────────────
let setupStep = 1;
let setupLang = 'tr';
let setupCurrency = 'TRY';
let setupReminderDay = 1;
let setupNotifEnabled = false;

function showSetup() {
  document.getElementById('setup-screen').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('hidden');
  renderSetupStep(1);
}

function hideSetup() {
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
}

function renderSetupStep(step) {
  setupStep = step;
  document.querySelectorAll('.setup-page').forEach((p, i) => {
    p.classList.toggle('hidden', i + 1 !== step);
  });
  document.querySelectorAll('.setup-dot').forEach((d, i) => {
    d.classList.toggle('active', i < step);
  });
}

function setupSelectLang(lang) {
  setupLang = lang;
  i18n.setLanguage(lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('selected', b.dataset.lang === lang));
  applyI18nSetup();
}

function setupSelectCurrency(cur) {
  setupCurrency = cur;
  document.querySelectorAll('.curr-btn').forEach(b => b.classList.toggle('selected', b.dataset.cur === cur));
}

function setupSelectDay(day) {
  setupReminderDay = day;
  document.querySelectorAll('#day-picker .day-btn').forEach(b => b.classList.toggle('selected', +b.dataset.day === day));
}

function setupNext() {
  if (setupStep < 3) renderSetupStep(setupStep + 1);
}

function setupBack() {
  if (setupStep > 1) renderSetupStep(setupStep - 1);
}

async function setupFinishWithNotif(allow) {
  if (allow && 'Notification' in window) {
    const perm = await Notification.requestPermission();
    setupNotifEnabled = perm === 'granted';
  } else {
    setupNotifEnabled = false;
  }
  renderSetupStep(4);
}

function setupSaveGoal() {
  const name = document.getElementById('setup-goal-name').value.trim();
  const amount = parseFloat(document.getElementById('setup-goal-amount').value.replace(',', '.'));
  const currency = document.getElementById('setup-goal-currency').value;
  const dateVal = document.getElementById('setup-goal-date').value;
  if (name && !isNaN(amount) && amount > 0) {
    const goals = Storage.getGoals();
    goals.push({ id: uid(), name, targetAmount: amount, targetCurrency: currency, targetDate: dateVal || null, createdAt: today() });
    Storage.saveGoals(goals);
  }
  completeSetup();
}

function completeSetup() {
  Storage.saveSettings({ language: setupLang, currency: setupCurrency, reminderDay: setupReminderDay, notificationsEnabled: setupNotifEnabled });
  Storage.setInitialized();
  hideSetup();
  renderApp();
}

function applyI18nSetup() {
  document.querySelector('.step1-title').textContent = i18n.t('welcome');
  document.querySelector('.step1-desc').textContent = i18n.t('welcomeDesc');
}

// ─── App Shell ────────────────────────────────────────
function renderApp() {
  applyI18nToApp();
  navigate('dashboard');
}

function applyI18nToApp() {
  document.getElementById('nav-dashboard').querySelector('.nav-label').textContent = i18n.t('dashboard');
  document.getElementById('nav-history').querySelector('.nav-label').textContent = i18n.t('history');
  document.getElementById('nav-goals').querySelector('.nav-label').textContent = i18n.t('goals');
  document.getElementById('nav-settings').querySelector('.nav-label').textContent = i18n.t('settings');
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`page-${page}`).classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`nav-${page}`).classList.add('active');

  // FAB visibility
  const fab = document.getElementById('fab');
  if (page === 'dashboard') {
    fab.classList.remove('hidden');
    fab.textContent = '+';
    fab.title = i18n.t('addAsset');
  } else if (page === 'goals') {
    fab.classList.remove('hidden');
    fab.textContent = '+';
    fab.title = i18n.t('addGoal');
  } else {
    fab.classList.add('hidden');
  }

  if (page === 'dashboard') renderDashboard();
  if (page === 'history') renderHistory();
  if (page === 'goals') renderGoals();
  if (page === 'settings') renderSettings();
}

function onFabClick() {
  if (currentPage === 'dashboard') openAssetModal(null);
  else if (currentPage === 'goals') openGoalModal(null);
}

// ─── Rate Badge ───────────────────────────────────────
function updateRateBadge() {
  const badge = document.getElementById('rate-badge');
  let suffix = '';
  if (rateInfo.stale) suffix = ` ${i18n.t('rateStale')}`;
  if (rateInfo.fallback) suffix = ` ${i18n.t('rateFallback')}`;
  badge.textContent = `$1 = ₺${USD_TRY.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}${suffix}`;
}

// ─── Conversions ──────────────────────────────────────
function toTRY(amount, currency, rate = USD_TRY) {
  return currency === 'USD' ? amount * rate : amount;
}
function toUSD(amount, currency, rate = USD_TRY) {
  return currency === 'USD' ? amount : amount / rate;
}
function fmtTRY(n) {
  return '₺' + Math.round(n).toLocaleString('tr-TR');
}
function fmtUSD(n) {
  return '$' + Math.round(n).toLocaleString('tr-TR');
}
function fmtNum(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString('tr-TR');
}

// ─── Dashboard ────────────────────────────────────────
function renderDashboard() {
  checkMonthlyUpdatePrompt();
  const assets = Storage.getAssets();
  const history = Storage.getHistory().sort((a, b) => a.monthKey > b.monthKey ? 1 : -1);
  const gamif = Storage.getGamification();
  const settings = Storage.getSettings();

  // Totals (dondurulmuş kur ile hesapla)
  const totalTRY = assets.reduce((s, a) => s + toTRY(a.amount, a.currency, frozenRate), 0);
  const totalUSD = assets.reduce((s, a) => s + toUSD(a.amount, a.currency, frozenRate), 0);

  // Son kayıt tarihi
  const lastSaveEl = document.getElementById('assets-last-save');
  if (lastSaveEl) {
    const ls = Storage.getLastSave();
    lastSaveEl.textContent = ls ? `Güncellendi: ${ls}` : '';
  }

  // Net worth card
  const primary = settings.currency === 'USD' ? fmtUSD(totalUSD) : fmtTRY(totalTRY);
  const secondary = settings.currency === 'USD' ? fmtTRY(totalTRY) : fmtUSD(totalUSD);
  document.getElementById('net-worth-primary').textContent = primary;
  document.getElementById('net-worth-secondary').textContent = secondary;

  // Monthly change
  const changeEl = document.getElementById('net-worth-change');
  if (history.length >= 2) {
    const prev = history[history.length - 2];
    const curr = history[history.length - 1];
    const pct = ((curr.totalUSD - prev.totalUSD) / (prev.totalUSD || 1)) * 100;
    const diff = curr.totalTRY - prev.totalTRY;
    changeEl.className = 'net-worth-change' + (pct >= 0 ? ' positive' : ' negative');
    const arrow = pct >= 0 ? '▲' : '▼';
    changeEl.textContent = `${arrow} ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%  ${pct >= 0 ? '+' : ''}${fmtTRY(diff)}`;
    changeEl.classList.remove('hidden');
  } else {
    changeEl.classList.add('hidden');
  }

  // Donut chart
  renderDonut(assets);

  // Asset list
  renderAssetList(assets, history);

  // Gamification strip
  renderGamifStrip(gamif);

  // Update rate badge
  updateRateBadge();
}

function renderDonut(assets) {
  const wrap = document.getElementById('donut-wrap');
  if (!assets.length) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');

  const cats = { bank: 0, gold: 0, crypto: 0, property: 0 };
  assets.forEach(a => { cats[a.category] = (cats[a.category] || 0) + toTRY(a.amount, a.currency); });
  const labels = Object.keys(cats).filter(k => cats[k] > 0);
  const values = labels.map(k => cats[k]);
  const colors = { bank: '#1a5276', gold: '#b5860d', crypto: '#f7931a', property: '#7c3aed' };
  const catNames = { bank: i18n.t('bank'), gold: i18n.t('gold'), crypto: i18n.t('crypto'), property: i18n.t('property') };
  const emojis = { bank: '🏦', gold: '🥇', crypto: '₿', property: '🏠' };

  const ctx = document.getElementById('donut-chart').getContext('2d');
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map(k => catNames[k]),
      datasets: [{ data: values, backgroundColor: labels.map(k => colors[k]), borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      cutout: '68%', plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` ${fmtTRY(ctx.raw)} (${((ctx.raw / values.reduce((s,v)=>s+v,0))*100).toFixed(1)}%)` }
      } },
      animation: { duration: 400 }
    }
  });

  // Legend
  const legend = document.getElementById('donut-legend');
  const total = values.reduce((s, v) => s + v, 0);
  legend.innerHTML = labels.map(k => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[k]}"></span>
      ${emojis[k]} ${catNames[k]} ${total ? ((cats[k]/total)*100).toFixed(0) : 0}%
    </div>`).join('');
}

function renderAssetList(assets, history) {
  const container = document.getElementById('asset-list');
  if (!assets.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">💼</div>
      <div class="empty-title">${i18n.t('noAssets')}</div>
      <div class="empty-desc">${i18n.t('noAssetsDesc')}</div>
    </div>`;
    return;
  }

  // Get last month's snapshot for change calculation
  const sorted = [...history].sort((a, b) => a.monthKey > b.monthKey ? 1 : -1);
  const prevSnap = sorted.length >= 2 ? sorted[sorted.length - 2].snapshot : null;
  const prevMap = {};
  if (prevSnap) prevSnap.forEach(a => prevMap[a.id] = a);

  const emojis = { bank: '🏦', gold: '🥇', crypto: '₿', property: '🏠' };
  container.innerHTML = assets.map(asset => {
    const tryVal = toTRY(asset.amount, asset.currency, frozenRate);
    const usdVal = toUSD(asset.amount, asset.currency, frozenRate);
    let changeHtml = '';
    if (prevMap[asset.id]) {
      const prevTRY = toTRY(prevMap[asset.id].amount, prevMap[asset.id].currency);
      if (prevTRY !== 0) {
        const pct = ((tryVal - prevTRY) / prevTRY) * 100;
        const cls = pct >= 0 ? 'positive' : 'negative';
        const arrow = pct >= 0 ? '▲' : '▼';
        changeHtml = `<div class="asset-change ${cls}">${arrow} ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%</div>`;
      }
    }
    return `<div class="asset-item" onclick="openAssetModal('${asset.id}')">
      <div class="asset-icon ${asset.category}">${emojis[asset.category]}</div>
      <div class="asset-info">
        <div class="asset-name">${esc(asset.name)}</div>
        ${asset.note ? `<div class="asset-note">${esc(asset.note)}</div>` : ''}
      </div>
      <div class="asset-values">
        <div class="asset-try">${fmtTRY(tryVal)}</div>
        <div class="asset-usd">${fmtUSD(usdVal)}</div>
        ${changeHtml}
      </div>
    </div>`;
  }).join('');
}

function renderGamifStrip(gamif) {
  const level = Gamification.LEVELS.find(l => l.level === gamif.level) || Gamification.LEVELS[0];
  const lang = i18n.current;
  document.getElementById('level-icon').textContent = level.icon;
  document.getElementById('level-name').textContent = level.name[lang];
  document.getElementById('streak-count').textContent = gamif.streak;
  document.getElementById('streak-label').textContent = i18n.t('streakMonths');
}

// ─── Asset Modal ──────────────────────────────────────
let editingAssetId = null;

function openAssetModal(id) {
  editingAssetId = id;
  const assets = Storage.getAssets();
  const asset = id ? assets.find(a => a.id === id) : null;

  const modal = document.getElementById('modal-asset');
  modal.querySelector('.modal-title').textContent = asset ? i18n.t('editAsset') : i18n.t('newAsset');

  // Category
  const cats = ['bank', 'gold', 'crypto', 'property'];
  const catEmojis = { bank: '🏦', gold: '🥇', crypto: '₿', property: '🏠' };
  const catNames = { bank: i18n.t('bank'), gold: i18n.t('gold'), crypto: i18n.t('crypto'), property: i18n.t('property') };

  const selCat = asset?.category || 'bank';
  document.getElementById('asset-cat-grid').innerHTML = cats.map(c =>
    `<button class="cat-btn ${c} ${selCat === c ? 'selected' : ''}" onclick="selectCategory('${c}')" data-cat="${c}">
      <span class="cat-emoji">${catEmojis[c]}</span>${catNames[c]}
    </button>`).join('');

  document.getElementById('asset-name-input').value = asset?.name || '';
  document.getElementById('asset-amount-input').value = asset?.amount || '';
  document.getElementById('asset-note-input').value = asset?.note || '';

  // Currency toggle
  const selCur = asset?.currency || 'TRY';
  document.querySelectorAll('#modal-asset .currency-btn').forEach(b => b.classList.toggle('selected', b.dataset.cur === selCur));

  // Delete button
  const delBtn = document.getElementById('asset-delete-btn');
  delBtn.classList.toggle('hidden', !asset);

  modal.classList.remove('hidden');
  document.getElementById('asset-name-input').focus();
}

function selectCategory(cat) {
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.cat === cat);
  });
}

function selectCurrency(cur) {
  document.querySelectorAll('#modal-asset .currency-btn').forEach(b => b.classList.toggle('selected', b.dataset.cur === cur));
}

function closeAssetModal() {
  document.getElementById('modal-asset').classList.add('hidden');
  editingAssetId = null;
}

function saveAsset() {
  const name = document.getElementById('asset-name-input').value.trim();
  const amountRaw = document.getElementById('asset-amount-input').value.trim().replace(',', '.');
  const note = document.getElementById('asset-note-input').value.trim();
  const cat = document.querySelector('.cat-btn.selected')?.dataset.cat || 'bank';
  const currency = document.querySelector('#modal-asset .currency-btn.selected')?.dataset.cur || 'TRY';
  const amount = parseFloat(amountRaw);

  // Validation
  let valid = true;
  const nameInput = document.getElementById('asset-name-input');
  const amountInput = document.getElementById('asset-amount-input');
  nameInput.classList.remove('error'); amountInput.classList.remove('error');

  if (!name) { nameInput.classList.add('error'); valid = false; }
  if (isNaN(amount) || amount < 0) { amountInput.classList.add('error'); valid = false; }
  if (!valid) { showToast(i18n.t('fillRequired')); return; }

  const assets = Storage.getAssets();
  if (editingAssetId) {
    const idx = assets.findIndex(a => a.id === editingAssetId);
    if (idx !== -1) assets[idx] = { ...assets[idx], name, category: cat, amount, currency, note };
  } else {
    assets.push({ id: uid(), category: cat, name, amount, currency, note, createdAt: today() });
  }
  Storage.saveAssets(assets);
  autoSaveHistorySnapshot();
  checkGamification();
  closeAssetModal();
  renderDashboard();
  showToast(i18n.t('assetSaved'));
}

function autoSaveHistorySnapshot() {
  const assets = Storage.getAssets();
  if (!assets.length) return;

  // Kuru dondur
  frozenRate = USD_TRY;
  Storage.saveFrozenRate(frozenRate);

  // Son kayıt tarihini sakla
  const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  Storage.saveLastSave(dateStr);

  // Cari ay için history snapshot yaz
  const totalTRY = assets.reduce((s, a) => s + toTRY(a.amount, a.currency, frozenRate), 0);
  const totalUSD = assets.reduce((s, a) => s + toUSD(a.amount, a.currency, frozenRate), 0);
  const history  = Storage.getHistory();
  const monthKey = Storage.currentMonthKey();
  const entry    = { monthKey, date: today(), totalTRY, totalUSD, usdTryRate: frozenRate, snapshot: JSON.parse(JSON.stringify(assets)) };
  const idx = history.findIndex(h => h.monthKey === monthKey);
  if (idx >= 0) history[idx] = entry; else history.push(entry);
  Storage.saveHistory(history);
}

function deleteAsset() {
  if (!editingAssetId) return;
  if (!confirm(i18n.t('deleteAssetConfirm'))) return;
  const assets = Storage.getAssets().filter(a => a.id !== editingAssetId);
  Storage.saveAssets(assets);
  closeAssetModal();
  renderDashboard();
  showToast(i18n.t('assetDeleted'));
}

// ─── Monthly Update ───────────────────────────────────
function checkMonthlyUpdatePrompt() {
  document.getElementById('header-update-btn').classList.add('hidden');
}

function tryShowReminderNotification() {
  const settings = Storage.getSettings();
  if (!settings.notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;
  if (Storage.hasCurrentMonthEntry()) return;
  if (!Storage.getAssets().length) return;
  const now = new Date();
  if (now.getDate() < settings.reminderDay) return;

  // Only show once per day
  const lastNotifDay = localStorage.getItem('srv_last_notif_day');
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  if (lastNotifDay === todayKey) return;
  localStorage.setItem('srv_last_notif_day', todayKey);

  new Notification('Servetim 📊', {
    body: 'Varlıklarını güncelleme zamanı! Bu ayın kaydını almayı unutma.',
    icon: '/servetim/icons/icon-192.png',
    badge: '/servetim/icons/icon-192.png',
  });
}

let _editingMonthKey = null; // null = current month, string = past month key

function openUpdateModal(monthKey) {
  const assets = Storage.getAssets();
  const history = Storage.getHistory().sort((a, b) => a.monthKey > b.monthKey ? 1 : -1);
  const currentMonthKey = Storage.currentMonthKey();
  const isPastEdit = monthKey && monthKey !== currentMonthKey;
  _editingMonthKey = isPastEdit ? monthKey : null;

  const emojis = { bank: '🏦', gold: '🥇', crypto: '₿', property: '🏠' };
  const modal = document.getElementById('modal-update');
  const body = document.getElementById('update-list');

  let rowAssets, title;
  if (isPastEdit) {
    // Geçmiş ay düzenleme: o ayın snapshot'ından besle
    const entry = history.find(h => h.monthKey === monthKey);
    if (!entry) return;
    const monthsFull = i18n.t('monthsFull');
    const [y, m] = monthKey.split('-');
    title = `✏️ ${monthsFull[+m - 1]} ${y}`;
    rowAssets = (entry.snapshot || []).map(sa => ({ ...sa }));
  } else {
    // Cari ay: yeni kayıt veya cari ay düzenleme
    if (!assets.length) { showToast(i18n.t('noAssets')); return; }
    const isEdit = Storage.hasCurrentMonthEntry();
    title = isEdit ? '✏️ Güncellemeyi Düzenle' : '📊 Aylık Güncelleme';
    const refSnap = history.length ? history[history.length - 1].snapshot : null;
    const refMap = {};
    if (refSnap) refSnap.forEach(a => refMap[a.id] = a);
    rowAssets = assets.map(asset => {
      const ref = refMap[asset.id];
      return { ...asset, amount: ref ? ref.amount : asset.amount };
    });
    document.getElementById('update-edit-note').style.display = isEdit ? 'block' : 'none';
  }

  modal.querySelector('.modal-title').textContent = title;
  if (isPastEdit) document.getElementById('update-edit-note').style.display = 'block';

  body.innerHTML = rowAssets.map(asset => {
    const cur = asset.currency;
    return `<div class="update-asset-row">
      <span class="update-asset-icon">${emojis[asset.category]}</span>
      <span class="update-asset-name">${esc(asset.name)}</span>
      <input class="update-asset-input" type="number" data-id="${asset.id}" data-currency="${cur}"
        value="${asset.amount}" inputmode="decimal" min="0" step="any">
      <span class="update-currency-label">${cur === 'USD' ? '$' : '₺'}</span>
    </div>`;
  }).join('');

  modal.classList.remove('hidden');
}

function closeUpdateModal() {
  document.getElementById('modal-update').classList.add('hidden');
}

function saveUpdate() {
  const inputs = document.querySelectorAll('.update-asset-input');
  let valid = true;
  inputs.forEach(inp => {
    const val = parseFloat(inp.value.replace(',', '.'));
    inp.classList.remove('error');
    if (isNaN(val) || val < 0) { inp.classList.add('error'); valid = false; }
  });
  if (!valid) { showToast(i18n.t('invalidAmount')); return; }

  const history = Storage.getHistory();

  if (_editingMonthKey) {
    // Geçmiş ay düzenleme: sadece history güncelle, mevcut varlıklara dokunma
    const idx = history.findIndex(h => h.monthKey === _editingMonthKey);
    if (idx < 0) return;
    const existing = history[idx];
    const snapshot = JSON.parse(JSON.stringify(existing.snapshot || []));
    inputs.forEach(inp => {
      const sa = snapshot.find(a => a.id === inp.dataset.id);
      if (sa) sa.amount = parseFloat(inp.value.replace(',', '.'));
    });
    const totalTRY = snapshot.reduce((s, a) => s + toTRY(a.amount, a.currency), 0);
    const totalUSD = snapshot.reduce((s, a) => s + toUSD(a.amount, a.currency), 0);
    history[idx] = { ...existing, totalTRY, totalUSD, snapshot };
    Storage.saveHistory(history);
  } else {
    // Cari ay güncellemesi: hem assets hem history kaydet
    const assets = Storage.getAssets();
    inputs.forEach(inp => {
      const asset = assets.find(a => a.id === inp.dataset.id);
      if (asset) asset.amount = parseFloat(inp.value.replace(',', '.'));
    });
    Storage.saveAssets(assets);
    const totalTRY = assets.reduce((s, a) => s + toTRY(a.amount, a.currency), 0);
    const totalUSD = assets.reduce((s, a) => s + toUSD(a.amount, a.currency), 0);
    const monthKey = Storage.currentMonthKey();
    const entry = { monthKey, date: today(), totalTRY, totalUSD, usdTryRate: USD_TRY, snapshot: JSON.parse(JSON.stringify(assets)) };
    const existingIdx = history.findIndex(h => h.monthKey === monthKey);
    if (existingIdx >= 0) { history[existingIdx] = entry; } else { history.push(entry); }
    Storage.saveHistory(history);
  }

  _editingMonthKey = null;
  checkGamification();
  closeUpdateModal();
  checkMonthlyUpdatePrompt();
  renderDashboard();
  showToast(i18n.t('updateSaved'));
}

// ─── Gamification ─────────────────────────────────────
function checkGamification() {
  const assets = Storage.getAssets();
  const history = Storage.getHistory();
  const goals = Storage.getGoals();
  const gamif = Storage.getGamification();

  const totalUSD = assets.reduce((s, a) => s + toUSD(a.amount, a.currency), 0);
  const newBadges = Gamification.checkNewBadges(assets, history, goals, gamif.badges, totalUSD);
  const streak = Gamification.calcStreak(history);
  const level = Gamification.calcLevel(history, goals, [...gamif.badges, ...newBadges]);

  const updated = {
    badges: [...gamif.badges, ...newBadges],
    level,
    streak,
    lastUpdateMonth: Storage.currentMonthKey()
  };
  Storage.saveGamification(updated);

  // Show badge popups sequentially
  newBadges.forEach((id, i) => setTimeout(() => showBadgePopup(id), i * 2000));
  if (level > gamif.level) setTimeout(() => showLevelUpToast(level), newBadges.length * 2000);
}

function showBadgePopup(id) {
  const info = Gamification.getBadgeInfo(id);
  const lang = i18n.current;
  const popup = document.getElementById('badge-popup');
  document.getElementById('badge-popup-emoji').textContent = info.icon;
  document.getElementById('badge-popup-title').textContent = i18n.t('badgeEarned');
  document.getElementById('badge-popup-name').textContent = Gamification.getBadgeName(id, lang);
  document.getElementById('badge-popup-desc').textContent = Gamification.getBadgeDesc(id, lang);
  popup.classList.remove('hidden');
  launchConfetti();
}

function closeBadgePopup() {
  document.getElementById('badge-popup').classList.add('hidden');
}

function showLevelUpToast(level) {
  const lvl = Gamification.LEVELS.find(l => l.level === level);
  showToast(`${i18n.t('levelUp')} ${lvl?.icon} ${lvl?.name[i18n.current]}`);
}

// ─── History ──────────────────────────────────────────
function renderHistory() {
  const history = Storage.getHistory().sort((a, b) => a.monthKey > b.monthKey ? 1 : -1);
  const monthsShort = i18n.t('monthsShort');

  function monthLabel(monthKey) {
    const [y, m] = monthKey.split('-');
    return `${monthsShort[+m - 1]} ${y.slice(2)}`;
  }

  // Chart
  const chartWrap = document.getElementById('history-chart-wrap');
  if (history.length >= 1) {
    chartWrap.classList.remove('hidden');
    document.getElementById('history-no-chart').classList.add('hidden');
    const labels = history.map(h => monthLabel(h.monthKey));
    const usdData = history.map(h => h.totalUSD);

    // Goal datasets: horizontal dashed lines on USD axis
    const goalColors = ['#7c3aed', '#1a5276', '#b5860d', '#dc2626'];
    const goals = Storage.getGoals().filter(g => g.targetAmount);
    const goalDatasets = goals.slice(0, 4).map((g, i) => {
      const targetUSD = g.targetCurrency === 'USD' ? g.targetAmount : g.targetAmount / USD_TRY;
      return {
        label: g.name,
        data: labels.map(() => targetUSD),
        borderColor: goalColors[i % goalColors.length],
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0
      };
    });

    const ctx = document.getElementById('line-chart').getContext('2d');
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'USD', data: usdData, borderColor: '#2d6a4f', backgroundColor: 'rgba(45,106,79,.08)', tension: .35, fill: true, pointBackgroundColor: '#2d6a4f', pointRadius: history.length === 1 ? 6 : 4 },
          ...goalDatasets
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { family: 'Nunito', weight: '600', size: 11 } } },
          tooltip: { callbacks: { label: ctx => fmtUSD(ctx.raw) } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 11 } } },
          y: { position: 'left', grid: { color: '#f0f0f0' }, ticks: { font: { family: 'Nunito', size: 10 }, callback: v => '$' + fmtNum(v) } }
        }
      }
    });
  } else {
    chartWrap.classList.add('hidden');
    document.getElementById('history-no-chart').classList.remove('hidden');
  }

  // Month cards
  const cardsContainer = document.getElementById('history-cards');
  if (!history.length) {
    document.getElementById('history-empty').classList.remove('hidden');
    cardsContainer.innerHTML = '';
    return;
  }
  document.getElementById('history-empty').classList.add('hidden');

  const currentMonthKey = Storage.currentMonthKey();
  const monthsFull = i18n.t('monthsFull');
  const catNames = { bank: i18n.t('bank'), gold: i18n.t('gold'), crypto: i18n.t('crypto'), property: i18n.t('property') };
  const emojis = { bank: '🏦', gold: '🥇', crypto: '₿', property: '🏠' };

  function fullMonthLabel(mk) {
    const [y, m] = mk.split('-');
    return `${monthsFull[+m - 1]} ${y}`;
  }

  const reversed = [...history].reverse();
  cardsContainer.innerHTML = reversed.map((h, i) => {
    const prev = reversed[i + 1];
    const isCurrentMonth = h.monthKey === currentMonthKey;

    let changeHtml = '';
    if (prev) {
      const diffTRY = h.totalTRY - prev.totalTRY;
      const pct = ((h.totalUSD - prev.totalUSD) / (prev.totalUSD || 1)) * 100;
      const up = diffTRY >= 0;
      const sign = up ? '+' : '';
      changeHtml = `<div class="hmc-change-row"><span class="hmc-change ${up ? 'positive' : 'negative'}">${up ? '▲' : '▼'} ${sign}${fmtTRY(diffTRY)} (${sign}${pct.toFixed(1)}%)</span></div>`;
    }

    const cats = {};
    (h.snapshot || []).forEach(a => {
      if (!cats[a.category]) cats[a.category] = 0;
      cats[a.category] += toTRY(a.amount, a.currency);
    });
    const catRows = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, val]) => `<div class="hmc-asset-row"><span>${emojis[cat]} ${catNames[cat]}</span><span>${fmtTRY(val)}</span></div>`)
      .join('');

    const rateStr = h.usdTryRate ? `$1 = ₺${h.usdTryRate.toFixed(2)}` : '';
    const metaStr = [rateStr, h.date].filter(Boolean).join(' · ');

    return `<div class="card hmc${isCurrentMonth ? ' hmc-current' : ''}">
      <div class="hmc-header">
        <span class="hmc-month-name">${fullMonthLabel(h.monthKey)}</span>
        <button class="hmc-edit-btn" onclick="openUpdateModal('${h.monthKey}')">✏️ Düzenle</button>
      </div>
      <div class="hmc-totals">
        <span class="hmc-total-try">${fmtTRY(h.totalTRY)}</span>
        <span class="hmc-total-usd">${fmtUSD(h.totalUSD)}</span>
      </div>
      ${changeHtml}
      <div class="hmc-divider"></div>
      <div class="hmc-assets">${catRows}</div>
      ${metaStr ? `<div class="hmc-meta">${metaStr}</div>` : ''}
    </div>`;
  }).join('');
}

// ─── Goals ────────────────────────────────────────────
let editingGoalId = null;

function renderGoals() {
  const goals = Storage.getGoals();
  const gamif = Storage.getGamification();
  const assets = Storage.getAssets();
  const totalUSD = assets.reduce((s, a) => s + toUSD(a.amount, a.currency), 0);
  const totalTRY = assets.reduce((s, a) => s + toTRY(a.amount, a.currency), 0);
  const lang = i18n.current;

  // Goals list
  const container = document.getElementById('goals-list');
  if (!goals.length) {
    container.innerHTML = `<div class="card"><div class="empty-state">
      <div class="empty-icon">🎯</div>
      <div class="empty-title">${i18n.t('noGoals')}</div>
      <div class="empty-desc">${i18n.t('noGoalsDesc')}</div>
    </div></div>`;
  } else {
    const history = Storage.getHistory().sort((a, b) => a.monthKey > b.monthKey ? 1 : -1);
    let avgMonthlyGrowthUSD = 0;
    if (history.length >= 2) {
      const diffs = [];
      for (let i = 1; i < history.length; i++) diffs.push(history[i].totalUSD - history[i-1].totalUSD);
      avgMonthlyGrowthUSD = diffs.reduce((s, d) => s + d, 0) / diffs.length;
    }

    container.innerHTML = goals.map(goal => {
      const targetUSD = goal.targetCurrency === 'USD' ? goal.targetAmount : goal.targetAmount / USD_TRY;
      const currentUSD = totalUSD;
      const pct = Math.min(100, (currentUSD / targetUSD) * 100);
      const remaining = Math.max(0, targetUSD - currentUSD);
      let estimateHtml = '';
      if (avgMonthlyGrowthUSD > 0 && remaining > 0) {
        const months = Math.ceil(remaining / avgMonthlyGrowthUSD);
        estimateHtml = `<div class="goal-estimate">⏱ ${i18n.t('estimatedArrival')}: ~${months} ${i18n.t('months')}</div>`;
      } else if (remaining === 0) {
        estimateHtml = `<div class="goal-estimate" style="color:var(--success)">🎉 Hedefe ulaştın!</div>`;
      } else {
        estimateHtml = `<div class="goal-estimate">${i18n.t('notEnoughData')}</div>`;
      }
      const displayCurrent = goal.targetCurrency === 'USD' ? fmtUSD(currentUSD) : fmtTRY(totalTRY);
      const displayTarget = goal.targetCurrency === 'USD' ? fmtUSD(targetUSD) : fmtTRY(goal.targetAmount);
      const complete = pct >= 100;
      return `<div class="card goal-card">
        <div class="goal-header">
          <div class="goal-name">${esc(goal.name)}</div>
          <div class="goal-actions">
            <button class="goal-action-btn" onclick="openGoalModal('${goal.id}')">✏️</button>
            <button class="goal-action-btn" onclick="deleteGoal('${goal.id}')">🗑️</button>
          </div>
        </div>
        <div class="goal-pct">${pct.toFixed(1)}%</div>
        <div class="goal-progress-bar"><div class="goal-progress-fill ${complete ? 'complete' : ''}" style="width:${pct}%"></div></div>
        <div class="goal-stats">
          <span>${i18n.t('current')}: ${displayCurrent}</span>
          <span>${i18n.t('target')}: ${displayTarget}</span>
        </div>
        ${estimateHtml}
      </div>`;
    }).join('');
  }

  // Badges
  const badgesContainer = document.getElementById('badges-container');
  const badges = gamif.badges;
  if (!badges.length) {
    badgesContainer.innerHTML = `<div class="empty-state" style="padding:16px"><div class="empty-desc">${i18n.t('noBadges')}</div></div>`;
  } else {
    badgesContainer.innerHTML = `<div class="badges-grid">${badges.map(id => {
      const info = Gamification.getBadgeInfo(id);
      return `<div class="badge-chip" title="${Gamification.getBadgeDesc(id, lang)}">
        <span class="badge-icon">${info.icon}</span>${Gamification.getBadgeName(id, lang)}
      </div>`;
    }).join('')}</div>`;
  }
}

function openGoalModal(id) {
  editingGoalId = id;
  const goals = Storage.getGoals();
  const goal = id ? goals.find(g => g.id === id) : null;

  document.getElementById('modal-goal').querySelector('.modal-title').textContent =
    goal ? i18n.t('editGoal') : i18n.t('newGoal');
  document.getElementById('goal-name-input').value = goal?.name || '';
  document.getElementById('goal-amount-input').value = goal?.targetAmount || '';
  document.getElementById('goal-date-input').value = goal?.targetDate || '';

  // Currency
  const selCur = goal?.targetCurrency || 'USD';
  document.querySelectorAll('.goal-currency-btn').forEach(b => b.classList.toggle('selected', b.dataset.cur === selCur));

  const delBtn = document.getElementById('goal-delete-btn');
  delBtn.classList.toggle('hidden', !goal);

  document.getElementById('modal-goal').classList.remove('hidden');
  document.getElementById('goal-name-input').focus();
}

function selectGoalCurrency(cur) {
  document.querySelectorAll('.goal-currency-btn').forEach(b => b.classList.toggle('selected', b.dataset.cur === cur));
}

function closeGoalModal() {
  document.getElementById('modal-goal').classList.add('hidden');
  editingGoalId = null;
}

function saveGoal() {
  const name = document.getElementById('goal-name-input').value.trim();
  const amountRaw = document.getElementById('goal-amount-input').value.trim().replace(',', '.');
  const date = document.getElementById('goal-date-input').value;
  const currency = document.querySelector('.goal-currency-btn.selected')?.dataset.cur || 'USD';
  const amount = parseFloat(amountRaw);

  let valid = true;
  const nameInput = document.getElementById('goal-name-input');
  const amountInput = document.getElementById('goal-amount-input');
  nameInput.classList.remove('error'); amountInput.classList.remove('error');
  if (!name) { nameInput.classList.add('error'); valid = false; }
  if (isNaN(amount) || amount <= 0) { amountInput.classList.add('error'); valid = false; }
  if (!valid) { showToast(i18n.t('fillRequired')); return; }

  const goals = Storage.getGoals();
  if (editingGoalId) {
    const idx = goals.findIndex(g => g.id === editingGoalId);
    if (idx !== -1) goals[idx] = { ...goals[idx], name, targetAmount: amount, targetCurrency: currency, targetDate: date };
  } else {
    goals.push({ id: uid(), name, targetAmount: amount, targetCurrency: currency, targetDate: date || null, createdAt: today() });
  }
  Storage.saveGoals(goals);
  checkGamification();
  closeGoalModal();
  renderGoals();
  showToast(i18n.t('goalSaved'));
}

function deleteGoal(id) {
  if (!confirm(i18n.t('deleteGoalConfirm'))) return;
  const goals = Storage.getGoals().filter(g => g.id !== id);
  Storage.saveGoals(goals);
  renderGoals();
  showToast(i18n.t('goalDeleted'));
  if (editingGoalId === id) closeGoalModal();
}

// ─── Settings Page ────────────────────────────────────
let settingsTemp = {};

function renderSettings() {
  const s = Storage.getSettings();
  settingsTemp = { ...s };

  document.querySelectorAll('#page-settings [data-lang]').forEach(b =>
    b.classList.toggle('selected', b.dataset.lang === s.language));

  document.querySelectorAll('#page-settings [data-scur]').forEach(b =>
    b.classList.toggle('selected', b.dataset.scur === s.currency));

  const dp = document.getElementById('settings-day-picker');
  if (!dp.children.length) {
    for (let d = 1; d <= 28; d++) {
      const btn = document.createElement('button');
      btn.className = 'day-btn';
      btn.dataset.day = d;
      btn.textContent = d;
      btn.onclick = () => settingsSelectDay(d);
      dp.appendChild(btn);
    }
  }
  dp.querySelectorAll('.day-btn').forEach(b =>
    b.classList.toggle('selected', +b.dataset.day === s.reminderDay));

  document.getElementById('settings-notif-switch')
    .classList.toggle('on', s.notificationsEnabled);
}

function settingsSelectLang(lang) {
  settingsTemp.language = lang;
  document.querySelectorAll('#page-settings [data-lang]').forEach(b =>
    b.classList.toggle('selected', b.dataset.lang === lang));
}

function settingsSelectCurrency(cur) {
  settingsTemp.currency = cur;
  document.querySelectorAll('#page-settings [data-scur]').forEach(b =>
    b.classList.toggle('selected', b.dataset.scur === cur));
}

function settingsSelectDay(day) {
  settingsTemp.reminderDay = day;
  document.querySelectorAll('#settings-day-picker .day-btn').forEach(b =>
    b.classList.toggle('selected', +b.dataset.day === day));
}

async function settingsToggleNotif() {
  if (!settingsTemp.notificationsEnabled) {
    if (!('Notification' in window)) {
      showToast('Tarayıcın bildirim desteklemiyor');
      return;
    }
    if (Notification.permission === 'denied') {
      showToast('Tarayıcı ayarları → Site izinleri → Bildirimler → İzin ver');
      return;
    }
    if (Notification.permission === 'granted') {
      settingsTemp.notificationsEnabled = true;
      document.getElementById('settings-notif-switch').classList.add('on');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      showToast('Tarayıcı ayarları → Site izinleri → Bildirimler → İzin ver');
      return;
    }
    settingsTemp.notificationsEnabled = true;
  } else {
    settingsTemp.notificationsEnabled = false;
  }
  document.getElementById('settings-notif-switch').classList.toggle('on', settingsTemp.notificationsEnabled);
}

function saveSettingsPage() {
  const current = Storage.getSettings();
  const langChanged = settingsTemp.language !== current.language;
  Storage.saveSettings({ ...current, ...settingsTemp });
  if (langChanged) {
    i18n.setLanguage(settingsTemp.language);
    applyI18nToApp();
  }
  renderDashboard();
  showToast('✓ Ayarlar kaydedildi');
}

function resetAllData() {
  if (!confirm('Tüm veriler (varlıklar, tarihçe, hedefler) silinecek. Emin misin?')) return;
  Storage.reset();
  location.reload();
}

function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings:     Storage.getSettings(),
    assets:       Storage.getAssets(),
    history:      Storage.getHistory(),
    goals:        Storage.getGoals(),
    gamification: Storage.getGamification(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `servetim-yedek-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Yedek dosyası indirildi');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.assets || !data.settings) { showToast('Geçersiz yedek dosyası'); return; }
      if (!confirm('Mevcut tüm veriler bu yedekle değiştirilecek. Devam et?')) return;
      Storage.saveSettings(data.settings);
      Storage.saveAssets(data.assets);
      Storage.saveHistory(data.history || []);
      Storage.saveGoals(data.goals || []);
      if (data.gamification) Storage.saveGamification(data.gamification);
      localStorage.setItem(Storage.K.INIT, 'true');
      showToast('✓ Veriler geri yüklendi!');
      setTimeout(() => location.reload(), 1000);
    } catch {
      showToast('Dosya okunamadı');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ─── Confetti ─────────────────────────────────────────
function launchConfetti() {
  const colors = ['#2d6a4f','#52b788','#b5860d','#f7931a','#7c3aed','#1a5276','#fbbf24'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;top:0;background:${colors[i%colors.length]};
      animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*.5}s;
      width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>0.5?'50%':'2px'}`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─── Toast ────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
}

// ─── Notifications ────────────────────────────────────
function scheduleNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const settings = Storage.getSettings();
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), settings.reminderDay, 9, 0, 0);
  if (target <= now) target.setMonth(target.getMonth() + 1);
  const delay = target - now;
  setTimeout(() => {
    if (!Storage.hasCurrentMonthEntry()) {
      new Notification(i18n.t('appName'), { body: i18n.t('updateReminder'), icon: './icons/icon-192.png' });
    }
  }, delay);
}

// ─── Utilities ────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function today() { return new Date().toISOString().slice(0, 10); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ─── Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);