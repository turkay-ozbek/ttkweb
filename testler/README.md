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
node testler/01-arayuz-ve-roller.mjs
node testler/02-rehber-rolleri.mjs
node testler/03-uctan-uca-kapora.mjs
node testler/04-red-manuel-tahsilat.mjs
node testler/05-surukle-birak-ve-dekont.mjs
```

Hepsi `... GEÇTİ` yazmalıdır; aksi hâlde `HATA:` başlığı altında ne olduğu sıralanır.

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

## Dikkat

Veriler bellektedir: **sayfa yenilenince her şey sıfırlanır.** Testler rol değiştirirken
sayfayı yenilemez, üst banttaki çıkış simgesini kullanır. Kendi testinizi yazarken aynı
yolu izleyin.
