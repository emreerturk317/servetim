const i18n = {
  current: 'tr',

  strings: {
    tr: {
      appName: 'Servetim',
      save: 'Kaydet', cancel: 'İptal', delete: 'Sil', edit: 'Düzenle',
      add: 'Ekle', close: 'Kapat', next: 'İleri', back: 'Geri', confirm: 'Onayla',
      yes: 'Evet', no: 'Hayır',

      // Setup
      welcome: 'Hoş Geldin 👋',
      welcomeDesc: 'Servetim ile tüm varlıklarını tek yerde takip et. Basit, güvenli, tamamen senin.',
      selectLanguage: 'Dil Seçin',
      selectCurrency: 'Ana Para Birimi',
      currencyDesc: 'Uygulamada öncelikli hangi para birimini görmek istersin?',
      reminderDay: 'Hatırlatma Günü',
      reminderDayDesc: 'Her ayın kaçında varlıklarını güncellemeni hatırlayayım?',
      notificationsQuestion: 'Bildirim almak ister misin?',
      notificationsDesc: 'Ayda bir hatırlatma göndereceğim.',
      notificationsAllow: '📲 Evet, izin veriyorum',
      notificationsSkip: 'Şimdilik hayır',
      getStarted: 'Başla 🚀',
      stepOf: '/ 3',

      // Nav
      dashboard: 'Özet', history: 'Grafik', goals: 'Hedefler', settings: 'Ayarlar',

      // Dashboard
      totalNetWorth: 'Toplam Net Servet',
      thisMonth: 'Bu ay',
      vsLastMonth: 'Geçen aya göre',
      noHistory: 'Henüz kayıt yok',
      noHistoryDesc: 'Aylık güncelleme yapınca grafikler ve değişimler burada görünecek.',
      addFirstAsset: 'İlk Varlığını Ekle',
      addAsset: '+ Varlık Ekle',
      monthlyUpdate: '📊 Aylık Güncelleme',
      assetDistribution: 'Varlık Dağılımı',
      noAssets: 'Henüz varlık yok',
      noAssetsDesc: 'Banka hesabın, altının veya kripto portföyünü ekleyerek başla.',
      rate: 'Kur',
      rateStale: '(eski)',
      rateFallback: '(varsayılan)',

      // Categories
      bank: 'Banka / Nakit',
      gold: 'Altın',
      crypto: 'Kripto',
      property: 'Gayrimenkul / Diğer',

      // Asset form
      assetName: 'Varlık Adı',
      assetNamePlaceholder: 'Yapı Kredi, Gram Altın, Arsa...',
      category: 'Kategori',
      amount: 'Değer',
      currency: 'Para Birimi',
      note: 'Not',
      notePlaceholder: 'Miktar, detay, hatırlatma...',
      newAsset: 'Yeni Varlık',
      editAsset: 'Varlığı Düzenle',
      deleteAssetConfirm: 'Bu varlığı silmek istediğine emin misin?',

      // Goals
      addGoal: '+ Hedef Ekle',
      goalName: 'Hedef Adı',
      goalNamePlaceholder: 'Tatil Evi, Araba, Emeklilik...',
      targetAmount: 'Hedef Tutarı',
      targetDate: 'Hedef Tarihi',
      targetDateOptional: 'Hedef Tarihi (opsiyonel)',
      estimatedArrival: 'Tahmini Ulaşım',
      months: 'ay',
      noGoals: 'Henüz hedef yok',
      noGoalsDesc: 'Finansal hedeflerini belirleyerek ne kadar yaklaştığını izle.',
      newGoal: 'Yeni Hedef',
      editGoal: 'Hedefi Düzenle',
      deleteGoalConfirm: 'Bu hedefi silmek istediğine emin misin?',
      current: 'Mevcut',
      target: 'Hedef',
      progress: 'İlerleme',
      notEnoughData: 'Trend için yeterli veri yok',

      // Gamification
      level: 'Seviye',
      streak: 'Aylık Seri',
      streakMonths: 'ay',
      badges: 'Rozetler',
      noBadges: 'Henüz rozet yok — varlık ekleyerek başla!',
      badgeEarned: '🎉 Yeni Rozet!',
      levelUp: '🎊 Seviye Atladın!',

      // Monthly Update
      updateAssets: 'Aylık Güncelleme',
      updateDesc: 'Bu ayki varlık değerlerini gir. Gayrimenkuller geçen ayın değeriyle hazır geliyor.',
      updateSaveBtn: 'Güncellemeyi Kaydet',
      alreadyUpdated: 'Bu ay zaten güncelleme yaptın.',
      updateReminder: 'Varlıklarını güncelleme zamanı!',
      lastMonth: 'Geçen ay',

      // History
      historyTitle: 'Servet Tarihçesi',
      noHistoryChart: 'Grafik için en az 2 aylık veri gerekli',
      month: 'Ay', tryVal: 'TL Servet', usdVal: 'USD Servet', change: 'Değişim',
      monthsShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
      monthsFull: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],

      // Toast
      assetSaved: '✓ Varlık kaydedildi',
      assetDeleted: '✓ Varlık silindi',
      goalSaved: '✓ Hedef kaydedildi',
      goalDeleted: '✓ Hedef silindi',
      updateSaved: '✓ Güncelleme kaydedildi!',
      fillRequired: 'Lütfen zorunlu alanları doldur',
      invalidAmount: 'Geçerli bir tutar gir',
    },

    en: {
      appName: 'Servetim',
      save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
      add: 'Add', close: 'Close', next: 'Next', back: 'Back', confirm: 'Confirm',
      yes: 'Yes', no: 'No',

      welcome: 'Welcome 👋',
      welcomeDesc: 'Track all your assets in one place with Servetim. Simple, secure, and all yours.',
      selectLanguage: 'Select Language',
      selectCurrency: 'Base Currency',
      currencyDesc: 'Which currency do you prefer to see primarily?',
      reminderDay: 'Reminder Day',
      reminderDayDesc: 'Which day of the month should I remind you to update?',
      notificationsQuestion: 'Would you like notifications?',
      notificationsDesc: "I'll send a monthly reminder.",
      notificationsAllow: '📲 Yes, allow',
      notificationsSkip: 'Not now',
      getStarted: 'Get Started 🚀',
      stepOf: 'of 3',

      dashboard: 'Overview', history: 'Chart', goals: 'Goals', settings: 'Settings',

      totalNetWorth: 'Total Net Worth',
      thisMonth: 'This month',
      vsLastMonth: 'vs last month',
      noHistory: 'No records yet',
      noHistoryDesc: 'Charts and changes will appear here after your first monthly update.',
      addFirstAsset: 'Add Your First Asset',
      addAsset: '+ Add Asset',
      monthlyUpdate: '📊 Monthly Update',
      assetDistribution: 'Asset Distribution',
      noAssets: 'No assets yet',
      noAssetsDesc: 'Add your bank account, gold, or crypto portfolio to get started.',
      rate: 'Rate',
      rateStale: '(cached)',
      rateFallback: '(fallback)',

      bank: 'Bank / Cash',
      gold: 'Gold',
      crypto: 'Crypto',
      property: 'Real Estate / Other',

      assetName: 'Asset Name',
      assetNamePlaceholder: 'Bank Account, Gold, Property...',
      category: 'Category',
      amount: 'Value',
      currency: 'Currency',
      note: 'Note',
      notePlaceholder: 'Quantity, details, reminder...',
      newAsset: 'New Asset',
      editAsset: 'Edit Asset',
      deleteAssetConfirm: 'Are you sure you want to delete this asset?',

      addGoal: '+ Add Goal',
      goalName: 'Goal Name',
      goalNamePlaceholder: 'Holiday Home, Car, Retirement...',
      targetAmount: 'Target Amount',
      targetDate: 'Target Date',
      targetDateOptional: 'Target Date (optional)',
      estimatedArrival: 'Estimated Arrival',
      months: 'months',
      noGoals: 'No goals yet',
      noGoalsDesc: 'Set financial goals and track how close you are.',
      newGoal: 'New Goal',
      editGoal: 'Edit Goal',
      deleteGoalConfirm: 'Are you sure you want to delete this goal?',
      current: 'Current',
      target: 'Target',
      progress: 'Progress',
      notEnoughData: 'Not enough data for trend',

      level: 'Level',
      streak: 'Monthly Streak',
      streakMonths: 'months',
      badges: 'Badges',
      noBadges: "No badges yet — add an asset to start!",
      badgeEarned: '🎉 New Badge!',
      levelUp: '🎊 Level Up!',

      updateAssets: 'Monthly Update',
      updateDesc: "Enter this month's asset values. Real estate comes pre-filled from last month.",
      updateSaveBtn: 'Save Update',
      alreadyUpdated: 'You already updated this month.',
      updateReminder: "Time to update your assets!",
      lastMonth: 'Last month',

      historyTitle: 'Net Worth History',
      noHistoryChart: 'At least 2 months of data needed for the chart',
      month: 'Month', tryVal: 'TRY Net Worth', usdVal: 'USD Net Worth', change: 'Change',
      monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      monthsFull: ['January','February','March','April','May','June','July','August','September','October','November','December'],

      assetSaved: '✓ Asset saved',
      assetDeleted: '✓ Asset deleted',
      goalSaved: '✓ Goal saved',
      goalDeleted: '✓ Goal deleted',
      updateSaved: '✓ Update saved!',
      fillRequired: 'Please fill in required fields',
      invalidAmount: 'Enter a valid amount',
    }
  },

  t(key) {
    return this.strings[this.current]?.[key] ?? this.strings['tr'][key] ?? key;
  },

  setLanguage(lang) {
    this.current = lang;
    document.documentElement.lang = lang;
  }
};