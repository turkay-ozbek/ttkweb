# TTK Misafirhane Bilgi Sistemi — Web Prototipi

Türkiye Taşkömürü Kurumu'nun TTKNET platformundaki **Misafirhane Bilgi Sistemi**
modülü için hazırlanmış, karar vericiye gösterilmek üzere tasarlanmış çalışan
demo prototipidir.

> **Mevcut sisteme dokunmaz.** Oracle Forms ekranlarında (MSFH0100, MSFH0350,
> MSFH0030) hiçbir değişiklik yapılmaz; prototip bunların yanında, bağımsız
> çalışır. Tüm veriler tarayıcı belleğinde üretilir — **gerçek misafir verisi
> kullanılmaz**, Tc kimlik numaraları 11 haneli sahte numaralardır. Gerçek ödeme
> veya muhasebe entegrasyonu yoktur.

## Çalıştırma

`misafirhane-prototip.html` dosyasını herhangi bir modern tarayıcıda açmak
yeterlidir; kurulum, sunucu veya derleme adımı yoktur. React, Tailwind ve Babel
CDN'den yüklenir, dolayısıyla ilk açılışta internet erişimi gerekir.
Masaüstü önceliklidir, 1600 px genişlikte çalışacak şekilde tasarlanmıştır.

## Ekranlar

| Kod | Ekran | İçerik |
|---|---|---|
| MSFH-W01 | **Doluluk Panosu** | 30 günlük doluluk takvimi (dolu/boş yatak, giriş, çıkış), bugünün oda/yatak haritası, seçili tarih aralığı için kalan yatak analizi, dört tesisin karşılaştırması |
| MSFH-W02 | **Rezervasyon ve Yerleştirme** | Talep listesi ile oda/yatak doluluğu tek ekranda ve canlı bağlı; otomatik yerleştirme önerisi, onay akışı, sürükle-bırak veya tıklayarak manuel yerleştirme, yerleştirilemeyen talepler için gerekçe |
| MSFH-W03 | **Peşinat ve Rezervasyon Statüsü** | Statü akışı (Talep → Peşinat Bekleniyor → Onaylı → Konaklıyor → Çıkış → İptal), peşinat/tahsilat takibi, tesis bazında peşinat kuralı, süresi dolan taleplerin otomatik iptali |

Üst bantta **+1 / +7 gün** düğmeleriyle sistem tarihi ilerletilerek statü
kurallarının (giriş, çıkış, süre aşımından iptal) canlı çalıştığı gösterilebilir.

## Demo verisi

4 tesis · 120 oda · 240 yatak · yaklaşık 5.000 rezervasyon kaydı (3 ay geçmiş +
3 ay gelecek), iptaller ve uzatmalar dahil. Veri deterministik üretilir; her
açılışta aynı demo görüntülenir.

| Tesis | Oda | Yatak |
|---|---:|---:|
| Yayla Konağı (Zonguldak) | 26 | 52 |
| Ankara Misafirhanesi | 40 | 80 |
| Amasra Misafirhanesi (Bartın) | 31 | 61 |
| Armutçuk Misafirhanesi (Ereğli) | 23 | 47 |

## Belgeler

- [`docs/yerlestirme-algoritmasi.md`](docs/yerlestirme-algoritmasi.md) — otomatik
  yerleştirme mantığı: öncelik, kısıtlar, skorlama, geri alma, gerekçe üretimi
- [`docs/api-sozlesmesi.md`](docs/api-sozlesmesi.md) — mevcut Oracle veritabanına
  bağlanmak için tablo/alan listesi ve REST API sözleşmesi taslağı
- [`docs/alan-eslestirme.md`](docs/alan-eslestirme.md) — MSFH0100 / MSFH0350 /
  MSFH0030 ekranlarındaki her alanın yeni tasarımdaki karşılığı

## Terminoloji

Mevcut sistemin alan adları ve kodları bilinçli olarak korunmuştur: *peşinat,
peşinattan kalan, yatak no, yatak fiyatı, harcırah miktarı, görev sevk no,
kurum-şahıs, ödeyecek, makbuz no, sicil no, geliş/çıkış tarihi, kaldığı gün* ve
ödeme türü kodları (KRT, NKT, MSD, BOS).
