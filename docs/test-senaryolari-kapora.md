# Kapora ve Dekont Onayı — Test Senaryoları

Sürüm 2.1.0 · Hesaplar: `.gizli/test-hesaplari.md` (depoya dahil değildir) veya giriş
ekranındaki «Giriş testi hesapları» listesi.

Kısaltmalar: **R** Resepsiyon (`5819`/`123`) · **M** Müdür (`6458`/`123`) ·
**MH** Muhasebe (`3610`/`123`) · **A** Admin (`2697`/`123`).
Bu hesapların hepsi Ankara Misafirhanesi'nde yetkilidir (muhasebe ve admin tüm tesislerde).

---

## A. Kapora hesabı

| # | Adım | Beklenen sonuç |
|---|---|---|
| A1 | R ile gir → **+ Yeni Kayıt** → Kurum-Şahıs: **Şahıs**, 5 gecelik konaklama seç | «Ödeme ve Kapora» kutusunda kapora, **ilk 1 gecenin bedeli** olarak görünür (asgari 750 ₺) |
| A2 | Aynı formda Kurum-Şahıs: **Kurum** yap | Kapora **«aranmıyor»** olur, açıklamada kurum muafiyeti yazar |
| A3 | Gün sayısını +/− ile değiştir | Yatak bedeli değişir, kapora **değişmez** (tek gecelik), asgari tutarın altına inmez |
| A4 | M ile gir → Tahsilat → **⚙ Peşinat Kuralı** → «Kapora olarak alınan gece» = 2 | Tesisin açık kayıtlarında kapora yeniden hesaplanır, işlem günlüğüne satır düşer |
| A5 | Aynı panelde hesabı **«Toplam bedelin yüzdesi»** yap | Kapora %30 üzerinden hesaplanır |

## B. Kapora yatırılmadan yerleştirme engeli

| # | Adım | Beklenen sonuç |
|---|---|---|
| B1 | R ile şahıs kaydı aç (A1) ve kaydet | Statü **«Kapora Bekleniyor»**, yatak tahsis edilmemiş |
| B2 | Talepler → kaydı seç → **⚙ Otomatik Yerleştir** | Öneri üretilmez; «yerleştirilemeyenler» listesinde gerekçe: *Kapora (750 ₺) yatırılıp dekontu onaylanmadan yatak tahsis edilemez.* |
| B3 | **✋ Manuel Yerleştir** → bir yatak seç | Kaydet düğmesi pasif, aynı gerekçe kırmızı satırda görünür |
| B4 | **🗺 Haritada Yerleştir** → misafir kartına, sonra müsait bir yatağa tıkla | İşlem yapılmaz, üstte kırmızı uyarı çıkar |
| B5 | Kurum misafiri için aynı adımları tekrarla | Yerleştirme **yapılabilir** (kapora aranmıyor) |

## C. Dekont yükleme

| # | Adım | Beklenen sonuç |
|---|---|---|
| C1 | R ile Talepler → kapora bekleyen kaydı seç | Altında amber şerit: «Kapora 750 ₺ · Dekont yüklenmedi · son ödeme …» |
| C2 | **↑ Dekont Yükle** | Pencere açılır; konaklama, istenen kapora ve son ödeme tarihi üstte özetlenir |
| C3 | Banka seç, dekont no gir, **Örnek dekont üret (demo)** düğmesine bas | Dosya adı yeşil şeritte görünür; «Dekontu Kaydet ve Onaya Gönder» etkinleşir |
| C4 | Gerçek bir PDF/JPG dosyası seç (5 MB altı) | Dosya adı ve boyutu görünür; 5 MB üstünde hata mesajı çıkar |
| C5 | Tutarı istenen kaporanın **altına** düşür | Amber uyarı: «Yatırılan tutar istenen kaporanın altında…» — kayıt yine de gönderilebilir |
| C6 | Kaydet | Statü **«Müdür Onayı Bekliyor»**, işlem günlüğüne satır düşer |
| C7 | Aynı kayıtta **Dekontu Gör** | PDF önizlemesi açılır, «Yeni sekmede aç» bağlantısı çalışır |
| C8 | MH (muhasebe) ile gir → aynı kaydı bul | Dekont yükleyebilir ve görebilir |

## D. Müdür onayı

| # | Adım | Beklenen sonuç |
|---|---|---|
| D1 | M ile gir → **Dekont/Onay** sayfası | Üç sayaç: Onay Bekleyen (toplam kapora tutarıyla), Onaylanan, Reddedilen |
| D2 | Listeden bir kayıt seç | Sağda kayıt özeti + **PDF önizlemesi**; banka, dekont no, ödeme tarihi, yükleyen görünür |
| D3 | Tutarı eksik olan bir kaydı seç | Amber uyarı şeridi: eksik tutar yazar |
| D4 | **✓ Onayla ve Rezervasyon Listesine Al** | Statü **Onaylı** (geliş bugünse **Konaklıyor**), tahsil edilen tutar işlenir, makbuz no dekont numarasından doldurulur |
| D5 | Onay sonrası Talepler → aynı kayıt → **⚙ Otomatik Yerleştir** | Öneri üretilir, onaylanınca yatak tahsis edilir |
| D6 | Başka bir kaydı **Reddet** → gerekçe yaz | Statü **Kapora Bekleniyor**'a döner, dekont «Reddedilen» listesine geçer, gerekçe kayıtta görünür |
| D7 | Reddedilen kaydı yerleştirmeyi dene | Engellenir; gerekçe yine kapora uyarısıdır |
| D8 | Reddedilen kayda R ile yeni dekont yükle | Kayıt tekrar «Müdür Onayı Bekliyor»a düşer |

## E. Yetki denetimi

| # | Adım | Beklenen sonuç |
|---|---|---|
| E1 | R ile Dekont/Onay sayfasını aç | Sayfa görünür, dekont incelenebilir; **Onayla/Reddet düğmeleri pasif**, ipucunda gerekçe yazar |
| E2 | MH ile Dekont/Onay sayfasını aç | Aynı şekilde salt görüntüleme |
| E3 | MH ile Talepler sayfası | «+ Yeni Kayıt» yok, yerleştirme düğmeleri pasif; dekont yükleme açık |
| E4 | M ile Tahsilat → ⚙ Peşinat Kuralı | Kapora ayarları değiştirilebilir |
| E5 | R ile Tahsilat → ⚙ Peşinat Kuralı | Sürgüler pasif, başlıkta «🔒 salt okunur» |

## F. Süre aşımı

| # | Adım | Beklenen sonuç |
|---|---|---|
| F1 | Tahsilat sayfası → **Süresi dolan** iş listesi | Son ödeme tarihi geçmiş, kaporası yatmamış kayıtlar listelenir |
| F2 | **Toplu İptal** | Kayıtlar İptal'e düşer, varsa yatak tahsisi serbest bırakılır, günlüğe uyarı satırı düşer |
| F3 | Üst bandda **+7** ile tarihi ilerlet | Süresi dolan kayıtlar otomatik iptal olur; günlükte «Kapora son ödeme tarihi geçti» satırı görünür |
| F4 | Dekontu onaylanmış bir kayıt için F3'ü tekrarla | İptal olmaz; Onaylı → Konaklıyor → Çıkış akışı işler |

---

## Otomatik olarak koşturulan doğrulamalar

Aşağıdaki akış her sürümde tarayıcıda (Chromium 1600×1000) uçtan uca çalıştırıldı ve
konsol hatası üretmediği doğrulandı:

1. Resepsiyon şahıs kaydı açar → statü **Kapora Bekleniyor**, yatak tahsisi yok.
2. Otomatik yerleştirme denenir → *«Kapora (750 ₺) yatırılıp dekontu onaylanmadan yatak
   tahsis edilemez.»* gerekçesiyle engellenir.
3. Resepsiyon dekont yükler → statü **Müdür Onayı Bekliyor**; resepsiyonun onay düğmesi pasif.
4. Müdür dekontu açar (PDF önizleme yüklenir) ve onaylar → statü **Onaylı/Konaklıyor**.
5. Onay sonrası otomatik yerleştirme öneri üretir, onaylanınca yatak tahsis edilir.
6. Müdür başka bir dekontu gerekçeyle reddeder → kayıt **Kapora Bekleniyor**'a döner,
   «Reddedilen» listesinde görünür ve yerleştirme yine engellenir.
