const Sounds = {
  _ctx: null,
  _init() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  },

  // Kısa coin sesi: 2 yüksek frekans tonu
  coin() {
    try {
      const ctx = this._init();
      [880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.15);
      });
    } catch(e) {}
  },

  // Rozet/konfeti sesi: yükselen 4 tonlu fanfar
  badge() {
    try {
      const ctx = this._init();
      [523, 659, 784, 1046].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      });
    } catch(e) {}
  }
};
