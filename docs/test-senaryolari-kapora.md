# Kapora ve Dekont Onayı — Test Senaryoları

Sürüm 2.7.0 · Prototipi açın (`misafirhane-prototip.html`), aşağıdaki adımları sırayla izleyin.

**Hesaplar** (giriş ekranındaki «Giriş testi hesapları» listesinden de seçilebilir):

| Kısaltma | Rol | Kullanıcı / Şifre | Ne yapabilir |
|---|---|---|---|
| **R** | Resepsiyon | `5819` / `123` | Kayıt açar, yerleştirir, dekont yükler — **onaylayamaz** |
| **M** | Müdür | `6458` / `123` | Hepsi + dekont onayı, kapora kuralı, kapora muafiyeti |
| **MH** | Muhasebe | `3610` / `123` | Tahsilat girer, dekont yükler — kayıt açamaz, yerleştiremez |
| **A** | Admin | `2697` / `123` | Sınırsız |

> **Önemli iki not**
> 1. **Kapora yalnız «Şahıs» kayıtlarında doğar.** Varsayılan kurala göre kurum
>    misafirinden kapora aranmaz. Kapora akışını denerken formda **Kurum-Şahıs → Şahıs**
>    seçmeyi unutmayın; yoksa kayıt doğrudan «Talep» olur ve kilit hiç devreye girmez.
> 2. **Sayfayı yenilemeyin (F5).** Veriler bellektedir; yenileme her şeyi sıfırlar.
>    Rol değiştirmek için sağ üstteki **güç simgesiyle** çıkış yapın.

---

## 0. Hızlı yol — hazır kayıtla başlamak

Demo verisinde zaten kapora bekleyen kayıtlar var; sıfırdan kayıt açmadan da deneyebilirsiniz.

| # | Adım | Beklenen sonuç |
|---|---|---|
| 0.1 | R ile gir → **Talepler** → üstteki **«Kapora bekleyen»** çipine tıkla | Ankara'da ~24 kayıt listelenir; KAPORA sütununda tutar ve `—` (dekont yok) görünür |
| 0.2 | **«Onayda»** çipine tıkla | Dekontu yüklenmiş, müdür onayı bekleyen ~20 kayıt gelir (tutar yanında ⏳) |
| 0.3 | Bir kayda tıkla | Sağ panelde kapora şeridi: tutar, kaç gecelik, dekont durumu, son ödeme tarihi |

Bu listelerden birini seçip doğrudan **C** ve **D** bölümlerine geçebilirsiniz.

---

## A. Kapora nasıl hesaplanıyor?

| # | Adım | Beklenen sonuç |
|---|---|---|
| A1 | R ile gir → **Talepler** → **+ Yeni Kayıt** | Form açılır, statü önizlemesi altta yazar |
| A2 | Süre kısayollarından **«1 hafta»**, Kurum-Şahıs: **Şahıs** seç | «Ödeme ve Kapora» kutusunda kapora **ilk 1 gecenin yatak bedeli** (asgari 750 ₺) olarak çıkar; altta «Kayıt açıldığında statü: **Kapora Bekleniyor**» yazar |
| A3 | Kurum-Şahıs: **Kurum** yap | Kapora **«aranmıyor»** olur, açıklamada kurum muafiyeti yazar, statü önizlemesi **Talep**'e döner |
| A4 | Tekrar **Şahıs** yap, süreyi 1 gece ↔ 2 hafta arasında değiştir | Yatak bedeli değişir, **kapora değişmez** (tek gecelik) ve asgari tutarın altına inmez |
| A5 | M ile gir → **Tahsilat** → **⚙ Peşinat Kuralı ▼** → «Kapora olarak alınan gece» = **2** | Tesisin açık kayıtlarında kapora yeniden hesaplanır; alt bantta işlem günlüğüne satır düşer |
| A6 | Aynı panelde hesabı **«Toplam bedelin yüzdesi»** yap | Kapora %30 üzerinden hesaplanır, asgari tutar yine geçerlidir |
| A7 | «Kurum misafirinde peşinat aranmasın» kutusunu **kapat**, yeni bir **kurum** kaydı aç | Artık kurum misafirinde de kapora hesaplanır |
| A8 | Kuralı eski hâline al | Kapora yeniden yalnız şahıs kayıtlarında çıkar |

---

## B. Kapora yatmadan yerleştirme engeli

Akışın kalbi budur: kapora onaylanmadan hiçbir yoldan yatak verilemez.

| # | Adım | Beklenen sonuç |
|---|---|---|
| B1 | R ile **Şahıs** kaydı aç (A2) ve **Kaydet** | Statü **«Kapora Bekleniyor»**, ODA NO sütunu `—` |
| B2 | Kaydı seç → **⚙ Otomatik Yerleştir** | Öneri üretilmez; gerekçe: *Kapora (750 ₺) yatırılıp dekontu onaylanmadan yatak tahsis edilemez.* |
| B3 | **✋ Manuel Yerleştir** → yatak seç → kaydetmeyi dene | Aynı gerekçe kırmızı satırda çıkar, tahsis yapılmaz |
| B4 | **🗺 Haritada Yerleştir** → misafir kartını müsait bir yatağa **sürükle** | İşlem reddedilir, üstte kırmızı uyarı; kart «yerleşmedi» kalır |
| B5 | Aynı kartı bir yatağa **tıklayarak** yerleştirmeyi dene | Yine engellenir — kural üç yolda da aynı |
| B6 | Bir **kurum** kaydıyla B2'yi tekrarla | Yerleştirme **yapılır** (kapora aranmıyor) |

---

## C. Dekont yükleme (R veya MH)

| # | Adım | Beklenen sonuç |
|---|---|---|
| C1 | Talepler → kapora bekleyen kaydı seç | Amber şerit: «Kapora 750 ₺ · Dekont yüklenmedi · son ödeme …» |
| C2 | **↑ Dekont Yükle** | Pencerede konaklama, istenen kapora ve son ödeme tarihi özetlenir |
| C3 | Banka seç, dekont no gir, **Gönderen IBAN** alanına `TR` sonrası 24 rakam yaz | Sayaç `24/24` olur; yanlış kontrol hanesinde «IBAN kontrol hanesi tutmuyor» uyarısı çıkar |
| C4 | **Örnek dekont üret (demo)** düğmesine bas | Dosya adı yeşil şeritte görünür; «Dekontu Kaydet ve Onaya Gönder» etkinleşir |
| C5 | Bunun yerine gerçek bir PDF/PNG/JPG seç | Dosya adı ve boyutu görünür; **5 MB üstünde** kırmızı hata çıkar ve dosya alınmaz |
| C6 | Tutarı istenen kaporanın **altına** düşür | Amber uyarı: «Yatırılan tutar istenen kaporanın altında…» — kayıt yine de gönderilebilir (müdür değerlendirir) |
| C7 | **Dekontu Kaydet ve Onaya Gönder** | Statü **«Müdür Onayı Bekliyor»**, işlem günlüğüne satır düşer |
| C8 | Aynı kayıtta **Dekontu Gör** | PDF önizlemesi açılır; «Yeni sekmede aç» çalışır. PNG yüklediyseniz görüntü olarak açılır |
| C9 | R ile **Dekont/Onay** sayfasına git | «🔒 Görüntüleme yetkiniz var, onay yetkiniz yok» yazar; Onayla/Reddet pasiftir |
| C10 | MH (muhasebe) ile gir, aynı kaydı bul | Dekont yükleyebilir ve görebilir; **onaylayamaz** |

---

## D. Müdür onayı (M)

| # | Adım | Beklenen sonuç |
|---|---|---|
| D1 | M ile gir → **Dekont/Onay** | Üç sayaç: Onay Bekleyen (toplam kapora tutarıyla), Onaylanan, Reddedilen |
| D2 | Listeden bir kayıt seç | Sağda kayıt özeti + **PDF önizlemesi**; banka, dekont no, ödeme tarihi, yükleyen görünür |
| D3 | Tutarı eksik olan kaydı seç | Amber uyarı şeridinde eksik tutar yazar |
| D4 | **✓ Onayla ve Rezervasyon Listesine Al** | Statü **Onaylı** (geliş bugünse **Konaklıyor**); tahsil edilen tutar işlenir, makbuz no dekont numarasından doldurulur |
| D5 | Alt banttaki **✉ SMS** düğmesine bas | «Rezervasyon onayı» türünde yeni bir mesaj görünür: onay bilgisi ve oda numarası |
| D6 | Talepler → aynı kayıt → **⚙ Otomatik Yerleştir** | Artık öneri üretilir; onaylayınca yatak tahsis edilir |
| D7 | Başka bir kaydı **Reddet** → gerekçe yaz → **Dekontu Reddet** | Statü **«Kapora Bekleniyor»**'a döner; gerekçe talep ekranında ve kayıt geçmişinde görünür |
| D8 | Reddedilen kaydı yerleştirmeyi dene | Engellenir — gerekçe yine kapora uyarısıdır |
| D9 | Reddedilen kayda **yeni dekont** yükle | Kayıt tekrar «Müdür Onayı Bekliyor»a düşer |

---

## E. Kapora muafiyeti — telefonla arayan öncelikli misafir

Bu, kaporanın **beklenmeden** yerleştirme yapılabilen tek yoludur ve yalnız müdürdedir.

| # | Adım | Beklenen sonuç |
|---|---|---|
| E1 | M ile kapora bekleyen bir kaydı seç | Kapora şeridinde **★ Kaporadan Muaf Tut** düğmesi görünür (R ve MH'de görünmez) |
| E2 | Düğmeye bas, gerekçe yazmadan onaylamayı dene | **«Muafiyeti Ver» pasif** — gerekçe en az 8 karakter olmalı |
| E3 | Hazır gerekçelerden birine tıkla (örn. «Protokol misafiri — kurum üst yönetimi») → **★ Muafiyeti Ver** | Şeritte mor **«★ kapora muafiyeti»** rozeti, gerekçe, kim ve ne zaman verdiği yazar |
| E4 | Şeritteki açıklamayı oku | **«Kapora borcu düşmedi; tahsilat listesinde kalır.»** — muafiyet borcu silmez, yalnız yerleştirme kilidini açar |
| E5 | **⚙ Otomatik Yerleştir** | Bu kez öneri üretilir ve yatak tahsis edilebilir |
| E6 | **Tahsilat** sayfasında aynı kaydı ara | Kayıt hâlâ «tahsilat bekleyen» listesindedir — kapora takibi sürüyor |
| E7 | **Muafiyeti kaldır** düğmesine bas | Yerleştirme yeniden dekont onayına bağlanır; işlem günlüğüne satır düşer |

---

## F. Tahsilat ve süre aşımı

| # | Adım | Beklenen sonuç |
|---|---|---|
| F1 | MH ile gir → **Tahsilat** → **Tüm dönem** → **«Tahsilat bekleyen»** kutusu | Kalan kaporası olan kayıtlar listelenir (sarı satırlar) |
| F2 | Bir satırda **₺ Tahsilat Al** → **Tamamı** → makbuz no gir → kaydet | Statü **Onaylı** olur, kalan 0 ₺ görünür |
| F3 | Başka bir satırda **Yarısı** ile tahsilat gir | Kayıt **«Kapora Bekleniyor»**'da kalır, kalan tutar tabloda yazar |
| F4 | Kapora tutarından **fazlasını** girmeyi dene | Kalan eksiye düşmez; tahsil edilen istenen kaporayı aşmaz |
| F5 | **Detay** düğmesi | «Kayıt Hareketleri» bölümünde tahsilat, dekont, onay ve statü değişiklikleri kullanıcı ve tarihle listelenir |
| F6 | R ile aynı listeye bak | **₺ Tahsilat Al** pasiftir; üzerine gelince hangi yetkinin gerektiği yazar |
| F7 | A ile **Bugünkü Durum** → **+7 gün** (birkaç kez) | Son ödeme tarihi geçen kapora talepleri kendiliğinden **İptal** olur; işlem günlüğünde ve **✉ SMS** günlüğünde iptal bildirimi görünür |
| F8 | Tahsilat → **«Süresi dolan»** kutusu | Süresi geçmiş kayıtlar kırmızı satırlarda; tek tek ya da toplu iptal edilebilir |

---

## G. Yetki denetimi özeti

| İşlem | R (Resepsiyon) | M (Müdür) | MH (Muhasebe) | A (Admin) |
|---|:--:|:--:|:--:|:--:|
| Kayıt açma | ✔ | ✔ | ✗ | ✔ |
| Yatak tahsisi | ✔ | ✔ | ✗ | ✔ |
| Dekont yükleme | ✔ | ✔ | ✔ | ✔ |
| **Dekont onayı / reddi** | ✗ | ✔ | ✗ | ✔ |
| **Kapora muafiyeti** | ✗ | ✔ | ✗ | ✔ |
| Tahsilat girme | ✗ | ✔ | ✔ | ✔ |
| Kapora kuralını değiştirme | ✗ | ✔ | ✗ | ✔ |

Pasif bir düğmenin üzerine gelin: hangi yetkinin gerektiği ipucu olarak yazar.

---

## Otomatik karşılığı

Bu senaryoların çoğu otomatik koşar:

```bash
node testler/03-uctan-uca-kapora.mjs      # B, C, D — ana akış
node testler/04-red-manuel-tahsilat.mjs   # D7–D9, F2–F3
node testler/05-surukle-birak-ve-dekont.mjs  # B4–B5, C4–C8
node testler/13-yeni-islevler.mjs         # E (muafiyet), SMS, IBAN denetimi
node testler/08-tahsilat-statu-zaman.mjs  # A5–A8, F1–F8
```
