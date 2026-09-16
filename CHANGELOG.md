# Sürüm Geçmişi

TTK Misafirhane Bilgi Sistemi — Web Prototipi.
Sürüm numarası uygulamanın alt bilgi çubuğunda ve «Nasıl çalışır?» penceresinde görünür.

Biçim: `ANA.ÖZELLİK.DÜZELTME` — ANA: ekran/veri modeli değişikliği,
ÖZELLİK: yeni yetenek, DÜZELTME: hata ve arayüz düzeltmeleri.

---

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
