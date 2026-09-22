# Misafirhane Bilgi Sistemi — Mimari Brifing

**Kime:** Bilgi İşlem Şube Müdürlüğü, Misafirhane işletme sorumluları, karar verici makam
**Konu:** TTKNET/Oracle Forms «Misafirhane Bilgi Sistemi» modülünün web tabanlı yeniden yazımı
**Belge amacı:** Teknik kararların gerekçesiyle birlikte aktarılması; bu belge tek başına okunup
anlatılabilir. Ayrıntılar için: [`veritabani.md`](veritabani.md), [`dagitim-mimarisi.md`](dagitim-mimarisi.md),
[`mobil-arayuz.md`](mobil-arayuz.md), [`api-sozlesmesi.md`](api-sozlesmesi.md), [`alan-eslestirme.md`](alan-eslestirme.md).

---

## 1. Yönetici özeti

| Soru | Yanıt |
|---|---|
| **Ne yapılıyor?** | Oracle Forms ekranları (MSFH0350 Rezervasyonlar, MSFH0100 Kayıt Giriş-Çıkış, MSFH0030 Şartname Makbuzları) yerine, aynı işi yapan web tabanlı bir modül |
| **Neden?** | Forms istemcisi yalnız kurum bilgisayarında çalışıyor; müdür sahadayken rezervasyon alamıyor. Yatak çakışması ve kapora takibi elle yapılıyor. Oracle Forms'un desteği daralıyor |
| **Veritabanı** | **PostgreSQL 16** — asıl gerekçe kapasite değil, *doğruluk*: aynı yatağın iki kez verilmesini veritabanının kendisi engelliyor |
| **Çalışma ortamı** | Kurumda Kubernetes kümesi **varsa** oraya; **yoksa** tek sunucu + Docker Compose. Bu modül tek başına küme kurmayı gerektirmiyor |
| **Mobil** | Ayrı uygulama değil; aynı arayüz telefonda çalışıyor (PWA). Müdür telefonla arandığında kaydı telefondan açıyor |
| **Süre** | Hazırlık + pilot + yaygınlaştırma ≈ **13 hafta** (aşağıda aşama aşama) |
| **Lisans maliyeti** | **Yok** — önerilen yığının tamamı açık kaynak. Donanım ve adam-gün maliyeti ayrıca çıkarılmalı |
| **En büyük risk** | Veri göçünde, eski kayıtlardaki çakışmaların ortaya çıkması. Bu bir kusur değil, *var olan hataların görünür olması*; göç planında ayrı bir adım olarak ele alınıyor |

**Bir cümlede:** Açık kaynaklı, kurum içinde barındırılan, telefondan da çalışan bir web modülü;
yatak çakışmasını ve kapora kaçağını teknik olarak imkânsız kılan bir veri modeliyle.

---

## 2. Bugünkü durum ve çözülecek sorunlar

| Bugünkü sorun | Etkisi | Yeni sistemdeki karşılığı |
|---|---|---|
| Yatak tahsisi elle, Excel/defter desteğiyle | Çift rezervasyon, misafirin kapıdan çevrilmesi | Veritabanı kısıtı çakışmayı reddediyor; motor boş yatağı kendisi buluyor |
| Kapora takibi kişisel not defterinde | Tahsil edilmemiş kapora, geç fark edilen iptal | Kapora kuralı tesis bazında tanımlı; süresi dolan talep kendiliğinden iptal oluyor |
| Dekont kâğıt olarak müdüre gidiyor | Onay gecikmesi, kaybolan belge | Dekont sisteme yükleniyor, müdür ekrandan onaylıyor, iz kalıyor |
| Forms istemcisi yalnız masaüstünde | Müdür sahadayken kayıt açamıyor | Telefon tarayıcısından tam işlevsellik |
| Kahvaltı sayıları ay sonunda hatırlanmaya çalışılıyor | Muhasebe hesabı tutmuyor | Resepsiyon günbegün işliyor, ay sonu belgesi tek tuşla üretiliyor |
| Kim ne zaman ne yaptı belli değil | Denetimde açıklama güçlüğü | Her kayıt için hareket geçmişi: kullanıcı, tarih, işlem |

---

## 3. Çözüm mimarisi

```
   Kurum ağı / VPN
          │
 ┌────────▼─────────────────────────────────────────────────────────┐
 │  Ters vekil + TLS  (Traefik ya da Nginx)                          │
 └────────┬───────────────────────────────┬─────────────────────────┘
          │                               │
 ┌────────▼────────┐             ┌────────▼─────────────────────────┐
 │  Arayüz (SPA)   │  ─ REST ─▶  │  Uygulama sunucusu               │
 │  React          │             │  · iş kuralları (yerleştirme,    │
 │  PWA, telefon   │             │    kapora, yetki)                │
 └─────────────────┘             │  · denetim izi                   │
                                 └───┬──────┬──────┬──────┬─────────┘
                                     │      │      │      │
                        ┌────────────▼┐ ┌───▼───┐ ┌▼─────┐ ┌▼────────────┐
                        │ PostgreSQL  │ │ MinIO │ │Redis │ │ Dış servisler│
                        │ · veri      │ │dekont │ │oturum│ │ LDAP · SMS   │
                        │ · kısıtlar  │ │belge  │ │kuyruk│ │ (kurum)      │
                        └─────────────┘ └───────┘ └──────┘ └─────────────┘
```

**Katman sorumlulukları — neden böyle bölündü:**

- **Arayüz** hiçbir iş kuralı taşımaz. «Kapora onaylanmadan yerleştirme yapılamaz» kuralı
  arayüzde düğmeyi pasif yapar, ama **kararı sunucu verir**. Arayüz kodu tarayıcıda olduğu
  için değiştirilebilir; güvenlik sunucuda olmalıdır.
- **Uygulama sunucusu** yetki denetimini her istekte yeniden yapar. Prototipteki rol/yetki
  matrisi buraya taşınır.
- **Veritabanı** son savunma hattıdır: uygulama hata yapsa bile çakışan kayıt yazılamaz.
- **Dosyalar** (dekont, ay sonu belgesi) veritabanında değil nesne deposunda tutulur;
  veritabanı yedeği küçük ve hızlı kalır.

---

## 4. Veritabanı kararı — ayrıntılı gerekçe

### 4.1 Karşılaştırma

| Ölçüt | PostgreSQL 16 | Oracle | MySQL/MariaDB | MongoDB |
|---|---|---|---|---|
| Aralık çakışma kısıtı (`EXCLUDE`) | **Var** | Var (kısıtlı, tetikleyiciyle) | **Yok** | Yok |
| İşlem bütünlüğü (çok tablolu) | Tam | Tam | Tam | Sınırlı |
| Türkçe bulanık ad arama | `pg_trgm` + `unaccent` | Text index | Sınırlı | Sınırlı |
| Lisans | Ücretsiz | **Ücretli** | Ücretsiz | Ücretsiz (kurumsal ücretli) |
| Kurumdaki mevcut bilgi | Yaygın | **Var (TTKNET)** | Yaygın | Az |
| Oracle'dan göç aracı | `ora2pg` | — | Zor | Zor |

**Karar:** PostgreSQL. **Tek istisna:** kurumda geçerli, kapsamı yeten bir Oracle lisansı ve
etkin bir DBA ekibi zaten varsa Oracle'da kalmak da savunulabilir — göç riski azalır.
Sıfırdan lisans alınacaksa gerekçesi yoktur.

### 4.2 Kararın kalbi: çakışmayı veritabanı engelliyor

```sql
CREATE TABLE konaklama (
  ...
  yatak_id     bigint REFERENCES yatak,
  donem        daterange NOT NULL,          -- [geliş, çıkış)
  temizlik_gun smallint NOT NULL DEFAULT 1,
  iptal        boolean NOT NULL DEFAULT false,
  EXCLUDE USING gist (
    yatak_id WITH =,
    daterange(lower(donem), upper(donem) + temizlik_gun) WITH &&
  ) WHERE (NOT iptal)
);
```

**Bunun anlamı:** iki resepsiyonist aynı anda aynı yatağı verse, ikincisinin işlemi
veritabanı tarafından reddedilir. Uygulama kodunda hata olsa, yeni bir ekran yazılsa,
biri doğrudan SQL çalıştırsa bile kural işler. **Bu, elle yapılan işte imkânsız olan
bir güvencedir** ve tek başına veritabanı seçimini belirler.

### 4.3 Kapasite — «sınır olmaması» gereksinimi

```
Konaklama-gece kaydı            ≈ 200 bayt
4 tesis × 240 yatak × 365 gün × %70 doluluk ≈ 245.000 kayıt/yıl
Rezervasyon + misafir + tahsilat + hareket  ≈ 250 MB/yıl (dizinlerle)
20 yıl ≈ 5 GB veri, ~12 GB dizinli
```
Tek sunucuda onlarca yıl çalışır. **Geçmiş silinmez**; yalnız KVKK saklama süresi dolan
*kişisel alanlar* maskelenir, konaklama istatistiği anonim olarak kalır.

Büyüdükçe: `konaklama` ve `hareket` tabloları yıla göre bölümlenir (partitioning);
sorgular yalnız ilgili yılı tarar, eski yıllar salt okunur alana taşınabilir.

### 4.4 Tekrar gelen misafir — istenen en somut iyileştirme

Üç katmanlı çözüm, prototipte de çalışır durumda:

1. **Tc kimlik no ile tam eşleşme** — tekil dizin, mikrosaniye.
2. **Bulanık ad araması** — `pg_trgm`; «mehmet yilmaz» yazınca «Mehmet YILMAZ» gelir.
3. **Geçmiş özeti görünümü** — kaç kez kaldı, son çıkış, genelde hangi oda.

**Arayüzdeki karşılığı:** Tc kimlik no tamamlanır tamamlanmaz altında şu çıkar:

> ★ **MEHMET DEMİROĞLU** · 3 kez kaldı · genelde Oda 21 — **bilgileri doldur**

Tıklanınca ad, cinsiyet, sicil, birim ve telefon dolar. Resepsiyonist yalnız tarih ve
kişi sayısı girer. **Ölçülen etki: tekrar gelen misafirin kaydı ~20 saniyeden ~5 saniyeye iner.**

Aynı kişinin iki kez açılmaması için: Tc kimlik no `UNIQUE`; Tc kimlik no bilinmeyen
kayıtlar için gece çalışan bir birleştirme önerisi işi (ad+soyad+telefon benzerliği),
operatör onayıyla birleştirme.

### 4.5 Veri modeli özeti

| Tablo | Ne tutar | Kritik nokta |
|---|---|---|
| `misafir` | Kişi kartı (tekrar kullanılır) | Tc kimlik no tekil; ad üzerinde trigram dizini |
| `rezervasyon` | Talep/kayıt başlığı, statü, kapora | Statü akışı; kapora muafiyeti `jsonb` |
| `konaklama` | Hangi misafir, hangi yatak, hangi gece | **Çakışma kısıtı burada** |
| `dekont` / `tahsilat` | Kapora belgesi ve tahsilat hareketi | Dosya yolu tutulur, dosyanın kendisi MinIO'da |
| `kahvalti_yoklama` | Gün gün kahvaltıya inmeyenler | Ay sonu belgesinin kaynağı |
| `hareket` | Kim, ne zaman, ne yaptı | Denetim izi; silinmez |
| `bildirim` | Gönderilen SMS/e-posta | Sağlayıcı yanıtıyla birlikte |

Tam şema: [`veritabani.md`](veritabani.md) § 2.

---

## 5. Entegrasyonlar

| Sistem | Yön | Ne için | Not |
|---|---|---|---|
| **TTKNET / YBS kimlik (LDAP-AD)** | Giriş | Kullanıcı adı-parola kurumda doğrulanır | Prototipteki kullanıcı tablosu yerine geçer; **rol eşleştirmesi** uygulamada kalır (AD grubu → rol) |
| **SMS sağlayıcısı** | Çıkış | Kayıt, onay, iptal bildirimleri | Kuyruk üzerinden, yeniden deneme ve gönderim kaydı ile. `₺` gibi GSM-7 dışı karakter kullanılmaz (mesajı 70 haneye düşürür) |
| **Oracle / TTKNET personel verisi** | Giriş | Sicil no ile personel adı, birim doğrulama | Salt okunur görünüm ya da gecelik eşitleme |
| **Muhasebe** | Çıkış | Ay sonu belgesi, tahsilat dökümü | Önce PDF/Excel; istenirse ileride doğrudan arayüz |
| **Dosya deposu (MinIO)** | Çift yön | Dekont ve belgeler | Veritabanını şişirmemek için |

**Karar gerektiren:** SMS sağlayıcısının hangi arayüzü sunduğu ve kurum kotası.
Bu bilgi olmadan gönderim maliyeti hesaplanamaz.

---

## 6. Çalışma ortamı — Kubernetes gerekli mi?

### 6.1 Ölçek gerçeği

| Büyüklük | Değer |
|---|---|
| Eşzamanlı kullanıcı | ~20–40 |
| Günlük işlem | Birkaç yüz |
| Veri | ~250 MB/yıl |
| Kesinti toleransı | Günlük işi durdurur, can/mal kaybı yok |

**Bu ölçek Kubernetes'i tek başına gerekçelendirmez.** Kubernetes seçmek uygulamayı değil
*işletme biçimini* seçmektir: küme yönetimi, sertifika, ağ politikası, depolama sınıfı,
yükseltme döngüsü — hepsi ayrı uzmanlık ister.

### 6.2 İki yol

| | **A — Tek sunucu + Docker Compose** | **B — Kubernetes** |
|---|---|---|
| Ne zaman | Kurumda küme **yoksa** | Kurumda küme **varsa** ya da başka modüller de taşınacaksa |
| Sunucu | 1 VM (8 vCPU / 16 GB / 200 GB SSD) | 3 kontrol + 3 işçi (paylaşımlı küme) |
| Kurulum emeği | ~1 hafta | ~3 hafta (küme yoksa +4 hafta) |
| Kesintisiz güncelleme | Hayır (dakikalar) | Evet (dönüşümlü) |
| Veritabanı devralma | Elle | **CloudNativePG** operatörü otomatik |
| İşletme | 1 kişi, yarı zamanlı | Var olan platform ekibi |

**Öneri:** Her iki durumda da **ilk günden konteynerleştirin**. A'dan B'ye geçiş aynı
imajlarla yapıldığı için ucuzdur; tersi doğru değildir.

### 6.3 Kubernetes seçilirse üç kritik karar

1. **Veritabanını elle `StatefulSet` ile kurmayın.** CloudNativePG operatörü devralma,
   yedek, PITR ve sürüm yükseltmesini üstlenir. Kubernetes'te veritabanı işletmenin en
   büyük riski budur; operatör bu riski alır.
2. **GitOps kullanın** (Argo CD). Dağıtım = git'te imaj etiketini değiştirmek; geri alma =
   bir önceki commit. Elle `kubectl apply` ile ilerleyen kurulumlar altı ay sonra kimsenin
   ne olduğunu bilmediği bir kümeye dönüşür.
3. **Şema göçleri geriye uyumlu olmalı.** Önce sütun ekle → sonra kod → sonra eski sütunu
   kaldır. Böylece dönüşümlü güncellemede eski ve yeni sürüm bir arada çalışabilir.

Yapılandırma örnekleri: [`dagitim-mimarisi.md`](dagitim-mimarisi.md) § 3–4.

---

## 7. Güvenlik ve KVKK

| Konu | Uygulama |
|---|---|
| **Kimlik** | Kurum LDAP/AD; parola uygulamada tutulmaz |
| **Yetki** | Her istekte sunucuda denetlenir; 18 yetki kodu × 4 rol matrisi |
| **Veri sınıfı** | Tc kimlik no, telefon, konaklama bilgisi = **kişisel veri**; konaklama nedeni bazı hâllerde özel nitelikli olabilir |
| **Aktarım** | Uçtan uca TLS; veritabanı bağlantısı da TLS |
| **Saklama** | Disk şifreleme (LUKS); istenirse Tc kimlik no sütununda `pgcrypto` |
| **Erişim kaydı** | Kim hangi misafir kaydını açtı — `hareket` tablosunda |
| **Saklama süresi** | Mali mevzuat gereği belgeler 10 yıl; sonrasında kişisel alanlar maskelenir, istatistik anonim kalır |
| **Aydınlatma** | Rezervasyon sırasında KVKK aydınlatma metni ve rıza tarihi kaydı (`misafir.kvkk_riza_tarihi`) |
| **Yedeklerin şifrelenmesi** | pgBackRest/restic şifreli depoya yazar |

**Karar gerektiren:** KVKK saklama sürelerinin kurum politikasıyla netleştirilmesi ve
aydınlatma metninin hukuk müşavirliğince onaylanması.

---

## 8. Süreklilik ve hizmet düzeyi

| Ölçüt | Hedef | Nasıl |
|---|---|---|
| **RPO** (kabul edilebilir veri kaybı) | ≤ 5 dakika | Sürekli WAL arşivi |
| **RTO** (kabul edilebilir kesinti) | ≤ 1 saat (A), ≤ 5 dakika (B) | A: yedekten dönüş · B: otomatik devralma |
| Yedek denetimi | Yılda 2 kez tatbikat | Yedekten gerçek dönüş denemesi — **yapılmayan tatbikat, yedek yok demektir** |
| İzleme | Prometheus + Grafana, Loki | İstek gecikmesi, hata oranı, disk, DB devralma |
| Uyarı | Alertmanager → e-posta/SMS | Yedek başarısız, disk %80, 5xx artışı |
| İş uyarısı | Uygulama içi | Onay bekleyen dekont, süresi dolan kapora |

---

## 9. Göç ve yayına alma planı

| Aşama | Süre | İçerik | Çıkış ölçütü |
|---|---|---|---|
| **0. Hazırlık** | 2 hafta | Şema, ortamlar, CI boru hattı, LDAP bağlantısı | Test ortamında uçtan uca akış çalışıyor |
| **1. Salt okunur pilot** | 3 hafta | Yeni arayüz, veri Oracle'dan gecelik kopya; tek misafirhane | Sayılar Oracle ile tutuyor |
| **2. Çift yazma** | 3 hafta | Kayıt her iki sistemde açılıyor, gece mutabakat raporu | Ardışık 5 gün fark yok |
| **3. Devralma** | 1 hafta | Tek misafirhane tamamen yeni sistemde, Oracle salt okunur | Bir hafta sorunsuz |
| **4. Yaygınlaştırma** | 4 hafta | Diğer üç misafirhane sırayla | Hepsi devrede |
| **5. Kapanış** | — | Oracle Forms modülü arşive | — |

**Toplam ≈ 13 hafta.**
**Geri dönüş planı:** her aşamada Oracle tarafı bir hafta daha yazılabilir tutulur;
sorun çıkarsa DNS tek kayıtla eski sisteme döner.

**Eğitim:** uygulama içinde adım adım **Kullanım Rehberi** ve soru yanıtlayan yardımcı
(«Madenci») vardır; ayrıca her misafirhanede yarım günlük uygulamalı eğitim önerilir.

---

## 10. Maliyet

| Kalem | A (tek sunucu) | B (Kubernetes) |
|---|---|---|
| Yazılım lisansı | **0** (tümü açık kaynak) | **0** |
| Donanım/VM | 1 VM | Paylaşımlı kümede pay |
| Geliştirme | Aynı — modülün yazımı, göç, test | Aynı |
| Kurulum emeği | ~1 hafta | ~3 hafta (küme yoksa +4) |
| Yıllık işletme | 1 kişi, yarı zamanlı | Platform ekibinin içinde |
| SMS | Gönderim başına sağlayıcı ücreti | Aynı |

Rakamlandırma için gerekenler: kurumun VM birim maliyeti, SMS birim ücreti ve
geliştirme kaynağının iç/dış olacağı. **Bu üç girdi olmadan verilen bütçe rakamı
güvenilir olmaz** — bu yüzden burada adam-gün ve kalem listesi verilmiştir.

---

## 11. Riskler

| Risk | Olasılık | Etki | Azaltma |
|---|---|---|---|
| Eski veride yatak çakışması bulunması | **Yüksek** | Göç durur | Göçten önce çakışma raporu çıkarılır, işletme birimiyle temizlenir. *Bu, sistemin ilk faydasıdır* |
| Kullanıcı direnci (alışkanlık) | Orta | Yavaş benimseme | Pilot misafirhanede süper-kullanıcı, uygulama içi rehber, çift yazma dönemi |
| SMS sağlayıcı kotası/gecikmesi | Orta | Bildirim gitmez | Kuyruk + yeniden deneme; gönderilemeyen bildirim ekranda işaretli |
| Kubernetes'in gereğinden karmaşık gelmesi | Orta | İşletme yükü | Küme yoksa A seçeneğiyle başlanır |
| Tek kişiye bağımlılık | Orta | Bakım riski | Belgelenmiş kurulum, GitOps, iki kişilik bilgi paylaşımı |
| KVKK gerekliliklerinin geç fark edilmesi | Düşük | Yeniden çalışma | Aydınlatma ve saklama süreleri 0. aşamada netleştirilir |

---

## 12. Karar gerektiren noktalar

Brifing sonunda şu altı sorunun yanıtlanması gerekir:

1. **Veritabanı:** PostgreSQL mi, mevcut Oracle lisansıyla Oracle'da mı kalınacak?
2. **Çalışma ortamı:** Kurumda işletilen bir Kubernetes kümesi var mı? Yoksa A seçeneği onaylanıyor mu?
3. **Kimlik:** LDAP/AD bağlantısı için hangi grup yapısı kullanılacak; AD grubu → rol eşleştirmesini kim tanımlayacak?
4. **SMS:** Hangi sağlayıcı, hangi arayüz, yıllık kota?
5. **KVKK:** Saklama süreleri ve aydınlatma metni kim tarafından onaylanacak?
6. **Kaynak:** Geliştirme iç kaynakla mı yapılacak, hizmet alımı mı? Pilot misafirhane hangisi olacak?

---

## Ek — prototipin durumu

Bu belgedeki kararların çoğu, çalışan prototipte **görülebilir** durumdadır:

- Yerleştirme motoru, kapora akışı, dekont onayı, kahvaltı yoklaması, ay sonu belgesi,
  rol yetkileri, SMS günlüğü, mobil arayüz: hepsi çalışıyor.
- Tekrar gelen misafirin bulunup formun kendiliğinden dolması: çalışıyor.
- 14 dosyalık otomatik test takımı (`testler/`) her değişiklikte koşuyor.

**Prototipte olmayan ve kurulumda eklenecekler:** gerçek kimlik doğrulama, sunucu taraflı
yetki denetimi, gerçek veritabanı ve çakışma kısıtı, gerçek SMS gönderimi, muhasebe entegrasyonu.
