# Kapora ve Dekont Onay Akışı

Sürüm 2.1.0 ile eklendi. Amaç: **misafir kaporayı yatırmadan ve dekontu misafirhane
müdürü onaylamadan rezervasyon listesine girememeli, yatak tahsis edilememeli.**

## 1. Akış

```
  Talep açılır (resepsiyon / müdür)
        │  kapora tutarı kurala göre hesaplanır
        ▼
  Kapora Bekleniyor  ──────────────── son ödeme tarihi geçerse ──▶  İptal
        │                                                          (yatak serbest)
        │ misafir kaporayı yatırır, dekont sisteme yüklenir
        ▼
  Müdür Onayı Bekliyor
        │                        ╲ müdür reddeder (gerekçeli)
        │ müdür onaylar           ╲
        ▼                          ▶  Kapora Bekleniyor  (yeni dekont beklenir)
  Onaylı  ──▶  Konaklıyor  ──▶  Çıkış
   └── yatak tahsisi ancak bu aşamadan sonra yapılabilir
```

Kurum misafirinde (`kurum_sahis = KURUM`) ve protokol kayıtlarında kapora aranmaz;
bu kayıtlar doğrudan Onaylı olur ve yerleştirmeye açıktır.

## 2. Kapora tutarı

Tesis bazında tanımlanır (Peşinat ve Tahsilat sayfası → **⚙ Peşinat Kuralı**):

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `kaporaTuru` | `GECE` | `GECE`: ilk N gecenin yatak bedeli · `ORAN`: toplam bedelin yüzdesi |
| `kaporaGece` | 1 | `GECE` seçiliyken kaç gecelik bedel alınır |
| `sahisOran` | %30 | `ORAN` seçiliyken uygulanan yüzde |
| `sahisAsgariTutar` | 750 ₺ | Hesap bu tutarın altına düşmez |
| `odemeSuresiGun` | 7 | Talep tarihinden itibaren ödeme süresi |
| `gelistenOnceEnGecGun` | 2 | Gelişten en geç kaç gün önce yatırılmalı |
| `kurumMisafirindePesinatAranmasin` | açık | Kurum misafirinde kapora aranmaz |
| `mudurOnayiZorunlu` | açık | Kapalıyken onay beklenmeden yerleştirme yapılabilir |

Son ödeme tarihi = **min**(rezerv tarihi + `odemeSuresiGun`, geliş tarihi − `gelistenOnceEnGecGun`).

Örnek: 5 gecelik konaklama, gecelik 750 ₺ → toplam 3.750 ₺; `kaporaTuru=GECE`,
`kaporaGece=1` ise kapora **750 ₺**.

## 3. Dekont

Dekont, kaydın `dekont` alanında tutulur:

| Alan | Açıklama |
|---|---|
| `banka`, `dekont_no`, `odeme_tarihi`, `tutar` | Ödeme bilgileri (müdürün ekranda gördüğü özet) |
| `dosya_adi`, `tur`, `boyut`, `icerik` | Yüklenen dosya (PDF/PNG/JPEG, en çok 5 MB; `icerik` base64 veri adresi) |
| `yukleyen`, `yuklenme_tarihi` | Kim, ne zaman yükledi |
| `durum` | `YUKLENDI` · `ONAYLANDI` · `REDDEDILDI` |
| `onaylayan`, `onay_tarihi` | Onaylayan/reddeden kullanıcı ve tarihi |
| `red_gerekcesi` | Reddedildiyse gerekçe (misafire iletilir) |

Prototipte demo kayıtların dekontları, açılabilir gerçek birer PDF olarak **görüntüleme
anında üretilir** (`dekontPdfUret`); gerçek yüklenen dosyalar `icerik` alanında saklanır.
Üretilen demo dekontlar «demo» rozetiyle işaretlidir.

## 4. Yetkiler

| Yetki | Admin | Müdür | Resepsiyon | Muhasebe |
|---|:-:|:-:|:-:|:-:|
| `rezervasyon.dekont` — dekont yükleme | ✓ | ✓ | ✓ | ✓ |
| `rezervasyon.onay` — dekontu onaylama/reddetme | ✓ | ✓ | — | — |
| `rezervasyon.yerlestir` — yatak tahsisi | ✓ | ✓ | ✓ | — |
| `pesinat.kural` — kapora kuralını değiştirme | ✓ | ✓ | — | — |

Resepsiyon ve muhasebe dekontu yükleyebilir ve görebilir, ancak **onaylayamaz**;
onay düğmeleri pasiftir ve gerekçesi ipucunda yazar.

## 5. Yerleştirme kısıtı

`yerlesmeyeUygun(rz, kural)` kuralı üç yerde birden uygulanır:

1. **Otomatik yerleştirme** — uygun olmayan talepler motora hiç verilmez, öneri
   penceresinde gerekçesiyle «yerleştirilemeyenler» listesinde çıkar.
2. **Manuel yerleştirme penceresi** — kaydetme engellenir, gerekçe gösterilir.
3. **Haritada sürükle-bırak / tıklayarak yerleştirme** — uyarı verilir, işlem yapılmaz.

Gerekçe metinleri:
- `Kapora (750 ₺) yatırılıp dekontu onaylanmadan yatak tahsis edilemez.`
- `Kapora dekontu müdür onayında (1.500 ₺); onaylanmadan yatak tahsis edilemez.`

## 6. Ekran

**MSFH-W06 — Dekont ve Onay** (menüde «Dekont/Onay»):
- Üstte üç sayaç: Onay Bekleyen (toplam kapora tutarıyla), Onaylanan, Reddedilen.
- Solda dekont listesi, sağda seçili kaydın özeti ve **PDF önizlemesi** (yeni sekmede
  de açılabilir).
- Yatırılan tutar istenen kaporanın altındaysa uyarı şeridi çıkar.
- «✓ Onayla ve Rezervasyon Listesine Al» / «Reddet» (gerekçe zorunlu).

Rezervasyon Talepleri sayfasında her kaydın kapora durumu sütunda görünür
(`750 ₺ ✓` onaylı, `⏳` onayda, `⛔` reddedildi, `—` dekont yok) ve seçili talebin
altında dekont şeridi ile «Dekont Yükle / Dekontu Gör» düğmeleri bulunur.

## 7. Oracle tarafı için ek tablo

**MSFH_DEKONT**

| Alan | Tip | Açıklama |
|---|---|---|
| `DEKONT_ID` | NUMBER PK | |
| `REZ_ID` | NUMBER FK | MSFH_REZERVASYON |
| `BANKA` | VARCHAR2(60) | |
| `DEKONT_NO` | VARCHAR2(40) | Banka referans numarası |
| `ODEME_TARIHI` | DATE | |
| `TUTAR` | NUMBER(10,2) | Yatırılan kapora |
| `DOSYA_ADI` | VARCHAR2(200) | |
| `ICERIK_TURU` | VARCHAR2(60) | application/pdf, image/png … |
| `DOSYA` | BLOB | Dekont belgesi |
| `DURUM` | VARCHAR2(20) | YUKLENDI / ONAYLANDI / REDDEDILDI |
| `YUKLEYEN`, `YUKLENME_TARIHI` | VARCHAR2(20), DATE | |
| `ONAYLAYAN`, `ONAY_TARIHI` | VARCHAR2(20), DATE | |
| `RED_GEREKCESI` | VARCHAR2(400) | |

API uçları:

```http
POST   /rezervasyonlar/{rezId}/dekont        (multipart: dosya + banka, dekontNo, tutar, odemeTarihi)
→ 201  { "dekontId":9912, "durum":"YUKLENDI", "statu":"ONAY_BEKLIYOR" }

GET    /rezervasyonlar/{rezId}/dekont        → meta veri
GET    /rezervasyonlar/{rezId}/dekont/dosya  → belgenin kendisi (PDF/görsel)

POST   /rezervasyonlar/{rezId}/dekont/onay   { "aciklama":"" }
→ 200  { "statu":"ONAYLI", "tahsilEdilen":750 }
→ 403  { "hata":"YETKI_YOK" }                 // rezervasyon.onay yetkisi yok

POST   /rezervasyonlar/{rezId}/dekont/red    { "gerekce":"Tutar eksik" }
→ 200  { "statu":"PESINAT_BEKLENIYOR", "dekontDurumu":"REDDEDILDI" }

GET    /tesisler/{kod}/dekontlar?durum=YUKLENDI   // müdürün onay kuyruğu
```

Sunucu, yatak tahsisi uçlarında (`/yerlestirme/uygula`, `PUT …/yatak`) kapora onayını
**tekrar denetlemelidir**; prototipteki denetim yalnız arayüz seviyesindedir.
Yetkisiz veya onaysız istek `409 KAPORA_ONAYI_YOK` döner.
