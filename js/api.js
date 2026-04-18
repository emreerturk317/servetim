const API = {
  URL: 'https://api.exchangerate-api.com/v4/latest/USD',
  CACHE_HOURS: 6,
  _liveRates: null,

  async getUsdTryRate() {
    const cached = Storage.getExchangeRate();
    if (cached) {
      const hrs = (Date.now() - new Date(cached.fetchedAt).getTime()) / 3_600_000;
      if (hrs < this.CACHE_HOURS) return { rate: cached.usdTry, fromCache: true };
    }
    try {
      const res = await fetch(this.URL, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      const rate = data.rates.TRY;
      Storage.saveExchangeRate({ usdTry: rate, fetchedAt: new Date().toISOString() });
      return { rate, fromCache: false };
    } catch {
      if (cached) return { rate: cached.usdTry, fromCache: true, stale: true };
      return { rate: 38.5, fromCache: false, fallback: true };
    }
  },

  async getLiveRates() {
    if (this._liveRates) return this._liveRates;
    try {
      const res = await fetch(this.URL, { signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      const r = data.rates;
      const usdTry = r.TRY;
      Storage.saveExchangeRate({ usdTry, fetchedAt: new Date().toISOString() });
      this._liveRates = {
        usdTry,
        eurTry: r.EUR ? usdTry / r.EUR : null,
        gbpTry: r.GBP ? usdTry / r.GBP : null,
        goldUsdOz: r.XAU ? 1 / r.XAU : null,
        silverUsdOz: r.XAG ? 1 / r.XAG : null,
        fetchedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        ok: true
      };
      return this._liveRates;
    } catch {
      const cached = Storage.getExchangeRate();
      return { usdTry: cached?.usdTry || 38.5, ok: false };
    }
  }
};