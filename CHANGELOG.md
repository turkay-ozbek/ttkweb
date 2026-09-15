# Sürüm Geçmişi

TTK Misafirhane Bilgi Sistemi — Web Prototipi.
Sürüm numarası uygulamanın alt bilgi çubuğunda ve «Nasıl çalışır?» penceresinde görünür.

Biçim: `ANA.ÖZELLİK.DÜZELTME` — ANA: ekran/veri modeli değişikliği,
ÖZELLİK: yeni yetenek, DÜZELTME: hata ve arayüz düzeltmeleri.

---

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
