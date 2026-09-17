# Otomatik testler

Playwright ile koşan uçtan uca testler. Prototip tek dosyalık bir HTML olduğu için
testler dosyayı doğrudan `file://` ile açar; sunucu ya da kurulum gerekmez.

## Kurulum

```bash
npm init -y
npm install -D playwright
npx playwright install chromium
```

## Koşturma

```bash
node testler/tumu.mjs          # tamamı, sonunda özet tablo
node testler/tumu.mjs 05 09    # yalnız numarası verilen dosyalar
node testler/07-yeni-kayit-dogrulama.mjs   # tek dosya
```

Her dosya geçen denetimleri `✓` ile sıralar, sonunda `… denetimin tamamı geçti` yazar.
Kalan denetim varsa `HATA:` başlığı altında ne beklendiği ve ne bulunduğu yazılır ve
çıkış kodu 1 olur; `tumu.mjs` de bu durumda 1 ile çıkar (CI'a takılabilir).

### Ortam değişkenleri

| Değişken | İşlevi |
|---|---|
| `HEDEF` | Sınanacak HTML dosyasının tam yolu. Varsayılan: depo kökündeki `misafirhane-prototip.html` |
| `CHROME` | Chromium/Chrome çalıştırılabilirinin yolu (Playwright'ın kendi indirdiği tarayıcı yoksa) |

CDN erişimi olmayan bir ağda prototip açılmaz; böyle bir ortamda React/Tailwind'i yerel
kopyaya çeviren bir sürüm hazırlayıp `HEDEF` ile gösterin.

Ekran görüntüleri ve testin ürettiği dosyalar `testler/cikti/` altına yazılır.

## Kapsam

| Dosya | Neyi sınar |
|---|---|
| `01-arayuz-ve-roller.mjs` | 1280/1440/1600/1920 px'te dokuz sayfa: yatay taşma, sayfa başlığında misafirhane adı, üst bantta kaldırılan öğeler, ekranda form kodu olmaması, ana menüden misafirhane değiştirme, tek misafirhaneli kullanıcı |
| `02-rehber-rolleri.mjs` | Dört rolle rehbere erişim, dokuz başlık arası gezinme, «rolünüze kapalı» rozetlerinin doğru başlıklarda çıkması |
| `03-uctan-uca-kapora.mjs` | Hatalı şifre, pasif hesap, yeni kayıt, kapora onayı olmadan yerleştirme engeli, dekont yükleme, resepsiyonun onaylayamaması, müdür onayı, onay sonrası listede kalma, otomatik yerleştirme, yatak listesi, tahsilat listesi, muhasebe yetki sınırı, tesis kapsamı, gün ilerletme |
| `04-red-manuel-tahsilat.mjs` | Dekont reddi ve statü dönüşü, reddedilen kaydın yerleştirilememesi, manuel yerleştirme, tahsis kaldırma, kayıt iptali, kısmi tahsilat, takvim, admin kullanıcı ekleme, yazı ölçeği |
| `05-surukle-birak-ve-dekont.mjs` | Haritada sürükle-bırak (hedef vurgusu, dolu yatağın reddi, müsait yatağa yerleştirme, kart üzerindeki × ile tahsis kaldırma, tıklayarak yerleştirme, kapora kuralının sürükle-bırakta da uygulanması), dekont önizlemesi (üretilen PDF'in yapısı ve içeriği, PNG'nin `<img>` ile gösterimi, 5 MB sınırı), dört misafirhanede kapora statüsü tutarlılığı |
| `06-yetki-matrisi.mjs` | Dört rol × beş düğme beklenti tablosu, pasif düğmelerin gerekçe ipucu, 14×4 yetki matrisi, kullanıcı ekleme, yinelenen kullanıcı adının engellenmesi, rol ve misafirhane değişikliğinin kullanıcıya yansıması, pasife alınan hesabın girişinin reddi |
| `07-yeni-kayit-dogrulama.mjs` | Zorunlu alan ve Tc kimlik denetimi, geçersiz tarih ve ok tuşları, çıkış tarihinin gelişten öne alınamaması, kişi sayısı ve aile, kurum/şahıs statü önizlemesi, formdan otomatik yatak bulma, «Vazgeç», ad/Tc/rezervasyon no ile arama |
| `08-tahsilat-statu-zaman.mjs` | Kapora kuralı değişikliği, altı dönem filtresi, iş listelerinin sayı/satır tutarlılığı, tam ve kısmi tahsilat, kayıt hareketleri, yedi statü kutusu ve süzme, gün ilerletme ve otomatik statü değişiklikleri, toplu iptal, muhasebe yetki sınırı |
| `09-goruntuleme-tutarlilik.mjs` | Dört misafirhanede dolu+boş+temizlik=kapasite ve yüzde tutarlılığı, takvim dönem kaydırma ve aralık mantığı, oda haritası lejantı/ipuçları/görünüm ve tarih değişimi, temizlik bloğu, yatak listesi sıralama ve süzgeçleri, toplu otomatik yerleştirme önerisinin onaylanmadan uygulanmaması |
| `10-arayuz-ve-sinir-durumlari.mjs` | Ölçek sınırları ve kalıcılığı, üç çözünürlük × dokuz sayfa taşma, 1280px+%135 birlikte, ekranda form kodu olmaması, «Rehberi yazdır», oturum kapatınca verinin korunması, geçmiş tarihli kayıt, kişi sayısı oynatma, kapora üstü tahsilat, arama sınırları |
| `tumu.mjs` | Hepsini sırayla koşturur, özet tablo basar |

## Sürükle-bırak nasıl test ediliyor?

Playwright'ın `dragTo()` yöntemi gerçek fare olayları üretir; tarayıcı bunlardan HTML5
`dragstart`/`drop` olaylarını türetmez. Bu yüzden testler tek bir `DataTransfer` nesnesi
üzerinden sentetik `DragEvent` zinciri gönderir:

```js
const dt = new DataTransfer();
kaynak.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
hedef .dispatchEvent(new DragEvent('dragover',  { bubbles: true, dataTransfer: dt }));
hedef .dispatchEvent(new DragEvent('drop',      { bubbles: true, dataTransfer: dt }));
```

Uygulamanın `onDragStart` işleyicisi veriyi bu nesneye yazar, `onDrop` işleyicisi aynı
nesneden okur; böylece gerçek kullanıcı davranışının aynısı sınanmış olur.

## Ortak yardımcılar

`ortak.mjs` giriş, rol değiştirme, sayfa gezinme, tarih yazma, kayıt açma, sürükle-bırak
ve sonuç toplama işlerini içerir. Yeni test yazarken oradan başlayın. İki tuzak:

- **Arama kutusunun placeholder'ı da «Ad soyad …» ile başlar.** Kayıt penceresindeki
  misafir alanlarını `formTc(p)` / `formAd(p)` ile, yani pencereye göre seçin.
- **Tablolarda boş durum satırı vardır** (`<td colspan>`). Satır sayarken
  `satirSayisi(p)` / `veriSatirlari(p)` kullanın.
- **Başlıklar CSS ile büyük harfe çevrilir**; Türkçe `İ` JavaScript'in `/i` bayrağıyla
  eşleşmez. Desenlerinizi bu harfi içermeyecek biçimde yazın.

## Dikkat

Veriler bellektedir: **sayfa yenilenince her şey sıfırlanır.** Testler rol değiştirirken
sayfayı yenilemez, üst banttaki çıkış simgesini kullanır. Kendi testinizi yazarken aynı
yolu izleyin.
