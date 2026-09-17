# Kullanım Rehberi — TTK Misafirhane Bilgi Sistemi (Web Prototipi)

Bu belge, uygulama içindeki **Kullanım Rehberi** sayfasının (MSFH-W10) yazılı karşılığıdır.
Uygulamada aynı içerik, adımların sonundaki bağlantılarla ilgili sayfaya doğrudan giderek
kullanılabilir. Rehbere **yalnız üst bandın sağındaki «Rehber» düğmesinden** ulaşılır.

Başlıklardaki form kodları (MSFH-Wxx) bu belgeye ve API sözleşmesine özeldir; kullanıcı
arayüzünde gösterilmez.

---

## 1. Başlarken — ekranı tanıyın

1. **Oturum açın.** Giriş ekranında YBS kullanıcı adınızı ve şifrenizi yazıp **BAĞLAN** düğmesine
   basın. Rolünüz (Müdür, Resepsiyon, Muhasebe, Admin) hangi sayfaları ve düğmeleri
   görebileceğinizi belirler.
2. **Hangi misafirhanede çalıştığınızı görün.** Üst bandın solunda «&lt;Misafirhane&gt; Bilgi
   Sistemi» yazar; çalışılan misafirhane her sayfanın başlığında da görünür (örn. «Ankara
   Misafirhanesi Rezervasyon Talepleri»). Birden çok misafirhaneye yetkiliyseniz Ana Menü'nün
   üstündeki misafirhane düğmelerinden veya «Bugünkü Durum» karşılaştırma tablosundan geçersiniz.
3. **Sayfalar arasında gezinin.** Logoya veya **Ana Menü**'ye basınca bütün sayfaların kart
   görünümü açılır; kartlardaki sayılar canlıdır. Sık kullanılan sayfalara logonun altındaki
   sayfa şeridinden tek tıkla geçilir.
4. **Yazı boyutu.** Ekranın sağ alt köşesindeki dikey büyüteç kutusu: **+** büyütür, **−**
   küçültür, ortadaki yüzde düğmesi %100'e döndürür. Ayar tarayıcıda saklanır.
5. **Bir düğmenin ne yaptığını öğrenin.** Düğmenin üzerine gelip bekleyin; ne işe yaradığı
   küçük bir balonda yazar. Düğme soluk (pasif) ise balon hangi yetkinin gerektiğini söyler.
6. **Aradığınız işlemi yazarak bulun.** Üst bandın ortasındaki **«Hangi işlemi yapmak
   istiyorsunuz?»** kutusu ya da her yerden **Ctrl + K**. Sayfa adı, işlem, misafir adı,
   Tc kimlik no veya rezervasyon no yazabilirsiniz; ↑ ↓ ile gezinip ↵ ile seçersiniz.
7. **Yardımcıya sorun.** Sağ alt köşedeki baretli maskot **Madenci**'dir. Doluluk gibi
   soruları canlı veriyle, «kapora nasıl işlenir?» gibi soruları bu rehberden adım adım
   yanıtlar ve ilgili sayfaya bağlantı verir. Bir **demo asistandır**: kural tabanlı çalışır,
   dış bir yapay zekâ servisine bağlanılmaz.
8. **Rehber ve oturum.** Üst bandın sağındaki **Rehber** düğmesi bu sayfayı her ekrandan açar;
   en sağdaki güç simgesi oturumu kapatır. Kullanıcı adınız alt bilgi çubuğunun solunda yazar.

> Bir düğme soluk (pasif) görünüyorsa üzerine gelin: o işlem için hangi yetkinin gerektiği
> ipucu olarak yazar.

---

## 2. Yeni rezervasyon kaydı nasıl açılır? — MSFH-W05

**Yetki:** `rezervasyon.olustur` · **Roller:** Müdür, Resepsiyon, Admin

1. **Formu açın.** «Rezervasyon Talepleri» sayfasının sağ üstündeki yeşil **+ Yeni Kayıt**
   düğmesi. Aynı düğme «Peşinat ve Tahsilat» sayfasında ve ana menüde
   (**+ Yeni Rezervasyon / Kayıt**) da bulunur.
2. **Rezervasyon bilgileri.** Misafirhane, rezervasyonu yaptıranın adı soyadı, telefonu,
   geliş nedeni (harcırahlı görev, kurum misafiri, personel, protokol…), gerekiyorsa görev sevk no.
3. **Tarih ve kişi sayısı.** Geliş ve çıkış tarihi seçilir, «Kaldığı Gün» otomatik hesaplanır.
   Kişi sayısı değiştikçe sağdaki misafir satırları artar/azalır.
4. **Misafirler.** Her misafir için ad soyad, 11 haneli Tc kimlik no, cinsiyet. Aile veya birlikte
   kalacak grup ise **Birlikte kalsın** işaretlenir; yerleştirme bu grubu bölmemeye çalışır.
5. **Ödeme ve kapora.** «Kurum-Şahıs» seçilir. Şahıs kayıtlarında kapora tutarı, misafirhanenin
   kapora kuralına göre otomatik hesaplanır. Kurum misafirlerinde kapora aranmayabilir.
6. **İsteğe bağlı: yatağı hemen bul.** **⚙ Uygun Yatağı Otomatik Bul** düğmesi tarih aralığında
   boş yatakları bulup misafirlere atar. Yatak atamadan da kayıt açılabilir («Talep» statüsü).
7. **Kaydedin.** **Kaydet** düğmesi. Eksik alan varsa düğme pasif kalır; kayıt açıldığında
   statünün ne olacağı kaydetmeden önce altta gösterilir.

**Notlar**
- Kapora tahsilatı kayıt açarken alındıysa «Kapora tahsil edildi» işaretlenip makbuz no yazılır;
  tutar tamamlanmışsa kayıt doğrudan **Onaylı** olur.
- Rezervasyon numarası (MSFH-…) otomatik verilir; arama kutularında bu numarayla da aranabilir.

---

## 3. Kapora / peşinat alındığında ne yapılır? — MSFH-W07

**Yetki:** `pesinat.tahsilat` · **Roller:** Müdür, Muhasebe, Admin

1. **Tahsilat bekleyenleri listeleyin.** «Peşinat ve Tahsilat» sayfası → iş listelerinden
   **Tahsilat bekleyen**. Üstteki dönem filtresi (Bugün / Bu hafta / Bu ay / Gelecek 30 gün /
   Son 30 gün / Tüm dönem) hangi tarih aralığına bakılacağını belirler.
2. **Kaydı bulun.** Arama kutusuna ad soyad, Tc kimlik no, rezervasyon no veya makbuz no.
   Kırmızı satır = ödeme süresi dolmuş, sarı satır = tahsilat bekliyor.
3. **Tahsilatı girin.** Satırdaki yeşil **₺ Tahsilat Al** düğmesi. Tutar («Tamamı» / «Yarısı»
   kısayolları) ve makbuz no girilir; tahsilat tarihi ve işlemi yapan kullanıcı otomatik kaydedilir.
4. **Sonucu doğrulayın.** Kapora tamamen tahsil edilince statü kendiliğinden **Onaylı** olur;
   kısmi tahsilatta kayıt **Kapora Bekleniyor** statüsünde kalır, kalan tutar tabloda görünür.
5. **Banka dekontu varsa** ayrıca yüklenmelidir (bkz. bölüm 4).
6. **Süresi dolanlar.** «Süresi dolan» iş listesinde son ödeme tarihi geçmiş talepler toplanır;
   tek tek **İptal** veya toplu iptal yapılabilir. İptal edilen kaydın yatağı anında serbest kalır.

**Notlar**
- Kapora kuralı (kaç gecelik / yüzde kaç, asgari tutar, ödeme süresi) misafirhane bazlıdır ve
  «Peşinat ve Tahsilat» sayfasının alt bölümünden müdür tarafından değiştirilir.
- Bu prototipte tahsilat yalnız statü ve kayıt seviyesinde modellenir; gerçek ödeme veya
  muhasebe entegrasyonu yoktur.

---

## 4. Dekont yükleme ve müdür onayı — MSFH-W06

**Yetki:** yükleme `rezervasyon.dekont` (Müdür, Resepsiyon, Muhasebe, Admin) ·
onay `rezervasyon.onay` (Müdür, Admin)

1. **Kaydı açın.** «Rezervasyon Talepleri» sayfasında kaydı seçin; sağdaki panelde kapora şeridi
   tutarı, kaç gecelik olduğunu ve dekont durumunu gösterir.
2. **Dekontu yükleyin.** Şeritteki **↑ Dekont Yükle** düğmesi. Dekont no, tutar, yatırma tarihi,
   banka bilgisi ve PDF/görsel dosya girilir. Denemek için **Örnek dekont üret (demo)** kullanılabilir.
3. **Onaya gönderin.** **Dekontu Kaydet ve Onaya Gönder** → kayıt **Müdür Onayı Bekliyor**
   statüsüne geçer ve «Dekont ve Onay» kuyruğuna düşer.
4. **Müdür inceler.** «Dekont ve Onay» sayfasında kayıt seçilir, belge sağda görüntülenir.
   **✓ Onayla ve Rezervasyon Listesine Al** → kayıt **Onaylı** olur, yatak tahsis edilebilir.
5. **Gerekirse reddedilir.** **Reddet** düğmesi ve gerekçe; kayıt kapora beklemeye döner,
   gerekçe kayıt geçmişinde ve talep ekranında görünür.

> Kapora tutarı olan bir kayda, dekontu onaylanmadan yatak tahsis edilemez. Bu kural otomatik
> yerleştirme, manuel yerleştirme ve harita üzerinden yerleştirmenin üçünde de uygulanır.

---

## 5. Oda ve yatak yerleştirmesi nasıl yapılır? — MSFH-W05 / MSFH-W03

**Yetki:** `rezervasyon.yerlestir` · **Roller:** Müdür, Resepsiyon, Admin

1. **Talebi seçin.** «Rezervasyon Talepleri» sayfasında soldaki listeden kayıt seçilir.
2. **Yol 1 — Otomatik.** **⚙ Otomatik Yerleştir**; kapasite, aile birlikteliği, cinsiyet ayrımı,
   protokol önceliği, ardışık gecelerde aynı oda ve temizlik boşluğu kurallarını gözeterek öneri
   üretir. Öneri doğrudan uygulanmaz; onay penceresinde görülür ve onaylanır. Yerleşemeyen talep
   için okunabilir gerekçe yazılır.
3. **Yol 2 — Manuel.** **✋ Manuel Yerleştir**; her misafir için oda ve yatak elle seçilir.
   Listede yalnız aralığın **tüm gecelerinde** boş olan yataklar çıkar. **Yerleşimi Kaydet**.
4. **Yol 3 — Harita üzerinde.** **🗺 Haritada Yerleştir** sizi «Oda ve Yatak Durumu» sayfasına
   yerleştirme modunda götürür; misafir boş yatağa sürüklenir veya yatağa tıklanır. Uygun olmayan
   yatakta neden ekranda yazar. **Yerleştirmeyi Bitir**.
5. **Doğrulayın.** «Oda ve Yatak Durumu» sayfasında yatakların üzerinde misafir adı yazar;
   «Yatak Listesi» sayfasında oda/yatak numarasına göre «hangi yatakta kim yatıyor» tablosu vardır.
6. **Geri alma.** **Tahsisi Kaldır** o kaydın bütün yatak tahsislerini iptal eder.

**Notlar**
- Çıkıştan sonra her yatak için bir gün temizlik boşluğu bloklanır.
- Karma oda oluşmaz: bir odada farklı cinsiyetten misafir bulunamaz (aile / birlikte kalma hariç).

---

## 6. Doluluğu görme ve boş yatak arama — MSFH-W01 / W02 / W03 / W04

1. **Günlük özet.** «Bugünkü Durum»: dolu/boş yatak, bugünkü giriş-çıkış, temizlikteki yatak,
   doluluk oranı ve dört misafirhanenin karşılaştırması. Tesis adına tıklayarak geçiş yapılır.
2. **30 günlük takvim.** «Doluluk Takvimi»: her gün için doluluk çubuğu, giriş (▲) ve çıkış (▼)
   sayıları; **◀ Önceki 30 gün** / **Sonraki 30 gün ▶** ile dönem kaydırılır.
3. **Aralıkta kalan yatak.** Takvim sayfasındaki tarih aralığı kutuları; seçilen aralığın bütün
   gecelerinde **kesintisiz** boş kalan yatak sayısı hesaplanır.
4. **Oda oda.** «Oda ve Yatak Durumu»: oda kartlarında yatak yatak durum (dolu / boş / temizlikte)
   ve kalan misafirin adı. Tarih değiştirilerek ileri günlere bakılabilir.

---

## 7. Giriş, çıkış, uzatma ve iptal — MSFH-W08

1. **Statü akışı.** «Statü Takibi» sayfasında kayıtlar statüye göre gruplanır:
   Talep → Kapora Bekleniyor → Müdür Onayı Bekliyor → Onaylı → Konaklıyor → Çıkış (her aşamadan İptal).
2. **Giriş.** Onaylı ve yatağı tahsis edilmiş kayıt, geliş tarihinde **Konaklıyor** olur;
   erken gelen misafir satırdaki statü düğmesiyle elle de konaklatılabilir.
3. **Çıkış.** Kayıt **Çıkış** statüsüne alınır; yatak serbest kalır, bir günlük temizlik boşluğu
   başlar. «Peşinat ve Tahsilat» sayfasındaki «Bugün çıkış» iş listesi o günkü çıkışları toplar.
4. **Uzatma.** Çıkış tarihi ileri alınır; aynı yatak boşsa misafir yerinde kalır, değilse sistem
   uyarır ve yeniden yerleştirme gerekir.
5. **İptal.** Her aşamada mümkündür; tahsis edilmiş yataklar anında boşa düşer. Ödeme süresi dolan
   kapora talepleri sistem tarafından kendiliğinden iptal edilir.

> «Bugünkü Durum» sayfasındaki **+1 gün** / **+7 gün** demo düğmeleriyle sistem tarihi ilerletilip
> süresi dolan taleplerin otomatik iptali canlı olarak görülebilir.

---

## 8. Hangi rol neyi yapabilir?

| İşlem | Yetkili roller |
|---|---|
| Kayıt açma (yeni rezervasyon) | Müdür, Resepsiyon, Admin |
| Yatak tahsisi / yerleştirme | Müdür, Resepsiyon, Admin |
| Kapora dekontu yükleme | Müdür, Resepsiyon, Muhasebe, Admin |
| Dekontu onaylama veya reddetme | Müdür, Admin |
| Peşinat / kapora tahsilatı girme | Müdür, Muhasebe, Admin |
| Kapora kuralını değiştirme | Müdür, Admin |
| Kayıt iptali | Müdür, Admin |
| Süresi dolan talepleri toplu iptal | Müdür, Muhasebe, Admin |
| Kullanıcı ve yetki yönetimi | Admin |

Her kullanıcı yalnız yetkili olduğu misafirhaneleri görür. Yetkisi olmayan sayfalar menüde
görünmez; yetkisi olmayan düğmeler pasif kalır ve üzerine gelince gerekçesi yazar.

---

## 9. Sık sorulan sorular

**Yerleştir düğmesi neden pasif / neden yatak veremiyorum?**
Ya rolünüzün yerleştirme yetkisi yoktur, ya da kaydın kaporası tahsil edilip dekontu müdürce
onaylanmamıştır. İkinci durumda önce «Dekont ve Onay» sayfasından onay alınmalıdır.

**Boş görünen yatağa neden misafir koyamıyorum?**
Yatak, geliş–çıkış arasındaki **her gecede** boş olmalıdır; aradaki bir gece doluysa listelenmez.
Ayrıca çıkıştan sonraki bir gün temizlik için bloklanır ve karma oda kuralı engelleyebilir.

**Kapora tutarını kim belirliyor?**
Misafirhanenin kapora kuralı: kaç gecelik ya da yüzde kaç, asgari tutar, kaç gün içinde ödenmeli.
Kural «Peşinat ve Tahsilat» sayfasının altındaki bölümden müdür tarafından değiştirilir.

**Listede göremediğim kayıt nerede?**
Dönem filtresi ve statü süzgecini kontrol edin; varsayılan olarak yalnız seçili tarih aralığıyla
kesişen kayıtlar listelenir. «Tüm dönem» + «Tüm statüler» hepsini gösterir.

**Yanlış tahsilat girdim, ne yapmalıyım?**
Kaydı **Detay** ile açın; bütün hareketler (tahsilat, dekont, onay, statü değişikliği) tarih ve
kullanıcı bilgisiyle listelenir. Prototipte düzeltme, doğru tutarla yeni bir hareket girilerek gösterilir.

**Ekrana sığmıyor / yazılar küçük.**
Sağ alt köşedeki dikey büyüteç kutusundan yazı boyutunu %85–%135 arasında ayarlayın; bütün
sayfalar bu ayarla yeniden düzenlenir, tarayıcı yakınlaştırmasına gerek yoktur.
