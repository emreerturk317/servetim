# Servetim — Kişisel Birikim Takip Uygulaması
### Ürün Tasarım Dokümanı · v1.1

---

## 📌 Genel Bakış

**Servetim**, kullanıcıların tüm varlıklarını tek bir yerde takip etmesini, ay ay gelişimini görmesini ve finansal hedeflerine motive olarak ulaşmasını sağlayan bir PWA (Progressive Web App) uygulamasıdır. Telefona uygulama olarak yüklenebilir, internet bağlantısı olmadan da çalışır.

**Temel Felsefe:** Uygulama mümkün olduğunca az dış bağımlılık kullanır. Varlık değerleri (altın, kripto, gayrimenkul) kullanıcı tarafından manuel girilir — kullanıcı kendi bildiği güncel fiyatı yazar. Uygulama yalnızca **USD/TRY döviz kurunu** otomatik çeker; tüm diğer çevrimler bu tek veriyle yapılır.

---

## 🗺️ Uygulama Akışı

```
İlk Açılış
    │
    ▼
Karşılama Ekranı → Dil Seçimi (TR / EN)
    │
    ▼
Para Birimi Seçimi (TL / USD / EUR / GBP ...)
    │
    ▼
İlk Varlık Girişi
    │
    ├─► Banka / Nakit
    ├─► Altın
    ├─► Kripto
    └─► Gayrimenkul / Diğer
    │
    ▼
Ana Ekran (Dashboard)
    │
    ├─► Varlıklar Sekmesi
    ├─► Grafik / Tarihçe Sekmesi
    └─► Hedefler Sekmesi
```

---

## 📱 Ekranlar ve İçerikleri

### 1. Karşılama & Kurulum Ekranı
- Uygulama adı ve kısa açıklama
- Dil seçimi: 🇹🇷 Türkçe / 🇬🇧 English
- Ana para birimi seçimi
- Bildirim günü tercihi (Ayın kaçında hatırlatılsın?)

---

### 2. Ana Ekran (Dashboard)

#### Üst Panel — Net Servet Kartı
```
┌─────────────────────────────────┐
│  Toplam Net Servet              │
│  ₺ 3.050.000                   │
│  $ 89.400  ▲ +%4.2 bu ay       │
│                                 │
│  [Geçen Aya Göre: +₺120.000]   │
└─────────────────────────────────┘
```

#### Varlık Dağılımı
Pasta / halka grafik ile varlık kategorilerinin yüzdesi:
- 🏦 Banka & Nakit — %58
- 🥇 Altın — %12
- ₿ Kripto — %11
- 🏠 Gayrimenkul — %19

#### Hızlı Varlık Listesi
Her varlık için:
- İkon + İsim
- TL değeri
- USD karşılığı
- Aylık değişim (▲/▼ ve yüzde)

---

### 3. Varlık Girişi & Düzenleme

> ℹ️ **Temel kural:** Her varlık için kullanıcı **TL mi yoksa USD mi** girdiğini seçer. Uygulama güncel USD/TRY kuru ile diğer karşılığı otomatik hesaplar. Hiçbir varlık kategorisinde fiyat otomatik çekilmez.

#### Tüm Kategoriler İçin Ortak Alanlar
| Alan | Açıklama |
|------|----------|
| Varlık Adı | Serbest metin ("Yapı Kredi", "Gram Altın", "Arsa" vb.) |
| Kategori | Banka/Nakit · Altın · Kripto · Gayrimenkul/Diğer |
| Değer | Sayısal giriş |
| Para Birimi | **TL** veya **USD** (kullanıcı seçer) |
| Not *(opsiyonel)* | Serbest metin — miktar, detay, hatırlatma amaçlı |

#### Kategori Örnekleri

**🏦 Banka / Nakit**
- Değer: `1.500.000` · Para Birimi: `TL`
- Not: *(boş bırakılabilir)*

**🥇 Altın**
- Değer: `185.000` · Para Birimi: `TL`
- Not: `2 gram altın, 3 çeyrek, 1 cumhuriyet`
> Altın miktarını not alanına yazar, toplam güncel TL değerini girer. Fiyatı kendisi hesaplar veya sarraftan öğrenir.

**₿ Kripto**
- Değer: `27.500` · Para Birimi: `USD`
- Not: `0.5 BTC, Binance`
> Portföyün anlık USD değerini Binance'tan bakıp girer.

**🏠 Gayrimenkul / Araç / Diğer**
- İsim: `Ankara Arsa` *(zorunlu — bir sonraki ay tanımak için)*
- Değer: `24.000` · Para Birimi: `USD`
- Not: `500m², tapulu`

> **Gayrimenkul & Araç İçin Özel Davranış:**
> Bu kategorideki varlıkların değeri her ay otomatik olarak **bir önceki ayın değeriyle önceden doldurulur.** Kullanıcı aylık güncelleme ekranına geldiğinde gayrimenkullerini listede hazır görür; değer değişmediyse dokunmadan geçer, değiştiyse ilgili varlığa tıklayıp yeni değeri girer.
>
> Güncelleme akışı:
> 1. Güncelleme ekranı açılır → gayrimenkuller önceki değerleriyle listelenir
> 2. Her varlığın yanında küçük bir ✏️ ikonu bulunur
> 3. İkona dokunulursa değer düzenleme alanı açılır; dokunulmadan geçilirse eski değer korunur
> 4. "Kaydet" denildiğinde güncellenen veya korunan değer o ayın kaydına işlenir

---

### 4. Grafik & Tarihçe Ekranı

#### Zaman Serisi Grafiği
- X ekseni: Aylar (Oca, Şub, Mar...)
- Y ekseni: Toplam servet (TL ve/veya USD)
- İki çizgi: TL değeri + USD değeri
- Noktalara tıklayınca o ayın detayı açılır

#### Aylık Özet Tablosu
```
Ay         TL Servet    USD Servet   Değişim
────────────────────────────────────────────
Ocak 25    ₺2.930.000   $85.500      —
Şubat 25   ₺2.980.000   $87.100      ▲ +%1.7
Mart 25    ₺3.050.000   $89.400      ▲ +%2.6
```

#### Varlık Kategorisi Trendi
Seçili kategorinin zaman içindeki seyri (kategori bazlı filtre)

---

### 5. Hedefler Ekranı

#### Hedef Kartı
```
┌──────────────────────────────────────┐
│  🎯 Tatil Evi                        │
│  Hedef: $100.000                     │
│                                      │
│  [████████████░░░░░░░░]  62%         │
│  Mevcut: $89.400 / $100.000          │
│                                      │
│  Tahmini Ulaşım: ~4 ay               │
│  (aylık ortalama +$1.650 artışla)    │
└──────────────────────────────────────┘
```

#### Hedef Özellikleri
- Hedef adı (serbest metin)
- Hedef tutarı + para birimi
- Başlangıç tarihi (otomatik: oluşturulma tarihi)
- Hedef tarihi (opsiyonel son tarih)
- Aylık artış trendi baz alınarak **otomatik tahmin**

---

### 6. Bildirim & Güncelleme

- Kullanıcının seçtiği günde (örn: "ayın 1'i") yerel bildirim
- Bildirim metni: *"Merhaba! Bu ay varlıklarını güncelleme zamanı 📊"*
- Bildirime tıklayınca doğrudan güncelleme ekranı açılır
- Güncelleme geçmişi tutulur (tarih damgalı)

> ⚠️ Bildirimler için kullanıcıdan izin alınır. İzin verilmezse uygulama içi hatırlatma gösterilir.

---

## 🎮 Oyunlaştırma Sistemi

### Rozetler (Badges)
| Rozet | Koşul |
|-------|-------|
| 🌱 İlk Adım | İlk varlığı girdi |
| 📅 Düzenli | 3 ay üst üste güncelledi |
| 🔥 Momentum | 6 ay üst üste güncelledi |
| 💰 10K Dolar | Net servet $10.000'i geçti |
| 🚀 50K Dolar | Net servet $50.000'i geçti |
| 💎 100K Dolar | Net servet $100.000'i geçti |
| 📈 Büyüme | 3 ay üst üste servet arttı |
| 🎯 Hedefe Yarı Yol | Herhangi bir hedefin %50'sine ulaşıldı |
| 🏆 Hedef Tamamlandı | Herhangi bir hedef gerçekleşti |

### Streak Sayacı
```
🔥 4 Aylık Seri!
"4 aydır düzenli güncelliyorsun. Böyle devam!"
```

### Seviye Sistemi
| Seviye | İsim | Kriter |
|--------|------|--------|
| 1 | 🌱 Filiz | Kayıt oldu |
| 2 | 🪴 Büyüyen | İlk 3 ay tamamlandı |
| 3 | 🌳 Güçlü | 6 ay + servet artışta |
| 4 | 💫 Zenginleşen | $25K+ servet |
| 5 | 👑 Usta Birikimci | Bir hedef tamamlandı |

### Hedef Yaklaşma Animasyonu
- %25, %50, %75, %100 geçildiğinde **konfeti animasyonu**
- "Hedefe 1 ay kaldı!" bildirimi

---

## 🔌 API Entegrasyonu

Uygulama yalnızca **tek bir API** kullanır:

### USD/TRY Döviz Kuru
- **Kaynak:** `https://api.exchangerate-api.com/v4/latest/USD` (ücretsiz, kayıt gerektirmez)
- **Güncelleme:** Uygulama her açıldığında
- **Önbellek:** 6 saat — aynı gün tekrar açılırsa yeni istek atmaz
- **Fallback:** API erişilemezse son kaydedilen kur kullanılır, kullanıcıya bilgi gösterilir

**Bu tek veriyle yapılan tüm hesaplamalar:**
- USD cinsinden girilen varlık → TL karşılığı
- TL cinsinden girilen varlık → USD karşılığı
- Toplam net servetin her iki para biriminde gösterimi
- Hedef ilerleme hesabı (TL hedef ↔ USD hedef karşılaştırması)

---

## 💾 Veri Saklama

Tüm veriler **localStorage** üzerinde saklanır — sunucu yok, hesap yok, gizlilik tam.

```json
{
  "settings": {
    "language": "tr",
    "currency": "TRY",
    "reminderDay": 1,
    "notificationsEnabled": true
  },
  "exchangeRate": {
    "usdTry": 38.45,
    "fetchedAt": "2025-03-10T08:00:00Z"
  },
  "assets": [
    {
      "id": "abc123",
      "category": "bank",
      "name": "Yapı Kredi",
      "amount": 1500000,
      "currency": "TRY",
      "note": ""
    },
    {
      "id": "def456",
      "category": "gold",
      "name": "Altınlarım",
      "amount": 185000,
      "currency": "TRY",
      "note": "2 gram, 3 çeyrek, 1 cumhuriyet"
    },
    {
      "id": "ghi789",
      "category": "crypto",
      "name": "Binance",
      "amount": 27500,
      "currency": "USD",
      "note": "0.5 BTC"
    },
    {
      "id": "jkl012",
      "category": "property",
      "name": "Ankara Arsa",
      "amount": 24000,
      "currency": "USD",
      "note": "500m², tapulu",
      "lastUpdated": "2025-02-01"
    }
  ],
  "history": [
    {
      "date": "2025-03-01",
      "totalTRY": 3050000,
      "totalUSD": 89400,
      "usdTryRate": 38.45,
      "snapshot": [...]
    }
  ],
  "goals": [
    {
      "id": "goal001",
      "name": "Tatil Evi",
      "targetAmount": 100000,
      "targetCurrency": "USD",
      "createdAt": "2025-01-01",
      "targetDate": "2026-01-01"
    }
  ],
  "badges": ["first_asset", "3_month_streak"],
  "level": 3
}
```

---

## 🎨 Tasarım Kararları

| Konu | Karar |
|------|-------|
| Tema | Açık, minimalist — krem/beyaz zemin, yeşil vurgular |
| Tipografi | Playfair Display (başlıklar) + Nunito (içerik) |
| Renk Paleti | #fafaf8 (bg), #2d6a4f (yeşil), #b5860d (altın), #1a5276 (mavi) |
| İkonlar | Emoji bazlı (bağımlılık yok) |
| Animasyonlar | Hafif geçişler, hedef ulaşımında konfeti |
| Grafik Kütüphanesi | Chart.js (CDN, hafif) |

---

## ✅ MVP Özellikleri (İlk Sürüm)

- [x] Çok dilli destek (TR/EN)
- [x] Varlık girişi — TL veya USD seçimiyle, not alanıyla (4 kategori)
- [x] Sadece USD/TRY kuru otomatik çekilir (tek API)
- [x] TL ↔ USD anlık çevrimi
- [x] Aylık servet kaydı (tarih + kur damgalı)
- [x] Çizgi grafik (TL ve USD tarihçesi)
- [x] Hedef tanımlama & ilerleme çubuğu
- [x] Rozet & seviye sistemi
- [x] Android PWA desteği
- [x] Bildirim hatırlatması

---

## 🚀 Gelecek Sürüm Fikirleri

- [ ] İhracat: PDF/Excel raporu
- [ ] Şifre / biyometrik kilit
- [ ] Aile/ortak hesap desteği
- [ ] Bütçe takibi (gelir-gider)
- [ ] Enflasyon düzeltmeli reel servet gösterimi
- [ ] Hisse senedi desteği (BIST, NYSE)
- [ ] Varlık bazlı tavsiyeler (AI destekli)

---

*Belge Tarihi: Mart 2025 · Servetim v1.1*
