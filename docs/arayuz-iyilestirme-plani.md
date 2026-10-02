# Arayüz İyileştirme Planı — TTKNET Misafirhane Bilgi Sistemi

**Kapsam:** Özet, Kat Hizmetleri, Dekont/Onay ve Denetim ekranları; buna bağlı olarak
navigasyon, renk dili ve tablo/filtre standardı.
**Tarih:** 02.10.2026 · **İncelenen sürüm:** v2.13.0 (`misafirhane-prototip.html`)
**Yöntem:** Bulgular hem **kaynaktan** hem **altı ekran görüntüsünden** doğrulanmıştır
(Giriş, Ana Menü, Özet, Kat Hizmetleri, Dekont/Onay, Denetim — MSF1001 / Müdür
oturumu, 02.10.2026). Her bulgunun yanında ölçülen değer, satır referansı veya
ekranda görülen değer verilmiştir. Doğrulanamayan şeyler açıkça **(varsayım)**
olarak işaretlidir. Ekran görüntüleri üç ön teşhişi değiştirdi; bunlar
«**düzeltme**» etiketiyle işaretlenmiştir.

**Kısıt:** Köklü yeniden yazım önerilmez. Her aşama tek başına yayına alınabilir.
Kurumsal lacivert (`ttk-*`) kimliği korunur, yeni marka rengi önerilmez. Veri
yoğunluğu düşürülmez — ferahlık, kolon/rozet/yoğunluk stratejisiyle sağlanır.

---

## 0. Önce şu beş sorunun yanıtı gerekiyor

Bunlar olmadan ilerleyen bölümlerdeki bazı kararlar varsayıma dayanır. Yanıt
beklerken etkilenmeyen bölümler tamdır ve uygulanabilir.

| # | Soru | Neyi belirler |
|---|---|---|
| 1 | **Kat görevlisi listesi nereden gelecek?** Uygulamada tanımlı dört rol var (Admin, Müdür, Resepsiyon, Muhasebe) — **kat görevlisi / kat şefi rolü yok**. Görevli adları AD/LDAP'tan mı, tesise bağlı bir personel tablosundan mı, yoksa elle yönetilen bir listeden mi gelecek? | P0-2 (serbest metin → seçim listesi) ve P0-6 (yeni rol) veri modeli |
| 2 | **Sahadaki tablet nedir?** Model/OS/çözünürlük (örn. iPad 10.2″ yatay 1080×810, Android 10″ 1280×800). Eldivenle mi kullanılıyor? | Dokunma hedefi boyutu, yoğunluk eşiği, kırpılma noktası |
| 3 | **Dekont reddinde misafire bildirim gidiyor mu?** Gidiyorsa metni kim onaylıyor, gerekçe aynen mi iletiliyor? | Red akışındaki mesaj önizlemesinin tasarımı |
| 4 | **Denetim izinde «önceki değer» tutulacak mı?** `docs/veritabani.md` içindeki `hareket` tablosunda `eski_deger`/`yeni_deger` (jsonb) alanları tanımlı ama prototipte doldurulmuyor. Gerçek kurulumda zorunlu mu? | Denetim ekranındaki diff görünümünün yapılabilirliği |
| 5 | **«Süper yönetici» ne demek?** Mevcut ADMIN (Bilgi İşlem) mi, yoksa tesis müdürünün üstünde kurum düzeyinde bir rol mü? | Rol × modül matrisinin üçüncü seviyesi |

---

## 1. Kısa teşhiş

### 1.1 Çapraz bulgular (tek ekrana ait değil, hepsini etkiliyor)

| # | Bulgu | Doğrulama | İş etkisi |
|---|---|---|---|
| C1 | **Sahadaki kullanıcının rolü yok, üstelik misafir adlarını görüyor.** Kat Hizmetleri tablette kat görevlisi tarafından kullanılıyor, ama `temizlik.isle` izni yalnız Müdür / Resepsiyon / Admin'de. Ekranda «Odadaki Misafirler» kolonu **tam ad soyad** gösteriyor: "NURETTİN GÜRBÜZ", "CENGİZ ŞAHİN, VOLKAN ALTUN" | `ROLLER` dört rol; `temizlik.isle` üç rolde · ekran görüntüsü | **En ağır bulgu.** Görevli ya resepsiyon hesabıyla giriyor — o zaman tüm rezervasyon, Tc kimlik ve tahsilat verisine erişiyor — ya da denetim izi yanlış kişiyi gösteriyor. Her iki durumda da **46 misafirin adı temizlik için gereksiz yere ifşa oluyor** (KVKK gereklilik ilkesi) |
| C2 | **Amber üç ayrı anlamda kullanılıyor, ikisi aynı başlıkta.** DEMO rozeti ve bildirim rozeti kodda birebir aynı: `bg-amber-400 text-amber-950`. Giriş ekranında **Muhasebe rol rozeti** de amber. **Düzeltme:** ekran görüntüsünde zil şu an **kırmızı** görünüyor (acil iş var); çakışma acil iş bitince, yani sakin günde ortaya çıkar | satır 8935 / 8946 · giriş ekranı rol rozetleri | Sarı aynı anda "bu gerçek değil", "bekleyen iş var" ve "muhasebe rolü" demek. Kullanıcı sarıyı görmezden gelmeyi öğrenir. Çakışma **gizli**: en sakin günde, yani uyarının en çok fark edilmesi gereken günde gerçekleşir |
| C3 | **Zil sayacı «iş» değil, karışık toplam.** Rozet, bilgi amaçlı satırları (bugün giriş yapacak, çıkış yapacak) da topluyor. 39'un yaklaşık yarısı yapılacak iş değil | `gorevleriHesapla` — `onem: 'bilgi'` satırları da `gorevSayisi`'na giriyor | Sayı hiç sıfırlanmıyor → "her zaman 30+" algısı → rozet anlamsızlaşıyor. Eleştiri haklı, sayaç bu hâliyle kuyruk değil |
| C7 | **Sayaçlar ekranlar arasında tutmuyor.** Ana Menü «Denetim İzi — **1** işlem günlüğü kaydı» diyor; Denetim ekranı aynı oturumda **207 satır** gösteriyor. (Ana menü yalnız `s.gunluk`'u sayıyor, ekran kayıt hareketlerini de katıyor) | Ana Menü ve Denetim ekranı, aynı oturum | Aynı veri iki yerde iki farklı sayı → kullanıcı hangi sayıya güveneceğini bilemez; raporlanan sayılara güven kaybı |
| C8 | **Ana Menü'de Kat Hizmetleri kartında sayı yok**, diğer on üç kartın hepsinde var | Ana Menü ekranı | Kart "ölü" görünüyor; en kritik operasyonel ekran ana menüde en zayıf sinyali veriyor |
| C4 | **Düğme yüksekliği 31 px, durum çipi 21 px.** `Buton` = `px-3 py-1.5 text-xs` → 17 px satır + 12 px dolgu + 2 px kenar = **31 px**. Kat hizmetleri durum çipi = `px-2 py-0.5 text-2xs` → **~21 px**, dördü 4 px aralıkla. | `Buton` tanımı; satır 7196 | WCAG 2.5.8 (AA, 24×24 px) **ihlal**; 2.5.5 (AAA, 44×44 px) ihlal. Tablette yanlış çipe basma riski yüksek |
| C5 | **Kendi otomatik testim bu ihlali yakalamıyor.** `12-mobil.mjs` yalnız 26 px altını işaretliyor, hem de tek sayfada. 21 px'lik çipler hiç ölçülmemiş. | `testler/12-mobil.mjs:97` (`r.height < 26`) | Regresyon koruması yok; düzeltme yapılsa bile tekrar bozulabilir |
| C6 | **14 sekme tek sırada, rol bazlı değil.** Müdür 14, resepsiyon 12 sekme görüyor; hiçbir rol 14'ünü günlük kullanmıyor. | `SAYFALAR` 15 kayıt (1 gizli) | Her işlem için hedef arama; yeni personel eğitim süresi uzun |

### 1.2 ÖZET ekranı

| # | Bulgu | İş etkisi |
|---|---|---|
| Ö1 | **Yedi eşit ağırlıklı KPI, hiyerarşi yok.** "Boş Yatak 4 (%8)" ile "Servis Dışı 0" aynı puntoda, aynı kutuda. Kritik eşik (boş yatak ≤ 2) görsel olarak işaretlenmiyor. | Müdür "bugün neye bakmalıyım" sorusunu ekrandan yanıtlayamıyor. %90 dolulukta boş yatak sayısının kritikliği kaçıyor → aşırı kabul / çakışma riski |
| Ö2 | **Kartlar aksiyona bağlı değil.** `Kpi` bileşeni düz `<div>`; `onClick` yok, tıklanabilirlik işareti yok. "Giriş Yapacak 15" görülüyor ama listeye gitmek için Statü sekmesi ayrıca aranıyor. | Her bakışta 2–3 fazladan tıklama; günde onlarca kez |
| Ö3 | **«Son İşlemler» paneli altı satır yer ayırıyor, ekranda iki satır var** — ikisi de sistem kaydı ("Oturum açıldı: MSF1001", "Demo veri üretildi: 104 oda / 211 yatak / 4488 rezervasyon kaydı"). Boş durum metni yok. | Panel güven kaybettiriyor; denetim ihtiyacı burada karşılanmadığı için kullanıcı Denetim sekmesine gidiyor. Gerçek kurulumda dolu olacak, ama boş/az-veri durumu tanımsız |
| Ö4 | **KPI alt metni geliştirici notu.** "Temizlikte" kartının altında `1 gün blok · dolu+boş+temizlik+servis dışı = 51` yazıyor. Bu bir formül doğrulaması, kullanıcı bilgisi değil | Müdür ekranda anlamadığı bir denklem görüyor; kurumsal ciddiyeti zedeliyor. (Formülün kendisi doğru ve değerli — yeri burası değil, Rehber ya da ipucu) |
| Ö5 | **«Misafirhane Karşılaştırması» kartı tek satır.** MSF1001 yalnız Ankara'ya yetkili; karşılaştırılacak ikinci tesis yok, ama kart "karşılaştırma" başlığıyla duruyor ve ekranın yarısını kaplıyor | Başlık yanıltıcı; tek tesisli kullanıcılar (resepsiyonun tamamı, müdürlerin çoğu) için boşa giden ekran alanı |
| Ö6 | **«Bugünün İşleri» iş listesi değil, sayfa kısayolu.** Dört kart: Oda Durumu / Yatak Listesi / Talepler / Tahsilat — ikisinde sayı var, ikisinde yok ("kim nerede kalıyor", "yerleştirme bekleyenler"). Zil panelindeki gerçek iş listesiyle hem çakışıyor hem farklı veri gösteriyor | İki ayrı "bugün ne var" kaynağı → hangisinin doğru olduğu belirsiz. Başlık iş vaat ediyor, içerik gezinme veriyor |

### 1.3 KAT HİZMETLERİ ekranı — en kritik ekran

Sahada, ayakta, tablette, muhtemelen ıslak/eldivenli elle kullanılıyor. Hata maliyeti
en yüksek olan ekran bu.

| # | Bulgu | İş etkisi |
|---|---|---|
| K1 | **Durum çipleri ~21 px ve dördü iki satıra sarıyor.** Ekranda: üst satır `Bekliyor · Temizleniyor`, alt satır `Temizlendi · Hazır`; dikey aralık ~4 px. Yani "Temizleniyor"a basmak isteyen parmak bir alt satırdaki "Hazır"a denk gelebiliyor. **Beklenen sıralama da bozuluyor:** akışın son adımı ("Hazır") ikinci satırın sonunda, ama "Temizlendi" onun solunda | **Oda yanlışlıkla "Temizlendi" ya da "Hazır" işaretlenir → misafire kirli oda verilir.** Bu ekranın en pahalı hatası; misafir şikâyeti ve oda değişikliği maliyeti. İki satıra sarma riski tek satıra göre belirgin biçimde artırıyor |
| K2 | **Kat görevlisi serbest metin.** `<input placeholder="ad soyad">`, doğrulama yok, otomatik tamamlama yok. | "F. Yıldız" / "Fatma Yıldız" / "fatma" aynı kişi için üç kayıt → kişi bazlı iş yükü, puantaj ve performans raporu üretilemez. Veri bir daha temizlenemez hâle gelir |
| K3 | **Toplu işlem yok.** 22 oda tek tek işaretleniyor; "3. katın tamamı Fatma'ya" denemiyor. | Vardiya başı 22 oda × (1 görevli yazımı + 1 durum) ≈ 44 etkileşim. Tablette klavye açılıp kapanmasıyla birkaç dakika; günde iki vardiya |
| K4 | **"Bekliyor 23" ile "Temizlenecek Oda 22" tutmuyor — fark tam olarak servis dışı oda.** Ekranda Oda 17 "Servis dışı" ve çipleri soluk; bu oda "Temizlenecek"e girmiyor ama "Bekliyor"a giriyor | Kullanıcı hangi sayıya güveneceğini bilemiyor; "bir oda kayıp mı?" sorusu. Vardiya planı 22 mi 23 mü belirsiz |
| K5 | **"Saat" kolonu ekranın tamamında boş** — on bir satırın hepsinde "—". Kolon yalnız durum değişince doluyor, gün başında hiç dolu değil | Ekranın en sağındaki kolon hiçbir gün sabahı bilgi taşımıyor; tablette yatay alan kıt ve bu alan boşa gidiyor |
| K6 | **Misafir adları kat görevlisine açık** (C1'in bu ekrandaki görünümü). "Odadaki Misafirler" kolonu 46 misafirin tam adını listeliyor | Temizlik işi için ad gerekmiyor; KVKK gereklilik ilkesi ihlali. Tablet sahada, ortak alanda, ekran açık duruyor |

### 1.4 DEKONT/ONAY ekranı

| # | Bulgu | İş etkisi |
|---|---|---|
| D1 | **Düzeltme — iki kez.** (a) «istenen vs yatırılan» karşılaştırması **var**; senin listende "yok" diyordu. (b) Ama sandığımdan daha zayıf: ekranda `İSTENEN KAPORA 750 ₺ · 1 gecelik` ve `YATIRILAN 750 ₺` **sekiz kutuluk ızgaranın 4. ve 5. hücresi olarak**, diğer altı alanla birebir aynı puntoda duruyor. **Fark hiç hesaplanmıyor** — kullanıcı iki sayıyı gözüyle karşılaştırmak zorunda. Listede de fark kolonu yok; "Kapora" kolonundaki tutarın istenen mi yatırılan mı olduğu belirsiz | Onaylayan kişi her kayıtta iki sayıyı gözle eşleştiriyor. 16 kayıtlık kuyrukta bu kaçınılmaz olarak atlanıyor → **eksik kapora onaylanır, tahsilat alacağı kaybolur.** Sayılar yuvarlak ve benzer olduğu için (750 / 1.500 / 2.250) gözle ayırt etmek daha da zor |
| D2 | **Düzeltme — panel küçük değil, belge kırpılıyor.** PDF sağ panelin yaklaşık yarısını kaplıyor (sandığımdan büyük). Gerçek sorun: tarayıcının gömülü PDF görüntüleyicisi kendi araç çubuğunu (sayfa no, zoom, indir, yazdır, çiz) dikey alanın üstüne koyuyor ve belge **%100 zoom'da alttan kesiliyor** — tutar satırının altındaki açıklama görünmüyor, kaydırma gerekiyor | Onaylayan belgenin tamamını görmeden karar veriyor ya da "Yeni sekmede aç" ile çıkıp bağlamı kaybediyor. Araç çubuğundaki "indir/yazdır" düğmeleri bu akışta gereksiz, dikkat dağıtıyor |
| D3 | **Kuyruk davranışı yok.** Onayladıktan sonra sıradaki kayda geçilmiyor, klavyeyle gezilmiyor, "16 bekleyenden 3.'sü" göstergesi yok. Listede 16 satırın hepsi aynı "Onay Bkl." rozetiyle duruyor — hangisine bakıldığı yalnız arka plan renginden anlaşılıyor | 16 dekont × (listeye dön + satır bul + tıkla) → fare-yoğun, sıra kaybı, atlanan kayıt |
| D4 | **"Onay notu (isteğe bağlı)" alanı hem onay hem ret için mi belirsiz.** Tek bir serbest metin alanı, altında iki düğme (Reddet · Onayla). Ret için gerekçe zorunlu mu, bu alan mı kullanılıyor, misafire gidiyor mu — hiçbiri yazmıyor | Reddeden kişi gerekçeyi nereye yazacağını bilemiyor; yazdığı metnin misafire gidip gitmeyeceğini bilmediği için ya fazla resmî ya fazla teknik yazıyor *(soru 3'e bağlı)* |
| D5 | *(olumlu — korunacak)* Üst sağda **"Onayladığınız kayıtlar rezervasyon listesine girer ve yerleştirmeye açılır."** yazıyor; birincil düğme de "Onayla ve Rezervasyon Listesine Al" diyor. İşlemin sonucu karar anından önce yazılı | Bu kalıp doğru ve diğer ekranlara örnek alınmalı (bkz. 6.4 "sonuç cümlesi zorunlu") |

### 1.5 DENETİM ekranı

| # | Bulgu | İş etkisi |
|---|---|---|
| N1 | **Sistem günlüğü satırlarında üç kolon yapısal olarak boş.** Kodda sabit: `kullanici: '—', tesis: null, rez_no: '—'`. 207 satırın bir bölümü üç kolonda "—" gösteriyor. | Denetim sorgusunda **"kim yaptı" yanıtsız**. İç denetim veya KVKK veri sahibi talebine cevap verilemez. Boş kolonlar aynı zamanda tabloyu okunmaz hâle getiriyor |
| N2 | **Önceki/sonraki değer (diff) yok.** Hareket metni "Peşinat tahsilatı 1.500 ₺" diyor ama neyin neye değiştiği yok. | "Tutar 1.500'den 150'ye düşürülmüş" gibi bir müdahale tespit edilemez — denetim izinin asıl amacı karşılanmıyor *(soru 4'e bağlı)* |
| N3 | **500 satırda sessiz kesme, sayfalama yok.** Ekran "ilk 500 gösteriliyor" diyor ama gezinme yok; 207 satırda görünmüyor, geniş aralıkta görünür. | Denetçi eksik veriyle çalıştığını fark etmeyebilir — denetim sonucu geçersiz olur |
| N4 | **Zayıf satır ayrımı.** Tarih kolonu gün hassasiyetinde — ekranda `02.10.2026` on bir kez üst üste, saat yok. Kaynak rozeti dışında görsel gruplama yok, zebra çizgi neredeyse görünmüyor | Kronolojik okuma zor; "şu işlemden sonra ne oldu" izi takip edilemiyor. Aynı günün 12 işlemi arasında sıra belirsiz |
| N5 | **İşlem metinleri tek tip, kullanıcı tek kişi.** Ekranda 207 satırın görünen kısmında işlemlerin neredeyse tamamı "Rezervasyon talebi alındı" ve kullanıcı `TTK7719`. Bu demo verinin üretim artefaktı **(varsayım: gerçek kurulumda çeşitlilik olacak)** — ama ekranın bugünkü hâli, denetim izinin nasıl görüneceğine dair yanlış bir izlenim veriyor | Prototipi değerlendiren karar verici "denetim izi işe yaramıyor" sonucuna varabilir. Demo veri üretilirken hareketlere **farklı kullanıcı, saat ve işlem türü** dağıtılmalı; bu bir arayüz değil veri üretimi düzeltmesi |

---

## 2. Önceliklendirilmiş yapılacaklar

Efor: **S** ≤ 1 gün · **M** 2–4 gün · **L** ≥ 1 hafta (tek geliştirici, mevcut yapı üzerinde).
Her madde tek başına yayına alınabilir.

### P0 — en yüksek etki (ilk beşi sırayla)

| # | Sorun | Çözüm | Gerekçe | Efor |
|---|---|---|---|---|
| **P0-1** | Kat hizmetleri çipleri 21 px, yanlış dokunma riski (K1/C4) | Durum kontrolünü **segment kontrolüne** çevir: tek satır, 44 px yüksek, dört bölme, aktif bölme dolu renk. Çipler arası boşluk 0 (yanlışlıkla aradaki boşluğa basmak yerine her dokunuş bir bölmeye düşer). "Temizlendi"ye geçiş tek dokunuşla değil, **ileri yönlü akış** düğmesiyle ("▸ Temizliğe Başla" → "✓ Temizlendi") — geri alma için "Geri Al" şeridi zaten var | Misafire kirli oda verilmesi bu ekranın en pahalı hatası. 44 px, WCAG 2.5.5 AAA'yı da karşılar | **S** |
| **P0-2** | Kat görevlisi serbest metin → veri kirliliği (K2) | Serbest metni **seçim listesine** çevir (`<select>` + arama). Liste kaynağı soru 1'e bağlı. Geçiş döneminde: mevcut serbest metinleri normalleştirip öneri listesi kur, yeni giriş yalnız listeden; "listede yok" için ayrı bir "yeni görevli ekle" yetkisi | Rapor üretilemezliğin kökü burada. Her gün biraz daha kirleniyor — ne kadar beklenirse göç o kadar pahalı | **M** |
| **P0-3** | Fark hesaplanmıyor; iki tutar gözle karşılaştırılıyor (D1) | **Farkı sistem hesaplasın.** Listeye fark kolonu + rozeti (`Tam` / `−350 ₺ eksik` / `+200 ₺ fazla`); detayda "İstenen / Yatırılan / **Fark**" üçlüsü sekiz kutuluk ızgaradan çıkıp panelin tepesinde ayrı bir blok olsun. Fark varsa **"Onayla" düğmesi ikincil hâle gelsin**, onaylamak için bilinçli kabul istensin (onay kutusu: "Eksik tutarı kabul ediyorum") | Gözle sayı eşleştirmek 16 kayıtlık kuyrukta kaçınılmaz olarak atlanır. Tutarlar birbirine benzer (750/1.500/2.250), hata olasılığı yüksek. Veri zaten var, yalnız çıkarma işlemi ve yerleşim eksik | **M** |
| **P0-4** | Zil sayacı iş + bilgiyi karıştırıyor (C3) | Rozet **yalnız `acil` + `uyari`** satırlarını saysın. Bilgi satırları panelde ayrı bir "Bugünün hareketi" bloğunda, sayaca girmeden dursun. Bekleyen iş yoksa rozet kaybolsun | Sıfırlanabilen sayaç anlam taşır; sıfırlanmayan sayaç gürültüdür | **S** |
| **P0-5** | Amber üç anlamda; DEMO ve bildirim rozeti aynı token (C2) | DEMO rozetini ve "DEMO ARACI" bandını amber'dan çıkar: lacivert üzerinde **çerçeveli nötr etiket** (`border-ttk-300 text-ttk-100`, dolgusuz); Özet'teki demo bandı slate zemine geçsin. Giriş ekranındaki **Muhasebe rol rozeti** amber'dan çıkıp nötr/sky olsun. Amber bundan sonra **yalnız "bekliyor / dikkat"** | Çakışma sakin günde — uyarının en çok fark edilmesi gereken günde — ortaya çıkıyor. Üç bileşen, yarım günlük iş | **S** |
| **P0-6** | Sahadaki kullanıcının rolü yok (C1) | **Kat Görevlisi rolü** ekle: yalnız `pano.goruntule` + `temizlik.isle`; giriş yaptığında doğrudan Kat Hizmetleri açılsın, rezervasyon/tahsilat/Tc kimlik verisi hiç görünmesin. Kat Şefi rolü ek olarak toplu atama yetkisi alsın | KVKK gereklilik ilkesi ve denetim izinin doğruluğu. Mevcut yetki altyapısı hazır — yeni rol eklemek veri modeli değişikliği gerektirmiyor | **M** |
| **P0-7** | Dokunma hedefi regresyon koruması yok (C5) | `12-mobil.mjs` eşiğini **24 px (WCAG AA)**'ya çek, kontrolü **bütün sayfalarda** koştur; Kat Hizmetleri için ayrıca 44 px eşiği uygula | Düzeltme kalıcı olmazsa P0-1 boşa gider | **S** |

### P1 — yüksek etki, biraz daha iş

| # | Sorun | Çözüm | Gerekçe | Efor |
|---|---|---|---|---|
| P1-1 | 14 sekme, rol bazlı değil (C6) | Sekmeleri **dört gruba** topla (Bugün / Konaklama / Mali / Yönetim), rol ana sayfası tanımla. Bölüm 3'te ayrıntı | Bilişsel yük ve eğitim süresi | M |
| P1-2 | Kat hizmetlerinde toplu işlem yok (K3) | **Satır seçimi + toplu atama**: "Seçili 8 odayı → [görevli] ata", "Seçili odaları Temizlendi yap". Kat/İş türü süzgeciyle birlikte "3. kat → tümünü seç" | Vardiya başı dakikalar; tablette daha fazla | M |
| P1-3 | PDF önizlemesi küçük (D2) | Detay panelinde **PDF'i birincil alan** yap (yükseklik ≥ %60), kayıt alanlarını üstte tek satır özete indir. "Tam ekran aç" düğmesi. Tablette iki sütun yerine **üst-alt yığılma** | Onaylayanın asıl işi belge okumak | M |
| P1-4 | Denetimde boş kolonlar (N1) | Sistem günlüğü satırlarına **gerçek kullanıcı ve tesis** yaz (işlemi tetikleyen oturum sahibi). Hâlâ boş kalanlarda "—" yerine kolonu **birleştir**: kaynak "Sistem" ise Kullanıcı/Rez. No kolonları tek açıklama hücresine dönüşsün | Denetim izinin temel sorusu "kim yaptı" | M |
| P1-5 | Denetimde sayfalama yok (N3) | Sayfalama + "toplam 207 satırın 1–100'ü" + CSV'nin **tamamını** aktardığını açıkça yaz | Eksik veriyle denetim | S |
| P1-6 | Dekont kuyruğunda klavye yok (D3) | **J/K/A/R** kuyruk kısayolları + "3 / 16" konum göstergesi + onaydan sonra otomatik sıradaki. Bölüm 6'da ayrıntı | 16 dekontluk kuyrukta ciddi zaman | M |
| P1-7 | Dashboard hiyerarşisiz (Ö1/Ö2) | KPI'ları **1 birincil + 3 operasyonel + 3 ikincil** olarak ayır; eşik aşıldığında kart durum rengi alsın; **her kart tıklanabilir** olup ilgili süzgeçli listeyi açsın | "Bugün neye bakmalıyım" tek bakışta | M |
| P1-8 | Boş / sonuç yok / hata durumları tanımsız (Ö3) | Üç durumu **standartlaştır**: boş (hiç veri yok — ne yapılacağını söyleyen metin + birincil aksiyon), sonuç yok (süzgeç eledi — "süzgeci temizle" düğmesi), hata (ne oldu + yeniden dene). `BosDurum` bileşenini üç varyanta çıkar | Her listede tekrar eden belirsizlik | S |
| P1-9 | "Bekliyor 23" ≠ "Temizlenecek 22" (K4) | İki sayacı aynı kümeden üret; servis dışı odaları her ikisinden de çıkar, ayrı sayaçta göster | Sayıya güven | S |
| P1-10 | Onay notu alanının kime gittiği belirsiz (D4) | Onay notu ile red gerekçesini **ayır**; red penceresinde **misafire gidecek mesajın önizlemesi**, gitmiyorsa "Bu gerekçe yalnız kurum içi kayda yazılır" açıkça yazılsın | Yazanın ne yazdığını bilmesi *(soru 3)* | S |
| P1-11 | Ana Menü ile Denetim ekranı farklı sayı veriyor (C7) | Her sayaç için **tek kaynak**: ana menü kartı ile sayfanın kendi sayacı aynı işlevi çağırsın. Ana menü sayaçlarının neyi saydığı kart altında yazsın ("son 30 günde 207 işlem") | Sayıya güven; raporlanan rakamların savunulabilirliği | S |
| P1-12 | Ana Menü'de Kat Hizmetleri kartı sayısız (C8) | Karta "22 oda temizlenecek" sayacı ekle | On üç kartın biri eksik; tutarlılık | S |
| P1-13 | KPI alt metni geliştirici notu (Ö4) | `dolu+boş+temizlik+servis dışı = 51` formülünü karttan çıkar, ipucuna ve Rehber'e taşı; kart altında "1 gün temizlik bloğu" kalsın | Kurumsal ton; müdür ekranında denklem durmaz | S |
| P1-14 | "Karşılaştırma" kartı tek satır (Ö5) | Tek tesisli kullanıcıda kartı **gizle**, yerine o tesisin 7 günlük doluluk eğilimini koy. Çok tesisli kullanıcıda bugünkü hâli kalsın | Resepsiyonun tamamı ve müdürlerin çoğu tek tesisli — ekranın yarısı boşa gidiyor | M |
| P1-15 | "Bugünün İşleri" iş değil, kısayol (Ö6) | Kartı **zil panelinin aynı veri kaynağına** bağla: gerçek bekleyen işler, sayılarıyla. Sayfa kısayolları zaten şeritte ve ana menüde var | İki ayrı "bugün ne var" kaynağı ortadan kalkar | M |
| P1-16 | Denetimde "Saat" yok, satırlar ayrışmıyor (N4) | Tarihe saat ekle, gün başlığıyla grupla | Kronolojik iz | S |
| P1-17 | Kat Hizmetleri'nde "Saat" kolonu gün başında tamamen boş (K5) | Kolonu **"Durum / Saat"** olarak birleştir: durum çipinin altında küçük saat; boşken yer kaplamaz | Tablette yatay alan kazanımı, bilgi kaybı yok | S |
| P1-18 | Demo veride denetim izi tek tip (N5) | Demo hareketlerini farklı kullanıcı, saat ve işlem türüne dağıt | Prototipi değerlendiren karar vericide yanlış izlenim | S |

### P2 — sonraki tur

| # | Sorun | Çözüm | Gerekçe | Efor |
|---|---|---|---|---|
| P2-1 | Denetimde diff yok (N2) | `eski_deger`/`yeni_deger` alanlarını doldur, satır açılınca "1.500 ₺ → 150 ₺" göster | Denetimin asıl değeri *(soru 4)* | L |
| P2-2 | Komut paleti sınırlı | Ctrl+K'ya **eylem** ekle: "oda 21'i temizlendi yap", "bugünün çıkışları", "MSF-2026-00123" | Güçlü kullanıcı hızı | M |
| P2-3 | Kayıtlı süzgeç yok | Sık kullanılan süzgeç kombinasyonlarını adlandırıp kaydetme ("Eksik tutarlı dekontlar") | Tekrar eden iş | M |
| P2-4 | Yoğunluk seçeneği yok | Masaüstü 36 px / tablet 44 px satır yüksekliği — **kullanıcı seçimi**, cihaza göre varsayılan | Veri yoğunluğunu düşürmeden tablet uyumu | S |
| P2-5 | Tarih kolonunda saat yok (N4) | Denetimde tarih + saat; aynı güne ait satırlar gün başlığı altında gruplanmış | Kronolojik izleme | S |

---

## 3. Bilgi mimarisi

### 3.1 14 sekmenin gruplanmış hâli

**Düzeltme:** İlk taslakta dört yeni grup önermiştim. Ana Menü ekran görüntüsü
gösteriyor ki **gruplama zaten var** — GÖRÜNTÜLEME / İŞLEMLER / YÖNETİM — ve
personel bunu öğrenmiş durumda. Yeni bir şema icat etmek yerine **var olanı
sekme şeridine taşıyoruz** ve tek bir sorununu düzeltiyoruz: "İŞLEMLER" grubu
yedi sayfa taşıyor ve günlük operasyonla mali işi karıştırıyor.

Tek değişiklik: **İŞLEMLER ikiye ayrılır.** Gerisi aynı kalır.

```
GÖRÜNTÜLEME       GÜNLÜK İŞLER      MALİ              YÖNETİM
───────────       ────────────      ────              ───────
Özet              Talepler          Dekont/Onay       Raporlar
Takvim            Statü             Tahsilat          Denetim
Odalar            Kahvaltı          Ay Sonu           Kullanıcılar
Yatak Listesi     Kat Hizmetleri
    (4)                (4)              (3)               (3)
```

- Gruplar **4/4/3/3** dengesinde; hiçbir grup bir bakışta taranamayacak kadar uzun değil.
- Mevcut `SAYFALAR` dizisindeki `grup` alanı zaten bu bilgiyi taşıyor — kodda
  yalnız "İşlemler" değerinin ikiye bölünmesi ve şeridin gruba göre çizilmesi gerekiyor.
- **Ana Menü** grup değil, sol baştaki ayrı düğme olarak kalır. Kart görünümü
  aynı dört başlığı kullanır — iki ekran arasındaki tutarsızlık ortadan kalkar.
- **Rehber** üst bandın sağında kalır (grup dışı), bugünkü gibi.
- Grup adına tıklamak grubun **ilk sayfasını** açar; ikinci sıra o grubun sayfalarını
  gösterir. En çok iki tıklamada her sayfaya ulaşılır, ekranda hiçbir zaman
  4 + 4 = 8'den fazla hedef durmaz.
- Telefonda mevcut çekmece korunur; çekmecede de aynı dört başlık kullanılır.
- **C8 düzeltmesi:** Kat Hizmetleri kartına ana menüde sayı gelir
  ("22 oda temizlenecek"), diğer on üç kartla aynı biçimde.

### 3.2 Rol × modül matrisi

**G** = görünür (okur) · **Y** = yazabilir · **S** = süper yönetici (tanım soru 5'e bağlı) · **—** = erişim yok

| Modül | Kat Görevlisi *(yeni)* | Kat Şefi *(yeni)* | Resepsiyon | Mali İşler | Tesis Müdürü | Admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Özet | — | G | G | G | G | S |
| Talepler | — | — | Y | G | Y | S |
| Kat Hizmetleri | **Y** *(yalnız kendi odaları)* | **Y** | Y | — | Y | S |
| Kahvaltı | — | G | Y | G | Y | S |
| Odalar / Yatak Listesi | — | G *(ad gizli)* | Y | G | Y | S |
| Takvim | — | — | G | G | G | S |
| Statü | — | — | Y | G | Y | S |
| Dekont/Onay | — | — | G + yükleme | G + yükleme | **Y (onay)** | S |
| Tahsilat | — | — | G | Y | Y | S |
| Ay Sonu | — | — | Y *(hazırlar)* | Y *(ister)* | Y | S |
| Raporlar | — | G *(yalnız temizlik)* | G | G | G | S |
| Denetim | — | — | — | — | G | S |
| Kullanıcılar | — | — | — | — | — | S |

Önemli kararlar:
- **Kat Görevlisi, misafir adını görmez.** Kat Hizmetleri tablosundaki "Odadaki
  Misafirler" kolonu bu rolde "2 misafir" gibi sayıya indirgenir. Temizlik için ad
  gerekmiyor; KVKK gereklilik ilkesi bunu zorunlu kılıyor.
- **Kat Görevlisi girişte doğrudan Kat Hizmetleri'ne düşer**, sekme şeridi görmez
  (tek sayfalı kiosk davranışı). Tablette aradığını bulma problemi tamamen kalkar.
- Mevcut `yetkiVar()` altyapısı bunu destekliyor; yeni izin kodu gerekmez, yalnız
  iki yeni rol tanımı ve "Odadaki Misafirler" kolonunun izne bağlanması gerekir.

### 3.3 Komut paleti (Ctrl/⌘ + K) davranış tanımı

Mevcut palet sayfa, işlem, rehber başlığı, misafirhane ve kayıt arıyor. Genişletme:

| Davranış | Tanım |
|---|---|
| **Açılış** | `Ctrl/⌘ + K` her yerden; yazı alanındayken de çalışır (tek istisna). Boş sorguda **son 5 kullanılan** komut + rolün ana sayfası listelenir |
| **Sıralama** | 1. Tam eşleşen kayıt (rez. no / Tc kimlik 11 hane) · 2. Eylem · 3. Sayfa · 4. Misafir adı · 5. Rehber başlığı |
| **Eylemler** *(yeni)* | "Oda 21 temizlendi", "Bugünün çıkışları", "Eksik tutarlı dekontlar", "Yeni kayıt", "Bekleme listesi". Eylem seçildiğinde doğrudan uygulanır veya ilgili süzgeçli liste açılır |
| **Kapsam** | Yalnız rolün yetkili olduğu modüller ve misafirhaneler. Yetkisiz sonuç **hiç listelenmez** (gri gösterilmez — varlığını sızdırmaz) |
| **Gezinme** | `↑ ↓` satır · `↵` seç · `Tab` sonucu süzgeç olarak uygula (listeyi açar, aramayı taşır) · `Esc` kapat |
| **Yazım** | Türkçe karakter duyarsız (`İ/ı/i`, `ş/s`, `ğ/g`, `ü/u`, `ö/o`, `ç/c`) — mevcut `aramaAnahtari()` bunu yapıyor, korunur |
| **Boş sonuç** | "«xyz» için sonuç yok" + en yakın üç öneri + "Rehberde ara" |

---

## 4. Tasarım sistemi temelleri

### 4.1 Durum paleti

Mevcut Tailwind tokenları kullanılır; yeni renk icat edilmez. **Kural: her renk tek
anlam taşır.** Lacivert kurumsal kimliktir, durum rengi değildir.

| Anlam | Zemin | Metin | Kenar | Kullanım kuralı |
|---|---|---|---|---|
| **Nötr** (işlem yok, boş, bilgi) | `#f1f5f9` slate-100 | `#334155` slate-700 | `#cbd5e1` slate-300 | Varsayılan. "İş yok", "Talep", boş hücre |
| **Aktif** (üzerinde çalışılıyor) | `#e0f2fe` sky-100 | `#075985` sky-800 | `#7dd3fc` sky-300 | "Temizleniyor", "Müdür onayı bekliyor", devam eden işlem |
| **Tamam** (başarıyla bitti) | `#d1fae5` emerald-100 | `#065f46` emerald-800 | `#6ee7b7` emerald-300 | "Temizlendi", "Onaylı", "Onaylandı" |
| **Bekliyor / dikkat** | `#fef3c7` amber-100 | `#78350f` amber-900 | `#fcd34d` amber-300 | **Yalnız** "bir insanın işlem yapması gerekiyor" anlamında: Kapora Bekleniyor, Bekliyor, süresi yaklaşan |
| **Sorun / geri alındı** | `#ffe4e6` rose-100 | `#9f1239` rose-800 | `#fda4af` rose-300 | "İptal", "Reddedildi", süresi dolmuş, doğrulama hatası |
| **Kapalı / kullanım dışı** | `#64748b` slate-500 | `#ffffff` | `#475569` slate-600 | "Servis Dışı" — dolu renk, çünkü "yok sayılacak" demek |
| **Kurumsal** | `#122f56` ttk-800 / `#0d2340` ttk-900 | `#ffffff` | — | **Yalnız** navigasyon, başlık, birincil düğme. Durum anlamı yoktur |
| **Konaklıyor** | `#d9e6f6` ttk-100 | `#173c6d` ttk-700 | `#b3cdec` ttk-200 | Tek istisna: "Konaklıyor" kurumsal tonun açık varyantını kullanır (normal, olağan durum) |

Kaldırılacak çakışmalar:
- `DEMO` rozeti amber-400'den çıkar → lacivert üzerinde `border-ttk-300 / text-ttk-100`, dolgusuz.
- Bildirim rozeti: bekleyen iş varsa amber-400 (dikkat), acil varsa rose-500. DEMO ile artık çakışmaz.
- `violet` (Çıkış statüsü) ve `orange` (Çıkış Bekliyor) **ayrı iki token** — ikisi de
  "çıkış" anlamında. Birleştirilir: tek anlam = tek renk (violet).

### 4.2 Tip ölçeği

Mevcut ölçek korunur, iki basamak eklenir.

| Ad | Boyut / satır | Kullanım |
|---|---|---|
| `2xs` | 11 / 15 | Rozet, yardımcı metin, kolon alt bilgisi. **Asla tek başına anlam taşıyan metin değil** |
| `xs` | 12 / 17 | Tablo gövdesi, düğme, form alanı — ekranın çalışma boyutu |
| `sm` | 13 / 19 | Kart başlığı, önemli etiket |
| `base` | 14 / 21 | Paragraf, rehber metni |
| `lg` *(yeni)* | 17 / 24 | Detay panelinde kritik değer (yatırılan tutar, oda no) |
| `metric` | 26 / 32 | KPI sayısı — yalnız `.num` ile |
| `metric-lg` *(yeni)* | 34 / 40 | Dashboard'daki **tek** birincil metrik |

Kural: `2xs` minimum kontrast oranı 7:1 olmalı (küçük punto). Mevcut
`text-slate-500` üzerinde beyaz zemin = 4.6:1 → **`text-slate-600` (5.9:1)** veya
`slate-700` (8.6:1) olarak yükseltilir.

### 4.3 Boşluk ritmi

4 px tabanlı: **4 · 8 · 12 · 16 · 24 · 32**. Ara değer kullanılmaz.

| Bağlam | Değer |
|---|---|
| Rozet / çip iç dolgu | 4 dikey · 8 yatay |
| Düğme iç dolgu | **10** dikey · 12 yatay → 44 px toplam (tablet), masaüstünde 8 → 36 px |
| Kart iç dolgu | 12 (yoğun tablo) · 16 (form/detay) |
| Kart arası | 12 |
| Bölüm arası | 24 |
| Tablo satır yüksekliği | 36 masaüstü · **44 tablet** (yoğunluk anahtarı) |
| Form alanları arası | 8 dikey · 12 yatay |

### 4.4 Tabular-nums kuralı

`.num` (`font-variant-numeric: tabular-nums`) **zorunlu** olduğu yerler — dikey veya
yatay karşılaştırılan her sayı:

- Para tutarı, yüzde, sayaç, KPI değeri
- Tarih, saat, tarih aralığı
- Oda no, yatak no, kat no
- Tc kimlik no, telefon, rezervasyon no, makbuz no, IBAN
- Tablo içindeki her sayısal kolon (başlık dahil, hizalama bozulmasın)

`.num` **kullanılmaz**: düz metin, ad soyad, açıklama, gerekçe, rehber metni.
Sayı cümle içinde geçiyorsa (örn. "3 misafirin adı bildirilmedi") yalnız sayı
`.num` ile sarılır, cümle sarılmaz.

### 4.5 Para ve tarih biçimi

| Tür | Biçim | Örnek | Not |
|---|---|---|---|
| Para | `#.###,## ₺` | `18.750,00 ₺` · `1.500 ₺` | Sağa hizalı, `.num`. Kuruş yalnız sıfırdan farklıysa |
| Para — yok | `aranmıyor` / `0 ₺` | | "Aranmıyor" ≠ "0 ₺". Boş hücre (`—`) para kolonunda kullanılmaz |
| Para — fark | `−350 ₺` / `+200 ₺` | | İşaret her zaman yazılır; eksi rose, fazla amber |
| Tarih | `GG.AA.YYYY` | `02.10.2026` | |
| Tarih + saat | `GG.AA.YYYY SS:dd` | `02.10.2026 14:00` | Denetim ve işlem kayıtlarında saat **zorunlu** |
| Aralık | `GG.AA – GG.AA.YYYY` | `02.10 – 05.10.2026` | Aynı yılda yıl bir kez |
| Operasyonel tarih | `GG.AA.YYYY Gün` | `02.10.2026 Cum` | Günlük iş ekranlarında kısa gün adı |
| Yüzde | `%##` | `%90` | Yüzde işareti **önde** (TR kuralı) |

### 4.6 Kart–tablo–filtre iskeleti standardı

Her liste ekranı aynı sırayı izler. Bu, 14 sayfanın öğrenilmesini tek sayfanın
öğrenilmesine indirger.

```
┌─ SAYFA BAŞLIĞI ────────────────────────────────── [kapsam seçici] ─┐
│  ikon · Misafirhane Adı + Sayfa Adı                                │
│  tek satır açıklama (slate-600, 2xs)                               │
└────────────────────────────────────────────────────────────────────┘

┌─ KPI ŞERİDİ ───────────────────────────────────────────────────────┐
│  en çok 4 birincil kart · tıklanabilir · eşik aşımında durum rengi │
│  (gerekiyorsa ikinci sırada 2–3 ikincil, daha küçük)               │
└────────────────────────────────────────────────────────────────────┘

┌─ FİLTRE BARI ──────────────────────────────────────────────────────┐
│ [kapsam: tarih/dönem]  [durum çipleri]   [ara…]   │ ⬇ CSV  🖨 Yazdır│
│ aktif süzgeçler rozet olarak + "temizle"          │ son güncelleme: │
│                                                    │ 14:32          │
└────────────────────────────────────────────────────────────────────┘

┌─ TABLO KARTI ──────────────────────────────────────────────────────┐
│ [☐] başlık satırı — sticky, sıralanabilir, .num hizalı            │
│ ─────────────────────────────────────────────────────────────────  │
│ [☐] veri satırı ............................ [satır aksiyonları →] │
│  ↳ seçim varsa üstte beliren toplu işlem şeridi:                   │
│    "8 oda seçildi"  [Görevli Ata ▾] [Temizlendi Yap] [Seçimi Bırak]│
│ ─────────────────────────────────────────────────────────────────  │
│ BOŞ DURUM: ne yok + ne yapılmalı + birincil aksiyon                │
│ SONUÇ YOK: süzgeç eledi + "Süzgeci temizle"                        │
│ sayfalama: "207 satırın 1–100'ü"      [◀ Önceki] [Sonraki ▶]      │
└────────────────────────────────────────────────────────────────────┘

açıklama dipnotu (slate-600, 2xs) — sayının nasıl hesaplandığı
```

Kurallar:
- Birincil aksiyon **sağ üstte** (filtre barı) veya **satır sonunda**; ikisi birden değil.
- Toplu işlem şeridi yalnız seçim varken görünür, tablonun **üstüne** yapışır.
- "Son güncelleme" her canlı listede zorunlu.
- Dışa aktarma her zaman **ekrandaki süzgeci** yansıtır ve bunu söyler.

---

## 5. Ekran ekran yeni düzen

### 5.1 ÖZET

Bilgi grupları: **(a)** bir cümlelik durum · **(b)** operasyonel sayılar ·
**(c)** bugünün işleri · **(d)** karşılaştırma · **(e)** son hareket.

```
Ankara Misafirhanesi · Bugünkü Durum                02.10.2026 Cum  [DEMO]
Dolu/boş yatak, giriş-çıkış ve dört tesisin karşılaştırması

┌──────────────────────────────┐ ┌─────────┐┌─────────┐┌─────────┐
│  DOLULUK            ⚠        │ │ GİRİŞ   ││ ÇIKIŞ   ││ TEMİZLİK│
│      %90                     │ │   15    ││    1    ││    1    │
│  46 / 51 yatak               │ │ misafir ││ misafir ││   oda   │
│  Boş: 4 yatak — kritik eşik  │ │ → Statü ││ → Statü ││ → Kat H.│
│  → Yatak Listesi             │ └─────────┘└─────────┘└─────────┘
└──────────────────────────────┘
  birincil, metric-lg, amber çerçeve (boş ≤ 5)    üçü tıklanabilir

İkincil:  Servis Dışı 0  ·  Bekleyen Dekont 16  ·  Tahsilat 100  (tek satır, xs)

«dolu+boş+temizlik+servis dışı = 51» formülü karttan çıkar → ipucu + Rehber (Ö4)

┌─ BUGÜNÜN İŞLERİ ───────────────┐ ┌─ 7 GÜNLÜK DOLULUK EĞİLİMİ ────┐
│ ⚠ 16 dekont onay bekliyor   →  │ │ (tek tesisli kullanıcıda)     │
│ ⚠ 4 kaporanın süresi doldu  →  │ │ Cum Cmt Paz Pzt Sal Çar Per   │
│ ⚠ 3 oda çıkış temizliğinde  →  │ │ %90 %88 %84 %92 %96 %94 %90   │
│ ℹ 15 giriş · 1 çıkış bugün     │ │ ▇▇▇ ▇▇  ▇▇  ▇▇▇ ▇▇▇ ▇▇▇ ▇▇▇   │
│                                 │ │                               │
│ ZİL PANELİYLE AYNI KAYNAK —    │ │ çok tesisli kullanıcıda:      │
│ iki ayrı "bugün ne var" listesi │ │ MİSAFİRHANE KARŞILAŞTIRMASI   │
│ olmaz (Ö6 düzeltmesi)          │ │ dört tesis yan yana (bugünkü) │
└────────────────────────────────┘ └───────────────────────────────┘

┌─ SON İŞLEMLER ───────────────────────── en son 6 · tümü → Denetim ┐
│ 02.10 14:32  MSF1001  MSF-2026-00412 dekontu onayladı             │
│ …                                                                  │
│ BOŞ DURUM: "Bugün henüz işlem yapılmadı. Yapılan her kayıt,        │
│  tahsilat ve onay burada ve Denetim İzi sayfasında görünür."       │
└────────────────────────────────────────────────────────────────────┘
```

- **Ana/ikincil aksiyon:** birincil = "Yeni Kayıt" (sağ üst); ikincil = demo gün ilerletme.
- **Durum boşlukları:** Son İşlemler boşsa yukarıdaki metin; karşılaştırma tek
  tesisli kullanıcıda hiç gösterilmez (kart yerine "Yetkili olduğunuz tek misafirhane").
- **Tablet (yatay):** birincil kart tam genişlik, üç operasyonel kart altında üçlü
  sırada, "Bugünün İşleri" ve karşılaştırma alt alta. KPI sayısı azalmaz.

### 5.2 KAT HİZMETLERİ

Bilgi grupları: **(a)** vardiya özeti · **(b)** kapsam · **(c)** oda listesi ·
**(d)** toplu işlem.

```
Ankara Misafirhanesi · Kat Hizmetleri        [◀] 02.10.2026 Cum [▶] [Bugün]

┌ TEMİZLENECEK ┐┌ BEKLİYOR ┐┌ TEMİZLENİYOR ┐┌ TEMİZLENDİ ┐
│     22       ││    22    ││      0       ││     0      │   ← aynı kümeden
│ 3 çıkış · 19 ││          ││              ││            │     (K4 düzeltmesi)
│   günlük     ││          ││              ││            │
└──────────────┘└──────────┘└──────────────┘└────────────┘
Servis dışı: 1 oda (listede ayrı, sayaçlara girmez)

[Kat: Tümü ▾] [İş: Çıkış temizliği ▾] [Durum: Bekliyor ▾] [ara…]  ⬇CSV 🖨Yazdır
Aktif: «Çıkış temizliği» ×   «Bekliyor» ×   [Temizle]        son güncelleme 14:32

┌────────────────────────────────────────────────────────────────────────┐
│ ☑ 8 oda seçildi   [Görevli Ata ▾]  [▸ Temizliğe Başla]  [Seçimi Bırak] │ ← toplu
├───┬────────┬──────────────┬──────────────────────┬─────────┬───────────┤
│ ☐ │ ODA    │ İŞ TÜRÜ      │ DURUM                │ GÖREVLİ │ SAAT      │
├───┼────────┼──────────────┼──────────────────────┼─────────┼───────────┤
│ ☑ │ Oda 12 │ Çıkış        │ ┌──────┬─────┬─────┐ │ F.Yıldız│ 14:02     │
│   │ 1. kat │ temizliği    │ │Bekl. │Tem..│ ✓   │ │   ▾     │           │
│   │ 2 mis. │              │ └──────┴─────┴─────┘ │         │           │
│   │        │              │   44 px segment      │ seçim   │           │
├───┼────────┼──────────────┼──────────────────────┼─────────┼───────────┤
```

- **Kritik değişiklikler:** (1) durum kontrolü 44 px segment, bölmeler yapışık ve
  **tek satırda** — bugünkü iki satıra sarma ortadan kalkar (K1); (2) görevli alanı
  `<select>`; (3) seçim kolonu + toplu şerit; (4) "Odadaki Misafirler" kolonu kat
  görevlisi rolünde **"2 misafir"** sayısına iner (K6/C1); (5) "Saat" kolonu durum
  hücresine iner, boşken yer kaplamaz (K5); (6) servis dışı oda iki sayaçtan da
  çıkar, ayrı gösterilir (K4).
- **Ana aksiyon:** satır içinde ileri yönlü akış düğmesi ("▸ Temizliğe Başla" →
  "✓ Temizlendi"); geri alma "Geri Al" şeridinden.
- **Durum boşlukları:** "Bu tarihte temizlik işi yok — bugün çıkış yapan oda ve
  konaklama süren oda bulunmuyor."; süzgeç boşsa "Süzgeci temizle".
- **Tablet (yatay):** "Odadaki Misafirler" ve "Saat" kolonları gizlenir (satır
  açılınca görünür), Oda / İş / Durum / Görevli kalır — **bilgi kaybı yok, kolon
  gizleme stratejisi**. Satır yüksekliği 44 px.
- **Telefon:** mevcut kart görünümü; durum segmenti kartın altında tam genişlik.

### 5.3 DEKONT/ONAY

Bilgi grupları: **(a)** kuyruk sayıları · **(b)** kuyruk listesi · **(c)** belge ·
**(d)** tutar mutabakatı · **(e)** karar.

```
Ankara Misafirhanesi · Dekont ve Onay

┌ ONAY BEKLEYEN ┐┌ ONAYLANAN ┐┌ REDDEDİLEN ┐    ⚠ 3 dekont eksik tutarlı
│      16       ││    160    ││     0      │       → süz
│  18.750,00 ₺  ││           ││            │
└───────────────┘└───────────┘└────────────┘

┌─ KUYRUK ── 3/16 ──────┐ ┌─ SEÇİLİ DEKONT ─ MSF-2026-00412 ───────────┐
│ J/K gez · A onay · R red│ │ A. YILMAZ ve Ark. · 3 kişi · 05–08.10.2026│
│ ☐ MSF-…0410 Tam    ✓   │ │                                            │
│ ☐ MSF-…0411 Tam        │ │ ┌─ TUTAR MUTABAKATI ──────────────────┐   │
│ ▸ MSF-…0412 −350 ₺  ⚠  │ │ │ İstenen   1.500,00 ₺                │   │
│ ☐ MSF-…0413 Tam        │ │ │ Yatırılan 1.150,00 ₺                │   │
│ ☐ MSF-…0414 +200 ₺  ⚠  │ │ │ Fark        −350,00 ₺  EKSİK        │   │
│ …                      │ │ └──────────────────────────────────────┘   │
│                        │ │   lg punto · rose çerçeve · panelin tepesi │
│ liste kolonları:       │ │                                            │
│ rez.no · fark · banka  │ │ ┌─ DEKONT BELGESİ ──────── [⛶ Tam ekran] ┐│
│ · tarih · rozet        │ │ │                                        ││
└────────────────────────┘ │ │   PDF — panelin ≥ %60'ı                ││
  dar sütun, sticky        │ │                                        ││
                           │ └────────────────────────────────────────┘│
                           │ Banka · Dekont No · IBAN · Ödeme tarihi   │
                           │ (tek satır, xs, katlanmış)                │
                           ├────────────────────────────────────────────┤
                           │ ☐ Eksik tutarı kabul ediyorum (gerekli)   │
                           │        [Reddet (R)]  [Onayla (A)] ← ikincil│
                           └────────────────────────────────────────────┘
```

- **Belge alanı (D2 düzeltmesi):** panel zaten yeterince büyük; sorun gömülü
  görüntüleyicinin araç çubuğu ve kırpılma. Çözüm: PDF `#toolbar=0&view=Fit` ile
  gömülür — indir / yazdır / çiz düğmeleri bu akışta gereksiz, belge sayfaya
  sığdırılır ve alttan kesilmez. Tam ekran ihtiyacı için tek bir `⛶` düğmesi kalır.
- **Ana aksiyon:** "Onayla ve Rezervasyon Listesine Al". **Fark varsa ikincil
  görünüme düşer** ve onay kutusu işaretlenmeden etkinleşmez. Fark yoksa birincil.
  Üstteki "Onayladığınız kayıtlar rezervasyon listesine girer…" cümlesi **korunur** (D5).
- **İkincil:** Reddet — gerekçe zorunlu + misafire gidecek mesaj önizlemesi.
- **Durum boşlukları:** kuyruk boşsa "Onay bekleyen dekont yok. Yeni dekont
  yüklendiğinde burada ve zilde görünür." (emerald tonlu, başarı değil nötr-pozitif).
- **Tablet (yatay):** iki sütun **üst-alt yığılır** — üstte tutar mutabakatı +
  belge (tam genişlik, okunur), altta kuyruk yatay kaydırmalı şerit. Mevcut
  iki-sütun yapısının tablette kırılması böyle çözülür.

### 5.4 DENETİM

Bilgi grupları: **(a)** kapsam · **(b)** süzgeçler · **(c)** kayıt akışı · **(d)** ayrıntı.

```
Ankara Misafirhanesi · Denetim İzi      02.09.2026 – 02.10.2026  [▾ Dönem]

[Kaynak: Tümü ▾] [Kullanıcı: Tümü ▾] [Misafirhane ▾] [ara…]     ⬇ CSV (207)
Aktif: 30 gün ×                                      [Temizle]  son gün. 14:32

┌──────────────────────────────────────────────────────────────────────┐
│ 02.10.2026 Cuma ───────────────────────────────────── 12 işlem  ─────│ ← gün başlığı
│ 14:32  MSF1001  Kayıt   MSF-2026-00412                              ▸│
│        Dekont onaylandı · 1.150,00 ₺                                 │
│ 14:28  MSF2001  Kayıt   MSF-2026-00411                              ▸│
│        Yatak tahsisi: Oda 21/1, Oda 21/2                             │
│ 09:15  SİSTEM   Sistem  —                                           ▸│
│        Süresi dolan 4 kayıt otomatik iptal edildi                    │
│ 01.10.2026 Perşembe ──────────────────────────────── 31 işlem  ──────│
│ …                                                                     │
│ ───────────────────────────────────────────────────────────────────── │
│ 207 satırın 1–100'ü            [◀ Önceki]  [1] 2 3  [Sonraki ▶]      │
└──────────────────────────────────────────────────────────────────────┘

satır açılınca (▸):
   Önceki değer → Yeni değer    (P2-1, soru 4'e bağlı)
   Tahsil edilen:  0,00 ₺  →  1.150,00 ₺
   Statü:  Kapora Bekleniyor  →  Onaylı
   Oturum: MSF1001 · 10.0.14.23 · Chrome/Windows
```

- **Kolon birleştirme (N1 çözümü):** "—" dolu kolon yerine satır **iki satırlık
  blok**: üst satır `saat · kullanıcı · kaynak · rez.no`, alt satır işlem metni.
  Sistem kaynaklı satırda rez.no kolonu hiç çizilmez, metin tüm genişliği kullanır.
  Böylece hem boş hücre kalmaz hem satır başına bilgi artar.
- **Satır ayrımı (N4):** gün başlığı + saat kolonu + zebra yok, ince ayırıcı var
  (zebra iki satırlık bloklarda okumayı bozar).
- **Durum boşlukları:** "Seçilen aralıkta işlem kaydı yok. Tarih aralığını
  genişletin veya süzgeçleri temizleyin." + [Son 90 güne bak] kısayolu.
- **Tablet:** kullanıcı ve kaynak üst satırda rozet olarak kalır; tam metin alt
  satırda sarmalanır. Yatay kaydırma gerekmez.

---

## 6. Etkileşim detayları

### 6.1 Klavye kısayolları

Mevcut küme (`?` `N` `/` `B` `G` `R` `Esc` `Ctrl+K` `↑↓` `↵`) korunur. Eklenenler
**bağlama duyarlı**: yalnız ilgili ekranda çalışır, yardım listesinde o ekranın
kısayolları ayrı başlık altında görünür.

| Ekran | Tuş | İşlev |
|---|---|---|
| Dekont kuyruğu | `J` / `K` | Sonraki / önceki dekont (liste odağı gerekmez) |
| | `A` | Onayla — fark varsa onay kutusuna odaklanır, doğrudan onaylamaz |
| | `R` | Reddet — gerekçe alanına odaklanır |
| | `F` | Belgeyi tam ekran aç / kapat |
| | `1`–`9` | Kuyruktaki n. kayda git |
| Kat hizmetleri | `Space` | Seçili satırı işaretle / kaldır |
| | `Shift + ↓` | Aralık seçimi |
| | `Ctrl + A` | Süzgeçteki tüm odaları seç |
| | `→` | Seçili odanın durumunu bir adım ilerlet |
| Her liste | `Ctrl + E` | CSV indir |
| | `Ctrl + P` | Yazdır |

Kural: tek harfli kısayollar yazı alanında ve pencere açıkken susar (mevcut
davranış korunur). `A`/`R` gibi yıkıcı olabilen tuşlar **doğrudan uygulamaz**,
karar alanına odaklanır — yanlış tuş kaza yapmaz.

### 6.2 Toplu seçim ve toplu atama

- **Seçim kolonu** Kat Hizmetleri, Dekont/Onay ve Talepler tablolarına eklenir.
- Başlıktaki kutu **süzgeçteki tümünü** seçer (görünen sayfayı değil) ve bunu
  söyler: "Süzgeçteki 22 odanın tümü seçildi · yalnız bu sayfayı seç".
- **Toplu şerit** tablonun üstüne yapışır: seçim sayısı + en çok üç toplu eylem +
  "Seçimi bırak".
- Toplu eylem **tek işlem** olarak kaydedilir ve tek "Geri Al" ile dönülür:
  "8 odaya F. Yıldız atandı" → Geri Al → sekizi birden eski hâline döner.
- Toplu eylem kısmen başarısız olursa (örn. 8'den 2'si servis dışı) sonuç özeti
  gösterilir: "6 oda güncellendi · 2 oda atlandı (servis dışı)" + atlananların listesi.

### 6.3 Geri alma

Mevcut `GeriAlSeridi` (12 saniye, `role="status"`) korunur ve genişletilir:

- Kapsama **toplu işlemler** ve **durum değişiklikleri** eklenir (şu anda yok).
- Şeritte işlemin **ne olduğu** yazılı olmalı, "Geri Al" tek başına değil:
  "Oda 12 «Temizlendi» işaretlendi · [Geri Al]".
- Şerit kapanmadan ikinci bir işlem yapılırsa şerit **yeni işlemle güncellenir**,
  yığılmaz (tek seviyeli geri alma — mevcut davranış, belgelenir).
- Geri alınamayan işlemlerde (dekont onayı gibi mali sonuç doğuran) şerit yerine
  **önceden onay** istenir. Hangi işlemin hangi gruba girdiği tek listede tanımlanır.

### 6.4 Onay / ret akışında gerekçe ve mesaj önizlemesi

```
┌─ DEKONTU REDDET — MSF-2026-00412 ────────────────────────────────┐
│ Red gerekçesi (zorunlu)                                          │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Yatırılan tutar istenen kaporadan 350 ₺ eksik.               │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ Hazır gerekçeler: [Tutar eksik] [Belge okunmuyor] [Farklı hesap] │
│                                                                   │
│ ┌─ MİSAFİRE GİDECEK MESAJ ─────────────────── 1 SMS · 134 hane ─┐│
│ │ TTK Ankara Misafirhanesi: MSF-2026-00412 numarali             ││
│ │ rezervasyonunuzun kapora dekontu kabul edilmedi.              ││
│ │ Gerekce: Yatirilan tutar istenen kaporadan 350 TL eksik.      ││
│ │ Bilgi: 0372 ... (otomatik üretildi, düzenlenemez)             ││
│ └────────────────────────────────────────────────────────────────┘│
│ ℹ Kayıt «Kapora Bekleniyor» statüsüne döner, yatak tahsisi kalkar.│
│                            [Vazgeç]  [Reddet ve Bildir]          │
└──────────────────────────────────────────────────────────────────┘
```

- Gerekçe serbest metin, ama **hazır gerekçeler** tek tıkla doldurur (veri
  tutarlılığı + hız). Hazır gerekçe seçilince istatistik için kod da kaydedilir.
- SMS önizlemesi **gerçek metni** gösterir: GSM-7 uyumlu (Türkçe karakterler
  dönüştürülmüş), hane sayısı ve kaç mesaja böleceği yazılı — bu altyapı
  uygulamada zaten var (`SmsGunlugu`), yalnız önizlemeye bağlanacak.
- **Sonuç cümlesi zorunlu:** işlemin kayda ne yapacağı ("statü X'e döner, yatak
  tahsisi kalkar") karar vermeden önce yazılı.
- Mesaj gitmiyorsa önizleme yerine: "Bu gerekçe yalnız kurum içi kayda yazılır,
  misafire bildirim gönderilmez." *(soru 3)*

### 6.5 Otomatik yenileme ve "son güncelleme"

Prototip tek kullanıcılı ve bellekte çalıştığı için şu anda gereksiz; **gerçek
kurulumda zorunlu** (aynı odayı iki resepsiyonist aynı anda veriyor).

| Davranış | Tanım |
|---|---|
| **Son güncelleme** | Her canlı listenin filtre barında, `SS:dd` biçiminde. Tıklanınca elle yeniler |
| **Otomatik yenileme** | Operasyonel ekranlarda (Özet, Talepler, Kat Hizmetleri, Dekont kuyruğu) 60 sn. Raporlar ve Denetim'de **yok** (dönemsel veri, altından kaymamalı) |
| **Sessiz yenileme** | Kullanıcı yazarken, seçim varken veya pencere açıkken yenileme **ertelenir**; iş bitince uygulanır |
| **Değişiklik bildirimi** | Yenileme veriyi değiştirdiyse üstte ince şerit: "3 kayıt güncellendi · [Göster]" — liste kendiliğinden zıplamaz |
| **Çakışma** | Kullanıcı bir kaydı düzenlerken başkası değiştirdiyse kaydetmede uyarı: "Bu kayıt 14:30'da MSF2001 tarafından değiştirildi. [Farkı gör] [Yine de kaydet]" |
| **Bağlantı kaybı** | "Bağlantı yok — veriler 14:32'den kalma" (sarı şerit, amber = dikkat kuralına uygun); yazma işlemleri devre dışı |

---

## 7. Erişilebilirlik

Kaynak üzerinden doğrulanmış ihlaller ve bileşen adları:

| Ölçüt | Durum | Bileşen / konum | Düzeltme |
|---|---|---|---|
| **2.5.8 Hedef Boyutu (AA, 24×24)** | ❌ **İhlal** | Kat Hizmetleri durum çipleri (`px-2 py-0.5 text-2xs` ≈ 21 px, satır 7196) — ekran görüntüsünde **iki satıra sarıyor**, dikey aralık ~4 px, yani komşu hedefe uzaklık da 24 px'in altında; `Buton tur="sessiz"` `!py-0.5` varyantları (bekleme kartı, muafiyet şeridi) ≈ 21 px | P0-1; `!py-0.5` varyantını sil |
| **2.5.5 Hedef Boyutu (AAA, 44×44)** | ❌ İhlal | Tüm `Buton` (31 px), tablo satır içi düğmeler, `TarihGirdi` ok düğmeleri, kişi sayısı `−/+` düğmeleri | Tablet yoğunluğunda 44 px (4.3'teki dolgu kuralı) |
| **1.4.3 Kontrast (AA, 4.5:1)** | ⚠ Sınırda | `text-slate-500` beyaz üzerinde ≈ 4.6:1 — metin 11 px olduğu için küçük metin sayılır, sınırı geçiyor ama okunurluk zayıf. `text-slate-400` (≈ 3.0:1) **ihlal** — boş hücre "— boş —" ve pasif satırlarda kullanılıyor | `slate-500` → `slate-600`; `slate-400` yalnız dekoratif (ikon) kalsın, metinde `slate-500`+ |
| **1.4.3 — ters zeminler** | ✅ | `amber-400` üzerine `amber-950` ≈ 10:1; `ttk-800` üzerine beyaz ≈ 12:1 | — |
| **1.4.1 Renk Tek Başına Bilgi Taşımaz** | ⚠ Kısmen | Doluluk şeridi hücreleri rengi + `title` ile anlatıyor (renk körü için zayıf); oda haritasında durum **renk + metin** veriyor (iyi); `Cubuk` yalnız renk+uzunluk | Doluluk hücrelerine desen veya sayı; `Cubuk` yanına yüzde yazısı (zaten var, zorunlu kılınsın) |
| **Renk körlüğü (deuteranopi)** | ⚠ | emerald-100 ve amber-100 deuteranopide yakın algılanıyor — "Temizlendi" ile "Bekliyor" karışabilir | Durum çiplerine **ikon** ekle: `✓` tamam, `⏱` bekliyor, `▸` aktif, `⛔` sorun. Renk ikincil işaret olsun |
| **2.4.7 Odak Görünür** | ⚠ | Tailwind'in `focus:ring-1 focus:ring-ttk-400` yalnız form alanlarında; `Buton`, `Kpi`, tablo satırı ve çiplerde **özel odak halkası yok** (tarayıcı varsayılanı, lacivert zeminde görünmez) | Global: `focus-visible:ring-2 ring-offset-2 ring-ttk-400`; koyu zeminde `ring-white` |
| **1.3.1 Yapı ve İlişkiler** | ⚠ | Kat hizmetleri görevli alanında `aria-label` var (iyi); durum çipleri **grup olarak işaretlenmemiş** — ekran okuyucu dört ayrı düğme okur, hangisinin seçili olduğunu söylemez | `role="radiogroup"` + `aria-checked`; segment kontrolü bunu doğal olarak sağlar |
| **4.1.3 Durum Mesajları** | ✅ | `GeriAlSeridi` `role="status"` taşıyor | Toplu işlem sonucu ve yenileme şeridine de eklenmeli |
| **Klavyeyle erişim** | ⚠ | Tablo satırları `onClick` ile seçiliyor, `tabindex`/`onKeyDown` yok → klavyeyle satır seçilemiyor | Satıra `tabindex="0"` + `Enter/Space`; veya satır içine gerçek düğme |
| **Hareket / animasyon** | ✅ | `maskot-salla` dekoratif | `prefers-reduced-motion` ile durdurulmalı (küçük ek) |

---

## 8. Kabul kriterleri

Her P0 maddesi için "yapılınca nasıl anlaşılır" — otomatik test yazılabilir biçimde.

**P0-1 — Dokunma hedefleri (Kat Hizmetleri)**
- Kat Hizmetleri sayfasındaki her tıklanabilir öğenin ölçülen yüksekliği **≥ 44 px**
  ve genişliği ≥ 44 px (1280 px ve 1024 px genişlikte).
- Durum kontrolü **tek satırda** duruyor: dört bölmenin `getBoundingClientRect().top`
  değeri aynı (bugünkü iki satıra sarma yok).
- Durum kontrolünün bölmeleri arasında tıklanabilir olmayan boşluk **yok**
  (iki bölmenin sınırı aynı pikselde).
- "Temizlendi"ye tek dokunuşla geçilemez: "Bekliyor" durumundaki bir odada
  görünür tek ileri düğme "Temizliğe Başla"dır.
- Her durum değişikliğinden sonra "Geri Al" şeridi görünür ve işlemi geri alır.

**P0-2 — Kat görevlisi seçim listesi**
- Görevli alanı serbest metin kabul **etmiyor**: klavyeyle yazılan ad kaydedilmiyor,
  yalnız listeden seçim kaydediliyor.
- Aynı görevli iki farklı satırda seçildiğinde kaydedilen değer **birebir aynı**
  (büyük/küçük harf ve boşluk farkı yok).
- CSV çıktısında görevli kolonu yalnız tanımlı değerler içeriyor.
- "Listede yok" durumu için yetkili rol dışında yeni görevli eklenemiyor.

**P0-3 — Dekont tutar farkı**
- Detayda **"Fark"** adlı bir alan var ve değeri sistem hesaplıyor; kullanıcı iki
  sayıyı gözle karşılaştırmak zorunda değil.
- Onay bekleyen listede her satırda fark rozeti var: `Tam` / `−X ₺` / `+X ₺`.
- Eksik tutarlı dekontta "Onayla" düğmesi, onay kutusu işaretlenmeden **pasif**.
- Fark rozeti ile detaydaki "Fark" değeri her kayıtta aynı.
- "Eksik tutarlı" süzgeci yalnız farkı sıfırdan küçük olan kayıtları getiriyor ve
  sayısı özet karttaki uyarı sayısına eşit.

**P0-4 — Zil sayacı**
- Rozetteki sayı, panelde **acil + dikkat** satırlarının toplamına eşit;
  bilgi satırları toplama **girmiyor**.
- Bekleyen iş kalmadığında rozet **görünmüyor** (0 yazmıyor).
- Bir dekont onaylandığında rozet en az 1 azalıyor.
- Bilgi satırları panelde ayrı bir blokta ve sayısız gösteriliyor.

**P0-5 — Renk ayrımı**
- Kaynakta `bg-amber-400` yalnız bildirim rozetinde geçiyor; DEMO rozetinde geçmiyor.
- DEMO rozeti ile bildirim rozeti aynı anda ekranda, **farklı** zemin rengiyle.
- Amber zeminli her öğe "bekliyor / dikkat" anlamı taşıyor (görsel denetim listesi
  belgelenmiş).

**P0-6 — Kat Görevlisi rolü**
- Kat Görevlisi hesabıyla giriş yapıldığında açılan ilk sayfa Kat Hizmetleri.
- Bu rolde sekme şeridinde Talepler, Tahsilat, Dekont/Onay, Yatak Listesi **yok**;
  doğrudan adresle de açılamıyor (yetki uyarısı).
- "Odadaki Misafirler" kolonu bu rolde ad değil sayı gösteriyor.
- Bu rolle yapılan durum değişikliği Denetim İzi'nde **o kullanıcı koduyla** görünüyor.

**P0-7 — Regresyon koruması**
- `12-mobil.mjs` her sayfada 24 px altı tıklanabilir öğe bulursa test **kalıyor**.
- Kat Hizmetleri için 44 px eşiği ayrı denetim olarak koşuyor.
- Mevcut 18 dosyalık takım bu değişikliklerden sonra tamamı geçiyor.

---

## 9. Riskler

| Risk | Olasılık / etki | Azaltma |
|---|---|---|
| **Serbest metin → seçim listesi göçü (P0-2)** Mevcut görevli adları normalleştirilemezse eski kayıtlar eşleşmez; temizlik geçmişi raporu kopar | Yüksek / Orta | Göçten **önce** mevcut değerlerin tekil listesini çıkar, elle eşleştirme tablosu kur (`eski_metin → gorevli_id`). Eşleşmeyenler "Tanımsız görevli" altında toplanır, silinmez. Prototipte geçmiş veri yok — **gerçek kurulumda bu adım atlanamaz** |
| **Yeni roller ve yetki matrisi (P0-6)** Kat Görevlisi rolü AD/LDAP grup eşlemesi gerektirir; kurumda böyle bir grup yoksa hesap açılamaz | Orta / Yüksek | Rolü uygulamada tanımla, AD eşlemesini **ikinci aşamaya** bırak; geçişte Bilgi İşlem elle atasın. Soru 1 ve 5 yanıtlanmadan yayına alınmaz |
| **Rapor bağımlılığı** Mevcut ay sonu belgesi ve dönem raporları kahvaltı/temizlik verisinden besleniyor. Kolon ve durum adları değişirse rapor çıktıları bozulur | Orta / Yüksek | Durum kodları (`BEKLIYOR`/`TEMIZLENIYOR`/`TAMAM`/`HAZIR`) **değişmez**; yalnız görünen etiket ve kontrol biçimi değişir. Rapor sorgularına dokunulmaz |
| **Navigasyon gruplaması (P1-1) ve eğitim** Personel 14 sekmenin yerini öğrenmiş; gruplama "kaybolma" hissi yaratabilir | Yüksek / Düşük | İki aşama: (1) gruplar eklenir ama **tüm sekmeler ikinci sırada açık kalır**, (2) iki hafta sonra daraltılır. Ctrl+K ve Ana Menü kart görünümü kaçış yolu olarak her zaman durur. Rehbere "sayfa nerede" tablosu eklenir |
| **Zil sayacının düşmesi (P0-4)** 39'dan ~18'e inen sayı "veri kayboldu" diye algılanabilir | Orta / Düşük | Panelde bilgi bloğunun başlığı açıkça "Bugünün hareketi (iş değil)" olsun; sürüm notunda yazılsın |
| **Otomatik yenileme (6.5)** Çok kullanıcılı ortamda sunucu yükü ve "altından kayan liste" şikâyeti | Orta / Orta | Yalnız operasyonel ekranlarda, 60 sn, sessiz erteleme kurallarıyla. Raporlarda **kapalı**. Yükleme ölçülmeden süre kısaltılmaz |
| **Denetim izine kullanıcı yazılması (P1-4)** Geçmiş sistem kayıtlarında kullanıcı bilgisi yok; geriye dönük doldurulamaz | Kesin / Düşük | Eski satırlarda "Sistem (geçmiş kayıt)" etiketi; değişiklik tarihinden sonrası dolu. Denetim raporunda bu kesme tarihi belirtilir |
| **Diff tutulması (P2-1)** `eski_deger`/`yeni_deger` jsonb alanları her hareket için yazılırsa tablo büyümesi hızlanır | Orta / Orta | Yalnız **mali ve statü** değişikliklerinde yaz (tahsilat, kapora, statü, iptal); görüntüleme ve süzgeç hareketlerinde yazma. `docs/veritabani.md` § 4'teki büyüklük hesabı yeniden yapılmalı — **soru 4'e bağlı** |
| **KVKK genişlemesi** Kat Görevlisi rolünde misafir adının gizlenmesi, aydınlatma metni ve yetki envanterinin güncellenmesini gerektirir | Kesin / Düşük | Yetki matrisi değişikliği hukuk müşavirliğine bildirilir; `docs/mimari-brifing.md` § 7 güncellenir |

---

## İlk Sprint önerisi

Tek sprintte (iki hafta, bir geliştirici) yapılabilecek, en yüksek etkili dört iş.
Hepsi birbirinden bağımsız yayına alınabilir; hiçbiri veri göçü veya yanıt
beklemeyen soru gerektirmez.

| Sıra | İş | Efor | Neden bu sprint |
|---|---|---|---|
| **1** | **P0-1 + P0-7** — Kat Hizmetleri durum kontrolünü 44 px segmente çevir, ileri yönlü akış kur; test eşiğini 24 px'e indirip tüm sayfalarda koştur | S + S | Tek dokunuşla "Temizlendi" işaretlenmesi, bu üründeki en pahalı kullanıcı hatası. Düzeltmesi tek bileşen; testle kalıcılaşıyor |
| **2** | **P0-4 + P0-5** — Zil rozetini yalnız bekleyen işe bağla; DEMO rozetini amber'dan çıkar | S + S | İkisi birlikte uyarı sistemini çalışır hâle getiriyor. Toplam yarım günlük iş, etkisi her ekranda |
| **3** | **P0-3** — Dekont listesine tutar farkı rozeti, detayda mutabakat bloğunu öne al, farklı onayda bilinçli kabul kutusu | M | Mali risk; bilgi zaten üretiliyor, yalnız görünür kılınıyor — düşük teknik risk, yüksek etki |
| **4** | **P1-8** — Boş / sonuç yok / hata durumlarını üç varyantlı tek bileşende standartlaştır, dört ekrana uygula | S | Diğer üç işin kabul kriterleri boş durum metinlerine dayanıyor; bu iş onların altyapısı. Ayrıca "Son İşlemler boş" şikâyetini doğrudan çözüyor |
| **5** *(sığarsa)* | **P1-11 + P1-12 + P1-13** — Ana Menü sayaçlarını sayfalarla aynı kaynağa bağla, Kat Hizmetleri kartına sayı ekle, KPI altındaki formülü ipucuna taşı | S | Üçü birlikte yarım gün; ekran görüntülerinde göze çarpan "sayılar tutmuyor / kart ölü / denklem ne?" izlenimini tek seferde kaldırıyor |

**Sprint dışında tutulanlar ve nedeni:**
- **P0-2 (görevli seçim listesi)** — soru 1 yanıtlanmadan veri kaynağı belirsiz.
  Yanıt gelirse sprint içine alınabilir (M).
- **P0-6 (Kat Görevlisi rolü)** — soru 1 ve 5'e bağlı; ayrıca AD eşlemesi
  Bilgi İşlem ile koordinasyon gerektiriyor.
- **P1-1 (navigasyon gruplaması)** — iki aşamalı geçiş ve eğitim planı gerektiriyor,
  tek sprinte sıkıştırılırsa "kayboldu" şikâyeti riski yüksek.

**Sprint sonunda ölçülecek:** Kat Hizmetleri'nde yanlış durum işaretleme sayısı
(Geri Al kullanım oranı üzerinden), dekont onay süresi, zil rozetinin gün sonunda
sıfırlanıp sıfırlanmadığı.
