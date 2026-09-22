# Mobil Arayüz

Misafirhane müdürü rezervasyon için telefonla arandığında, nerede olursa olsun
kaydı açabilmelidir. Bu belge mobil davranışı ve bunun için yapılanları anlatır.

---

## 1. Yaklaşım: ayrı mobil uygulama değil, duyarlı tek arayüz

| Seçenek | Değerlendirme |
|---|---|
| Ayrı mobil uygulama (iOS/Android) | İki ayrı kod tabanı, mağaza süreçleri, kurum cihaz yönetimi. **Bu ölçek için gereksiz** |
| **Duyarlı web + PWA** | Aynı kod, tek dağıtım, tarayıcıdan anında güncel. **Seçilen yol** |
| Yalnız masaüstü | Müdür sahadayken kayıt açamaz — gereksinimi karşılamaz |

Uygulama **PWA** olarak paketlenir: telefon ana ekranına eklenir, tam ekran açılır,
kurum ağına VPN ile bağlanır. Çevrimdışı kayıt açma **bilinçli olarak yoktur** —
yatak çakışmasını ancak sunucu kesin olarak engelleyebilir (bkz.
[`veritabani.md`](veritabani.md) § çakışma kısıtı). Bunun yerine bağlantı yoksa
arayüz «bağlantı bekleniyor» der ve girilen form içeriğini yerelde saklar.

---

## 2. Kırılma noktaları

| Genişlik | Cihaz | Düzen |
|---|---|---|
| < 640 px | Telefon (dikey) | Tek sütun, tablolar kendi içinde yatay kayar, arama kutusu tam genişlik |
| 640–900 px | Telefon (yatay), küçük tablet | İki sütunlu kartlar, tablolar hâlâ kaydırmalı |
| 900–1280 px | Tablet, küçük dizüstü | Masaüstü düzeni, daraltılmış sütunlar |
| > 1280 px | Masaüstü | Tam düzen |

### Prototipte yapılanlar

1. **Esnek ızgaralar.** Bütün `repeat(auto-fit, minmax(Xrem, 1fr))` kuralları
   `minmax(min(Xrem, 100%), 1fr)` olarak değiştirildi. 28 rem'lik bir sütun,
   390 px'lik ekranda artık sayfayı yana itmiyor, kendini daraltıyor.
2. **Tablolar kutusunda kayar.** 900 px altında geniş veri tabloları sayfayı değil
   kendi kutusunu kaydırır; sütun hizası korunur:
   ```css
   @media (max-width: 900px) {
     .kaydir-x, div:has(> table.veri) { overflow-x: auto; max-width: 100%; }
     table.veri { min-width: max-content; }
   }
   ```
3. **Yeni kayıt formu tek sütun.** `col-span-5 / col-span-7` yerine
   `col-span-12 lg:col-span-5 / lg:col-span-7`.
4. **Kart başlıkları sarmalanır.** Süzgeç ve arama kutuları alt satıra iner,
   kutular `w-full sm:w-56` olur.
5. **Pencereler kenara yapışmaz.** Modal dolgusu `p-2 sm:p-6`, yükseklik `72vh`.
6. **Üst bant.** Başlık kısalır, arama kutusu telefonda tam genişliğe geçip alt
   satıra iner; sayfa şeridi yatay kayar.
7. **Yardımcı ve ölçek kutusu.** Panel genişliği `min(27rem, 100vw - 1.5rem)`.

**Ölçüm:** 390 × 844 px'de (iPhone 14 boyutu) on bir sayfanın hiçbirinde yatay taşma
yok; ölçüm `testler/12-mobil.mjs` içinde otomatik koşuyor.

---

## 3. Telefonla arandığında kayıt açma — hedef akış

Müdürün sahada yapacağı iş şudur:

1. Ana ekrandaki TTKNET simgesine dokunur, parmak izi/yüz ile açılır (PWA + kurum SSO).
2. **Sayfa şeridinden «Talepler» → «+ Yeni Kayıt»** — ya da daha hızlısı:
   arama kutusuna (Ctrl+K karşılığı: üst bandaki arama) dokunup «yeni kayıt» yazar.
3. Formda **önce Tc kimlik no** girer. Kişi daha önce kaldıysa öneri şeridi çıkar
   ve ad, soyad, telefon, sicil alanları kendiliğinden dolar (bkz.
   [`veritabani.md`](veritabani.md) § 3). Telefondayken en çok zaman kazandıran adım budur.
4. Geliş–çıkış tarihini seçer, kişi sayısını girer.
5. **«Uygun Yatağı Otomatik Bul»** — motor boş yatağı bulur; müdür onaylar.
6. **Kaydet.** Misafire bilgilendirme SMS'i gider.

Telefonda tek elle yapılabilmesi için:
- Dokunma hedefleri en az **44 × 44 px** (düğmeler `py-2` ve üstü).
- Sayısal alanlarda `inputMode="numeric"` — telefon rakam klavyesini açar
  (Tc kimlik no, telefon, IBAN alanlarında uygulanmıştır).
- Tarih alanları GG.AA.YYYY metin kutusudur; telefonda sayı klavyesiyle yazılır,
  ok tuşları yerine ▲▼ düğmeleri kullanılır.

---

## 4. Rol bazlı mobil öncelikler

| Rol | Telefonda en çok yapacağı | Arayüzde önceliklendirilen |
|---|---|---|
| **Misafirhane müdürü** | Yeni kayıt açma, dekont onaylama, doluluk sorma | «+ Yeni Kayıt», «Dekont/Onay», yardımcıya «bugün kaç yatak boş?» |
| **Resepsiyon** | Kahvaltı yoklaması, giriş-çıkış | «Kahvaltı» sayfası tek sütunlu ve dokunmatik kutucuklu |
| **Muhasebe** | Tahsilat girme, belge isteme | «Tahsilat» satır işlemleri, «Ay Sonu Belgesi» |

---

## 5. Sonraki adımlar (kurulumda)

- **PWA manifest + service worker:** ana ekrana ekleme, çevrimdışı kabuk.
- **Push bildirim:** onay bekleyen dekont ya da kapora süresi dolan kayıt için.
- **Kamera ile dekont yükleme:** `<input type="file" accept="image/*" capture>` —
  müdür dekontun fotoğrafını çekip doğrudan yükler.
- **Tc kimlik kartı okuma:** NFC ile kimlik okuma, kurum politikası izin verirse.
