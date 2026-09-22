# Mobil Erişim Güvenliği

**Soru:** «Uygulamanın kurum içi özel ağda çalışması beklenir; mobil veriyle kullanım
ağ ve veri güvenliği riski oluşturmaz mı?»

**Kısa yanıt:** Oluşturur — ama risk *mobil verinin kendisinde* değil, **sistemi internete
açmakta ve cihazda** yoğunlaşır. Doğru kurgu, uygulamayı hiç yayımlamadan telefona
erişim vermektir. Aşağıda önce riskin nerede olduğu, sonra üç seçenek ve önerilen katmanlı
denetim seti anlatılıyor.

---

## 1. Risk nerede, nerede değil?

| Sanılan risk | Gerçek durum |
|---|---|
| «Mobil veri (4G/5G) güvensizdir» | Radyo bağlantısı operatör tarafından **şifrelenir**. Operatör hedef IP ve TLS SNI'ı görebilir, **içeriği göremez**. Halka açık Wi-Fi'dan daha güvenlidir |
| «TLS varsa yeterlidir» | TLS aktarımı korur; **cihazı, oturumu ve yayımlanmış uç noktayı korumaz** |
| «Uygulama küçük, hedef olmaz» | İnternete açılan her uç nokta otomatik taranır. Risk uygulamanın önemiyle değil, **erişilebilirliğiyle** orantılıdır |

**Gerçek riskler, önem sırasıyla:**

1. **Sistemi internete yayımlamak** — yeni ve kalıcı bir saldırı yüzeyi. Yama döngüsü,
   WAF, sızma testi, sürekli izleme gerektirir.
2. **Cihazın kaybı/çalınması** — açık oturumla telefon başkasının eline geçer.
3. **Oturum çalınması** — uzun ömürlü token, «beni hatırla», paylaşılan cihaz.
4. **Cihazın ele geçirilmiş olması** — köklenmiş telefon, kötücül klavye, ekran kaydı.
5. **Veri sızması** — Tc kimlik no, telefon ve konaklama geçmişi **kişisel veridir**;
   ekran görüntüsü ya da dışa aktarma ile sızabilir (KVKK ihlali).
6. **Sertifika araya girme (MITM)** — cihazda sahte bir kök sertifika varsa trafik
   çözülebilir. **Saf web uygulamasında sertifika sabitleme (pinning) yapılamaz** —
   bu, PWA'nın yerel uygulamaya göre kabul edilmesi gereken bir sınırıdır.

---

## 2. Üç seçenek

| | **A — Kurum VPN'i** | **B — ZTNA / kimlik farkındalı vekil** | **C — Doğrudan yayımlama (DMZ + WAF)** |
|---|---|---|---|
| Uygulama internette mi? | **Hayır** | **Hayır** (aracı üzerinden) | **Evet** |
| Kullanıcı deneyimi | Önce VPN'e bağlan | Şeffaf, uygulama açılır açılmaz | Şeffaf |
| Ağ erişimi | VPN açıkken **kurum ağının tamamı** | Yalnız izin verilen uygulama | — |
| Cihaz sağlığı denetimi | Genelde yok | **Var** (MDM/uyum sorgusu) | Yok |
| Denetime anlatılabilirlik | En kolay — mevcut politika geçerli | Orta | **En zor** |
| Ek maliyet | Genelde **sıfır** (mevcut altyapı) | Ürün/lisans | WAF + sızma testi + sürekli izleme |
| Kurulum emeği | Düşük | Orta | Yüksek |

**Öneri:**

- **Başlangıç: A (VPN).** Kurumda zaten vardır, onaylatması en kolayıdır, sistemi hiç
  yayımlamaz. Müdürün telefonunda «bağlan, sonra aç» adımı kabul edilebilir bir bedeldir.
- **Olgunlaşınca: B (ZTNA).** VPN'in en büyük kusuru, bağlanan cihazın kurum ağının
  tamamına erişmesidir. ZTNA yalnız bu uygulamaya, yalnız o kullanıcıya, yalnız cihaz
  uyumluysa izin verir. Başka modüller de mobile açılacaksa yatırım kendini amorti eder.
- **C'den kaçının.** Bu ölçekteki bir iç modül için internete yayımlamanın getirdiği
  yük (WAF, düzenli sızma testi, 7/24 izleme, KVKK risk değerlendirmesi) faydasından
  büyüktür. Zorunlu kalınırsa § 4'teki ek denetimler şarttır.

---

## 3. Katmanlı denetimler (hangi seçenek olursa olsun)

### 3.1 Kimlik ve oturum

| Denetim | Ayar | Gerekçe |
|---|---|---|
| Kurum SSO (LDAP/AD) | Parola uygulamada tutulmaz | Tek hesap yönetimi, işten ayrılanda anında kapanır |
| **Çok etmenli doğrulama (MFA)** | Kurum dışından erişimde **zorunlu** | Çalınan parola tek başına yetmesin |
| **Passkey / WebAuthn** | Telefonda parmak izi / yüz | MFA'nın en kullanışlı biçimi; oltalamaya dayanıklı |
| Oturum ömrü | 15 dk hareketsizlik, en çok 8 saat | Kayıp cihazda pencere daralır |
| Hassas işlemde yeniden doğrulama | Tahsilat, dekont onayı, kullanıcı yönetimi | Açık kalmış oturumla kritik işlem yapılmasın |
| Sunucu taraflı iptal | «Oturumlarımı kapat» + yöneticiden zorla çıkış | Telefon kaybında ilk yapılacak |
| «Beni hatırla» | **Yok** | Paylaşılan/kaybolan cihaz riski |

### 3.2 Veri

| Denetim | Uygulama |
|---|---|
| **Çevrimdışı kişisel veri yok** | Service worker yalnız **uygulama kabuğunu** (HTML/CSS/JS) önbelleğe alır; API yanıtları **asla** önbelleğe alınmaz |
| Tc kimlik no maskeleme | Listelerde `*******1234`; açmak tek tıkla ama **kayda geçer** |
| Mobilden toplu dışa aktarma yok | Excel/PDF listesi indirme yalnız kurum ağından |
| Ekran görüntüsü izi | Hassas listelerde silik filigran: kullanıcı kodu + tarih. Web'de ekran görüntüsü **engellenemez**; sızan görüntünün kaynağı bu sayede bulunur |
| Yazdırma | Mobilde kapalı |

### 3.3 Ağ ve uygulama

| Denetim | Ayar |
|---|---|
| TLS | Yalnız 1.3 (1.2 geriye dönük), HSTS `max-age=31536000; includeSubDomains; preload` |
| Güvenlik başlıkları | `Content-Security-Policy` (yalnız kendi kaynağı), `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` |
| **Üçüncü taraf betik yok** | ⚠ **Prototip şu an React/Tailwind/Babel dosyalarını cdnjs ve cdn.tailwindcss.com'dan çekiyor.** Kurulumda bunlar **kendi sunucumuzdan** sunulmalıdır; aksi hâlde dış bir CDN'in ele geçirilmesi uygulamayı da ele geçirir (tedarik zinciri riski) |
| Hız sınırı | IP ve kullanıcı başına; giriş denemelerinde üstel bekletme |
| Ağ bağlamına göre yetki | Kurum dışından: kullanıcı yönetimi, toplu iptal ve dışa aktarma **kapalı** — sunucuda denetlenir |
| Denetim izi | Her istek: kullanıcı, IP, cihaz, kurum içi/dışı etiketi. Olağandışı erişimde uyarı |

### 3.4 Cihaz

| Durum | Politika |
|---|---|
| Kurum telefonu | MDM zorunlu: ekran kilidi, disk şifreleme, uzaktan silme, güncel işletim sistemi |
| Kişisel telefon (BYOD) | Ya yasak, ya MAM ile yönetilen tarayıcı profili. **Karar kurumun BYOD politikasına aittir** |
| Köklenmiş/jailbreak cihaz | Web'den güvenilir tespit **yapılamaz**; ZTNA seçilirse aracı bu denetimi yapar |

---

## 4. Yayımlamak zorunlu kalınırsa (seçenek C)

Ek olarak: DMZ'de ters vekil (uygulama sunucusu doğrudan erişilebilir olmamalı) ·
WAF (OWASP kural seti) · yönetim uçları (`/metrics`, `/saglik`) internete kapalı ·
coğrafi kısıt (yalnız Türkiye) makul bir ilk filtre · yılda en az bir **sızma testi** ·
7/24 SIEM'e günlük aktarımı · KVKK risk değerlendirmesinin güncellenmesi.

---

## 5. KVKK açısından

- Veri **yurt içinde, kurum sunucusunda** kalır; yurt dışına aktarım yoktur (yığının
  tamamı kendi barındırılır).
- Mobil erişim, işleme amacını değiştirmez ama **riski artırır**; bu nedenle:
  - VERBİS kaydında «uzaktan erişim» belirtilir,
  - Veri güvenliği tedbirleri arasında MFA, oturum süresi ve maskeleme yazılır,
  - Kayıp cihaz ihbar akışı tanımlanır (ihlal bildirimi 72 saat).
- Saklama süreleri ve aydınlatma metni için bkz. [`mimari-brifing.md`](mimari-brifing.md) § 7.

---

## 6. Karar için özet

> **Mobil erişim güvenli biçimde verilebilir; ama «uygulamayı internete açalım» diyerek değil.**
> Uygulama kurum ağında kalır; telefon **VPN ya da ZTNA** ile o ağa alınır. Üstüne
> kurum SSO + MFA (tercihen passkey), kısa oturum, çevrimdışı kişisel veri tutmama,
> Tc kimlik no maskeleme, ağ bağlamına göre daraltılmış yetki ve tam denetim izi konur.
> Bu haliyle risk, masaüstünden erişimin riskine yakınsar; kalan fark **cihaz riskidir**
> ve MDM ile yönetilir.

**Karar gerektiren üç soru:**
1. Kurumda kullanılabilir bir VPN altyapısı var mı? Kapasitesi kaç eşzamanlı kullanıcı?
2. Müdürler **kurum telefonu** mu kullanacak, kişisel telefon (BYOD) da olacak mı?
3. Kurum dışından hangi işlemler yasaklansın? (Öneri: kullanıcı yönetimi, toplu iptal,
   toplu dışa aktarma.)
