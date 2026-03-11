const Gamification = {
  BADGES: {
    first_asset:    { icon: '🌱', nameKey: 'b_first_asset',    descKey: 'bd_first_asset' },
    streak_3:       { icon: '📅', nameKey: 'b_streak_3',       descKey: 'bd_streak_3' },
    streak_6:       { icon: '🔥', nameKey: 'b_streak_6',       descKey: 'bd_streak_6' },
    net_10k:        { icon: '💰', nameKey: 'b_net_10k',        descKey: 'bd_net_10k' },
    net_50k:        { icon: '🚀', nameKey: 'b_net_50k',        descKey: 'bd_net_50k' },
    net_100k:       { icon: '💎', nameKey: 'b_net_100k',       descKey: 'bd_net_100k' },
    growth_3:       { icon: '📈', nameKey: 'b_growth_3',       descKey: 'bd_growth_3' },
    goal_halfway:   { icon: '🎯', nameKey: 'b_goal_halfway',   descKey: 'bd_goal_halfway' },
    goal_complete:  { icon: '🏆', nameKey: 'b_goal_complete',  descKey: 'bd_goal_complete' },
  },

  BADGE_NAMES: {
    tr: {
      b_first_asset: 'İlk Adım',       bd_first_asset: 'İlk varlığını ekledin',
      b_streak_3: 'Düzenli',            bd_streak_3: '3 ay üst üste güncelledi',
      b_streak_6: 'Momentum',           bd_streak_6: '6 ay üst üste güncelledi',
      b_net_10k: '10K Dolar',           bd_net_10k: 'Net servet $10.000\'i geçti',
      b_net_50k: '50K Dolar',           bd_net_50k: 'Net servet $50.000\'i geçti',
      b_net_100k: '100K Dolar',         bd_net_100k: 'Net servet $100.000\'i geçti',
      b_growth_3: 'Büyüme',             bd_growth_3: '3 ay üst üste servet arttı',
      b_goal_halfway: 'Yarı Yol',       bd_goal_halfway: 'Bir hedefe %50 yaklaştın',
      b_goal_complete: 'Hedef!',        bd_goal_complete: 'Bir hedefini tamamladın',
    },
    en: {
      b_first_asset: 'First Step',      bd_first_asset: 'Added your first asset',
      b_streak_3: 'Consistent',         bd_streak_3: 'Updated 3 months in a row',
      b_streak_6: 'On Fire',            bd_streak_6: 'Updated 6 months in a row',
      b_net_10k: '$10K',                bd_net_10k: 'Net worth passed $10,000',
      b_net_50k: '$50K',                bd_net_50k: 'Net worth passed $50,000',
      b_net_100k: '$100K',              bd_net_100k: 'Net worth passed $100,000',
      b_growth_3: 'Growing',            bd_growth_3: 'Net worth grew 3 months in a row',
      b_goal_halfway: 'Halfway',        bd_goal_halfway: 'Reached 50% of a goal',
      b_goal_complete: 'Goal!',         bd_goal_complete: 'Completed a goal',
    }
  },

  LEVELS: [
    { level: 1, icon: '🌱', name: { tr: 'Filiz',           en: 'Sprout' } },
    { level: 2, icon: '🪴', name: { tr: 'Büyüyen',         en: 'Growing' } },
    { level: 3, icon: '🌳', name: { tr: 'Güçlü',           en: 'Strong' } },
    { level: 4, icon: '💫', name: { tr: 'Zenginleşen',     en: 'Prospering' } },
    { level: 5, icon: '👑', name: { tr: 'Usta Birikimci',  en: 'Master Saver' } },
  ],

  getBadgeName(id, lang) { return this.BADGE_NAMES[lang]?.[`b_${id}`] || id; },
  getBadgeDesc(id, lang) { return this.BADGE_NAMES[lang]?.[`bd_${id}`] || ''; },
  getBadgeInfo(id) { return this.BADGES[id] || { icon: '?', nameKey: id, descKey: '' }; },

  calcStreak(history) {
    if (history.length < 1) return 0;
    const sorted = [...history].sort((a, b) => a.monthKey < b.monthKey ? 1 : -1);
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const [y1, m1] = sorted[i-1].monthKey.split('-').map(Number);
      const [y2, m2] = sorted[i].monthKey.split('-').map(Number);
      const diff = (y1 - y2) * 12 + (m1 - m2);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  },

  calcLevel(history, goals, badges) {
    if (badges.includes('goal_complete')) return 5;
    const latestUSD = history.length
      ? [...history].sort((a, b) => a.monthKey < b.monthKey ? 1 : -1)[0].totalUSD
      : 0;
    if (latestUSD >= 25000) return 4;
    if (history.length >= 6) return 3;
    if (history.length >= 3) return 2;
    return 1;
  },

  checkNewBadges(assets, history, goals, currentBadges, currentUSD) {
    const earned = new Set(currentBadges);
    const newBadges = [];

    const maybe = (id, cond) => { if (!earned.has(id) && cond) newBadges.push(id); };

    maybe('first_asset', assets.length > 0);

    const streak = this.calcStreak(history);
    maybe('streak_3', streak >= 3);
    maybe('streak_6', streak >= 6);
    maybe('net_10k',  currentUSD >= 10000);
    maybe('net_50k',  currentUSD >= 50000);
    maybe('net_100k', currentUSD >= 100000);

    if (history.length >= 3) {
      const sorted = [...history].sort((a, b) => a.monthKey > b.monthKey ? 1 : -1);
      const last3 = sorted.slice(-3);
      maybe('growth_3', last3[1].totalUSD > last3[0].totalUSD && last3[2].totalUSD > last3[1].totalUSD);
    }

    goals.forEach(goal => {
      const pct = (currentUSD / (goal.targetCurrency === 'USD' ? goal.targetAmount : goal.targetAmount / 38.5)) * 100;
      maybe('goal_halfway', pct >= 50);
      maybe('goal_complete', pct >= 100);
    });

    return newBadges;
  }
};