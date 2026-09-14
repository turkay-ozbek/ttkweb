# Otomatik Yerleştirme Algoritması

Bu belge, prototipteki **Rezervasyon ve Yerleştirme (MSFH-W02)** ekranındaki
"Otomatik Yerleştir" düğmesinin arkasındaki mantığı açıklar. Algoritma tek dosya
prototipte `yerlestirmeMotoru()` fonksiyonundadır.

## Özet

Kısıt denetimi + ağırlıklı skorlama + tek seviyeli geri alma (backtracking) yapan
açgözlü (greedy) bir yerleştiricidir. Optimum çözümü garanti etmez; amaç, bir
memurun elle yapacağı yerleştirmenin kurallarını taklit eden, hızlı ve
**açıklanabilir** bir öneri üretmektir. Motor doluluğu kendi başına değiştirmez,
yalnızca öneri üretir; uygulanması kullanıcı onayına bağlıdır.

## 1. Öncelik sırası

Talepler şu sırayla işlenir (üsttekiler önce yerleşir):

| Sıra | Ölçüt | Gerekçe |
|---|---|---|
| 1 | Protokol talebi | Protokol misafiri geri çevrilemez |
| 2 | Kurum misafiri (`kurum_sahis = KURUM`) | Görevli konaklaması önceliklidir |
| 3 | Peşinatı tahsil edilmiş / Onaylı talep | Taahhüt verilmiş kayıt |
| 4 | Geliş tarihi yakın olan | Yakın tarihli talep beklemeye alınamaz |
| 5 | Kişi sayısı çok olan | Büyük gruba yer bulmak zordur, önce denenir |
| 6 | Rezerv tarihi eski olan | İlk gelen ilk hizmet |

## 2. Gruplama

Bir talepteki misafirler konaklama gruplarına ayrılır:

- **Aile / birlikte kalma talebi** (`aile = true`): tüm misafirler tek gruptur,
  bölünmez ve yalnızca **tamamen boş** bir odaya yerleştirilir (karma konaklama
  ancak oda münhasıran o gruba tahsis edilirse mümkündür).
- Aksi halde talep **cinsiyete göre** alt gruplara ayrılır; her alt grup ayrı
  yerleştirilir.

## 3. Kısıtlar (sağlanmazsa aday elenir)

1. **Süreklilik:** Yatak, `gelis_tarihi` ile `cikis_tarihi` arasındaki *her
   gecede* boş olmalıdır. Misafir konaklama ortasında oda değiştirilmez.
2. **Temizlik boşluğu:** Bir yatak, çıkış gününde `TEMIZLIK_GUN` (varsayılan 1
   gün) boyunca bloke edilir; aynı gün yeni girişe verilmez.
3. **Karma oda kısıtı:** Odada aynı tarihlerde farklı cinsiyette misafir varsa
   oda elenir. Aile grubunda oda tamamen boş olmalıdır.
4. **Protokol odası:** Protokol odaları yalnız protokol talebine açılır.
5. **Kapasite:** Odada, grubun tamamı için yeterli sayıda müsait yatak olmalıdır.

## 4. Skorlama

Kısıtları geçen her oda adayı puanlanır; en yüksek puanlı aday seçilir.

| Bileşen | Puan | Amaç |
|---|---:|---|
| Grubun tamamı tek odada | +100 | Grup bütünlüğü |
| Oda kapasitesi talebe birebir uyuyor | +40 | Kapasite israfını önle |
| Oda aynı cinsiyetle kısmen dolu | +25 | Oda parçalanmasını azalt |
| Protokol misafiri protokol odasında | +35 | Doğru envanter kullanımı |
| Ardışık gecelerde sıkı paketleme (yatağın öncesi/sonrası dolu) | +12 / yatak | Boşlukları kapat |
| Alt kat tercihi | +4 / kat | Erişilebilirlik |
| Uzun konaklama (5+ gece) alt katta | +6 | Konfor |
| Odada atıl kalan yatak | −18 / yatak | Kapasite israfı |
| Aralığın kenarında 1 gecelik satılamaz boşluk | −14 | Parçalanma cezası |
| Protokol odası normal misafire veriliyor | −25 | Envanter korunur |
| Grup birden fazla odaya bölündü | −60 | Son çare |
| Bölünen grup farklı katlara dağıldı | −30 | Son çare |

## 5. Grup bölme

Grup tek odaya sığmazsa (aile/birlikte kalma talepleri hariç), mümkün olan en
büyük parçalardan başlayarak en az sayıda odaya bölünür; aynı katta toplanma
tercih edilir. Bölünmüş yerleşim öneri listesinde "Grup N odaya bölündü"
notuyla işaretlenir.

## 6. Tek seviyeli geri alma

Yüksek öncelikli bir talep yerleşemezse, motor **aynı turda yerleşmiş, tarihi
çakışan ve önceliği daha düşük** en fazla 2 öneriyi geri alıp yeniden dener.
Öncelikli talep yerleşirse, geri alınan talep tekrar yerleştirilmeye çalışılır:

- Yerleşirse önerisi güncellenir ("Öncelikli talep nedeniyle oda değişti").
- Yerleşemezse öneri listesinden çıkarılır ve gerekçesiyle birlikte
  "yerleştirilemeyenler" listesine düşer.

## 7. Gerekçe üretimi

Yerleştirilemeyen her talep için, elenme sayaçlarına ve gece bazlı boşluk
analizine bakılarak okunabilir bir gerekçe üretilir. Üretilen gerekçe türleri:

- `14.09.2026 – 16.09.2026 arası uygun yatak yok — 15.09.2026 gecesinde tesiste
  hiç boş yatak bulunmuyor.`
- `... arası boş yatak var ancak 6 oda karma konaklama kısıtı nedeniyle
  kullanılamıyor (odalarda farklı cinsiyette misafir konaklıyor).`
- `... arası aile/birlikte kalma talebi için tamamen boş 3 yataklı oda
  bulunamadı (4 oda kısmen dolu olduğu için karma konaklamaya kapalı).`
- `... arası yataklar çıkış-giriş temizlik boşluğu (1 gün) nedeniyle aynı gün
  tahsis edilemiyor.`
- `3 kişilik grup için ... arası ardışık gecelerde aynı odada 3 boş yatak
  bulunamadı (aynı odada en fazla 1 yatak müsait; tesis genelinde en dar gecede
  5 boş yatak var); grup ayrı odalara bölünerek de tamamlanamadı.`

## 8. Onay akışı

Motorun çıktısı doğrudan uygulanmaz:

1. Öneriler onay ekranına düşer (oda/yatak, skor, gerekçe/not).
2. Kullanıcı tek tek veya toplu onaylar; onaylanmayan öneri doluluğu değiştirmez.
3. Onaylanan öneriler kayıt hareketlerine "Otomatik yerleştirme onaylandı" notu
   ile yazılır.
4. Kullanıcı sonrasında sürükle-bırak veya tıklayarak yerleşimi değiştirebilir;
   manuel yerleştirmede de aynı kısıtlar denetlenir ve ihlal uyarı ile bildirilir.

## 9. Karmaşıklık ve ölçüm

Talep başına maliyet `O(oda sayısı × gece sayısı × oda başına yatak)`. Prototipte
120 oda / 240 yatak ve ~50 bekleyen talep için motor tipik olarak **60–150 ms**
içinde sonuç üretir (tarayıcıda ölçülmüştür, onay ekranının altında gösterilir).

## 10. Üretime alınırken gözden geçirilmesi gerekenler

- Skor ağırlıkları tesis bazında parametre tablosuna alınmalıdır
  (`MSFH_YERLESTIRME_PARAM`).
- Temizlik süresi tesise göre değişebilir (`TEMIZLIK_GUN` alanı oda/tesis
  tanımına taşınmalı).
- Engelli erişimi, kat tercihi, sigara durumu gibi ek kısıtlar aynı skor
  çerçevesine eklenebilir.
- Optimum çözüm gerekiyorsa aynı kısıt modeli bir ILP/CP çözücüye taşınabilir;
  açgözlü motor bu durumda başlangıç çözümü (warm start) olarak kullanılır.
