# Veritabanı Seçimi ve Veri Modeli

TTK Misafirhane Bilgi Sistemi — kurulum önerisi.
Bu belge, prototipin bellekte tuttuğu veriyi gerçek bir veritabanına taşırken
verilmesi gereken kararları ve gerekçelerini anlatır.

---

## 1. Öneri: PostgreSQL

**PostgreSQL 16** (kurumsal destek isteniyorsa EDB Postgres Advanced Server).

### Neden Postgres?

| Gereksinim | Postgres'in karşılığı |
|---|---|
| **Misafir sayısı ve geçmişte sınır olmaması** | Tablo başına 32 TB, satır sayısı pratikte sınırsız. 240 yatak × 4 tesis × 365 gün ≈ **350 bin konaklama-gece/yıl**; 20 yıllık geçmiş bile tek sunucuda rahat çalışır (aşağıdaki hesap) |
| **Aynı yatağın iki kez satılmaması** | `EXCLUDE` kısıtı + `daterange` tipi ile **veritabanı seviyesinde** çakışma engeli — uygulama hatası yapsa bile veri bozulmaz. Bu, seçimin en güçlü gerekçesidir |
| **Tekrar gelen misafirin hızlı bulunması** | `pg_trgm` ile adda bulanık arama, `unaccent` ile Türkçe harf duyarsızlığı, Tc kimlik no üzerinde tekil dizin |
| **Dönemsel raporlar (ay sonu belgesi)** | Pencere fonksiyonları, `generate_series` ile gün gün doluluk, materialized view ile gecelik özet |
| **Denetim izi** | `pgaudit`, satır seviyesinde geçmiş tabloları, `pg_stat_statements` |
| **Kurum içi kullanım** | Açık kaynak, lisans maliyeti yok, KVKK için veri yurt içinde kalır, Oracle'dan göç için `ora2pg` hazır |

### Neden diğerleri değil?

- **Oracle:** mevcut TTKNET zaten Oracle Forms üzerinde; devam etmek mümkündür ve göçü kolaylaştırır. Ancak lisans maliyeti bu ölçekteki bir modül için yüksektir. **Karar kriteri:** kurumda zaten geçerli bir Oracle lisansı ve DBA ekibi varsa Oracle'da kalmak makuldür; sıfırdan lisans alınacaksa Postgres seçilmelidir.
- **MySQL/MariaDB:** aralık çakışma kısıtı (`EXCLUDE`) yok; aynı yatağın iki kez verilmesini yalnız uygulama koduyla engellersiniz. Konaklama sisteminde bu risk kabul edilemez.
- **MongoDB ve benzeri belge tabanlı:** rezervasyon–misafir–yatak–tahsilat ilişkileri güçlü ve işlemler (transaction) çok tabloludur; ilişkisel model doğru seçimdir.
- **SQLite:** tek misafirhanelik bir kurulumda yeterli olabilir, ancak çok kullanıcılı eşzamanlı yazma ve yedekleme ihtiyacı nedeniyle önerilmez.

### Büyüklük hesabı

```
Konaklama-gece satırı  ≈ 200 bayt
4 tesis × 240 yatak × 365 gün × %70 doluluk ≈ 245.000 satır/yıl ≈ 50 MB/yıl
Misafir + rezervasyon + tahsilat + hareket kayıtları ile birlikte ≈ 250 MB/yıl
20 yıllık geçmiş ≈ 5 GB (dizinlerle ~12 GB)
```
Yani **geçmişi hiç silmeden** onlarca yıl tek bir sunucuda çalışır. Arşivleme ihtiyacı
veri boyutundan değil, ancak KVKK saklama süresi gereğinden doğar.

---

## 2. Çekirdek şema

```sql
-- ── Kişi kartı: misafir bir kez tanımlanır, her konaklamada tekrar kullanılır ──
CREATE TABLE misafir (
  id              bigserial PRIMARY KEY,
  tc_kimlik_no    char(11)    UNIQUE,              -- yabancı misafirde NULL
  pasaport_no     varchar(20),
  ad              varchar(60) NOT NULL,
  soyad           varchar(60) NOT NULL,
  cinsiyet        char(1)     NOT NULL CHECK (cinsiyet IN ('E','K')),
  dogum_tarihi    date,
  tel_no          varchar(15),
  eposta          varchar(120),
  sicil_no        varchar(10),                     -- TTK personeli ise
  birim           varchar(80),
  kvkk_riza_tarihi timestamptz,
  olusturma       timestamptz NOT NULL DEFAULT now(),
  guncelleme      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX misafir_ad_trgm ON misafir USING gin ((ad || ' ' || soyad) gin_trgm_ops);
CREATE INDEX misafir_tel     ON misafir (tel_no);

-- ── Yer envanteri ────────────────────────────────────────────────────────────
CREATE TABLE tesis (kod varchar(12) PRIMARY KEY, ad varchar(80), sehir varchar(40), aktif boolean DEFAULT true);
CREATE TABLE oda   (id bigserial PRIMARY KEY, tesis_kod varchar(12) REFERENCES tesis, oda_no int,
                    kat int, tip varchar(8), protokol boolean DEFAULT false,
                    UNIQUE (tesis_kod, oda_no));
CREATE TABLE yatak (id bigserial PRIMARY KEY, oda_id bigint REFERENCES oda, yatak_no int,
                    gecelik_bedel numeric(10,2), UNIQUE (oda_id, yatak_no));

-- ── Rezervasyon ve konaklama ────────────────────────────────────────────────
CREATE TABLE rezervasyon (
  id              bigserial PRIMARY KEY,
  rez_no          varchar(20) UNIQUE NOT NULL,
  tesis_kod       varchar(12) REFERENCES tesis,
  ad_soyad        varchar(120) NOT NULL,           -- rezervasyonu yaptıran
  tel_no          varchar(15),
  gelis_tarihi    date NOT NULL,
  cikis_tarihi    date NOT NULL CHECK (cikis_tarihi > gelis_tarihi),
  kisi_sayisi     smallint NOT NULL,
  kurum_sahis     varchar(6) NOT NULL,
  odeyecek        varchar(120),
  gelis_nedeni    varchar(40),
  protokol        boolean DEFAULT false,
  aile            boolean DEFAULT false,
  statu           varchar(24) NOT NULL,
  pesinat_tutari  numeric(10,2) DEFAULT 0,
  tahsil_edilen   numeric(10,2) DEFAULT 0,
  pesinat_son_odeme date,
  kapora_muafiyeti jsonb,                          -- {gerekce, kullanici, tarih}
  kayit_yapan     varchar(20),
  olusturma       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rez_tarih  ON rezervasyon (tesis_kod, gelis_tarihi, cikis_tarihi);
CREATE INDEX rez_statu  ON rezervasyon (tesis_kod, statu) WHERE statu NOT IN ('CIKIS','IPTAL');

-- ── Yatak tahsisi: çakışmayı VERİTABANI engeller ────────────────────────────
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE konaklama (
  id           bigserial PRIMARY KEY,
  rezervasyon_id bigint REFERENCES rezervasyon ON DELETE CASCADE,
  misafir_id   bigint REFERENCES misafir,
  yatak_id     bigint REFERENCES yatak,
  donem        daterange NOT NULL,                 -- [gelis, cikis) — çıkış günü dahil değil
  temizlik_gun smallint NOT NULL DEFAULT 1,
  iptal        boolean NOT NULL DEFAULT false,
  -- Aynı yatak, temizlik boşluğu dahil, aynı anda iki kez verilemez:
  EXCLUDE USING gist (
    yatak_id WITH =,
    daterange(lower(donem), upper(donem) + temizlik_gun) WITH &&
  ) WHERE (NOT iptal)
);
CREATE INDEX konaklama_misafir ON konaklama (misafir_id);
CREATE INDEX konaklama_donem   ON konaklama USING gist (donem);

-- ── Kapora, dekont, tahsilat ────────────────────────────────────────────────
CREATE TABLE dekont (
  id bigserial PRIMARY KEY, rezervasyon_id bigint REFERENCES rezervasyon,
  banka varchar(40), dekont_no varchar(40), iban char(26), tutar numeric(10,2),
  odeme_tarihi date, dosya_adi varchar(200), dosya_yol text, dosya_tur varchar(40),
  durum varchar(12) NOT NULL,                      -- YUKLENDI / ONAYLANDI / REDDEDILDI
  yukleyen varchar(20), yuklenme timestamptz DEFAULT now(),
  onaylayan varchar(20), onay_tarihi timestamptz, red_gerekcesi text
);
CREATE TABLE tahsilat (
  id bigserial PRIMARY KEY, rezervasyon_id bigint REFERENCES rezervasyon,
  tutar numeric(10,2) NOT NULL CHECK (tutar > 0), makbuz_no varchar(20),
  tahsil_tarihi date NOT NULL, kullanici varchar(20) NOT NULL
);

-- ── Günlük işler ────────────────────────────────────────────────────────────
CREATE TABLE kahvalti_yoklama (
  tarih date NOT NULL, konaklama_id bigint REFERENCES konaklama,
  kahvalti_yapmadi boolean NOT NULL DEFAULT true,
  isleyen varchar(20), islenme timestamptz DEFAULT now(),
  PRIMARY KEY (tarih, konaklama_id)
);
CREATE TABLE ay_sonu_belge (
  id bigserial PRIMARY KEY, tesis_kod varchar(12), donem char(7),   -- 'YYYY-MM'
  isteyen varchar(20), talep_tarihi date, not_metni text,
  durum varchar(10) NOT NULL, hazirlayan varchar(20), hazirlanma_tarihi date,
  belge_yol text
);

-- ── Denetim izi ─────────────────────────────────────────────────────────────
CREATE TABLE hareket (
  id bigserial PRIMARY KEY, rezervasyon_id bigint REFERENCES rezervasyon,
  tarih timestamptz NOT NULL DEFAULT now(), kullanici varchar(20) NOT NULL,
  islem varchar(40) NOT NULL, aciklama text, eski_deger jsonb, yeni_deger jsonb
);
CREATE TABLE bildirim (                            -- gönderilen SMS/e-posta
  id bigserial PRIMARY KEY, rezervasyon_id bigint REFERENCES rezervasyon,
  kanal varchar(10), tur varchar(20), alici varchar(120), metin text,
  durum varchar(16), saglayici_yanit jsonb, gonderim timestamptz DEFAULT now()
);
```

### Kritik nokta: çakışma kısıtı

`konaklama` tablosundaki `EXCLUDE` kısıtı, aynı yatağın örtüşen dönemlerde iki kez
verilmesini **veritabanı seviyesinde** imkânsız kılar — iki resepsiyonist aynı anda
aynı yatağı verse bile ikincisi hata alır. Uygulama katmanındaki denetim kullanıcıya
nazik bir mesaj vermek içindir; **doğruluğu garanti eden bu kısıttır.**

---

## 3. Tekrar gelen misafirin hızlı kaydı

Bu, istenen en somut işlevlerden biri. Üç katmanlı çözüm:

### 3.1 Tc kimlik no ile tam eşleşme
```sql
SELECT * FROM misafir WHERE tc_kimlik_no = $1;
```
Tekil dizin üzerinden mikrosaniyeler içinde döner. Arayüzde: 11 hane tamamlanır
tamamlanmaz form kendiliğinden dolar.

### 3.2 Adla bulanık arama (Tc kimlik no hatırlanmıyorsa)
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

SELECT m.*, similarity(m.ad || ' ' || m.soyad, $1) AS puan
FROM misafir m
WHERE (m.ad || ' ' || m.soyad) % $1                 -- trigram benzerliği
ORDER BY puan DESC, m.guncelleme DESC
LIMIT 10;
```
«mehmet yilmaz» yazınca «Mehmet YILMAZ» ve «Mehmet Yılmaz» birlikte gelir.

### 3.3 Konaklama geçmişi görünümü
```sql
CREATE VIEW misafir_gecmisi AS
SELECT m.id AS misafir_id, m.ad, m.soyad, m.tc_kimlik_no,
       count(*)                          AS konaklama_sayisi,
       max(upper(k.donem))               AS son_cikis,
       sum(upper(k.donem) - lower(k.donem)) AS toplam_gece,
       mode() WITHIN GROUP (ORDER BY y.oda_id) AS en_cok_kaldigi_oda,
       bool_or(r.protokol)               AS protokol_misafiri
FROM misafir m
JOIN konaklama k ON k.misafir_id = m.id AND NOT k.iptal
JOIN yatak y     ON y.id = k.yatak_id
JOIN rezervasyon r ON r.id = k.rezervasyon_id
GROUP BY m.id;
```

**Arayüzdeki karşılığı:** yeni kayıt formunda Tc kimlik no ya da ad yazılınca bir
öneri şeridi açılır:

> **MEHMET YILMAZ** · 3 kez kaldı · son çıkış 14.03.2026 · genelde Oda 21
> `[Bilgileri doldur]`

Tıklanınca ad, soyad, cinsiyet, telefon, sicil ve birim alanları dolar; resepsiyonist
yalnız tarih ve kişi sayısını girer. **Bu, tekrar gelen misafirin kaydını ~20 saniyeden
~5 saniyeye indirir.**

### 3.4 Aynı kişinin iki kez açılmasını önleme
- Tc kimlik no `UNIQUE` — aynı numara ikinci kez açılamaz.
- Tc kimlik no bilinmeyen kayıtlar için gece çalışan bir **birleştirme önerisi** işi:
  ad+soyad+telefon üçlüsü benzeşen kartları listeler, operatör onayıyla birleştirilir
  (`konaklama.misafir_id` güncellenir, eski kart `birlesti_id` ile işaretlenir).

---

## 4. Geçmişin sınırsız tutulması

- **Bölümleme (partitioning):** `konaklama` ve `hareket` tabloları yıla göre
  `PARTITION BY RANGE (lower(donem))` ile bölünür. Sorgular yalnız ilgili yılı tarar;
  eski yıllar salt okunur tablo alanına (tablespace) alınabilir.
- **Özet tablo:** ay sonu belgeleri için `gunluk_doluluk` materialized view gece
  yenilenir; 20 yıllık rapor bile saniyeler içinde çıkar.
- **Silme yok, arşivleme var:** KVKK gereği saklama süresi dolan kişisel alanlar
  (Tc kimlik no, telefon) maskelenir; konaklama istatistiği anonim olarak kalır.

```sql
-- Saklama süresi dolan kişisel veriyi maskele, istatistiği koru
UPDATE misafir SET tc_kimlik_no = NULL, tel_no = NULL, eposta = NULL,
                   ad = 'ANONİM', soyad = left(soyad,1) || '***'
WHERE id IN (SELECT misafir_id FROM konaklama GROUP BY misafir_id
             HAVING max(upper(donem)) < current_date - interval '10 years');
```

---

## 5. Yedekleme ve süreklilik

| Konu | Uygulama |
|---|---|
| Yedek | `pgBackRest` ile günlük tam + sürekli WAL arşivi; **RPO ≤ 5 dk** |
| Kurtarma | Zaman noktasına dönüş (PITR); yılda iki kez tatbikat yapılır |
| Yüksek erişilebilirlik | Patroni + etcd ile birincil/yedek küme, otomatik devralma |
| Dosyalar (dekont, belge) | Veritabanında değil, S3 uyumlu nesne deposunda (MinIO); tabloda yalnız yol tutulur |
| Şifreleme | Disk seviyesinde LUKS; bağlantıda zorunlu TLS; Tc kimlik no sütununda `pgcrypto` isteğe bağlı |

---

## 6. Oracle Forms'tan göç

1. **Alan eşleştirmesi** hazırdır: [`docs/alan-eslestirme.md`](alan-eslestirme.md).
2. `ora2pg` ile şema ve veri aktarılır; MSFH0350/MSFH0100/MSFH0030 tabloları yukarıdaki
   modele dönüştürülür.
3. **Geçiş dönemi:** yeni sistem önce salt okunur çalışır (Oracle'dan gecelik kopya),
   doğrulama sonrası yazma da devralınır.
4. Eski kayıtlarda çakışma bulunursa `EXCLUDE` kısıtı yükleme sırasında hata verir —
   bu bir sorun değil, **var olan veri hatalarının ortaya çıkmasıdır**; temizlenerek yüklenir.

---

## 7. Yerleştirme motorunun SQL karşılığı

Prototipteki motor bellekte çalışır. Kurulumda aynı sorular veritabanına sorulur.
Bu bölüm, geliştiriciye verilecek somut sorguları içerir.

### 7.1 Bir tarih aralığında kesintisiz müsait yataklar

«Geliş–çıkış arasındaki **her gecede** boş olan yataklar» — prototipteki
`yatakMusait()` işlevinin karşılığı:

```sql
-- $1 tesis, $2 geliş, $3 çıkış, $4 temizlik günü (varsayılan 1)
SELECT y.id, o.oda_no, y.yatak_no, o.tip, o.protokol, y.gecelik_bedel
FROM yatak y
JOIN oda  o ON o.id = y.oda_id
WHERE o.tesis_kod = $1
  AND NOT EXISTS (
        SELECT 1 FROM konaklama k
        WHERE k.yatak_id = y.id
          AND NOT k.iptal
          -- temizlik boşluğu dahil çakışma
          AND daterange(lower(k.donem), upper(k.donem) + k.temizlik_gun) && daterange($2, $3)
      )
ORDER BY o.protokol, o.oda_no, y.yatak_no;
```
`konaklama_donem` GiST dizini sayesinde 240 yataklık tesiste **1 ms altında** döner.

### 7.2 Karma oda denetimi

```sql
-- Odada seçilen aralıkta hangi cinsiyetler var?
SELECT DISTINCT m.cinsiyet
FROM konaklama k
JOIN yatak y   ON y.id = k.yatak_id
JOIN misafir m ON m.id = k.misafir_id
WHERE y.oda_id = $1 AND NOT k.iptal AND k.donem && daterange($2, $3);
```
Sonuç boş değilse ve talebin cinsiyeti kümede yoksa oda kapalıdır (aile talebi hariç).

### 7.3 Gün gün doluluk (takvim şeridi)

```sql
SELECT g.gun,
       count(*) FILTER (WHERE k.id IS NOT NULL)                       AS dolu,
       (SELECT count(*) FROM yatak y2 JOIN oda o2 ON o2.id = y2.oda_id
        WHERE o2.tesis_kod = $1)                                      AS kapasite
FROM generate_series($2::date, $3::date, '1 day') AS g(gun)
LEFT JOIN konaklama k ON NOT k.iptal AND g.gun <@ k.donem
LEFT JOIN yatak y ON y.id = k.yatak_id
LEFT JOIN oda   o ON o.id = y.oda_id AND o.tesis_kod = $1
GROUP BY g.gun ORDER BY g.gun;
```
30 günlük şerit için yeterlidir. Yıllık raporlarda bunun yerine gecelik
**materialized view** kullanılır (aşağıda).

### 7.4 Gecelik özet (raporlar için)

```sql
CREATE MATERIALIZED VIEW gunluk_doluluk AS
SELECT o.tesis_kod, g.gun,
       count(*) AS dolu_yatak,
       count(DISTINCT k.rezervasyon_id) AS kayit
FROM konaklama k
JOIN yatak y ON y.id = k.yatak_id
JOIN oda   o ON o.id = y.oda_id
CROSS JOIN LATERAL generate_series(lower(k.donem), upper(k.donem) - 1, '1 day') AS g(gun)
WHERE NOT k.iptal
GROUP BY o.tesis_kod, g.gun;

CREATE UNIQUE INDEX ON gunluk_doluluk (tesis_kod, gun);
-- Gece yenilenir; kilitlemeden:
REFRESH MATERIALIZED VIEW CONCURRENTLY gunluk_doluluk;
```
Ay sonu belgesi ve yıllık doluluk raporu bu görünümden okunur; 20 yıllık sorgu
bile saniyeler içinde döner.

---

## 8. Performans ve dizin stratejisi

| Sorgu | Dizin | Beklenen |
|---|---|---|
| Tc kimlik no ile misafir | `misafir(tc_kimlik_no)` UNIQUE | Index Scan, < 1 ms |
| Ad ile bulanık arama | `misafir` GIN trigram | Bitmap Scan, < 20 ms (100 bin kayıtta) |
| Müsait yatak | `konaklama` GiST `donem` + `EXCLUDE` dizini | < 1 ms |
| Talep listesi (tarih aralığı) | `rezervasyon(tesis_kod, gelis_tarihi, cikis_tarihi)` | < 5 ms |
| Açık kayıtlar | Kısmi dizin: `WHERE statu NOT IN ('CIKIS','IPTAL')` | Küçük dizin, hızlı |
| Ay sonu raporu | `gunluk_doluluk` materialized view | < 100 ms |

**Ayar önerileri** (16 GB RAM'li sunucu için):
```
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 32MB
maintenance_work_mem = 512MB
random_page_cost = 1.1          # SSD
max_connections = 200           # ya da PgBouncer ile 50'ye indir
```
**Bağlantı havuzu:** uygulama sunucusu çok örnekli çalışacaksa **PgBouncer**
(transaction pooling) konur; `max_connections` düşük tutulur.

**Denetim:** `pg_stat_statements` açık tutulur; haftalık en yavaş 10 sorgu gözden geçirilir.

---

## 9. Oracle'dan göç — adım adım

### 9.1 Şema ve veri aktarımı
```bash
# Oracle şemasını incele ve dönüştür
ora2pg -c ora2pg.conf -t SHOW_TABLE          # envanter
ora2pg -c ora2pg.conf -t TABLE -o sema.sql   # DDL
ora2pg -c ora2pg.conf -t COPY  -o veri.sql   # veri
```
Üretilen DDL doğrudan kullanılmaz; § 2'deki hedef modele **elle eşlenir**
(alan karşılıkları [`alan-eslestirme.md`](alan-eslestirme.md) belgesindedir).

### 9.2 Çakışma raporu — göçten ÖNCE çalıştırılmalı

`EXCLUDE` kısıtı, eski veride çakışma varsa yüklemeyi durdurur. Bu yüzden önce
geçici bir tabloya yüklenip rapor alınır:

```sql
-- Aynı yatakta örtüşen konaklamalar
SELECT a.yatak_id, a.rezervasyon_id AS rez_a, b.rezervasyon_id AS rez_b,
       a.donem AS donem_a, b.donem AS donem_b
FROM konaklama_gecici a
JOIN konaklama_gecici b
  ON a.yatak_id = b.yatak_id AND a.id < b.id AND a.donem && b.donem
ORDER BY a.yatak_id, lower(a.donem);
```
Çıkan liste işletme birimine verilir, hangi kaydın geçerli olduğu belirlenir,
düzeltilmiş veri asıl tabloya yüklenir.

> **Bu adımı atlamayın.** Çakışma çıkması bir aksaklık değil, sistemin ilk
> faydasıdır: bugüne kadar fark edilmemiş kayıt hatalarını görünür kılar.

### 9.3 Mutabakat (çift yazma döneminde)
```sql
-- Her gece: iki sistemdeki gecelik dolu yatak sayısı tutuyor mu?
SELECT gun, dolu_yatak FROM gunluk_doluluk WHERE tesis_kod = $1 AND gun = current_date - 1;
```
Sonuç Oracle tarafındaki aynı hesapla karşılaştırılır; ardışık beş gün fark
çıkmazsa devralmaya geçilir.

### 9.4 Geri dönüş
Devralmadan sonra bir hafta Oracle yazılabilir tutulur. Sorun çıkarsa yeni
sistemde açılan kayıtlar `rezervasyon.olusturma > devralma_tarihi` ile süzülüp
Oracle'a aktarılır; DNS eski sisteme döner.
