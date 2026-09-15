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

## Ekranlar

| Kod | Ekran | İçerik |
|---|---|---|
| MSFH-W01 | **Doluluk Panosu** | 30 günlük doluluk takvimi (dolu/boş yatak, giriş, çıkış), oda/yatak haritası (her yatakta misafir adı), **Yatak Listesi** görünümü (hangi odada kaç numaralı yatakta kim yatıyor), seçili tarih aralığı için kalan yatak analizi, dört tesisin karşılaştırması |
| MSFH-W02 | **Rezervasyon ve Yerleştirme** | Talep listesi ile oda/yatak doluluğu tek ekranda ve canlı bağlı; **otomatik yerleştirme** önerisi ve onay akışı, **manuel yerleştirme penceresi** (misafir başına oda/yatak seçimi, odadaki mevcut misafirler görünür), sürükle-bırak veya tıklayarak yerleştirme, konaklanacak gecelerin tek tek incelenebildiği harita, yerleştirilemeyen talepler için gerekçe |
| MSFH-W04 | **Kullanıcı ve Yetki Yönetimi** (yalnız Admin) | Kullanıcı listesi, rol ve misafirhane yetkisi atama, aktif/pasif yapma, yeni kullanıcı tanımlama, rol × yetki matrisi |
| MSFH-W03 | **Peşinat / Tahsilat ve Statü** | Dönem (zaman) filtresi ve iş listeleri (tahsilat bekleyen, süresi dolan, bugün giriş/çıkış), statü akışı, satır başındaki **₺ Tahsilat Al** düğmesiyle tek tıkla tahsilat, tesis bazında peşinat kuralı, süresi dolan taleplerin toplu iptali |

Her ekrandan erişilebilen **+ Yeni Rezervasyon / Kayıt** düğmesi yeni bir rezervasyon
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
