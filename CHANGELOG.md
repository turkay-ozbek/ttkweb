# Sürüm Geçmişi

TTK Misafirhane Bilgi Sistemi — Web Prototipi.
Sürüm numarası uygulamanın alt bilgi çubuğunda ve «Nasıl çalışır?» penceresinde görünür.

Biçim: `ANA.ÖZELLİK.DÜZELTME` — ANA: ekran/veri modeli değişikliği,
ÖZELLİK: yeni yetenek, DÜZELTME: hata ve arayüz düzeltmeleri.

---

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
