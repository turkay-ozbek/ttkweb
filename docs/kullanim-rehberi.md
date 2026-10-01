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
4. **Telefon ve tablette.** Arayüz ekran genişliğine göre kendini düzenler: sayfa şeridi
   yerini **«☰ <sayfa adı> ▼»** düğmesine bırakır (alttan açılan çekmecede bütün sayfalar
   sayılarıyla listelenir), kartlar tek sütuna iner, listeler tablo yerine kart olarak
   açılır. Yazı boyutu için tarayıcının yakınlaştırmasını kullanın.
5. **Bir düğmenin ne yaptığını öğrenin.** Düğmenin üzerine gelip bekleyin; ne işe yaradığı
   küçük bir balonda yazar. Düğme soluk (pasif) ise balon hangi yetkinin gerektiğini söyler.
6. **Aradığınız işlemi yazarak bulun.** Üst bandın ortasındaki **«Hangi işlemi yapmak
   istiyorsunuz?»** kutusu ya da her yerden **Ctrl + K**. Sayfa adı, işlem, misafir adı,
   Tc kimlik no veya rezervasyon no yazabilirsiniz; ↑ ↓ ile gezinip ↵ ile seçersiniz.
7. **Yardımcıya sorun.** Sağ alt köşedeki baretli maskot **Madenci**'dir. Doluluk gibi
   soruları canlı veriyle, «kapora nasıl işlenir?» gibi soruları bu rehberden adım adım
   yanıtlar ve ilgili sayfaya bağlantı verir. Bir **demo asistandır**: kural tabanlı çalışır,
   dış bir yapay zekâ servisine bağlanılmaz.
8. **Bugün neye bakmanız gerektiğini görün.** Üst bandın sağındaki **zil**, o misafirhanede
   bekleyen bütün işleri tek listede toplar (dekont onayı, süresi dolan kapora, bugünün
   giriş-çıkışları, yerleştirilmeyen talepler, bekleme listesi, temizlik, servis dışı yatak).
   Zildeki sayı bekleyen iş sayısıdır; acil iş varsa kırmızı olur. Kısayolu **B**.
9. **Klavyeyle hızlanın.** **`?`** tuşu bütün kısayolları listeler: `N` yeni kayıt,
   `/` arama kutusu, `B` bekleyen işler, `G` ana menü, `R` rehber, `Esc` açık pencere.
10. **Yanlış tıkladıysanız.** Çoğu işlemden sonra ekranın altında 12 saniye duran bir
   **«Geri Al»** şeridi çıkar; basınca veri işlemden önceki hâline döner.
11. **Rehber ve oturum.** Üst bandın sağındaki **Rehber** düğmesi bu sayfayı her ekrandan açar;
   en sağdaki güç simgesi oturumu kapatır. Kullanıcı adınız alt bilgi çubuğunun solunda yazar.
   Ortak kullanılan bilgisayarda **15 dakika** işlem yapılmazsa oturum kendiliğinden kapanır;
   kapanmadan önce geri sayımlı uyarı çıkar.

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

1. **Günü ve talebi seçin.** «Rezervasyon Talepleri» listesi **günlüktür**: üstteki **Geliş günü**
   kutusunda seçili günde gelişi olan kayıtlar listelenir; **◀ ▶** ile gün değiştirilir, **Bugün**
   sistem tarihine döner. Aradığınız kayıt başka bir güne aitse arama kutusuna ad, Tc kimlik ya da
   rezervasyon no yazın — arama bütün günlerde yapılır. Sonra soldaki listeden kayıt seçilir.
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
   Ankara Misafirhanesi'nde sağ üstteki **Kroki** görünümü odaları misafirhanenin kâğıt
   krokisindeki düzende gösterir; yerleştirme bu görünümde de yapılabilir. **🖨 Yazdır**
   ile seçili günün kroki çıktısı alınır: kat kat odalar ve her yatağın karşısında kalan
   misafirin adı (A4 yatay). «Yataklara misafir adlarını yaz» işareti kaldırılırsa çizelge boş
   basılır, elle doldurmak için kullanılır.
6. **Geri alma.** **Tahsisi Kaldır** o kaydın bütün yatak tahsislerini iptal eder.

**Notlar**
- Çıkıştan sonra her yatak için bir gün temizlik boşluğu bloklanır.
- Karma oda oluşmaz: bir odada farklı cinsiyetten misafir bulunamaz (aile / birlikte kalma hariç).

---

## 6. Doluluğu görme ve boş yatak arama — MSFH-W01 / W02 / W03 / W04

1. **Günlük özet.** «Bugünkü Durum»: dolu/boş yatak, bugünkü giriş-çıkış, temizlikteki yatak,
   doluluk oranı ve dört misafirhanenin karşılaştırması. Tesis adına tıklayarak geçiş yapılır.
2. **Doluluk takvimi.** «Doluluk Takvimi»: her gün için doluluk çubuğu, giriş (▲) ve çıkış (▼)
   sayıları. Şeridin uzunluğu sağ üstten seçilir — **7 gün** (bu haftaya odaklanır, günler geniş
   ve okunaklıdır, telefonda da sığar), **14 gün**, **30 gün** (aylık planlama). **◀ Önceki …** /
   **Sonraki … ▶** seçilen uzunluk kadar ilerler, **Bugün** sistem tarihine döner.
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
4. **Uzatma.** Talep detayındaki **«📅 Uzat»** düğmesi yeni çıkış tarihini sorar ve her misafir
   için yeni gecelerde yatağın boş olup olmadığını denetler: boşsa misafir yerinde kalır, değilse
   uzatma kilitlenir ve önce nakil istenir.
5. **Nakil (oda değişikliği).** **«🔁 Nakil»** misafiri kalan gecelerin tamamında kesintisiz boş
   olan bir yatağa taşır; yalnız bu yataklar listelenir. İşlem gerekçesiyle kayıt geçmişine yazılır
   ve gerekirse «Geri Al» şeridinden döndürülebilir.
6. **İptal.** Her aşamada mümkündür; tahsis edilmiş yataklar anında boşa düşer. Ödeme süresi dolan
   kapora talepleri sistem tarafından kendiliğinden iptal edilir — **ancak yalnız konaklaması
   henüz başlamamış talepler.** Misafir içerideyken kayıt kendiliğinden düşmez; kapora alacağa
   döner ve «Peşinat ve Tahsilat» sayfasındaki **«Konaklıyor, kapora eksik»** listesinde izlenir.
   Tahsil ya da iptal kararını müdür verir.

> «Bugünkü Durum» sayfasındaki **+1 gün** / **+7 gün** demo düğmeleriyle sistem tarihi ilerletilip
> süresi dolan taleplerin otomatik iptali canlı olarak görülebilir.

---

## 8. Kahvaltı yoklaması nasıl işlenir? — MSFH-W11

1. «Kahvaltı Takibi» sayfası o gün konaklayan misafirleri oda/yatak sırasıyla listeler.
2. **Kahvaltıya inmeyen** misafirin satırındaki kutu işaretlenir — işaretlenmeyen herkes kahvaltı
   yapmış sayılır. Yoklama güne bağlıdır; tarih kutusundan başka bir güne geçilebilir.
3. Sayılar ay sonu belgesine buradan gelir; yoklama eksikse belge de eksik olur.
4. İşaretleme yetkisi müdür ve resepsiyondadır; muhasebe sayfayı görür, değiştiremez.

---

## 9. Ay sonu belgesi nasıl hazırlanır? — MSFH-W12

1. **Muhasebe ister.** Dönem (ay) seçilip «Belgeyi İste» düğmesine basılır, istenirse not eklenir.
2. **Resepsiyon hazırlar.** Bekleyen talebin yanındaki «Belgeyi Hazırla» düğmesi dönemin konaklama
   gecesini, kahvaltı sayılarını ve tahsilatı hesaplayıp PDF üretir.
3. **Muhasebe alır.** Durum «Teslim edildi»ye döner; «Belgeyi Gör» ekranda açar, «İndir» kaydeder.
   Kim istedi, kim hazırladı, ne zaman — hepsi listede yazılıdır.

---

## 10. Oda temizliği ve servis dışı yatak — MSFH-W13 / MSFH-W03

1. **Günlük liste.** «Kat Hizmetleri» sayfası o gün iş olan odaları iki başlıkta getirir:
   çıkış yapılan odalar **«Çıkış temizliği»**, misafiri süren odalar **«Günlük temizlik»**.
   İşi olmayan odalar «İş yok» sayılır; «Yalnız iş olanlar» kutusuyla liste daraltılır.
2. **Durum ilerletme.** Her satırda dört çip vardır: Bekliyor → Temizleniyor → Temizlendi → Hazır.
   Çipe basıldığında **işlem saati** kendiliğinden yazılır; odanın ne zaman hazır olduğu belli olur.
3. **Kat görevlisi.** Odayı kimin temizlediği yazılır. Liste «🖨 Yazdır» ile kâğıda alınıp kat
   görevlisine verilir, «⬇ Excel/CSV» ile dışa aktarılır.
4. **Kullanılamayan yatak.** Arıza, tadilat ya da boya durumunda «Oda ve Yatak Durumu» veya
   «Yatak Listesi» sayfasından yatağa tıklanıp **«⛔ Servis Dışı Bırak»** denir; tarih aralığı ve
   gerekçe zorunludur. Yerleştirme motoru o yatağı hiç önermez.
5. **Hizmete alma.** Arıza giderildiğinde aynı pencereden **«✓ Hizmete Al»** denir.

> Servis dışı yatak kapasiteden düşmez, ayrı sayılır:
> **`dolu + boş + temizlikte + servis dışı = kapasite`** eşitliği «Bugünkü Durum» ekranında yazılıdır.

---

## 11. Grup kaydı, bekleme listesi ve misafir kartı — MSFH-W05 / MSFH-W04

1. **Grup / blok kaydı.** «On kişilik yer tutun, adları sonra bildireceğiz» denildiğinde yeni kayıt
   formunda kişi sayısı girilir ve **«Grup / blok kaydı»** kutusu işaretlenir. İlk misafir dışındaki
   ad alanları boş bırakılabilir; yataklar yine ayrılır ve adlar `— AD BİLDİRİLECEK` kalır.
   Kayıt adı «… Grubu» olarak yazılır, talep listesinde **👥** işaretiyle görünür.
2. **İsim bildirimi.** Adlar geldikçe kayıt seçilip **«👥 İsim Bildir»** penceresinden girilir.
   Girişte Tc kimlik no zorunlu olduğu için adla birlikte alınması iyidir.
3. **Grup küçülürse.** **«Yatak Serbest Bırak»** ile adı bildirilmemiş yataklardan istenen kadarı
   başka taleplere açılır; kişi sayısı, yatak bedeli ve kapora yeniden hesaplanır. Yanlışlıkla
   yapıldıysa «Geri Al» şeridinden dönülür.
4. **Yer yoksa bekleme listesi.** Yerleştirilemeyen kayıtta **«⏳ Bekleme Listesine Al»** düğmesine
   basılır; kayıt iptal edilmez, statüsü değişmez. Talepler sayfasındaki bekleme kartı o tarihlerde
   kaç yatağın boş olduğunu sürekli hesaplar ve yeter sayıda yatak boşalınca **«yatak çıktı»** der.
5. **Misafir kartı.** Yatak listesinde ya da talep detayında misafir adına tıklanır: kart kişinin
   kaç kez kaldığını, toplam gecesini, sık kaldığı odayı, tahsilat ve iptal geçmişini gösterir.
   **«★ Öncelikli misafir»**, **«⛔ Dikkat işareti»**, oda tercihi ve serbest not buradan kaydedilir;
   bunlar rezervasyonda değil **kişide** durur ve bir sonraki kayıtta adın yanında görünür.
   Kart notları kurum içi bilgidir, misafire giden SMS ve belgelerde yer almaz.

---

## 12. Yönetim raporları ve denetim izi — MSFH-W14 / MSFH-W15

1. **Dönem seçimi.** «Yönetim Raporları» sayfasında tarih aralığı elle girilir ya da
   **Bu ay / Geçen ay / Son 30 gün / Son 90 gün / Bu yıl** kısayolları kullanılır.
2. **Doluluk okuma.** Doluluk, aralığın her günü için dolu yatak sayısının yatak kapasitesine
   oranıdır («yatak-gece»). Karşılaştırma tablosu yetkili olunan bütün misafirhaneleri yan yana
   getirir ve toplam satırını verir.
3. **Kırılımlar.** Seçili misafirhane için geliş nedeni, en çok konaklayan kurumlar ve konaklama
   süresi dağılımı ayrı kartlarda çıkar. Kısa konaklama ağırlığı yüksekse çıkış temizliği yükü de
   yüksektir — kat hizmetleri planı buna göre yapılır.
4. **Teslim.** «⬇ Excel/CSV» tabloyu dışa aktarır, «🖨 Yazdır» A4 çıktı alır. Muhasebenin istediği
   ay sonu belgesi ayrı bir sayfadadır (bölüm 9).
5. **Denetim izi.** «Denetim İzi» sayfası bütün kayıt hareketlerini ve sistem günlüğünü tek listede
   toplar; tarih aralığı, kullanıcı, kaynak (kayıt / sistem) ve serbest metinle süzülür, Excel'e
   aktarılır. Sayfa **yalnız okunur** — buradan hiçbir kayıt değiştirilemez.

> Raporlar müdür, resepsiyon ve muhasebeye açıktır; denetim izi yalnız müdür ve admin rolündedir.

---

## 13. Yanlış işlem, klavye kısayolları ve oturum güvenliği

1. **Geri alma.** Tahsis kaldırma, iptal, uzatma, nakil, toplu yerleştirme, servis dışı bırakma ve
   bloktan yatak serbest bırakma işlemlerinden sonra ekranın altında **«Geri Al»** şeridi çıkar.
   Şerit 12 saniye durur; düğme veriyi işlemden önceki hâline döndürür. Şerit kapandıktan sonra
   işlem kalıcıdır.
2. **Bekleyen işler.** Üst bandın sağındaki **zil**, o misafirhanede bekleyen bütün işleri tek
   listede toplar: dekont onayı, süresi dolan kapora, bugünün giriş-çıkışları, yerleştirilmeyen
   talepler, adı bildirilmemiş gruplar, bekleme listesi, servis dışı yatak, çıkış temizliği bekleyen odalar ve
   bekleyen ay sonu belgesi. Satıra basmak ilgili sayfayı açar.
3. **Klavye kısayolları.** **`?`** listeyi açar. En çok kullanılanlar: `Ctrl + K` işlem araması,
   `N` yeni kayıt, `/` sayfadaki arama kutusu, `B` bekleyen işler, `G` ana menü, `R` rehber,
   `↑ ↓` talep listesinde satır, `↵` manuel yerleştirme, `Esc` açık pencere. Yazı alanında ya da
   pencere açıkken kısayollar çalışmaz.
4. **Oturum.** Resepsiyon bilgisayarı ortak kullanıldığı için **15 dakika** işlem yapılmayan oturum
   kapanır; kapanmadan **2 dakika** önce geri sayımlı uyarı çıkar. «Devam Et» süreyi sıfırlar,
   «Şimdi çık» hemen kapatır.
5. **Excel'e aktarma.** Yatak listesi, talep listesi, tahsilat, kahvaltı, kat hizmetleri, bekleme
   listesi, dönem raporu ve denetim izi sayfalarındaki **«⬇ Excel/CSV»** düğmesi ekrandaki süzgeçle
   sınırlı dosya üretir; Türkçe karakterler Excel'de doğru açılır.
6. **Beklenmeyen hata.** Bir ekran çökerse boş sayfa yerine ne olduğunu ve verinin kaybolmadığını
   anlatan bir kutu çıkar; «Ekranı yeniden dene» çoğu durumda yeterlidir.

---

## 14. Hangi rol neyi yapabilir?

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
| Kahvaltı yoklaması işleme | Müdür, Resepsiyon, Admin |
| Ay sonu belgesini isteme | Müdür, Muhasebe, Admin |
| Ay sonu belgesini hazırlama | Müdür, Resepsiyon, Admin |
| Kapora beklemeden yerleştirme (öncelikli misafir) | Müdür, Admin |
| Yatağı servis dışı bırakma (arıza) | Müdür, Resepsiyon, Admin |
| Kat hizmetleri (temizlik) işleme | Müdür, Resepsiyon, Admin |
| Yönetim raporlarını görüntüleme | Müdür, Resepsiyon, Muhasebe, Admin |
| Denetim izini görüntüleme | Müdür, Admin |
| Kullanıcı ve yetki yönetimi | Admin |

Her kullanıcı yalnız yetkili olduğu misafirhaneleri görür. Yetkisi olmayan sayfalar menüde
görünmez; yetkisi olmayan düğmeler pasif kalır ve üzerine gelince gerekçesi yazar.

---

## 15. Sık sorulan sorular

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

**Yanlış işlem yaptım, geri alabilir miyim?**
Tahsis kaldırma, iptal, uzatma, nakil, toplu yerleştirme, servis dışı bırakma ve bloktan yatak
serbest bırakma işlemlerinden hemen sonra ekranın altındaki **«Geri Al»** şeridini kullanın.
Şerit 12 saniye durur; sonrasında işlem kalıcıdır ve düzeltme yeni bir işlemle yapılır.

**Misafir adının yanındaki ★ veya ⛔ ne demek?**
Misafir kartına kaydedilmiş not var: ★ öncelikli misafir, ⛔ dikkat işareti, ✎ oda tercihi ya da
serbest not. Ada tıklayarak kartı açıp ayrıntısını görebilirsiniz.

**Yer bulamadığım talebi nasıl takip ederim?**
«⏳ Bekleme Listesine Al» ile bekleme listesine alın. Talepler sayfasındaki kart o tarihlerde kaç
yatağın boş olduğunu sürekli hesaplar; yeter sayıda yatak boşalınca «yatak çıktı» yazar ve üst
banttaki zil sayacına düşer.

**Bugün neye bakmam gerektiğini nereden anlarım?**
Üst bandın sağındaki **zil**: bekleyen bütün işler (onay, kapora, giriş-çıkış, yerleştirme,
temizlik, grup isimleri, bekleme listesi) tek listede, sayısıyla birlikte durur.

**Yanlış tahsilat girdim, ne yapmalıyım?**
Kaydı **Detay** ile açın; bütün hareketler (tahsilat, dekont, onay, statü değişikliği) tarih ve
kullanıcı bilgisiyle listelenir. Prototipte düzeltme, doğru tutarla yeni bir hareket girilerek gösterilir.

**Ekrana sığmıyor / yazılar küçük.**
Geniş tablolar sayfayı değil kendi kutusunu kaydırır; tablonun üzerinde parmağınızı ya da
farenizi yana sürükleyin. Telefonda satır işlemi olan listeler zaten kart olarak açılır.
Yazı boyutu için tarayıcının yakınlaştırmasını kullanın (Ctrl + / telefonda iki parmakla açma).
