const API = {
  URL: 'https://api.exchangerate-api.com/v4/latest/USD',
  CACHE_HOURS: 6,

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
  }
};