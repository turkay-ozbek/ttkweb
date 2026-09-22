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

Uygulama ana menüden açılan on odaklı sayfadan oluşur; her sayfa tek bir işi yapar.

| Kod | Sayfa | İçerik |
|---|---|---|
| MSFH-W01 | **Bugünkü Durum** | Dolu/boş yatak, giriş-çıkış, temizlik sayıları; misafirhane karşılaştırması; bugünün işleri ve son işlemler |
| MSFH-W02 | **Doluluk Takvimi** | 30 günlük doluluk şeridi, seçili tarih aralığında garanti kalan yatak ve gece bazında boşluk |
| MSFH-W03 | **Oda ve Yatak Durumu** | Oda kartlarında hangi yatakta kimin kaldığı (isimli/kompakt); talep seçiliyken yerleştirme modu (sürükle-bırak veya tıklayarak) |
| MSFH-W04 | **Yatak Listesi** | Oda ve yatak numarasına göre misafir tablosu; dolu/boş süzgeci ve arama |
| MSFH-W05 | **Rezervasyon Talepleri** | Talep listesi, seçili talep özeti, otomatik / manuel / haritada yerleştirme |
| MSFH-W06 | **Dekont ve Onay** | Kapora dekontlarının PDF önizlemesiyle incelenip onaylanması (misafirhane müdürü) |
| MSFH-W07 | **Peşinat ve Tahsilat** | Dönem filtresi, iş listeleri, ₺ Tahsilat Al, süresi dolanlar, peşinat kuralı |
| MSFH-W08 | **Statü Takibi** | Talep → Kapora Bekleniyor → Müdür Onayı Bekliyor → Onaylı → Konaklıyor → Çıkış → İptal akışı |
| MSFH-W09 | **Kullanıcı ve Yetki** (Admin) | Kullanıcılar, roller, misafirhane yetkisi ve yetki matrisi |
| MSFH-W11 | **Kahvaltı Takibi** | Günlük kahvaltı yoklaması — kahvaltıya inmeyen misafirlerin işaretlenmesi (resepsiyon işler, muhasebe görür) |
| MSFH-W12 | **Ay Sonu Belgesi** | Muhasebe ister, resepsiyon hazırlar; konaklama gecesi, kahvaltı ve tahsilat sayılarını içeren PDF |
| MSFH-W10 | **Kullanım Rehberi** | Adım adım anlatım: kayıt açma, kapora, dekont onayı, yerleştirme, tahsilat, giriş-çıkış, rol yetkileri ve SSS (yalnız üst banttaki «Rehber» düğmesinden açılır) |

> Form kodları (MSFH-Wxx) yalnız bu belgede ve API sözleşmesinde kullanılır; kullanıcı
> arayüzünde gösterilmez.

### Üst bant ve misafirhane seçimi

Üst bant sadedir: TTK logosu, **«&lt;Misafirhane&gt; Bilgi Sistemi»** başlığı (oturum açan
kullanıcının çalıştığı misafirhaneye göre yazılır), DEMO rozeti, **Rehber** düğmesi ve
oturumu kapatma simgesi. Birden çok misafirhaneye yetkili kullanıcılar misafirhaneyi
**ana menünün üstündeki düğme sırasından** veya «Bugünkü Durum» sayfasındaki karşılaştırma
tablosundan değiştirir. Çalışılan misafirhane her sayfanın başlığında yazar
(örn. «Ankara Misafirhanesi Rezervasyon Talepleri»).

## Yardım öğeleri

Üç yerden yardım alınır; üçü de aynı bilgi kaynağını (kullanım rehberi ve ekrandaki
canlı veri) kullanır:

| Öğe | Nerede | Ne işe yarar |
|---|---|---|
| **İpucu** | Her düğme ve simgede | Üzerine gelince düğmenin ne yaptığını yazar. Pasif düğmelerde hangi yetkinin gerektiğini söyler. `data-ipucu` yazılan her öğede çıkar; eski `title` değerleri de devralınır |
| **İşlem araması** | Sayfa şeridinin sağ ucu · **Ctrl + K** | «Hangi işlemi yapmak istiyorsunuz?» — sayfa, işlem, rehber başlığı, misafirhane ve kayıt (ad soyad / Tc kimlik / rezervasyon no) tek kutudan aranır. ↑ ↓ ile gezilir, ↵ ile seçilir |
| **Madenci** (yardımcı bot) | Sağ alt köşe, baretli maskot | Doluluk, bekleyen talep, onaydaki dekont, tahsilat gibi soruları **canlı veriyle** yanıtlar; «kapora nasıl işlenir?» gibi soruları rehberden adım adım anlatır ve ilgili sayfaya bağlantı verir |

> Madenci bir **demo asistandır**: yanıtlar ekrandaki veriden ve kullanım rehberinden kural
> tabanlı üretilir, dış bir yapay zekâ servisine bağlanılmaz. Kurulumda yerine kurumsal bir
> dil modeli servisi konabilir; soru–yanıt eşleştirmesi `botYanit()` işlevindedir.

## Kullanım rehberi

Uygulamanın nasıl kullanılacağı, **her iş için hangi sayfada hangi düğmeye basılacağı**
sırasıyla anlatılmıştır. Rehbere **yalnız üst bandın sağındaki «Rehber» düğmesinden** ulaşılır; sayfa şeridini ve
ana menüyü kalabalıklaştırmamak için oralarda görünmez.

- Dokuz başlık: başlarken · yeni kayıt · kapora tahsilatı · dekont ve müdür onayı ·
  oda/yatak yerleştirme · doluluk ve boş yatak arama · giriş-çıkış-uzatma-iptal ·
  rol yetkileri · sık sorulan sorular.
- Her adımın sonundaki bağlantı doğrudan ilgili sayfayı açar; rolünüze kapalı başlıklar
  rozetle işaretlenir.
- «Rehberi yazdır» düğmesiyle çıktı alınabilir.

Yazılı karşılığı: [`docs/kullanim-rehberi.md`](docs/kullanim-rehberi.md)

## Test

Prototipi baştan sona sınamak için adım adım senaryolar:
[`docs/test-plani.md`](docs/test-plani.md) — giriş ve yetkilendirme, yeni kayıt,
kapora/dekont/müdür onayı, yerleştirmenin üç yolu, tahsilat, statü akışı, görüntüleme
sayfaları, kullanıcı yönetimi, arayüz/okunurluk ve sınır durumları; sonunda kabul ölçütü.

> Veriler bellektedir: **sayfayı yenilemek (F5) her şeyi sıfırlar.** Rol değiştirirken
> sağ üstteki çıkış simgesini kullanın.

Otomatik testler [`testler/`](testler/) altındadır (Playwright, kurulum yok — dosyayı
doğrudan `file://` ile açar):

```bash
npm install -D playwright && npx playwright install chromium
node testler/tumu.mjs          # on test dosyasının tamamı, sonunda özet tablo
node testler/tumu.mjs 05 09    # yalnız numarası verilen dosyalar
```

Test planındaki senaryoların çoğu bu takımla otomatik koşar; hangi bölümü hangi dosyanın
kapsadığı [`docs/test-plani.md`](docs/test-plani.md) sonundaki tabloda, elle bakılması
gereken başlıklar da aynı yerdedir.

## Kurulum kararları

Prototipin arkasındaki mimari sorular ayrı belgelerde yanıtlanmıştır:

| Konu | Belge | Özet |
|---|---|---|
| **Brifing** | [`docs/mimari-brifing.md`](docs/mimari-brifing.md) | **Başkasına anlatmak için tek parça belge:** yönetici özeti, bugünkü sorunlar, katman mimarisi, veritabanı ve Kubernetes kararlarının gerekçesi, entegrasyonlar, KVKK, RPO/RTO, 13 haftalık göç planı, maliyet kalemleri, risk tablosu, kurum ağı dışından mobil erişim ve karar gerektiren yedi soru |
| Veritabanı | [`docs/veritabani.md`](docs/veritabani.md) | **PostgreSQL 16.** Aynı yatağın iki kez verilmesini `EXCLUDE … daterange` kısıtı veritabanı seviyesinde engeller. Geçmiş sınırsız tutulur (~250 MB/yıl); tekrar gelen misafir Tc kimlik no ya da bulanık ad aramasıyla saniyeler içinde bulunup formu doldurur |
| Canlıya çıkış | [`docs/dagitim-mimarisi.md`](docs/dagitim-mimarisi.md) | Kurumda Kubernetes kümesi **varsa** K8s + CloudNativePG + Argo CD; **yoksa** tek sunucu + Docker Compose ile çıkıp konteynerleri hazır tutmak. Bu ölçekte küme kurmak tek başına gerekçelendirilemez |
| Mobil | [`docs/mobil-arayuz.md`](docs/mobil-arayuz.md) | Ayrı uygulama değil, duyarlı web + PWA. Müdür telefonla arandığında kaydı telefondan açabilir; 390 px'te taşma yok. **PWA masaüstü kadar etkili mi?** Kayıt alma, onaylama ve sorgulamada evet; oda haritasında toplu yerleştirme, 30 günlük takvim ve toplu veri girişi masaüstü işi olarak kalır |
| Mobil güvenlik | [`docs/mobil-guvenlik.md`](docs/mobil-guvenlik.md) | **Risk mobil verinin kendisinde değil, sistemi internete açmakta ve cihazdadır.** Üç seçenek (kurum VPN'i / ZTNA / DMZ'den yayımlama) karşılaştırılır; öneri VPN ile başlayıp ZTNA'ya geçmek, uygulamayı hiç yayımlamamaktır. Oturum, veri, ağ ve cihaz katmanlarında alınacak önlemler ve KVKK etkisi listelenir |

## Kapora ve dekont onayı

Şahsi misafirin rezervasyon listesine girebilmesi için konaklama bedelinin bir bölümünü
(varsayılan: **ilk gecenin yatak bedeli**, asgari 750 ₺) kapora olarak yatırması gerekir.
Dekont sisteme yüklenir, **misafirhane müdürü** dekontu inceleyip onaylar; onaylanmadan
yatak tahsis edilemez. Kurum misafiri ve protokol kayıtları kaporadan muaftır.

Ayrıntı: [`docs/kapora-onay-akisi.md`](docs/kapora-onay-akisi.md) ·
Test senaryoları: [`docs/test-senaryolari-kapora.md`](docs/test-senaryolari-kapora.md)

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

## Kurum logosu

TTK logosu prototipe gömülüdür: giriş ekranında 64 px, üst barda 36 px olarak görünür.
Kaynak dosya depoda [`ttk-logo.svg`](ttk-logo.svg) olarak durur; HTML içinde ise tek dosya
yapısı bozulmasın diye `LOGO_VERI` sabitine base64 SVG olarak yazılmıştır.

Logoyu değiştirmek isterseniz `misafirhane-prototip.html` içindeki `const LOGO_VERI = '...'`
satırını güncellemeniz yeterlidir; giriş ekranı ve üst bar birlikte değişir. Satırı `''`
yaparsanız beyaz daire içinde «TTK» yazılı yedek gösterime döner.

```bash
# Linux/macOS — yeni bir logoyu gömmek için
B64=$(base64 -w0 yeni-logo.svg)
sed -i "s|const LOGO_VERI = '[^']*';|const LOGO_VERI = 'data:image/svg+xml;base64,$B64';|" misafirhane-prototip.html
```

Logoyu HTML'in yanına koyup dosya adı da verebilirsiniz: `const LOGO_VERI = 'ttk-logo.svg';`
Önerilen biçim: kare (1:1) SVG veya en az 256×256 piksel PNG.

## Sürüm geçmişi

Her değişiklik sürüm numarası ile [`CHANGELOG.md`](CHANGELOG.md) dosyasına işlenir;
sürüm uygulamanın alt bilgi çubuğunda görünür.
