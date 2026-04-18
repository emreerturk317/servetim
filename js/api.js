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
    const CDN = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
    try {
      const [fxRes, goldRes, silverRes] = await Promise.allSettled([
        fetch(this.URL, { signal: AbortSignal.timeout(6000) }),
        fetch(`${CDN}/xau.json`, { signal: AbortSignal.timeout(8000) }),
        fetch(`${CDN}/xag.json`, { signal: AbortSignal.timeout(8000) })
      ]);

      const fxData   = fxRes.status    === 'fulfilled' ? await fxRes.value.json()    : null;
      const goldData = goldRes.status  === 'fulfilled' ? await goldRes.value.json()  : null;
      const silvData = silverRes.status === 'fulfilled' ? await silverRes.value.json() : null;

      const r = fxData?.rates || {};
      const usdTry = r.TRY || Storage.getExchangeRate()?.usdTry || 38.5;
      if (r.TRY) Storage.saveExchangeRate({ usdTry, fetchedAt: new Date().toISOString() });

      // fawazahmed0 CDN: xau.try = TRY price per troy oz of gold
      this._liveRates = {
        usdTry,
        eurTry: r.EUR ? usdTry / r.EUR : null,
        gbpTry: r.GBP ? usdTry / r.GBP : null,
        goldTryOz:   goldData?.xau?.try || null,
        silverTryOz: silvData?.xag?.try || null,
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