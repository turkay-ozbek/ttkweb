# Oracle Veritabanı Tablo/Alan Listesi ve API Sözleşmesi Taslağı

Bu belge, prototipin mevcut TTKNET (Oracle Forms / Oracle DB) ortamına
bağlanabilmesi için gereken **veri sözleşmesini** tanımlar. Mevcut şema elimizde
olmadığından tablo ve alan adları, MSFH0100 / MSFH0350 / MSFH0030 ekranlarındaki
alan adlarından türetilmiştir; **kurulum öncesi TTK Bilgi İşlem Şube Müdürlüğü
ile eşleştirilmelidir.** Amaç, prototipin hangi veriyi hangi biçimde beklediğini
net göstermektir.

## 1. Mimari yaklaşım

Prototip mevcut sisteme dokunmadan yanında çalışır:

```
Oracle Forms (MSFH0100/0350/0030)  ─┐
                                    ├─► Oracle DB (MSFH şeması)
Web Prototip (React)  ──► REST API ─┘
                          (ORDS veya .NET/Java servis katmanı)
```

- **Okuma** doğrudan mevcut tablolardan / view'lardan yapılır.
- **Yazma** yalnız PL/SQL paketleri üzerinden yapılır; iş kuralları (yatak
  çakışması, statü geçişi) veritabanında tek noktada kalır.
- Web tarafı için **yeni alanlar** (statü, peşinat süresi, cinsiyet, protokol,
  aile) mevcut tabloları bozmadan ek tablolarda veya yeni kolonlarda tutulabilir.

## 2. Tablolar ve alanlar

### 2.1 MSFH_MISAFIRHANE — Tesis tanımı (mevcut)

| Alan | Tip | Açıklama |
|---|---|---|
| `MISAFIRHANE_KODU` | VARCHAR2(10) PK | YAYLA / ANKARA / AMASRA / ARMUTCUK |
| `MISAFIRHANE_ADI` | VARCHAR2(60) | Ekran başlığındaki ad |
| `SEHIR` | VARCHAR2(30) | |
| `AKTIF_MI` | CHAR(1) | E/H |

### 2.2 MSFH_ODA — Oda tanımı (mevcut)

| Alan | Tip | Açıklama |
|---|---|---|
| `ODA_ID` | NUMBER PK | |
| `MISAFIRHANE_KODU` | VARCHAR2(10) FK | |
| `ODA_NO` | NUMBER | MSFH0100/0350'deki "Oda No" |
| `KAT` | NUMBER | |
| `ODA_TIPI` | VARCHAR2(10) | TEK / CIFT / UCLU |
| `YATAK_SAYISI` | NUMBER | |
| `YATAK_FIYATI` | NUMBER(10,2) | MSFH0100'deki "Yatak Fiyatı" |
| `PROTOKOL_MU` | CHAR(1) | **yeni** — protokol odası işareti |
| `TEMIZLIK_GUN` | NUMBER | **yeni** — çıkış sonrası blok süresi (varsayılan 1) |

### 2.3 MSFH_YATAK — Yatak tanımı (mevcut)

| Alan | Tip | Açıklama |
|---|---|---|
| `YATAK_ID` | NUMBER PK | |
| `ODA_ID` | NUMBER FK | |
| `YATAK_NO` | NUMBER | MSFH0100'deki "Yatak No" |
| `KULLANIM_DISI_MI` | CHAR(1) | Arıza/bakım |

### 2.4 MSFH_REZERVASYON — Rezervasyon başlığı (MSFH0350 sol liste)

| Alan | Tip | Kaynak / Açıklama |
|---|---|---|
| `REZ_ID` | NUMBER PK | |
| `REZ_NO` | VARCHAR2(20) | Kullanıcıya gösterilen numara |
| `MISAFIRHANE_KODU` | VARCHAR2(10) FK | |
| `REZERV_EDEN_ADI` | VARCHAR2(100) | "Adı Soyadı" (rezerv eden) |
| `REZERV_TARIHI` | DATE | "Rezerv edilen Tarih" |
| `ACIKLAMA` | VARCHAR2(200) | "Açıklama" (200 karakter sınırı mevcut) |
| `TEL_NO` | VARCHAR2(20) | "Tel No" |
| `KISI_SAYISI` | NUMBER | "Kişi" |
| `GUN_SAYISI` | NUMBER | "Gün" |
| `GELIS_TARIHI` | DATE | MSFH0100 "Geliş Tarihi" |
| `CIKIS_TARIHI` | DATE | MSFH0100 "Çıkış Tarihi" |
| `ONCEKI_CIKIS_TARIHI` | DATE | **yeni** — uzatma öncesi tarih |
| `KURUM_SAHIS` | VARCHAR2(10) | MSFH0100 "Kurum-Şahıs" |
| `ODEYECEK` | VARCHAR2(120) | MSFH0100 "Ödeyecek" |
| `ODEME_TURU` | VARCHAR2(5) | KRT / NKT / MSD / BOS |
| `GELIS_NEDENI` | VARCHAR2(30) | MSFH0100 "Geliş nedeni" |
| `PLAKA_NO` | VARCHAR2(15) | MSFH0100 "Plaka No" |
| `PROTOKOL_MU` | CHAR(1) | **yeni** |
| `AILE_MI` | CHAR(1) | **yeni** — birlikte kalma talebi |
| `STATU` | VARCHAR2(20) | **yeni** — TALEP / PESINAT_BEKLENIYOR / ONAYLI / KONAKLIYOR / CIKIS / IPTAL |
| `KAYIT_YAPAN` | VARCHAR2(20) | MSFH0100 "Kayıt Yapan" (ör. TTK7719) |
| `KAYIT_TARIHI` | DATE | |

### 2.5 MSFH_REZ_MISAFIR — Rezervasyondaki kişiler (MSFH0100 kayıt satırı)

| Alan | Tip | Kaynak / Açıklama |
|---|---|---|
| `REZ_MISAFIR_ID` | NUMBER PK | |
| `REZ_ID` | NUMBER FK | |
| `TC_KIMLIK_NO` | VARCHAR2(11) | "Tc Kimlik No" (yabancılarda sanal TC) |
| `ADI_SOYADI` | VARCHAR2(100) | "Adı ve Soyadı" |
| `CINSIYET` | CHAR(1) | **yeni** — E/K, oda tahsisi için zorunlu |
| `SICIL_NO` | VARCHAR2(10) | "Sicil No" |
| `GOREV_SEVK_NO` | VARCHAR2(20) | "Görev Sevk No" |
| `HARCIRAH_MIKTARI` | NUMBER(10,2) | "Harcırah Miktarı" |
| `BIRIM` | VARCHAR2(80) | Kurum çalışanının birimi |
| `ODA_ID` / `YATAK_ID` | NUMBER FK | Tahsis edilen yatak (boş ise yerleşmemiş) |
| `TAHSIS_TARIHI` | DATE | |
| `TAHSIS_TIPI` | VARCHAR2(10) | **yeni** — OTOMATIK / MANUEL |

> Not: Tahsis **oda değil yatak** seviyesindedir; aynı odada farklı
> rezervasyonlara ait misafirler bulunabilir.

### 2.6 MSFH_PESINAT — Peşinat ve tahsilat (MSFH0100 "Peşinatlar")

| Alan | Tip | Açıklama |
|---|---|---|
| `PESINAT_ID` | NUMBER PK | |
| `REZ_ID` | NUMBER FK | |
| `PESINAT_TUTARI` | NUMBER(10,2) | Talep edilen peşinat |
| `SON_ODEME_TARIHI` | DATE | **yeni** — süre takibi |
| `TAHSIL_EDILEN` | NUMBER(10,2) | |
| `PESINATTAN_KALAN` | NUMBER(10,2) | MSFH0350 "Peşinat Kalan" |
| `MAKBUZ_NO` | VARCHAR2(20) | MSFH0030 "Makbuz No" |
| `TAHSILAT_TARIHI` | DATE | |

### 2.7 MSFH_PESINAT_KURAL — Peşinat kuralı (yeni, tesis bazında)

| Alan | Tip | Açıklama |
|---|---|---|
| `MISAFIRHANE_KODU` | VARCHAR2(10) PK | |
| `KURUM_PESINAT_ARANMASIN` | CHAR(1) | E/H |
| `SAHIS_ORAN` | NUMBER(5,2) | Yatak bedelinin yüzdesi |
| `SAHIS_ASGARI_TUTAR` | NUMBER(10,2) | |
| `ODEME_SURESI_GUN` | NUMBER | Talep tarihinden itibaren |
| `GELISTEN_ONCE_EN_GEC_GUN` | NUMBER | |

### 2.8 MSFH_REZ_HAREKET — Kayıt hareketleri (yeni, denetim izi)

| Alan | Tip | Açıklama |
|---|---|---|
| `HAREKET_ID` | NUMBER PK | |
| `REZ_ID` | NUMBER FK | |
| `HAREKET_TARIHI` | DATE | |
| `ESKI_STATU` / `YENI_STATU` | VARCHAR2(20) | |
| `ACIKLAMA` | VARCHAR2(400) | "Peşinat süresi doldu — otomatik iptal" gibi |
| `KULLANICI` | VARCHAR2(20) | TTK7719 / SİSTEM |

### 2.9 Mevcut ancak prototip kapsamı dışındaki tablolar

`MSFH_SARTNAME`, `MSFH_SARTNAME_MAKBUZ` (MSFH0030), `MSFH_SAHSI_MASRAF`,
`MSFH_TAHSILAT_FATURA`, `MSFH_MISAFIR_BEYAN` — prototipte modellenmemiştir;
API sözleşmesine v2'de eklenir.

## 3. Önerilen view'lar

```sql
-- Yatak-gece doluluk matrisi (pano ve yerleştirme motorunun ana girdisi)
CREATE OR REPLACE VIEW MSFH_V_YATAK_GECE AS
SELECT rm.YATAK_ID, y.ODA_ID, o.MISAFIRHANE_KODU, o.ODA_NO, y.YATAK_NO,
       g.GECE_TARIHI, r.REZ_ID, r.STATU, rm.TC_KIMLIK_NO, rm.ADI_SOYADI,
       CASE WHEN g.GECE_TARIHI = r.CIKIS_TARIHI THEN 'TEMIZLIK' ELSE 'DOLU' END AS DURUM
  FROM MSFH_REZERVASYON r
  JOIN MSFH_REZ_MISAFIR rm ON rm.REZ_ID = r.REZ_ID
  JOIN MSFH_YATAK y        ON y.YATAK_ID = rm.YATAK_ID
  JOIN MSFH_ODA   o        ON o.ODA_ID   = y.ODA_ID
  JOIN TABLE(MSFH_PKG_TAKVIM.GECELER(r.GELIS_TARIHI,
             r.CIKIS_TARIHI + NVL(o.TEMIZLIK_GUN,1))) g ON 1=1
 WHERE r.STATU <> 'IPTAL';
```

## 4. REST API sözleşmesi

Taban yol: `/api/misafirhane/v1`. Kimlik doğrulama TTKNET oturumu üzerinden
(Bearer token). Tüm tarihler **ISO 8601 (YYYY-MM-DD)** taşınır; GG.AA.YYYY
biçimlendirmesi yalnız arayüzdedir. Tutarlar `number` (TL).

### 4.1 Tanım uçları

```http
GET /tesisler
→ 200 [ { "kod":"ANKARA", "ad":"Ankara Misafirhanesi", "sehir":"Ankara",
          "odaSayisi":40, "yatakSayisi":80 } ]

GET /tesisler/{kod}/odalar
→ 200 [ { "odaId":1201, "odaNo":17, "kat":1, "tip":"CIFT", "yatakFiyati":750,
          "protokolMu":false, "temizlikGun":1,
          "yataklar":[ {"yatakId":3401,"yatakNo":1},{"yatakId":3402,"yatakNo":2} ] } ]
```

### 4.2 Doluluk panosu (Ekran 1)

```http
GET /tesisler/{kod}/doluluk?bas=2026-09-14&son=2026-10-14
→ 200 {
    "kapasite": 80,
    "gunler": [
      { "tarih":"2026-09-14", "dolu":47, "bos":17, "temizlik":16,
        "giris":18, "cikis":20, "oran":59 }
    ]
  }

GET /tesisler/{kod}/yatak-haritasi?tarih=2026-09-14
→ 200 [ { "odaNo":17, "yatakNo":1, "durum":"DOLU",
          "rezId":8841, "tcKimlikNo":"18439451522", "adiSoyadi":"GONCA AÇIKALIN",
          "gelisTarihi":"2026-09-12", "cikisTarihi":"2026-09-16",
          "odemeTuru":"KRT", "pesinattanKalan":1500 } ]
          // durum: BOS | DOLU | REZERVE | CIKIS_BEKLIYOR | TEMIZLIK

GET /tesisler/{kod}/kalan-yatak?bas=2026-09-15&son=2026-09-21
→ 200 { "gece":6, "garantiKalan":13, "ortalamaKalan":19,
        "kesintisizMusaitYatak":7, "tekKisilikMusait":2,
        "enDarGece": { "tarih":"2026-09-16", "bos":13 } }
```

### 4.3 Rezervasyon ve yerleştirme (Ekran 2)

```http
GET /tesisler/{kod}/rezervasyonlar?gelisBas=2026-09-14&gelisSon=2026-10-05
    &statu=TALEP,PESINAT_BEKLENIYOR&ara=demir
→ 200 [ { "rezId":8912, "rezNo":"MSF-2026-02733", "rezervEdenAdi":"TOLGA ALTAN",
          "rezervTarihi":"2026-09-05", "aciklama":"Eğitim programı",
          "telNo":"541 338 5443", "kisiSayisi":1, "gunSayisi":5,
          "gelisTarihi":"2026-09-20", "cikisTarihi":"2026-09-25",
          "kurumSahis":"KURUM", "odemeTuru":"MSD", "protokolMu":false,
          "aileMi":false, "statu":"ONAYLI",
          "misafirler":[ { "rezMisafirId":15220, "tcKimlikNo":"93559640569",
                           "adiSoyadi":"TOLGA ALTAN", "cinsiyet":"E",
                           "sicilNo":"41822", "gorevSevkNo":"381204",
                           "harcirahMiktari":900, "odaNo":17, "yatakNo":1 } ] } ]

POST /tesisler/{kod}/yerlestirme/oner
{ "rezIdler":[8912,8913,8914], "geriAlma":true }
→ 200 {
    "sureMs": 68,
    "oneriler":[
      { "rezId":8912, "skor":153,
        "atamalar":[ {"rezMisafirId":15220,"odaId":1201,"odaNo":17,"yatakId":3401,"yatakNo":1} ],
        "notlar":["Oda kapasitesi talebe birebir uyuyor"] } ],
    "basarisiz":[
      { "rezId":8914,
        "gerekce":"3 kişilik grup için 15.09.2026 – 21.09.2026 arası ardışık gecelerde aynı odada 3 boş yatak bulunamadı (aynı odada en fazla 1 yatak müsait; tesis genelinde en dar gecede 3 boş yatak var)." } ]
  }
```

> `oner` ucu **hiçbir kayıt değiştirmez**; yalnız öneri döner.

```http
POST /tesisler/{kod}/yerlestirme/uygula
{ "oneriler":[ { "rezId":8912,
                 "atamalar":[ {"rezMisafirId":15220,"yatakId":3401} ] } ] }
→ 200 { "uygulanan":1, "reddedilen":[] }
→ 409 { "hata":"YATAK_CAKISMASI",
        "mesaj":"Oda 17 / Yatak 1, 20.09.2026 gecesi için başka bir kayda tahsis edilmiş",
        "rezId":8912, "yatakId":3401 }

PUT    /rezervasyonlar/{rezId}/misafirler/{rezMisafirId}/yatak   { "yatakId":3401 }
DELETE /rezervasyonlar/{rezId}/misafirler/{rezMisafirId}/yatak
```

### 4.4 Peşinat ve statü (Ekran 3)

```http
GET /tesisler/{kod}/pesinat-kurali
PUT /tesisler/{kod}/pesinat-kurali
{ "kurumPesinatAranmasin":true, "sahisOran":30, "sahisAsgariTutar":750,
  "odemeSuresiGun":7, "gelistenOnceEnGecGun":2 }
→ 200 { "etkilenenKayit":1175 }

POST /rezervasyonlar/{rezId}/pesinat/tahsilat
{ "tutar":1500, "makbuzNo":"8347", "tahsilatTarihi":"2026-09-14" }
→ 200 { "tahsilEdilen":1500, "pesinattanKalan":0, "statu":"ONAYLI" }

POST /rezervasyonlar/{rezId}/statu      { "statu":"IPTAL", "aciklama":"Talep sahibi vazgeçti" }
→ 200 { "statu":"IPTAL", "serbestBirakilanYatak":2 }

POST /tesisler/{kod}/pesinat/sure-kontrol      // nightly job da aynı ucu çağırır
{ "tarih":"2026-09-14" }
→ 200 { "iptalEdilen":4,
        "kayitlar":[ {"rezId":8801,"rezNo":"MSF-2026-01550",
                      "sonOdemeTarihi":"2026-07-22","serbestYatak":3} ] }
```

### 4.5 Hata sözleşmesi

```json
{ "hata": "KOD", "mesaj": "Kullanıcıya gösterilecek Türkçe açıklama",
  "alan": "cikis_tarihi", "izlemeNo": "REQ-2026-0914-00231" }
```

| Kod | HTTP | Anlam |
|---|---|---|
| `YATAK_CAKISMASI` | 409 | Yatak seçilen gecelerde başka kayda tahsisli |
| `TEMIZLIK_BLOGU` | 409 | Çıkış-giriş temizlik boşluğu ihlali |
| `KARMA_ODA` | 409 | Cinsiyet kısıtı ihlali |
| `STATU_GECISI_GECERSIZ` | 422 | Örn. CIKIS → TALEP |
| `PESINAT_EKSIK` | 422 | Peşinat tahsil edilmeden onay |
| `YETKI_YOK` | 403 | Kullanıcının bu tesiste yetkisi yok |

## 5. PL/SQL paket taslağı

```sql
CREATE OR REPLACE PACKAGE MSFH_PKG_REZERVASYON AS
  FUNCTION  YATAK_MUSAIT_MI (p_yatak_id NUMBER, p_gelis DATE, p_cikis DATE,
                             p_haric_rez_id NUMBER DEFAULT NULL) RETURN CHAR;
  PROCEDURE YATAK_TAHSIS     (p_rez_misafir_id NUMBER, p_yatak_id NUMBER,
                              p_tahsis_tipi VARCHAR2, p_kullanici VARCHAR2);
  PROCEDURE YATAK_TAHSIS_KALDIR (p_rez_misafir_id NUMBER, p_kullanici VARCHAR2);
  PROCEDURE STATU_DEGISTIR   (p_rez_id NUMBER, p_yeni_statu VARCHAR2,
                              p_aciklama VARCHAR2, p_kullanici VARCHAR2);
  PROCEDURE PESINAT_HESAPLA  (p_rez_id NUMBER);
  PROCEDURE SURE_KONTROL     (p_misafirhane_kodu VARCHAR2, p_tarih DATE,
                              p_iptal_adedi OUT NUMBER);   -- gece işi
END MSFH_PKG_REZERVASYON;
```

## 6. Yetkilendirme

| Rol | Yetki |
|---|---|
| `MSFH_GORUNTULE` | Pano ve listeleri okuma |
| `MSFH_REZERVASYON` | Talep açma, yerleştirme, tahsis değiştirme |
| `MSFH_TAHSILAT` | Peşinat tahsilatı, makbuz no girişi |
| `MSFH_YONETICI` | Peşinat kuralı değiştirme, toplu iptal |

Yetki, mevcut TTKNET kullanıcı kodu (ör. TTK7719) ve misafirhane kodu çiftine
bağlanmalıdır; bir kullanıcı yalnız yetkili olduğu tesisleri görmelidir.

## 7. Geçiş notları

1. **Salt okunur pilot:** Prototip önce yalnız `GET` uçlarıyla gerçek veriye
   bağlanır; Forms tarafında hiçbir değişiklik yapılmaz.
2. **Yeni alanlar:** `STATU`, `CINSIYET`, `PROTOKOL_MU`, `AILE_MI`,
   `SON_ODEME_TARIHI` eklenir; mevcut kayıtlar için varsayılan değerlerle
   doldurulur (`STATU` geliş/çıkış tarihlerinden türetilebilir).
3. **Çift yazma dönemi:** Yerleştirme ve tahsilat yazmaları PL/SQL paketleri
   üzerinden yapılır; Forms ekranları aynı paketleri kullanacak şekilde
   güncellenirse iki arayüz yan yana çalışabilir.
4. **Gece işi:** `SURE_KONTROL` prosedürü DBMS_SCHEDULER ile günlük çalıştırılır.
