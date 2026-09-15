# TTK Misafirhane Bilgi Sistemi — Web Prototipi

Türkiye Taşkömürü Kurumu'nun TTKNET platformundaki **Misafirhane Bilgi Sistemi**
modülü için hazırlanmış, karar vericiye gösterilmek üzere tasarlanmış çalışan
demo prototipidir.

> **Mevcut sisteme dokunmaz.** Oracle Forms ekranlarında (MSFH0100, MSFH0350,
> MSFH0030) hiçbir değişiklik yapılmaz; prototip bunların yanında, bağımsız
> çalışır. Tüm veriler tarayıcı belleğinde üretilir — **gerçek misafir verisi
> kullanılmaz**, Tc kimlik numaraları 11 haneli sahte numaralardır. Gerçek ödeme
> veya muhasebe entegrasyonu yoktur.

## Çalıştırma

`misafirhane-prototip.html` dosyasını herhangi bir modern tarayıcıda açmak
yeterlidir; kurulum, sunucu veya derleme adımı yoktur. React, Tailwind ve Babel
CDN'den yüklenir, dolayısıyla ilk açılışta internet erişimi gerekir.
Masaüstü önceliklidir, 1600 px genişlikte çalışacak şekilde tasarlanmıştır.

## Giriş ve roller

Uygulama bir **giriş ekranı** ile açılır (TTKNET «Bağlantı» penceresinin karşılığı).
Demo hesaplarına giriş ekranındaki listeden tek tıkla girilebilir:

| Kullanıcı | Şifre | Rol | Kapsam |
|---|---|---|---|
| `TTK7719` | 7719 | Sistem Yöneticisi (Admin) | Tüm misafirhaneler, kullanıcı ve yetki yönetimi |
| `MSF1001` | 1234 | Misafirhane Müdürü | Ankara |
| `MSF1002` | 1234 | Misafirhane Müdürü | Yayla Konağı, Amasra, Armutçuk |
| `MSF2001` | 1234 | Resepsiyon Görevlisi | Ankara |
| `MSF2002` | 1234 | Resepsiyon Görevlisi | Yayla Konağı |
| `MSF3001` | 1234 | Muhasebe Görevlisi | Tüm misafirhaneler |
| `MSF2003` | 1234 | Resepsiyon (pasif) | Amasra — oturum açamaz |

Yetkisi olmayan sekmeler gizlenir, yetkisiz düğmeler pasif gösterilir ve gerekçesi
ipucunda yazar. Rol × yetki matrisi Admin rolündeki **Kullanıcı ve Yetki Yönetimi**
ekranındadır; ayrıntısı [`docs/api-sozlesmesi.md`](docs/api-sozlesmesi.md) § 6'dadır.

> Kimlik doğrulama prototipte yalnız tarayıcıda çalışır ve şifreler dosyada açık
> yazılıdır. Kurulumda TTKNET/YBS oturumu ve **sunucu taraflı** yetki denetimi kullanılır.

## Sayfalar

Uygulama ana menüden açılan sekiz odaklı sayfadan oluşur; her sayfa tek bir işi yapar.

| Kod | Sayfa | İçerik |
|---|---|---|
| MSFH-W01 | **Bugünkü Durum** | Dolu/boş yatak, giriş-çıkış, temizlik sayıları; misafirhane karşılaştırması; bugünün işleri ve son işlemler |
| MSFH-W02 | **Doluluk Takvimi** | 30 günlük doluluk şeridi, seçili tarih aralığında garanti kalan yatak ve gece bazında boşluk |
| MSFH-W03 | **Oda ve Yatak Durumu** | Oda kartlarında hangi yatakta kimin kaldığı (isimli/kompakt); talep seçiliyken yerleştirme modu (sürükle-bırak veya tıklayarak) |
| MSFH-W04 | **Yatak Listesi** | Oda ve yatak numarasına göre misafir tablosu; dolu/boş süzgeci ve arama |
| MSFH-W05 | **Rezervasyon Talepleri** | Talep listesi, seçili talep özeti, otomatik / manuel / haritada yerleştirme |
| MSFH-W06 | **Peşinat ve Tahsilat** | Dönem filtresi, iş listeleri, ₺ Tahsilat Al, süresi dolanlar, peşinat kuralı |
| MSFH-W07 | **Statü Takibi** | Talep → Peşinat Bekleniyor → Onaylı → Konaklıyor → Çıkış → İptal akışı ve kayıt listesi |
| MSFH-W08 | **Kullanıcı ve Yetki** (Admin) | Kullanıcılar, roller, misafirhane yetkisi ve yetki matrisi |

## Her çözünürlükte okunur arayüz

- Yazı ölçeği ekran genişliğine göre akar (1280 px'te 15,2 px → 1920 px'te 17,2 px).
- Üst bardaki **A− / %100 / A+** düğmeleriyle kullanıcı kendi ekranına göre büyütüp
  küçültebilir; tercih tarayıcıda saklanır.
- Kart ve oda ızgaraları sütun sayısını ekrana göre kendisi belirler; geniş tablolar kendi
  içinde yatay kaydırılır, sayfa gövdesi taşmaz.

Üst bardaki **+ Yeni Kayıt** düğmesi (her sayfadan erişilebilir) yeni bir rezervasyon
veya doğrudan giriş kaydı açar: misafir satırları (Tc kimlik no, adı soyadı, cinsiyet,
sicil no, görev sevk no, harcırah), canlı müsaitlik özeti, yatağı elle seçme veya
«Uygun Yatağı Otomatik Bul», peşinat önizlemesi ve tahsilat işaretlemesi. Doluluk
panosunda boş bir yatağa tıklayıp **«Bu yatağa yeni kayıt aç»** ile de başlanabilir.

Üst bantta **+1 / +7 gün** düğmeleriyle sistem tarihi ilerletilerek statü
kurallarının (giriş, çıkış, süre aşımından iptal) canlı çalıştığı gösterilebilir.

## Demo verisi

4 tesis · 120 oda · 240 yatak · yaklaşık 5.000 rezervasyon kaydı (3 ay geçmiş +
3 ay gelecek), iptaller ve uzatmalar dahil. Veri deterministik üretilir; her
açılışta aynı demo görüntülenir.

| Tesis | Oda | Yatak |
|---|---:|---:|
| Yayla Konağı (Zonguldak) | 26 | 52 |
| Ankara Misafirhanesi | 40 | 80 |
| Amasra Misafirhanesi (Bartın) | 31 | 61 |
| Armutçuk Misafirhanesi (Ereğli) | 23 | 47 |

## Belgeler

- [`docs/yerlestirme-algoritmasi.md`](docs/yerlestirme-algoritmasi.md) — otomatik
  yerleştirme mantığı: öncelik, kısıtlar, skorlama, geri alma, gerekçe üretimi
- [`docs/api-sozlesmesi.md`](docs/api-sozlesmesi.md) — mevcut Oracle veritabanına
  bağlanmak için tablo/alan listesi ve REST API sözleşmesi taslağı
- [`docs/alan-eslestirme.md`](docs/alan-eslestirme.md) — MSFH0100 / MSFH0350 /
  MSFH0030 ekranlarındaki her alanın yeni tasarımdaki karşılığı

## Terminoloji

Mevcut sistemin alan adları ve kodları bilinçli olarak korunmuştur: *peşinat,
peşinattan kalan, yatak no, yatak fiyatı, harcırah miktarı, görev sevk no,
kurum-şahıs, ödeyecek, makbuz no, sicil no, geliş/çıkış tarihi, kaldığı gün* ve
ödeme türü kodları (KRT, NKT, MSD, BOS).

## Sürüm geçmişi

Her değişiklik sürüm numarası ile [`CHANGELOG.md`](CHANGELOG.md) dosyasına işlenir;
sürüm uygulamanın alt bilgi çubuğunda görünür.
