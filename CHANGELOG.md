# Sürüm Geçmişi

TTK Misafirhane Bilgi Sistemi — Web Prototipi.
Sürüm numarası uygulamanın alt bilgi çubuğunda görünür.

Biçim: `ANA.ÖZELLİK.DÜZELTME` — ANA: ekran/veri modeli değişikliği,
ÖZELLİK: yeni yetenek, DÜZELTME: hata ve arayüz düzeltmeleri.

---

## [2.5.0] — 17.09.2026
### Eklendi — üç yardım öğesi
- **İpucu (tooltip) katmanı.** Düğmenin ne yaptığı, üzerine gelince okunaklı bir balonda
  yazıyor. Tarayıcının kendi `title` balonundan farkları: gecikmesi tutarlı, ekran dışına
  taşmıyor, klavyeyle odaklanınca da çıkıyor ve **pasif düğmelerde de görünüyor** (imlecin
  altındaki öğe `elementFromPoint` ile bulunur, çünkü `disabled` düğmeler fare olayı
  yaymaz). Mevcut `title` değerleri kendiliğinden devralınıyor; yerleştirme, tahsilat,
  dekont ve onay düğmelerine ayrıca açıklayıcı metinler yazıldı.
- **İşlem araması** — üst bandın ortasında «Hangi işlemi yapmak istiyorsunuz?» kutusu,
  her yerden **Ctrl + K**. Sayfalar, işlemler, rehber başlıkları, misafirhaneler ve kayıtlar
  (ad soyad / Tc kimlik no / rezervasyon no) tek kutudan aranıyor; ↑ ↓ ile gezilip ↵ ile
  seçiliyor. Aramadan seçilen kayıt talep ekranında açılıyor, tarih süzgeci gerekiyorsa
  kendiliğinden genişliyor.
- **Bareti — yardımcı bot.** Sağ alt köşede madenci bareti takan maskot. Doluluk, bugünkü
  giriş-çıkış, bekleyen talep, onaydaki dekont, tahsilat bekleyen kayıt ve kapora kuralı
  sorularını **canlı veriyle** yanıtlıyor; «kapora nasıl işlenir?», «dekont nasıl
  onaylanır?» gibi soruları kullanım rehberinden adım adım anlatıp ilgili sayfaya bağlantı
  veriyor; «ne yapabilirim?» sorusuna rolün yetkilerini sayıyor; misafirin hangi odada
  kaldığını buluyor. Yanıtlar kural tabanlıdır, dış bir yapay zekâ servisine bağlanılmaz —
  pencerenin altında bu açıkça yazıyor.
- `testler/11-ipucu-arama-bot.mjs`: 47 denetim — ipucunun çıkması/kaybolması, pasif
  düğmedeki yetki gerekçesi, `title` devralma, Ctrl + K, sayfa/işlem/kayıt araması, ok
  tuşlarıyla gezinme, on soru–yanıt eşleşmesi, yanıttaki bağlantının doğru sayfayı açması,
  yardımcının ölçek kutusuyla çakışmaması.

### Değişti
- Rehber başlıklarına arama anahtarları eklendi; bot eşleştirmesi Türkçe çekim eklerine
  takılmadan doğru başlığı buluyor («kapora nasıl işlenir» → kapora başlığı).

## [2.4.0] — 17.09.2026
### Eklendi — elle test planı otomatikleştirildi
- `testler/` altına beş yeni test dosyası ve ortak yardımcı modül (`ortak.mjs`) eklendi;
  `tumu.mjs` hepsini sırayla koşturup özet tablo basıyor ve kalan denetim varsa 1 ile çıkıyor.
  - `06-yetki-matrisi.mjs` — dört rol × beş düğme beklenti tablosu, pasif düğmelerin gerekçe
    ipucu, 14×4 yetki matrisi, kullanıcı ekleme, yinelenen kullanıcı adının engellenmesi,
    rol ve misafirhane değişikliğinin kullanıcıya yansıması, pasife alınan hesabın reddi.
  - `07-yeni-kayit-dogrulama.mjs` — zorunlu alan ve Tc denetimi, geçersiz tarih, ok tuşları,
    çıkış tarihinin gelişten öne alınamaması, kişi sayısı ve aile, kurum/şahıs statü
    önizlemesi, formdan otomatik yatak bulma, «Vazgeç», üç alanla arama.
  - `08-tahsilat-statu-zaman.mjs` — kapora kuralı değişikliği, altı dönem filtresi, iş
    listelerinin sayı/satır tutarlılığı, tam ve kısmi tahsilat, kayıt hareketleri, yedi statü
    kutusu ve süzme, gün ilerletme, toplu iptal, muhasebe yetki sınırı.
  - `09-goruntuleme-tutarlilik.mjs` — dört misafirhanede dolu+boş+temizlik=kapasite ve yüzde
    tutarlılığı, takvim dönem kaydırma ve aralık mantığı, oda haritası lejantı/ipuçları/
    görünüm/tarih değişimi, yatak listesi sıralama ve süzgeçleri, toplu yerleştirme
    önerisinin onaylanmadan uygulanmaması.
  - `10-arayuz-ve-sinir-durumlari.mjs` — ölçek sınırları ve kalıcılığı, üç çözünürlük ×
    dokuz sayfa taşma, 1280px + %135 birlikte, ekranda form kodu olmaması, «Rehberi yazdır»,
    oturum kapatınca verinin korunması, geçmiş tarihli kayıt, kişi sayısı oynatma, kapora
    üstü tahsilat, arama sınırları.
- `docs/test-plani.md` bölüm başlıklarına `[oto: NN]` işaretleri ve «elle bakılması
  gerekenler» listesi eklendi.

### Düzeltildi
- **Yeni kayıt formunda eski terim:** statü önizlemesi «Peşinat Bekleniyor» yazıyordu; statü
  adları artık tek kaynaktan (`STATULER`) okunuyor, «Kapora Bekleniyor» görünüyor.
- **«Boş Yatak» kartındaki yanıltıcı yüzde:** kart 5 boş yatak gösterirken alt satırında
  «%16 boşluk» yazıyordu, çünkü yüzde doluluk oranından türetiliyor ve temizlikteki yatakları
  da boş sayıyordu. Yüzde artık kartın kendi sayısından hesaplanıyor; «Temizlikte» kartı da
  dolu+boş+temizlik = kapasite ilişkisini yazıyor.
- README ve `docs/alan-eslestirme.md` içinde kalmış «Peşinat Bekleniyor» statü adları
  güncel akışa göre düzeltildi.

## [2.3.2] — 17.09.2026
### Düzeltildi
- **Çelişkili statü:** demo verisinde kaporası aranmayan kayıtlar (kurum misafiri, protokol,
  bedelsiz) da «Kapora Bekleniyor» statüsüne düşebiliyordu; ekranda «Kapora: aranmıyor ·
  Statü: Kapora Bekleniyor» gibi kendi kendisiyle çelişen satırlar oluşuyordu. Peşinat
  tutarı sıfır olan kayıt artık «Talep» statüsünde üretiliyor. (Sürükle-bırak testinde bulundu.)

### Eklendi — otomatik test takımı
- [`testler/`](testler/) altında Playwright ile koşan beş uçtan uca test ve
  [`testler/README.md`](testler/README.md) (kurulum, koşturma, kapsam tablosu).
- **Sürükle-bırak yerleştirme otomatik sınanıyor:** hedef yatağın vurgulanması, dolu yatağın
  gerekçeli reddi, müsait yatağa bırakınca tahsis, kart üzerindeki × ile tahsisin kalkması,
  tıklayarak yerleştirme, yerleştirme modunun kapanması ve kapora kuralının sürükle-bırak
  yolunda da uygulanması. Gerçek fare olayları HTML5 sürükleme üretmediği için ortak bir
  `DataTransfer` üzerinden sentetik `DragEvent` zinciri gönderiliyor.
- **Dekont önizlemesi otomatik sınanıyor:** üretilen örnek PDF'in yapısı (`%PDF-1.4`, `xref`,
  `trailer`, `%%EOF`, Helvetica) ve içeriği (dekont no, rezervasyon no, banka), önizlemenin
  `data:application/pdf` kaynağıyla iframe'de açılması, PNG dekontun `<img>` ile gerçekten
  yüklenmesi, «demo» rozeti, «Yeni sekmede aç» bağlantısı ve 5 MB dosya sınırı.
- Dört misafirhanede kapora statüsü/tutarı tutarlılık taraması (regresyon koruması).

## [2.3.1] — 16.09.2026
### Düzeltildi
- **«Bekleyen talepler» süzgeci kayıt kaybediyordu.** Müdür kapora dekontunu onayladıktan
  sonra kayıt «Onaylı» statüsüne geçiyor, ancak henüz yatağı olmadığı hâlde talep
  listesinin varsayılan süzgecinden düşüyordu. Süzgeç artık dekont onayındaki ve
  onaylanmış olup yatağı olmayan kayıtları da tutuyor; adı «Bekleyen işler
  (yerleştirilmemiş)» olarak netleştirildi. (Uçtan uca testte bulundu.)

### Eklendi
- [`docs/test-plani.md`](docs/test-plani.md): 11 bölüm, ~90 adımlık elle test senaryoları —
  giriş ve yetkilendirme, yeni kayıt, kapora/dekont/onay, yerleştirmenin üç yolu, tahsilat,
  statü akışı ve zaman, görüntüleme sayfaları, kullanıcı yönetimi, rehber, arayüz ve
  sınır durumları, kabul ölçütü.

## [2.3.0] — 16.09.2026
### Değişti — arayüz sadeleştirmesi (ikinci tur)
- **Rehber yalnız üst bandın sağında.** Sayfa şeridinden ve ana menüden «Kullanım Rehberi»
  kartı ile «Yardım» grubu kaldırıldı; sayfa `gizli` olarak işaretlendi.
- **«?» (Prototip ve yetkiler hakkında) düğmesi ve penceresi kaldırıldı.** İçeriği zaten
  `docs/yerlestirme-algoritmasi.md` ve uygulama içi Kullanım Rehberi'nde bulunuyor.
- **Kullanıcı sekmesi (kafa simgesi) kaldırıldı**; üst bantta yalnız oturumu kapatma simgesi kaldı.
- **Üst banttaki misafirhane seçicisi kaldırıldı.** Başlık artık oturum açan kullanıcının
  misafirhanesine göre yazıyor: «Ankara Misafirhanesi Bilgi Sistemi», «Yayla Konağı Bilgi Sistemi»…
  Birden çok misafirhaneye yetkili kullanıcılar için ana menünün üstüne misafirhane düğmeleri
  eklendi; tek misafirhaneli kullanıcıda bu sıra hiç görünmez.
- **Çalışılan misafirhane sayfa başlıklarında** yazıyor: «Ankara Misafirhanesi Rezervasyon
  Talepleri», «Yayla Konağı Oda ve Yatak Durumu» gibi.
- **Form kodları (MSFH-Wxx) arayüzden kaldırıldı** — ana menü kartlarından, alt bilgi
  çubuğundan ve rehber bağlantılarından. Kodlar veri modelinde ve belgelerde korunuyor.
- **Alt bilgi çubuğundaki oturum kaydı kısaltıldı**: ad, unvan ve yetkili misafirhane listesi
  yerine yalnız «Oturum açıldı: TTK7719».
- «Kullanıcı ve Yetki» sayfasına, diğer sayfalarla tutarlı olsun diye sayfa başlığı eklendi.

## [2.2.0] — 16.09.2026
### Eklendi — kullanım rehberi
- **Kullanım Rehberi sayfası (MSFH-W10)**: dokuz başlıkta adım adım anlatım — başlarken,
  yeni rezervasyon kaydı açma, kapora/peşinat tahsilatı, dekont yükleme ve müdür onayı,
  oda-yatak yerleştirme (otomatik / manuel / haritada), doluluk ve boş yatak arama,
  giriş-çıkış-uzatma-iptal, rol yetkileri tablosu ve sık sorulan sorular.
- Rehberdeki her adımın sonunda ilgili sayfayı açan bağlantı; rolünüze kapalı başlıklar
  rozetle işaretlenir; «Rehberi yazdır» düğmesi.
- Üst bantta **Rehber** kısayolu ve ana menüde «Yardım» grubu altında rehber kartı.
- Belge karşılığı: [`docs/kullanim-rehberi.md`](docs/kullanim-rehberi.md).
- Üst bandın sağına **kullanıcı sekmesi**: yuvarlak kişi simgesine tıklanınca ad, unvan,
  kullanıcı adı, rol, yetkili misafirhaneler ve son giriş bilgisi açılır (dışarı tıklayınca kapanır).

### Değişti — arayüz sadeleştirmesi
- **Sistem tarihi artık gerçek günle başlıyor**; uygulama açıldığı günün tarihini kullanır.
- Arayüz ölçeği kontrolü üst banttan alınıp **ekranın sağ alt köşesine**, dikey ve yarı saydam
  bir kutu olarak taşındı; büyüteç (+) ve büyüteç (−) simgeleri kullanılıyor.
- Üst banttan **+ Yeni Kayıt** düğmesi, tarih göstergesi ve **+1 / +7 gün** düğmeleri kaldırıldı.
  Gün ilerletme, «Bugünkü Durum» sayfasındaki demo aracı şeridine taşındı.
- **Çıkış** yazısı yerine kapatma (güç) simgesi kullanılıyor.
- Ana menüden başlık bloğu (logo + «Misafirhane Bilgi Sistemi» + tesis/tarih/kullanıcı satırı)
  kaldırıldı; sayfa doğrudan kart listesiyle açılıyor.

## [2.1.0] — 16.09.2026
### Eklendi — kapora ve dekont onay akışı
- **Kapora zorunluluğu**: şahsi misafirin rezervasyon listesine girebilmesi için konaklama
  bedelinin bir bölümünü (varsayılan: **ilk gecenin yatak bedeli**, asgari 750 ₺) kapora
  olarak yatırması gerekiyor. Kurum misafiri ve protokol kayıtları muaf.
- **Dekont yükleme**: PDF/PNG/JPEG dosya yükleme (en çok 5 MB) veya demo için örnek dekont
  üretme; banka, dekont no, ödeme tarihi ve tutar alanları. Yüklenen kayıt «Müdür Onayı
  Bekliyor» statüsüne geçiyor.
- **Yeni ekran — Dekont ve Onay (MSFH-W06)**: misafirhane müdürü dekontu PDF önizlemesiyle
  inceleyip onaylıyor veya gerekçe yazarak reddediyor. Onay bekleyen / onaylanan /
  reddedilen sayaçları ve toplam kapora tutarı üstte görünüyor.
- **Yeni statü**: «Müdür Onayı Bekliyor» (Talep → Kapora Bekleniyor → Müdür Onayı Bekliyor
  → Onaylı → Konaklıyor → Çıkış; her aşamadan İptal).
- **Yerleştirme kısıtı**: kapora onaylanmadan yatak tahsis edilemiyor. Kural otomatik
  yerleştirmede (gerekçeli), manuel yerleştirme penceresinde ve haritada sürükle-bırak /
  tıklayarak yerleştirmede birlikte uygulanıyor.
- **Yeni yetkiler**: `rezervasyon.dekont` (yükleme — admin, müdür, resepsiyon, muhasebe) ve
  `rezervasyon.onay` (onaylama/reddetme — yalnız admin ve müdür).
- Kapora kuralı ayarları: hesap türü (gece / oran), kapora gecesi, müdür onayı zorunluluğu.
- Demo veri: onaylı kayıtlarda onaylanmış dekont, kapora bekleyenlerin bir bölümünde müdür
  onayında bekleyen dekont üretiliyor. Demo dekontlar açılabilir gerçek PDF olarak
  görüntüleme anında oluşturuluyor.
- Belgeler: `docs/kapora-onay-akisi.md` (akış, kural, veri modeli, API) ve
  `docs/test-senaryolari-kapora.md` (6 başlıkta 30 test adımı).

## [2.0.4] — 16.09.2026
### Değişti
- Logonun kırmızı çevre yazısı («Türkiye Taşkömürü Kurumu Genel Müdürlüğü» ve «1848»)
  artık beyaz zemin üzerinde okunuyor: dış elips ölçüsünde (rx 67,4 · ry 87,3) beyaz bir
  zemin, tüm çizimlerin altına eklendi. Elips dışı saydam kaldığı için lacivert bantta
  beyaz kare/halka görünmüyor.
- Logolar büyütüldü ve oranı korunacak biçimde yerleştirildi (yükseklik sabit, genişlik
  otomatik): giriş ekranı 96 px, üst bar 44 px. Ana menü başlığının yanına da 56 px logo
  eklendi.
- Ana menü kartlarında ekran kodunun (MSFH-W0x) satır kırması giderildi.

## [2.0.3] — 16.09.2026
### Değişti
- Logonun etrafındaki beyazlık kaldırıldı: SVG içindeki tam alanı kaplayan beyaz dikdörtgen
  zemin (`path1`) silindi, logo kabındaki beyaz daire (`rounded-full bg-white`) çıkarıldı.
  Logo artık saydam zeminle doğrudan lacivert üst bantta ve giriş ekranında duruyor.
  Logonun kendi iç beyaz dolgusu korundu.

## [2.0.2] — 16.09.2026
### Eklendi
- **Kurum logosu yerleştirildi**: TTK logosu giriş ekranında (64 px) ve üst barda (36 px)
  görünüyor. Logo, tek dosya yapısı korunacak şekilde `LOGO_VERI` sabitine base64 SVG
  olarak gömüldü; kaynak dosya ayrıca `ttk-logo.svg` olarak depoda.
- SVG, Inkscape düzenleyici verisinden (namedview, metadata, inkscape/sodipodi öznitelikleri)
  arındırıldı ve ölçekten bağımsız kullanım için sabit `width`/`height` yerine `viewBox`
  bırakıldı — her boyutta net görünüyor.

## [2.0.1] — 16.09.2026
### Eklendi
- Kurum logosu tek bir yerden besleniyor: `LOGO_VERI` sabiti doldurulduğunda giriş ekranı
  ve üst bardaki logo otomatik değişir. Boş bırakılırsa beyaz daire içinde «TTK» yazılı
  yedek gösterim kullanılır (mevcut davranış).
- `TtkLogo` bileşeni: logo hem giriş ekranında (48 px) hem üst barda (32 px) aynı kaynaktan
  gelir, oranı korunarak (`object-contain`) yerleşir.

## [2.0.0] — 15.09.2026
### Değişti — sayfa mimarisi
- Arayüz üç yoğun ekrandan **sekiz odaklı sayfaya** bölündü; her sayfa tek bir işi yapar:
  Bugünkü Durum (W01), Doluluk Takvimi (W02), Oda ve Yatak Durumu (W03), Yatak Listesi (W04),
  Rezervasyon Talepleri (W05), Peşinat ve Tahsilat (W06), Statü Takibi (W07),
  Kullanıcı ve Yetki (W08).
- **Ana Menü** eklendi: her sayfa, üzerinde canlı sayı taşıyan bir kart düğmesinden açılır
  (doluluk, boş yatak, bekleyen talep, tahsilat bekleyen kayıt…). Üstteki ince sayfa şeridi
  her yerden hızlı geçiş sağlar.
- Talepler sayfasından seçilen talep «Haritada Yerleştir» ile Oda ve Yatak Durumu sayfasında
  **yerleştirme moduna** geçirilir; harita, misafir kartları ve gece seçimi orada toplanır.
- Bugünkü Durum sayfasına «Bugünün İşleri» kısayolları ve son işlem listesi eklendi.

### Değişti — çözünürlük ve okunurluk
- Tipografi **rem tabanlı** hale getirildi; kök yazı boyutu ekran genişliğine göre akıyor
  (1280 px'te 15,2 px → 1920 px'te 17,2 px). Tüm bileşenler bu ölçeğe bağlı.
- Üst bara **A− / %100 / A+** arayüz ölçeği düğmeleri eklendi (0,85–1,35 arası, tarayıcıda
  saklanır). Kullanıcı kendi ekranına göre yazı boyutunu ayarlayabiliyor.
- Sabit sütun sayıları yerine **esnek ızgaralar** (`auto-fit/minmax`) kullanıldı; kartlar ve
  oda haritası ekran genişliğine göre sütun sayısını kendisi belirliyor.
- Geniş tablolar kendi içinde yatay kaydırılıyor; sayfa gövdesi hiçbir çözünürlükte yatay
  taşmıyor. 1280 / 1440 / 1600 / 1920 px'te taşma olmadığı test edildi.
- Yükseklikler `vh` tabanlı (max-h-[60vh] vb.) — küçük ekranlarda içerik ekranı taşırmıyor.

### Eklendi
- Çizgi ikon seti (emoji yerine), sayfa başlığı bileşeni, «Yeni Kayıt» düğmesi her sayfadan
  erişilebilir biçimde üst barda.

## [1.4.0] — 15.09.2026
### Eklendi
- **Manuel yerleştirme penceresi**: otomatik yerleştirmenin yanında açık bir seçenek.
  Her misafir için oda/yatak elle seçilir; seçenekler yalnız talebin tüm gecelerinde
  müsait yataklardır ve odada hâlihazırda kimlerin kaldığı seçenekle birlikte görünür.
  «Grubun tamamını tek odaya yerleştir» hızlı seçimi, çakışma ve karma oda denetimi içerir.
  Rezervasyon listesinde satıra çift tıklayarak da açılır.
- **Yatak haritasında misafir adları**: her yatak satırında yatak numarası ve o yatakta
  kalan misafirin adı yazıyor. «İsimli / Kompakt» görünüm anahtarı eklendi.
- **Yatak Listesi görünümü** (Doluluk Panosu): «hangi odada, kaç numaralı yatakta kim
  yatıyor» sorusunun tablo karşılığı — oda no, yatak no, oda tipi, durum, Tc kimlik no,
  adı soyadı, cinsiyet, geliş/çıkış, gün, kurum-şahıs, ödeme türü, peşinattan kalan, rez. no.
  Dolu/boş süzgeci ve serbest metin araması var; temizlikteki yataklarda çıkış yapan misafir
  görünür.

### Değişti
- Oda/yatak haritası ortak bir bileşene taşındı; Doluluk Panosu ve Rezervasyon ekranı
  aynı görünümü kullanıyor. Oda kartları ekran genişliğine göre esnek ızgarada diziliyor.
- **Okunurluk**: tipografi ölçeği bir kademe büyütüldü (tablo gövdesi 12→13 px, etiketler
  10→11 px), tablo satır yüksekliği ve başlık kontrastı artırıldı, çift satır gölgelendirmesi
  (zebra) ve belirgin klavye odak halkası eklendi, düğme ve kart başlıkları büyütüldü.
- Liste görünümünde tablo tam ekran genişliğini kullanıyor.

## [1.3.1] — 15.09.2026
### Değişti
- `.gizli/` dizini `.gitignore` ile depo dışına alındı; test hesabı listesi ve senaryolar
  yalnız yerelde tutuluyor. Dosyalar kullanıcıya ayrıca iletildi.
- Depoya `.gitignore` eklendi (bağımlılıklar, derleme çıktıları, editör ve işletim sistemi dosyaları).

## [1.3.0] — 15.09.2026
### Eklendi
- **Giriş testi hesapları**: her rol için üç farklı şifre uzunluğuyla (123 / 1234 / 12345)
  toplam 12 hesap; kullanıcı adları rastgele 4 rakam. Tesis kapsamları da çeşitlendirildi
  (tek tesis, iki tesis, tüm tesisler) ki yetki kapsamı denenebilsin.
- Giriş ekranına «Giriş testi hesapları · 4 haneli» katlanabilir bölümü; satıra tıklayınca
  doğrudan oturum açılır.
- Kullanıcı ve Yetki Yönetimi ekranında test hesapları «test» rozetiyle işaretleniyor.
- `.gizli/` dizini: test hesapları tablosu (md + json) ve rol bazlı test senaryoları
  (1.3.1 ile depo dışına alınmıştır).

### Not
- Test hesapları ve `.gizli/` dizini yalnız prototip denemeleri içindir; gerçek kuruluma
  geçilirken hem dizin hem de `TEST_KULLANICILAR` listesi silinmelidir.

## [1.2.0] — 15.09.2026
### Eklendi
- **Giriş ekranı**: TTKNET «Bağlantı» penceresinin karşılığı — YBS kullanıcı adı ve şifre,
  hatalı giriş ve pasif kullanıcı denetimi, rol farklarını denemek için demo hesap listesi.
- **Rol tabanlı yetkilendirme**: Admin (sistem yöneticisi), Misafirhane Müdürü,
  Resepsiyon Görevlisi ve Muhasebe Görevlisi rolleri; 12 ayrı yetki kodu.
- **Kullanıcı ve Yetki Yönetimi ekranı (MSFH-W04, yalnız Admin)**: kullanıcı listesi,
  rol değiştirme, misafirhane yetkisi atama, aktif/pasif yapma, yeni kullanıcı tanımlama,
  rol × yetki matrisi.
- Misafirhane kapsamı: kullanıcı yalnız yetkili olduğu misafirhaneleri görür ve seçebilir.
- Üst bantta kullanıcı kimliği, rol rozeti ve «Çıkış»; alt bantta oturum açan kullanıcının kodu.
- Kayıt hareketleri ve işlem günlüğü artık oturum açan kullanıcının kodunu yazıyor.

### Değişti
- Yetkisi olmayan sekmeler gizleniyor; yetkisiz düğmeler pasif ve gerekçeli ipucu gösteriyor
  (ör. «Bu işlem için yetkiniz yok — Resepsiyon Görevlisi rolü Peşinat tahsilatı girme iznine sahip değil»).
- «Nasıl çalışır?» penceresine roller ve yetkilendirme bölümü eklendi.

## [1.1.1] — 15.09.2026
### Eklendi
- Sürüm takibi: `CHANGELOG.md`, uygulama içinde sürüm numarası ve sürüm tarihi gösterimi.

## [1.1.0] — 15.09.2026
### Eklendi
- **Yeni Rezervasyon / Kayıt girişi** (MSFH0100 karşılığı): her ekrandan erişilebilen form;
  rezervasyon bilgileri, konaklama, ödeme ve peşinat bölümleri, kişi sayısına göre misafir
  satırları (Tc kimlik no, adı soyadı, cinsiyet, sicil no, görev sevk no, harcırah).
- Yatak seçimi yalnız seçili aralıkta kesintisiz müsait yataklardan; «Uygun Yatağı Otomatik Bul»
  düğmesi yerleştirme motorunu forma uygular.
- Doluluk panosunda boş yatağa tıklayıp «Bu yatağa yeni kayıt aç» kısayolu.
- MSFH-W03'e dönem (zaman) filtresi ve hızlı aralık düğmeleri (Bugün / Bu hafta / Bu ay /
  Gelecek 30 gün / Son 30 gün / Tüm dönem).
- MSFH-W03'e iş listeleri: tahsilat bekleyen, süresi dolan, bugün giriş, bugün çıkış.
- MSFH-W02 doluluk haritasında konaklanacak gecelerin tek tek incelenmesi.

### Değişti
- MSFH-W03'te İşlem sütunu tablonun başına alındı, satırda belirgin «₺ Tahsilat Al» düğmesi.
- Tahsilat penceresine tutar kısayolları (Tamamı / Yarısı), makbuz no ve kayıt özeti eklendi.
- Peşinat kuralı paneli katlanabilir yapıldı; tablo ilk ekranda görünür.
- Sekme adı «Peşinat / Tahsilat ve Statü» olarak netleştirildi.
- Talep kartında süre «gün» yerine «gece» olarak yazılıyor; çıkış gününün gecelenmediği belirtiliyor.

## [1.0.0] — 14.09.2026
### Eklendi
- İlk prototip: Doluluk Panosu (MSFH-W01), Rezervasyon ve Yerleştirme (MSFH-W02),
  Peşinat ve Rezervasyon Statüsü (MSFH-W03).
- Kısıt + skor tabanlı otomatik yerleştirme motoru, onay akışı, gerekçe üretimi.
- Sürükle-bırak ve tıklayarak manuel yerleştirme.
- Statü akışı (Talep → Peşinat Bekleniyor → Onaylı → Konaklıyor → Çıkış → İptal),
  tesis bazında peşinat kuralı, süresi dolan taleplerin otomatik iptali.
- Deterministik demo verisi: 4 tesis, 120 oda, 240 yatak, ~5.000 rezervasyon.
- Belgeler: yerleştirme algoritması, API sözleşmesi, alan eşleştirme.
