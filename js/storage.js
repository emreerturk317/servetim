const Storage = {
  K: {
    INIT:   'srv_initialized',
    SETTINGS: 'srv_settings',
    ASSETS:   'srv_assets',
    HISTORY:  'srv_history',
    GOALS:    'srv_goals',
    EXCHANGE: 'srv_exchange',
    GAMIF:    'srv_gamification',
  },

  _get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  isInitialized() { return localStorage.getItem(this.K.INIT) === 'true'; },
  setInitialized() { localStorage.setItem(this.K.INIT, 'true'); },

  getSettings() {
    return { language: 'tr', currency: 'TRY', reminderDay: 1, notificationsEnabled: false,
      ...this._get(this.K.SETTINGS, {}) };
  },
  saveSettings(s) { this._set(this.K.SETTINGS, s); },

  getAssets() { return this._get(this.K.ASSETS, []); },
  saveAssets(a) { this._set(this.K.ASSETS, a); },

  getHistory() { return this._get(this.K.HISTORY, []); },
  saveHistory(h) { this._set(this.K.HISTORY, h); },

  getGoals() { return this._get(this.K.GOALS, []); },
  saveGoals(g) { this._set(this.K.GOALS, g); },

  getExchangeRate() { return this._get(this.K.EXCHANGE, null); },
  saveExchangeRate(d) { this._set(this.K.EXCHANGE, d); },

  getGamification() {
    return { badges: [], level: 1, streak: 0, lastUpdateMonth: null,
      ...this._get(this.K.GAMIF, {}) };
  },
  saveGamification(g) { this._set(this.K.GAMIF, g); },

  /** Returns the YYYY-MM key for the current month */
  currentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  /** True if history already has an entry for the current month */
  hasCurrentMonthEntry() {
    const key = this.currentMonthKey();
    return this.getHistory().some(h => h.monthKey === key);
  },

  /** Wipes everything (for dev/testing) */
  reset() {
    Object.values(this.K).forEach(k => localStorage.removeItem(k));
  }
};