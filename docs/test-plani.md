# Test Planı — TTK Misafirhane Bilgi Sistemi (Web Prototipi)

Sürüm 2.4.0 · Bu belge, prototipi **elle baştan sona sınamak** için hazırlanmıştır.
Her senaryo `Hazırlık → Adımlar → Beklenen sonuç` düzenindedir. Sonuç beklenenden
farklıysa satırın soluna ✗ koyup ekran görüntüsüyle birlikte bildirin.

> **Bu senaryoların çoğu artık otomatik koşuyor.** Aşağıdaki başlıkların yanındaki
> `[oto: NN]` işareti, o bölümü koşturan test dosyasını gösterir
> ([`testler/`](../testler/), tamamı için `node testler/tumu.mjs`). İşaretsiz başlıklar
> insan gözü isteyen ya da otomatikleştirilmesi anlamlı olmayan adımlardır; elle test
> ederken öncelik onlardır.

---

## 0. Teste başlamadan

| Konu | Bilgi |
|---|---|
| Dosya | `misafirhane-prototip.html` — çift tıklayıp tarayıcıda açın |
| Tarayıcı | Chrome, Edge veya Firefox güncel sürüm |
| İnternet | Gerekli (React ve Tailwind CDN'den yükleniyor). Ekranda uyarı çıkarsa erişim engellidir |
| **Veri kalıcı değil** | Bütün veriler bellektedir. **Sayfayı yenilerseniz (F5) her şey sıfırlanır.** Rol değiştirmek için mutlaka sağ üstteki **çıkış (güç) simgesini** kullanın, F5 yapmayın |
| Sistem tarihi | Uygulama açıldığı günün tarihini kullanır. «Bugünkü Durum» sayfasındaki **+1 gün / +7 gün** düğmeleri yalnız demo içindir |
| Gerçek veri yok | Tc kimlik numaraları 11 haneli sahtedir, ödeme/muhasebe entegrasyonu yoktur |

### Test hesapları

| Kullanıcı | Şifre | Rol | Misafirhane |
|---|---|---|---|
| `TTK7719` | `7719` | Admin | Hepsi |
| `MSF1001` | `1234` | Müdür | Ankara |
| `MSF1002` | `1234` | Müdür | Yayla, Amasra, Armutçuk |
| `MSF2001` | `1234` | Resepsiyon | Ankara |
| `MSF2002` | `1234` | Resepsiyon | Yayla Konağı |
| `MSF3001` | `1234` | Muhasebe | Hepsi |
| `MSF2003` | `1234` | Resepsiyon (**pasif**) | Amasra |

4 haneli giriş testi hesapları (`2697/123`, `4380/1234`, `6458/123`, `5819/1234`, `3610/123` …)
giriş ekranındaki **«Giriş testi hesapları · 4 haneli»** başlığından listelenir.

### Tarih yazma kuralı

Tarih kutuları **GG.AA.YYYY** biçimindedir. Yazdıktan sonra **Enter'a basın** ya da
kutunun dışına tıklayın; yukarı/aşağı ok tuşları günü bir bir değiştirir. Geçersiz tarih
yazarsanız kutu eski değerine döner — bu beklenen davranıştır.

---

## 1. Giriş ve yetkilendirme  `[oto: 01, 03, 06]`

### 1.1 Doğru giriş
1. `MSF1001` / `1234` ile **BAĞLAN**.
   - ✔ Ana menü açılır, sol üstte **«Ankara Misafirhanesi Bilgi Sistemi»** yazar.

### 1.2 Hatalı şifre
1. `TTK7719` / `yanlis` ile bağlanmayı deneyin.
   - ✔ Kırmızı uyarı çıkar, oturum açılmaz.

### 1.3 Pasif hesap
1. `MSF2003` / `1234` ile bağlanmayı deneyin.
   - ✔ «Hesap pasif» türü uyarı çıkar, giriş olmaz.

### 1.4 Rol farkları — her rol için ayrı ayrı bakın
Her rolle girip **sayfa şeridini** ve düğmeleri karşılaştırın:

| Kontrol | Admin | Müdür | Resepsiyon | Muhasebe |
|---|:--:|:--:|:--:|:--:|
| «Kullanıcılar» sekmesi görünür | ✔ | ✗ | ✗ | ✗ |
| «+ Yeni Kayıt» etkin | ✔ | ✔ | ✔ | ✗ (pasif) |
| «Otomatik / Manuel Yerleştir» etkin | ✔ | ✔ | ✔ | ✗ (pasif) |
| «₺ Tahsilat Al» etkin | ✔ | ✔ | ✗ (pasif) | ✔ |
| «Dekont Yükle» etkin | ✔ | ✔ | ✔ | ✔ |
| «Onayla / Reddet» etkin | ✔ | ✔ | ✗ | ✗ |
| «İptal» etkin | ✔ | ✔ | ✗ | ✔ (süresi dolan) |

- ✔ Pasif düğmenin üzerine gelince «… yetkisi gerekir» ipucu çıkar.
- ✔ Yetkisiz sayfa menüde hiç görünmez.

### 1.5 Misafirhane kapsamı
1. `MSF2002` (Yayla) ile girin.
   - ✔ Başlık «Yayla Konağı Bilgi Sistemi», ana menüde misafirhane seçme sırası **yok**.
   - ✔ Hiçbir ekranda Ankara/Amasra/Armutçuk kaydı görünmez.
2. `MSF1002` (3 misafirhane) ile girin.
   - ✔ Ana menünün üstünde üç misafirhane düğmesi çıkar; birine tıklayınca üst bandaki
     başlık ve sayfa başlıkları o misafirhaneye döner.
3. `TTK7719` ile girin.
   - ✔ Dört misafirhane de seçilebilir.

### 1.6 Oturum kapatma
1. Sağ üstteki **güç simgesine** basın.
   - ✔ Giriş ekranına dönülür; yeniden girince **veriler korunur** (yenilemedikçe).

---

## 2. Yeni rezervasyon kaydı  `[oto: 07]`

### 2.1 Zorunlu alan denetimi
1. `MSF2001` ile girin → **Talepler** → **+ Yeni Kayıt**.
2. Hiçbir şey yazmadan **Kaydet**'e bakın.
   - ✔ Düğme pasif, altta «N eksik/hatalı alan var — kayıt açılamaz» yazar.
3. Tc kimlik alanına 5 haneli sayı yazın.
   - ✔ Hata sayısı artar / alan uyarı verir.

### 2.2 Şahıs kaydı (kapora doğar)
1. Adı Soyadı: `DENEME MISAFIR`, Geliş: bugünden 10 gün sonra, Çıkış: 13 gün sonra.
2. **Kurum-Şahıs → Şahıs**.
   - ✔ Formun alt kısmında kapora tutarı belirir (ör. 750 ₺), «Kayıt açıldığında statü:
     **Kapora Bekleniyor**» yazar.
3. Misafir satırına ad soyad, 11 haneli Tc ve cinsiyet girin → **Kaydet**.
   - ✔ Kayıt talep listesinde **Kapora Bkl.** statüsüyle çıkar, rezervasyon no verilir.

### 2.3 Kurum kaydı (kapora aranmaz)
1. Aynı formu **Kurum-Şahıs → Kurum** ile doldurun.
   - ✔ Kapora sütununda «aranmıyor» yazar, statü **Talep** olur.

### 2.4 Kişi sayısı ve aile
1. Kişi sayısını 3 yapın.
   - ✔ Sağdaki misafir satırı 3'e çıkar; azaltınca geri düşer.
2. **Birlikte kalsın** kutusunu işaretleyin.
   - ✔ Listede ad yanında ⚭ (aile) işareti görünür.

### 2.5 Formdan otomatik yatak bulma
1. Formu doldurduktan sonra **⚙ Uygun Yatağı Otomatik Bul**.
   - ✔ Misafirlere oda/yatak atanır, alttaki statü önizlemesi **Onaylı**'ya döner
     (kapora yoksa) ya da kapora uyarısı verir.

---

## 3. Kapora, dekont ve müdür onayı  `[oto: 03, 04, 05, 08]`

### 3.1 Kapora onaylanmadan yerleştirme engeli
1. 2.2'de açtığınız **şahıs** kaydını Talepler'de seçin.
2. **⚙ Otomatik Yerleştir**'e basın.
   - ✔ Yerleştirme yapılmaz; «Kapora … yatırılıp dekontu onaylanmadan yatak tahsis
     edilemez» gerekçesi yazar.
3. Aynısını **✋ Manuel Yerleştir** ve **🗺 Haritada Yerleştir** ile deneyin.
   - ✔ Üç yolda da aynı engel ve aynı gerekçe çıkar.

### 3.2 Dekont yükleme
1. Kayıt seçiliyken kapora şeridindeki **↑ Dekont Yükle**.
2. **Örnek dekont üret (demo)** düğmesine basın (ya da kendi PDF'inizi seçin).
   - ✔ Dekont önizlemesi görünür.
3. **Dekontu Kaydet ve Onaya Gönder**.
   - ✔ Statü **Müdür Onayı Bekliyor** olur; «Dekont ve Onay» kartındaki sayaç artar.

### 3.3 Resepsiyon onaylayamaz
1. Aynı oturumda (resepsiyon) **Dekont/Onay** sayfasını açın.
   - ✔ «🔒 Görüntüleme yetkiniz var, onay yetkiniz yok» yazar; Onayla/Reddet pasiftir.

### 3.4 Müdür onayı
1. Çıkış yapıp `MSF1001` / `1234` ile girin → **Dekont/Onay**.
2. Kaydı seçin, dekonta bakın, **✓ Onayla ve Rezervasyon Listesine Al**.
   - ✔ Statü **Onaylı** olur (geliş bugünse **Konaklıyor**).
   - ✔ Talepler sayfasında, «Bekleyen işler» süzgecinde kayıt **hâlâ görünür** (yatağı yok).
   - ✔ Artık yerleştirme düğmeleri çalışır.

### 3.5 Müdür reddi
1. Yeni bir şahıs kaydı açıp dekont yükleyin, müdürle **Reddet** deyin, gerekçe yazın.
   - ✔ Statü **Kapora Bekleniyor**'a döner.
   - ✔ Talep ekranında «Dekont reddedildi: <gerekçe>» yazar.
   - ✔ Kayıt yeniden yerleştirilemez; yeni dekont yüklenebilir.

### 3.6 Kapora kuralı
1. Müdürle **Tahsilat** → sayfanın altındaki **peşinat/kapora kuralı** bölümünü açın.
2. «Kurum misafirinde peşinat aranmasın» kutusunu **kapatın**.
3. Yeni bir **kurum** kaydı açın.
   - ✔ Artık kurum kaydında da kapora hesaplanır.
4. Kaporayı «% oran» yapıp oranı ve asgari tutarı değiştirin, yeni kayıt açın.
   - ✔ Tutar yeni kurala göre hesaplanır.
   - ✔ Kural yalnız seçili misafirhaneyi etkiler (başka misafirhaneye geçip doğrulayın).

---

## 4. Yerleştirme  `[oto: 03, 04, 05, 09]`

### 4.1 Otomatik (tek talep)
1. Kaporası kapanmış ya da kapora aranmayan bir talebi seçin → **⚙ Otomatik Yerleştir**.
   - ✔ Öneri penceresi açılır: hangi misafir hangi oda/yatağa.
   - ✔ **Onaylamadan** pencereyi kapatırsanız doluluk değişmez.
   - ✔ Onaylayınca oda no sütunu dolar.

### 4.2 Otomatik (toplu)
1. **⚙ Tümünü Otomatik Yerleştir**.
   - ✔ Yerleşenler ve yerleşemeyenler ayrı ayrı listelenir.
   - ✔ Yerleşemeyen her talep için okunabilir gerekçe yazar (kapora, doluluk, cinsiyet…).

### 4.3 Manuel
1. Talebi seçin → **✋ Manuel Yerleştir**.
   - ✔ Açılan listede yalnız **tüm gecelerde boş** yataklar vardır.
2. Oda/yatak seçip **Yerleşimi Kaydet**.
   - ✔ Tahsis işlenir, statü Onaylı/Konaklıyor olur.

### 4.4 Harita üzerinde
1. Talebi seçin → **🗺 Haritada Yerleştir**.
   - ✔ «Oda ve Yatak Durumu» sayfası yerleştirme modunda açılır, üstte kayıt bilgisi yazar.
2. Misafiri **dolu** bir yatağa sürükleyin.
   - ✔ Kabul edilmez, nedeni yazar.
3. Farklı cinsiyetten misafirin olduğu odaya bırakın.
   - ✔ Karma oda uyarısı verir.
4. Boş bir yatağa bırakın → **Yerleştirmeyi Bitir**.
   - ✔ Yatakta misafir adı görünür.

### 4.5 Temizlik boşluğu
1. Bugün çıkış yapan bir yatağı not edin.
2. Aynı yatağa, çıkış gününde başlayan yeni bir kayıt yerleştirmeye çalışın.
   - ✔ Yatak listelenmez / reddedilir; oda haritasında o gün **Temizlik** rengindedir.

### 4.6 Tahsisi kaldırma
1. Yerleştirilmiş kaydı seçin → **Tahsisi Kaldır**.
   - ✔ Oda no sütunu «—» olur, yatak haritada anında boşalır.

---

## 5. Tahsilat  `[oto: 04, 08]`

### 5.1 Tam tahsilat
1. `MSF3001` ile girin → **Tahsilat** → **Tüm dönem** → kaydı arayın.
2. **₺ Tahsilat Al** → **Tamamı** → makbuz no yazın → kaydedin.
   - ✔ Statü **Onaylı** olur, kalan 0 ₺ görünür, makbuz no tabloda yazar.

### 5.2 Kısmi tahsilat
1. Aynı işlemi **Yarısı** ile yapın.
   - ✔ Kayıt **Kapora Bekleniyor**'da kalır, kalan tutar görünür.

### 5.3 Dönem ve iş listeleri
1. Sırayla **Bugün / Bu hafta / Bu ay / Gelecek 30 gün / Son 30 gün / Tüm dönem**.
   - ✔ Kayıt sayısı her seferinde değişir; hiçbirinde hata çıkmaz.
2. **Tahsilat bekleyen / Süresi dolan / Bugün giriş / Bugün çıkış** kutularına tıklayın.
   - ✔ Liste süzülür; kutudaki sayı listedeki satır sayısıyla aynıdır.

### 5.4 Arama
1. Arama kutusuna sırayla ad soyad, Tc kimlik no, rezervasyon no ve makbuz no yazın.
   - ✔ Dördüyle de kayıt bulunur.

### 5.5 Süresi dolan kayıtların iptali
1. **Süresi dolan** listesini açın, bir kaydı **İptal** edin.
   - ✔ Statü İptal olur, varsa yatağı serbest kalır.
2. Toplu iptal seçeneğini deneyin.
   - ✔ Listedeki tüm süresi dolan kayıtlar iptal olur, işlem günlüğüne yazılır.

### 5.6 Kayıt detayı ve hareketler
1. Satırdaki **Detay** düğmesine basın.
   - ✔ Kaydın bütün hareketleri (kayıt açma, dekont, onay/red, tahsilat, statü) tarih ve
     kullanıcı bilgisiyle sıralanır.

---

## 6. Statü akışı ve zaman  `[oto: 08]`

### 6.1 Statü sayaçları
1. **Statü** sayfasını açın.
   - ✔ Yedi statünün sayıları toplamı, dönemdeki kayıt sayısına eşittir.
   - ✔ Rozete tıklayınca liste süzülür.

### 6.2 Gün ilerletme
1. **Bugünkü Durum** → **+1 gün**.
   - ✔ Alt bardaki tarih değişir; giriş tarihi gelen Onaylı kayıtlar **Konaklıyor** olur.
2. **+7 gün** birkaç kez.
   - ✔ Çıkış tarihi geçen kayıtlar **Çıkış**'a döner, yataklar boşalır.
   - ✔ Kapora son ödeme tarihi geçen talepler kendiliğinden **İptal** olur ve işlem
     günlüğünde gerekçesiyle görünür.

### 6.3 Kalış uzatma
1. Konaklayan bir kaydın çıkış tarihini ileri alın.
   - ✔ Aynı yatak boşsa misafir yerinde kalır.
   - ✔ Yatak doluysa uyarı verir ve yeniden yerleştirme ister.

---

## 7. Görüntüleme sayfaları  `[oto: 09]`

### 7.1 Bugünkü Durum
- ✔ Dolu + Boş = kapasite.
- ✔ Doluluk yüzdesi dolu/kapasite ile tutarlı.
- ✔ Misafirhane karşılaştırmasında tesis adına tıklayınca o misafirhaneye geçilir.

### 7.2 Doluluk Takvimi
- ✔ 30 gün listelenir; **◀ Önceki / Sonraki ▶** ile dönem kayar.
- ✔ Geliş–çıkış aralığı girince «kesintisiz boş yatak» sayısı hesaplanır.
- ✔ Aralığı daralttıkça boş yatak sayısı azalmaz (mantık denetimi).

### 7.3 Oda ve Yatak Durumu
- ✔ Başlıkta misafirhane adı yazar.
- ✔ **İsimli / Kompakt** görünüm değişir.
- ✔ Yatak renkleri lejantla uyumlu (Boş / Dolu / Rezerve / Çıkış Bekliyor / Temizlik).
- ✔ Tarihi ileri alınca doluluk o güne göre değişir.

### 7.4 Yatak Listesi
- ✔ Oda ve yatak numarasına göre sıralı; «hangi yatakta kim» net okunur.
- ✔ Dolu/boş süzgeci ve arama çalışır.
- ✔ Tarih değiştirince liste o güne döner.

---

## 8. Kullanıcı ve yetki yönetimi (yalnız Admin)  `[oto: 06]`

1. `TTK7719` ile **Kullanıcılar**.
2. **Yetki matrisini göster**.
   - ✔ 14 yetki × 4 rol matrisi açılır, rol tanımlarıyla tutarlıdır.
3. Bir kullanıcının rolünü değiştirin.
   - ✔ O kullanıcıyla girince yeni rolün yetkileri geçerlidir.
4. Bir kullanıcının misafirhanelerini değiştirin (en az biri kalmalı).
   - ✔ O kullanıcı yalnız yeni listedeki misafirhaneleri görür.
5. **+ Yeni Kullanıcı** ile kullanıcı ekleyin, o hesapla girin.
   - ✔ Giriş yapılır, rolün yetkileri uygulanır.
6. Bir kullanıcıyı **pasif** yapın, o hesapla girmeyi deneyin.
   - ✔ Giriş reddedilir.

---

## 9. Kullanım rehberi  `[oto: 02, 10]`

1. Üst bandın sağındaki **Rehber** düğmesi.
   - ✔ Rehber açılır. Sayfa şeridinde ve ana menüde rehber **görünmez** (tasarım gereği).
2. Dokuz başlığı tek tek gezin.
   - ✔ Her başlıkta adımlar ve «Dikkat edilecekler» kutusu vardır.
   - ✔ Rolünüze kapalı başlıklarda **«rolünüze kapalı»** rozeti çıkar
     (ör. muhasebede «Oda ve yatak yerleştirmesi»).
3. Adımların altındaki mavi sayfa bağlantılarına tıklayın.
   - ✔ İlgili sayfa açılır.
4. **Rehberi yazdır**.
   - ✔ Yazdırma önizlemesi açılır, ölçek kutusu çıktıda görünmez.

---

## 10. Arayüz, okunurluk ve dayanıklılık  `[oto: 01, 10]`

### 10.1 Çözünürlük
Tarayıcı penceresini sırayla **1280 / 1366 / 1440 / 1600 / 1920** piksel genişliğe getirip
**bütün sayfaları** gezin.
- ✔ Hiçbir sayfada yatay kaydırma çubuğu çıkmaz.
- ✔ Yazılar üst üste binmez, kartlar taşmaz.

### 10.2 Yazı ölçeği
1. Sağ alttaki dikey kutudan **+** ile %135'e, **−** ile %85'e getirin.
   - ✔ Bütün sayfalar yeniden düzenlenir, taşma olmaz.
2. Ortadaki yüzdeye basın.
   - ✔ %100'e döner.
3. Tarayıcıyı kapatıp açın (F5 değil, yeni sekme).
   - ✔ Ölçek ayarı hatırlanır.

### 10.3 Ekranda görünmemesi gerekenler
- ✔ Hiçbir yerde **MSFH-W…** form kodu yazmaz.
- ✔ Alt barda uzun kullanıcı/yetki cümlesi yoktur; «Oturum açıldı: <kullanıcı>» yeterlidir.
- ✔ Üst bantta yalnız logo + başlık … DEMO · Rehber · çıkış vardır.

### 10.4 Konsol denetimi
1. **F12 → Console** sekmesini açık tutarak 1–9 arasındaki senaryoları tekrar gezin.
   - ✔ Kırmızı hata satırı çıkmaz.

### 10.5 Sınır durumları
| Deneme | Beklenen |
|---|---|
| Çıkış tarihini geliş tarihinden önceye almak | Reddedilir / otomatik düzeltilir |
| Geçmiş tarihe kayıt açmak | Uyarı verir ya da statüyü Konaklıyor/Çıkış yapar |
| Aynı Tc kimlik ile ikinci kayıt | Kabul edilir ama arama ikisini de bulur |
| Kişi sayısını 1'e düşürüp tekrar artırmak | Misafir satırları tutarlı kalır |
| Tahsilata kapora tutarından fazlasını girmek | Kalan eksiye düşmez |
| Kayıt penceresini **Vazgeç** ile kapatmak | Hiçbir kayıt oluşmaz |
| Tarih kutusuna `32.13.2026` yazmak | Eski değere döner |

---

## 11. Kabul ölçütü

Aşağıdakilerin tamamı sağlanıyorsa sürüm kabul edilebilir:

1. Bölüm 1–9'daki her senaryo beklenen sonucu veriyor.
2. Beş çözünürlükte hiçbir sayfada yatay taşma yok.
3. Tarayıcı konsolunda hata yok.
4. Kaporalı hiçbir kayıt, dekontu onaylanmadan yatak alamıyor (üç yerleştirme yolunda da).
5. Hiçbir kullanıcı yetkisi dışındaki sayfayı veya misafirhaneyi göremiyor.
6. Ekranda form kodu (MSFH-W…) görünmüyor.

---

## Ek — otomatik test takımı

Bütün senaryolar [`testler/`](../testler/) altında Playwright ile koşar. Kurulum ve
koşturma yönergesi [`testler/README.md`](../testler/README.md) dosyasındadır.

```bash
node testler/tumu.mjs          # tamamı, sonunda özet tablo
node testler/tumu.mjs 05 09    # yalnız seçilen dosyalar
```

| Dosya | Plandaki karşılığı |
|---|---|
| `01-arayuz-ve-roller.mjs` | 1.5, 10.1, 10.3 — dört çözünürlükte dokuz sayfa, başlıkta misafirhane adı, üst bant, form kodu olmaması, misafirhane değiştirme |
| `02-rehber-rolleri.mjs` | 9.1–9.3 — dört rolle rehber erişimi, başlıklar arası gezinme, «rolünüze kapalı» rozetleri |
| `03-uctan-uca-kapora.mjs` | 1.2, 1.3, 1.5, 2.2, 3.1–3.4, 4.1, 5.x, 6.2 — uçtan uca ana akış |
| `04-red-manuel-tahsilat.mjs` | 3.5, 4.3, 4.6, 5.2, 5.5, 7.2, 8.5, 10.2 |
| `05-surukle-birak-ve-dekont.mjs` | 3.1, 3.2, 4.4 — sürükle-bırak ve dekont önizlemesi; kapora tutarlılık taraması |
| `06-yetki-matrisi.mjs` | 1.4 tablosunun tamamı ve 8.1–8.6 |
| `07-yeni-kayit-dogrulama.mjs` | 2.1–2.5 ve 10.5'in tarih/kayıt sınır durumları |
| `08-tahsilat-statu-zaman.mjs` | 3.6, 5.1–5.6, 6.1–6.3 |
| `09-goruntuleme-tutarlilik.mjs` | 7.1–7.4 ve 4.2, 4.5 |
| `10-arayuz-ve-sinir-durumlari.mjs` | 1.6, 9.4, 10.1–10.5 |

### Elle bakılması gerekenler

Otomatik testler davranışı doğrular; şunlar için insan gözü gerekir:

- **Görsel denge:** renk, boşluk, hizalama — özellikle %85 ve %135 ölçeklerde.
- **Dekont belgesinin okunabilirliği:** üretilen PDF'in yapısı sınanıyor, ama sayfanın
  gerçekten düzgün göründüğünü siz görün.
- **Metinlerin anlaşılırlığı:** uyarı ve gerekçe cümleleri kullanıcıya yeterince açık mı?
- **Sürükle-bırak hissi:** otomatik test olayları sentetik gönderir; fareyle gerçek
  sürüklemenin akıcılığını siz deneyin.
- **Yazıcı çıktısı:** «Rehberi yazdır» çıktısının sayfa düzeni.
