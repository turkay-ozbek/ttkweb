# Alan Eşleştirme Tablosu — Mevcut Oracle Forms Ekranları → Web Prototipi

Bu tablo, mevcut TTKNET ekranlarındaki her alanın yeni tasarımda nereye
karşılık geldiğini gösterir. "Yeni" işaretli satırlar mevcut ekranlarda
bulunmayan, prototipin getirdiği alanlardır.

Web ekran kodları: **MSFH-W01** Doluluk Panosu · **MSFH-W02** Rezervasyon ve
Yerleştirme · **MSFH-W03** Peşinat ve Rezervasyon Statüsü.

---

## 1. Misafirhane seçim ekranı (MSFH ana ekran)

| Mevcut alan | Web karşılığı | Not |
|---|---|---|
| "MİSAFİRHANE MENÜSÜ SEÇİNİZ" radyo grubu (Yayla Konağı / Ankara / Amasra / Armutçuk) | Üst bantta tesis seçim düğmeleri | Ekran değiştirmeden tesisler arası geçiş; seçim tüm ekranlarda geçerli |
| "Tamam" / "Geri Dön" düğmeleri | — | Ayrı adım gerekmiyor, seçim anında uygulanır |
| Kullanıcı kodu (TTK7719) | Üst bant sağ köşe + alt bant | Aynen korundu |
| Form kodu (MSFH0100 vb.) | Sekme yanındaki kod + alt bant | Karşılık gösterimi için korundu |

## 2. MSFH0350 — Rezervasyonlar

### 2.1 Sol liste ("Rezervler")

| Mevcut alan | Web karşılığı | Ekran | Not |
|---|---|---|---|
| Adı Soyadı | "Adı Soyadı" kolonu | MSFH-W02 | Protokol talepleri ★ ile işaretli |
| Rezerv edilen Tarih | "Rezerv Tarihi" kolonu | MSFH-W02 | GG.AA.YYYY |
| Açıklama | "Açıklama" kolonu | MSFH-W02 | 200 karakter sınırı korunur |
| Tel No | "Tel No" — seçili talep kartı | MSFH-W02 | Listede yer kazanmak için karta taşındı |
| Kişi | "Kişi" kolonu | MSFH-W02 | Aile/birlikte talebi ⚭ simgesiyle |
| Gün | "Gün" kolonu | MSFH-W02 | |
| Oda No | "Oda No" kolonu | MSFH-W02 | **Artık otomatik dolar**; yerleşmemişse kırmızı "—" |
| "Detay" düğmesi | Satıra tıklama → sağ panel + doluluk haritası canlı bağlanır | MSFH-W02 | Ayrı pencere yok |
| Kırmızı / sarı satır boyama | Statü rozeti (Talep / Peşinat Bkl. / Onaylı / Konaklıyor / Çıkış / İptal) | MSFH-W02, W03 | Renk anlamı artık tanımlı ve filtrelenebilir |
| Tarih aralığı + "Listele" | "Geliş Tarihi" aralık filtresi | MSFH-W02 | Statü ve serbest metin araması eklendi |
| "Kalan Raporu" / "Rezerv Raporu" düğmeleri | MSFH-W01 aralık analizi ve KPI kartları | MSFH-W01 | Rapor beklemeden ekranda |

### 2.2 Sağ liste ("Odalar")

| Mevcut alan | Web karşılığı | Ekran | Not |
|---|---|---|---|
| Oda/Yatak | Oda kartı içindeki yatak hücreleri (her yatakta misafir adı) + **Yatak Listesi** tablosu | MSFH-W01, W02 | Hem görsel harita hem «hangi yatakta kim» tablosu |
| Tc Kimlik No | Yatak detayında / misafir kartında | MSFH-W01, W02 | |
| Adı | Yatak detayı ve tooltip | MSFH-W01, W02 | |
| Öd. Türü (KRT/BOS/MSD) | "Ödeme Türü" — yatak detayı ve MSFH-W03 tablosu | W01, W03 | Kodlar korundu, tooltip'te açıklaması var |
| Peşinat Kalan | "Peşinattan Kalan" kolonu | MSFH-W03 | Ayrıca yatak detayında |
| "Tarihli Listedir" başlığı | Harita üstündeki tarih seçici (◀ / ▶) | MSFH-W01 | |
| Kayıt Sayısı | KPI kartları (dolu/boş/giriş/çıkış) | MSFH-W01 | |

## 3. MSFH0100 — Kayıt Giriş Çıkış

| Mevcut alan | Web karşılığı | Ekran | Not |
|---|---|---|---|
| Sicil No | Misafir satırı "Sicil No" | MSFH-W02/W03 detay | |
| Tc Kimlik No | Misafir kartı ve detay tablosu | MSFH-W02/W03 | Prototipte 11 haneli **sahte** numaralar |
| Adı ve Soyadı | Misafir kartı / detay | MSFH-W02/W03 | |
| Geliş Tarihi | "Geliş / Çıkış" kolonu ve talep kartı | Tümü | |
| Çıkış Tarihi | Aynı | Tümü | Uzatma varsa "(uzatıldı, önceki …)" |
| Kaldığı Gün | "Gün" kolonu | MSFH-W02 | |
| Oda No | Yatak haritası + "Oda No" kolonu | W01, W02 | |
| Yatak No | Yatak hücresi numarası | W01, W02 | Tahsis oda değil **yatak** seviyesinde |
| Yatak Fiyatı | Oda kartı altında "₺/gece"; toplamı MSFH-W03 "Bedel" | W01, W03 | |
| Harcırah Miktarı | Misafir detay tablosu | MSFH-W03 detay | |
| Görev Sevk No | Misafir detay tablosu | MSFH-W03 detay | |
| Geliş nedeni | Talep kartı "Geliş Nedeni" | MSFH-W02 | |
| Görev Tarihi | — | — | v2'ye bırakıldı |
| Ödeme Türü | "Öd. Türü" kolonu | MSFH-W03 | |
| Kurum-Şahıs | "Kurum-Şahıs" rozeti | MSFH-W02/W03 | **Peşinat kuralının anahtarı** |
| Ödeyecek | Talep kartı "Kurum-Şahıs" satırı + detay | MSFH-W02 | |
| Telefon No | Talep kartı "Tel No" | MSFH-W02 | |
| Plaka No | Kayıt detayı | MSFH-W03 detay | |
| Peşinatlar (düğme) | MSFH-W03 tablosu: Peşinat / Son Ödeme / Tahsil / Kalan | MSFH-W03 | Ayrı pencere yerine ana tablo |
| Peşinattan Kalan | "Kalan" kolonu | MSFH-W03 | |
| Rezervli Geldi işareti | Statü akışında "Onaylı → Konaklıyor" geçişi | MSFH-W03 | Ayrı kutucuk gerekmiyor |
| Tahmini kalacak gün / Yatak ücreti | Talep kartı ve "Bedel" kolonu | W02, W03 | |
| Kayıt Yapan / Kayıt Tarihi | Kayıt hareketleri listesi (kullanıcı + tarih) | MSFH-W03 detay | Tam denetim izi |
| Şahsi Masraflar | — | — | Kapsam dışı (v2) |
| Tahsilat-Fatura / Tahsilatı Yapılmamış | — | — | Kapsam dışı; prototip yalnız statü ve kayıt seviyesinde modeller |
| Misafir Beyanı | — | — | Kapsam dışı (v2) |
| Odaların Durumu (düğme) | MSFH-W01 oda/yatak haritası | MSFH-W01 | Ana ekranın parçası |
| Kalanlar / Tüm Misafirler / Listele | MSFH-W02 filtre çubuğu, MSFH-W03 statü filtreleri | W02, W03 | |
| Kaydı Sil | "İptal" işlemi (kayıt silinmez, İptal statüsüne düşer) | MSFH-W03 | Yatak otomatik serbest kalır |

### 3.1 Yeni kayıt açma (MSFH0100 giriş formunun karşılığı)

Prototipte kayıt açma tek bir formda toplanmıştır: üst bantdaki **+ Yeni Rezervasyon /
Kayıt** düğmesi, MSFH-W02'deki **+ Yeni Rezervasyon** düğmesi veya MSFH-W01'de boş bir
yatağa tıklayıp **«Bu yatağa yeni kayıt aç»**.

| MSFH0100 alanı | Formdaki karşılığı |
|---|---|
| Sicil No / Tc Kimlik No / Adı ve Soyadı | Misafirler tablosunda satır başına bir kayıt (kişi sayısı kadar satır) |
| Geliş / Çıkış Tarihi, Kaldığı Gün | «Konaklama» bölümü; gün sayısı +/− ile değişir, çıkış tarihi otomatik güncellenir |
| Oda No / Yatak No | Misafir satırındaki «Oda / Yatak No» seçimi — yalnız seçili tarih aralığında **kesintisiz müsait** yataklar listelenir |
| Yatak Fiyatı | Yatak seçeneğinin yanında; toplamı «Yatak bedeli» olarak gösterilir |
| Görev Sevk No / Harcırah Miktarı | Misafir satırında (yalnız Kurum kayıtlarında etkin) |
| Geliş nedeni, Açıklama, Tel No, Plaka No | «Rezervasyon Bilgileri» ve «Konaklama» bölümleri |
| Kurum-Şahıs, Ödeyecek, Ödeme Türü | «Ödeme ve Peşinat» bölümü; kurum listesi öneri olarak sunulur |
| Peşinatlar / Peşinattan Kalan | Peşinat önizlemesi (tesis kuralına göre canlı hesap) + «Peşinat tahsil edildi» ve Makbuz No |
| Kayıt Yapan / Kayıt Tarihi | Otomatik: TTK7719 ve sistem tarihi; kayıt hareketlerine yazılır |
| — (yeni) | «Aile / birlikte kalacak», «Protokol misafiri» işaretleri; «Uygun Yatağı Otomatik Bul» düğmesi |

Kaydetmeden önce form; zorunlu alanları, Tc kimlik no biçimini, tarih tutarlılığını,
aynı yatağın iki kişiye verilmesini ve karma oda kısıtını denetler. Statü, girilen
bilgilere göre otomatik belirlenir (Talep / Peşinat Bekleniyor / Onaylı / Konaklıyor).

## 4. MSFH0030 — Şartname Makbuzları

| Mevcut alan | Web karşılığı | Not |
|---|---|---|
| Makbuz No | MSFH-W03 "Makbuz" kolonu ve tahsilat penceresi | Peşinat makbuzu için kullanıldı |
| Şartname / Firma / Şartname Bedeli / Banka Makbuz No | — | Şartname işlemleri prototip kapsamı dışında (v2) |
| Son kesilen Makbuz No | — | Kapsam dışı |
| Aylık Rapor / Rapor Tarihleri | MSFH-W01 30 günlük takvim ve KPI'lar | Rapor yerine canlı gösterim |

## 5. Prototipin getirdiği yeni alanlar

| Yeni alan | Nerede | Neden gerekli |
|---|---|---|
| **Statü** (Talep → Peşinat Bekleniyor → Onaylı → Konaklıyor → Çıkış → İptal) | Tüm ekranlar | Talep ile konaklamayı ayırır; süre takibini mümkün kılar |
| **Cinsiyet** (E/K) | Misafir kaydı | Karma oda kısıtı olmadan otomatik yerleştirme yapılamaz |
| **Protokol işareti** (talep ve oda) | Talep, oda tanımı | Öncelik ve oda ayırma kuralı |
| **Aile / birlikte kalma talebi** | Talep | Grubun bölünmemesi kuralı |
| **Peşinat son ödeme tarihi** | Peşinat | Süresi dolan talebin otomatik iptali |
| **Peşinat kuralı** (oran, asgari tutar, süre, kurum muafiyeti) | Tesis tanımı | Kural bugün sistemde yok, elde uygulanıyor |
| **Temizlik boşluğu (gün)** | Oda/tesis tanımı | Çıkış-giriş arası yatak bloğu |
| **Tahsis tipi** (Otomatik / Manuel) | Misafir kaydı | Kimin yerleştirdiğinin izlenmesi |
| **Kayıt hareketleri** | Rezervasyon | Statü değişikliklerinin denetim izi |
| **Önceki çıkış tarihi** | Rezervasyon | Uzatmaların görünür olması |

## 6. Bilinçli olarak yapılmayanlar

- Gerçek ödeme, tahsilat-fatura ve muhasebe entegrasyonu (yalnız statü ve kayıt
  seviyesinde modellenmiştir).
- Şartname/makbuz işlemleri (MSFH0030), şahsi masraflar, misafir beyanı,
  yabancı uyruklu XML bildirimi.
- Mevcut Oracle Forms ekranlarında herhangi bir değişiklik — prototip ayrı
  çalışır, mevcut sisteme dokunmaz.
