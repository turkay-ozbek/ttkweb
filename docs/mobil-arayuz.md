# Mobil Arayüz

Misafirhane müdürü rezervasyon için telefonla arandığında, nerede olursa olsun
kaydı açabilmelidir. Bu belge mobil davranışı, bunun için yapılanları ve
**«telefonda masaüstündeki kadar etkili olur mu?»** sorusunun dürüst cevabını anlatır.

Mobil erişimin ağ ve veri güvenliği tarafı ayrı belgededir:
[`mobil-guvenlik.md`](mobil-guvenlik.md).

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

## 2. PWA masaüstü kadar etkili olur mu?

**Kısa yanıt: günlük işlerin yaklaşık %80'inde evet, üç ekranda hayır — ve bu
bilinçli bir tasarım kararıdır.** Telefon, masaüstünün yerine geçen bir kopya değil,
**«o anda yapılması gereken işi yapabilen»** bir uçtur. Bir rezervasyonu telefondan
açmak masaüstü kadar hızlıdır; 240 yataklık oda haritasında toplu yerleştirme yapmak
değildir — ve zaten telefonda yapılması beklenen bir iş de değildir.

### 2.1 İş bazında karşılaştırma

| İş | Telefonda | Gerekçe / yapılan |
|---|---|---|
| Yeni rezervasyon kaydı (tek misafir) | ✅ **Eşdeğer** | Sayısal alanlar telefonun rakam klavyesini açar, tarihler takvim düğmesiyle seçilir; yazılacak alan az |
| Tekrar gelen misafirin kaydı | ✅ **Masaüstünden hızlı** | Tc kimlik no'nun ilk hanelerinde öneri çıkar, ad/telefon/sicil kendiliğinden dolar — telefonda klavye kullanımı neredeyse sıfıra iner |
| Doluluk / boş yatak sorma | ✅ Eşdeğer | Özet kartları tek sütuna iner; yardımcıya («Madenci») yazıp sorulabilir |
| Kapora–dekont onayı | ✅ Eşdeğer | Tek düğme; dekont fotoğrafı doğrudan kameradan yüklenir (kurulumda) |
| Kahvaltı yoklaması | ✅ **Telefon daha iyi** | Kahvaltı salonunda elde tutulan cihazda kutucuk işaretlemek, masaya dönüp girmekten kolay |
| Tahsilat girişi | ✅ Eşdeğer | Tutar + tarih; kısa form |
| Talep listesinde arama / süzgeç | 🟡 Çalışır, dar | Tablo kendi kutusunda yatay kayar; süzgeç kutuları alt satıra iner |
| Yatak listesi (13 sütun) | 🟡 Okunur, yazdırılamaz | Kaydırmalı okunur; **yazdırma masaüstü işidir**, telefonda PDF olarak paylaşılır |
| Oda haritasına yerleştirme (240 yatak) | ❌ **Zayıf** | Yatak hücreleri parmak için küçük; sürükle-bırak dokunmatikte güvenilir değil. **Karşılığı:** «misafire dokun → yatağa dokun» akışı, «✋ Listeden Seç» penceresi ve «⚙ Otomatik Yerleştir» — üçü de telefonda çalışır |
| 30 günlük doluluk takvimi | ❌ Zayıf | Şerit yatay kayar; telefonda tek günlük harita görünümü tercih edilmeli |
| Ay sonu raporu / çok sayfalı PDF | 🟡 Okunur | Üretilir ve paylaşılır; incelemesi masaüstünde yapılır |
| 10 kişilik grubun veri girişi | ❌ **Masaüstü işi** | Onlarca alan; telefonda yapılabilir ama verimsizdir |

Bu tablonun özeti: **kayıt alma, onaylama ve sorgulama telefonda tamdır; toplu
düzenleme ve görsel planlama masaüstünde kalır.**

### 2.2 PWA'nın platform sınırları (dürüst liste)

| Sınır | Etkisi | Bu üründe anlamı |
|---|---|---|
| iOS'ta PWA depolaması, uygulama bir süre açılmazsa silinebilir | Yerel veri kaybolur | **Etkisi yok** — kişisel veri zaten cihazda saklanmıyor, yalnız arayüz kabuğu önbelleğe alınıyor |
| iOS'ta push bildirimi yalnız «ana ekrana eklendiyse» ve iOS 16.4+ ile | Bildirim her cihazda garanti değil | Bildirim **yardımcı** kanaldır; kritik uyarı ayrıca SMS/e-posta ile gider |
| iOS'ta arka plan eşitleme (Background Sync) yok | Kapalıyken iş kuyruğa alınamaz | Çevrimdışı kayıt zaten bilinçli olarak yok |
| Doğrudan yazıcıya baskı yok | Yatak listesi telefondan yazdırılamaz | PDF üretilip paylaşılır; baskı resepsiyon bilgisayarından |
| Klavye kısayolları (Ctrl+K) yok | Hızlı komut çağrısı | Üst bantta her zaman görünen arama kutusu aynı işi görür |
| Sertifika sabitleme (pinning) yapılamaz | Ele geçirilmiş cihazda MITM | Yerel uygulamaya göre kabul edilen sınır — bkz. [`mobil-guvenlik.md`](mobil-guvenlik.md) § 1 |
| Ekran alanı | Çok sütunlu ekranlar sıkışır | Tablolar kendi kutusunda kayar, formlar tek sütuna iner |

Android/Chrome tarafında bu sınırların çoğu yoktur; kısıtların kaynağı çoğunlukla iOS'tur.

### 2.3 Mobilde bilinçli olarak kısıtlanması önerilen işlemler

Bunlar teknik bir eksiklik değil, **güvenlik kararıdır** ve sunucu tarafında
zorlanır (arayüzde gizlemek yetmez):

- Toplu dışa aktarma (Excel/CSV indirme) — kişisel veri sızıntısının en kolay yolu.
- Kullanıcı/rol ve yetki yönetimi.
- Geçmiş kayıtta düzeltme ve silme.
- Kurum dışı ağdan bağlanıldığında bu üçünün tamamı kapalı olmalıdır.

Ayrıntı: [`mobil-guvenlik.md`](mobil-guvenlik.md) § 3.

---

## 3. Kırılma noktaları

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

## 4. Telefonla arandığında kayıt açma — hedef akış

Müdürün sahada yapacağı iş şudur:

1. Ana ekrandaki TTKNET simgesine dokunur, parmak izi/yüz ile açılır (PWA + kurum SSO).
2. **Sayfa şeridinden «Talepler» → «+ Yeni Kayıt»** — ya da daha hızlısı:
   arama kutusuna (Ctrl+K karşılığı: üst bandaki arama) dokunup «yeni kayıt» yazar.
3. Formda **önce Tc kimlik no** girer. Kişi daha önce kaldıysa öneri şeridi çıkar
   ve ad, soyad, telefon, sicil alanları kendiliğinden dolar (bkz.
   [`veritabani.md`](veritabani.md) § 3). Telefondayken en çok zaman kazandıran adım budur.
4. Geliş–çıkış tarihini takvim düğmesinden seçer, kişi sayısını girer.
5. **«Uygun Yatağı Otomatik Bul»** — motor boş yatağı bulur; müdür onaylar.
6. **Kaydet.** Misafire bilgilendirme SMS'i gider.

Telefonda tek elle yapılabilmesi için:
- Dokunma hedefleri en az **44 × 44 px** (düğmeler `py-2` ve üstü).
- Sayısal alanlarda `inputMode="numeric"` — telefon rakam klavyesini açar
  (Tc kimlik no, telefon, IBAN alanlarında uygulanmıştır).
- Tarih alanları GG.AA.YYYY metin kutusudur; yanındaki takvim düğmesiyle de seçilir,
  ayrıca «Bugün / Yarın / +1 hafta» ve gece sayısı ▲▼ düğmeleri vardır.

---

## 5. Rol bazlı mobil öncelikler

| Rol | Telefonda en çok yapacağı | Arayüzde önceliklendirilen |
|---|---|---|
| **Misafirhane müdürü** | Yeni kayıt açma, dekont onaylama, doluluk sorma | «+ Yeni Kayıt», «Dekont/Onay», yardımcıya «bugün kaç yatak boş?» |
| **Resepsiyon** | Kahvaltı yoklaması, giriş-çıkış | «Kahvaltı» sayfası tek sütunlu ve dokunmatik kutucuklu |
| **Muhasebe** | Tahsilat girme, belge isteme | «Tahsilat» satır işlemleri, «Ay Sonu Belgesi» |

---

## 6. Sonraki adımlar (kurulumda)

- **PWA manifest + service worker:** ana ekrana ekleme, çevrimdışı **kabuk**
  (yalnız arayüz; API yanıtları hiçbir zaman önbelleğe alınmaz).
- **Push bildirim:** onay bekleyen dekont ya da kapora süresi dolan kayıt için.
- **Kamera ile dekont yükleme:** `<input type="file" accept="image/*" capture>` —
  müdür dekontun fotoğrafını çekip doğrudan yükler.
- **Telefona özel harita görünümü:** oda haritasının tek günlük, büyük hücreli
  «dokunmatik» varyantı.
- **Tc kimlik kartı okuma:** NFC ile kimlik okuma, kurum politikası izin verirse.
