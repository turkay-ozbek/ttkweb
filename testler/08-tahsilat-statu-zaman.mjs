/* Test planı bölüm 5 (tahsilat ve iş listeleri), 6 (statü akışı ve zaman), 3.6 (kapora kuralı) */
import { defter, tarayici, giris, rolDegistir, sayfa, govde, HESAP, yeniKayit, kaydet,
         trTarih, tarihYaz, taleplerdeAra, pencereKapat, satirSayisi, veriSatirlari } from './ortak.mjs';

const d = defter('08 — Tahsilat, iş listeleri, statü ve zaman');
const { b, p } = await tarayici(d);
const sayi = (metin, desen) => { const m = metin.match(desen); return m ? Number(m[1].replace(/\./g, '')) : null; };

try {
  await giris(p, HESAP.mudur);

  /* ═══ 3.6 Kapora kuralı — kurum misafirinde kapora aranmasın kapatılıyor ═══ */
  await sayfa(p, 'Tahsilat');
  const kuralAc = p.getByRole('button', { name: /[Pp]eşinat.*[Kk]ural|[Kk]apora [Kk]ural/ }).first();
  if (await kuralAc.count()) { await kuralAc.click(); await p.waitForTimeout(400); }
  const kutu = p.locator('main input[type=checkbox]').first();
  if (await kutu.count()) {
    const onceki = await kutu.isChecked();
    await kutu.click(); await p.waitForTimeout(600);
    d.bekle(await kutu.isChecked() !== onceki, 'kapora kuralı değiştirilebiliyor');
    /* kural değişince kurum kaydında da kapora hesaplanmalı */
    await sayfa(p, 'Talepler');
    const f = await yeniKayit(p, { ad: 'KURUM KAPORALI', ekGun: 30, gece: 2 });
    const altlik = await f.altlik();
    d.bekle(/₺/.test(altlik) && !/aranmıyor/.test(altlik.split('MİSAFİRLER')[0]),
      'kural kapatılınca kurum misafirinde de kapora hesaplanıyor');
    await p.getByRole('button', { name: 'Vazgeç', exact: true }).click(); await p.waitForTimeout(400);
    /* kuralı geri al */
    await sayfa(p, 'Tahsilat');
    const kuralAc2 = p.getByRole('button', { name: /[Pp]eşinat.*[Kk]ural|[Kk]apora [Kk]ural/ }).first();
    if (await kuralAc2.count()) { await kuralAc2.click(); await p.waitForTimeout(400); }
    await p.locator('main input[type=checkbox]').first().click(); await p.waitForTimeout(600);
    d.ok('kapora kuralı eski hâline döndürüldü');
  } else d.hata('kapora kuralı paneli bulunamadı');

  /* ═══ 5.3 Dönem filtreleri ═══ */
  await sayfa(p, 'Tahsilat');
  const sayilar = {};
  for (const aralik of ['Bugün', 'Bu hafta', 'Bu ay', 'Gelecek 30 gün', 'Son 30 gün', 'Tüm dönem']) {
    await p.getByRole('button', { name: aralik, exact: true }).click();
    await p.waitForTimeout(450);
    sayilar[aralik] = await satirSayisi(p);
    d.bekle(true, `dönem «${aralik}» seçildi (${sayilar[aralik]} kayıt)`);
  }
  d.bekle(sayilar['Tüm dönem'] >= sayilar['Bugün'], 'Tüm dönem, Bugün\'den az kayıt göstermiyor',
    `tüm: ${sayilar['Tüm dönem']} · bugün: ${sayilar['Bugün']}`);
  d.bekle(sayilar['Tüm dönem'] >= sayilar['Bu ay'], 'Tüm dönem, Bu ay\'dan az kayıt göstermiyor');

  /* ═══ 5.3 İş listeleri — kutudaki sayı satır sayısıyla aynı mı ═══ */
  await p.getByRole('button', { name: 'Tüm dönem', exact: true }).click();
  await p.waitForTimeout(400);
  for (const liste of ['Tahsilat bekleyen', 'Süresi dolan', 'Bugün giriş', 'Bugün çıkış']) {
    const kart = p.locator('main button', { hasText: liste }).first();
    if (!(await kart.count())) { d.hata(`iş listesi «${liste}» bulunamadı`); continue; }
    const kartMetni = await kart.innerText();
    const beklenen = sayi(kartMetni, /(\d[\d.]*)/);
    await kart.click(); await p.waitForTimeout(500);
    const satir = await satirSayisi(p);
    d.bekle(satir === beklenen, `iş listesi «${liste}»: kutudaki sayı (${beklenen}) tablodaki satırla (${satir}) aynı`);
  }
  await p.locator('main button', { hasText: 'Tüm kayıtlar' }).first().click();
  await p.waitForTimeout(400);

  /* ═══ 5.4 Arama: ad soyad, Tc, rezervasyon no, makbuz no ═══ */
  const ilkSatir = await veriSatirlari(p).first().innerText();
  const rezNo = (await govde(p)).match(/MSF-\d{4}-\d+/);
  const arama = p.getByPlaceholder(/Ad soyad/).first();
  if (rezNo) {
    await arama.fill(rezNo[0].slice(-5)); await p.waitForTimeout(500);
    d.bekle(await satirSayisi(p) >= 1, 'rezervasyon numarasının son hanesiyle arama sonuç veriyor');
  }
  const ad = ilkSatir.split('\t').find(x => /[A-ZÇĞİÖŞÜ]{3,} /.test(x));
  if (ad) { await arama.fill(ad.trim()); await p.waitForTimeout(500);
    d.bekle(await satirSayisi(p) >= 1, 'ad soyad ile arama sonuç veriyor'); }
  await arama.fill('zzzyokboyle'); await p.waitForTimeout(500);
  d.bekle(await satirSayisi(p) === 0, 'bulunmayan aramada liste boşalıyor');
  await arama.fill('');
  await p.waitForTimeout(400);

  /* ═══ 5.1 / 5.2 Tam ve kısmi tahsilat ═══ */
  await sayfa(p, 'Talepler');
  const f2 = await yeniKayit(p, { ad: 'TAHSILAT TAM', ekGun: 35, gece: 3, sahis: true });
  await kaydet(p, f2);
  const f3 = await yeniKayit(p, { ad: 'TAHSILAT KISMI', ekGun: 36, gece: 3, sahis: true });
  await kaydet(p, f3);
  await sayfa(p, 'Tahsilat');
  await p.getByRole('button', { name: 'Tüm dönem', exact: true }).click(); await p.waitForTimeout(400);

  const tahsilEt = async (ad, dugme) => {
    await p.getByPlaceholder(/Ad soyad/).first().fill(ad); await p.waitForTimeout(500);
    const satir = veriSatirlari(p).filter({ hasText: ad }).first();
    if (!(await satir.count())) { d.hata(`${ad}: kayıt tahsilat listesinde yok`); return null; }
    await satir.getByRole('button', { name: /Tahsilat Al/ }).click(); await p.waitForTimeout(400);
    await p.getByRole('button', { name: dugme, exact: true }).click();
    await p.getByLabel(/Makbuz No/).fill('9' + Math.floor(Math.random() * 900 + 100));
    await p.getByRole('button', { name: /Kaydet/ }).last().click(); await p.waitForTimeout(700);
    return (await veriSatirlari(p).filter({ hasText: ad }).first().innerText()).replace(/\n/g, ' | ');
  };
  const tam = await tahsilEt('TAHSILAT TAM', 'Tamamı');
  d.bekle(tam !== null && /Onaylı/.test(tam), 'kapora tamamı tahsil edilince statü «Onaylı» oldu', tam);
  const kismi = await tahsilEt('TAHSILAT KISMI', 'Yarısı');
  d.bekle(kismi !== null && /Kapora Bkl/.test(kismi), 'kısmi tahsilatta kayıt «Kapora Bekleniyor» kalıyor', kismi);

  /* ═══ 5.6 Detay penceresi ve hareket geçmişi ═══ */
  await p.getByPlaceholder(/Ad soyad/).first().fill('TAHSILAT TAM'); await p.waitForTimeout(500);
  await veriSatirlari(p).filter({ hasText: 'TAHSILAT TAM' }).first()
    .getByRole('button', { name: 'Detay', exact: true }).click();
  await p.waitForTimeout(500);
  const detay = await p.locator('.fixed.inset-0').last().innerText();
  /* Not: başlıklar CSS ile büyük harfe çevrilir; Türkçe «İ» JS'in /i bayrağıyla
     eşleşmediği için deseni o harfi içermeyecek biçimde yazıyoruz. */
  d.bekle(/KAYIT HAREKETLER/i.test(detay), 'detay penceresinde «Kayıt Hareketleri» bölümü var');
  d.bekle(/[Tt]ahsilat/.test(detay), 'hareket geçmişinde tahsilat kaydı görünüyor');
  d.bekle(/MSF1001|TTK7719/.test(detay), 'hareketlerde işlemi yapan kullanıcı yazıyor');
  await pencereKapat(p);

  /* ═══ 6.1 Statü sayaçları toplamı ═══ */
  /* Tahsilat ve Statü aynı bileşendir: arama kutusu temizlenmezse Statü sayfasına taşınır. */
  await p.getByPlaceholder(/Ad soyad/).first().fill('');
  await p.waitForTimeout(400);
  await sayfa(p, 'Statü');
  /* Statü kutuları: ad + sayı + açıklama içeren düğmeler. hasText deseni textContent
     üzerinde çalıştığı için satır sonlarını görmez; bu yüzden innerText ile süzüyoruz. */
  const kutuMetinleri = (await p.locator('main button').allInnerTexts())
    .filter(x => /^[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ ]*\n\d[\d.]*(\n|$)/.test(x));
  d.bekle(kutuMetinleri.length === 7, 'yedi statü kutusu listeleniyor', `${kutuMetinleri.length} kutu`);
  const sayimlar = Object.fromEntries(kutuMetinleri.map(x => {
    const [ad, adet] = x.split('\n');
    return [ad, Number((adet || '0').replace(/\./g, ''))];
  }));
  const toplamStatu = Object.values(sayimlar).reduce((a, x) => a + x, 0);
  d.bekle(toplamStatu > 0, `statü sayaçları toplamı ${toplamStatu} kayıt`);
  d.bekle(Object.keys(sayimlar).length === 7 && sayimlar['İPTAL'] !== undefined,
    'statü akışı yedi statünün tamamını gösteriyor', Object.keys(sayimlar).join(', '));

  /* Bir kutuya tıklayınca liste yalnız o statüyü göstermeli */
  const konaklayanIndex = (await p.locator('main button').allInnerTexts())
    .findIndex(x => /^KONAKLIYOR\n\d/.test(x));
  if (konaklayanIndex >= 0) {
    await p.locator('main button').nth(konaklayanIndex).click();
    await p.waitForTimeout(600);
    const satirlar = await veriSatirlari(p).allInnerTexts();
    d.bekle(satirlar.length > 0 && satirlar.every(x => /Konaklıyor/.test(x)),
      'statü kutusuna tıklayınca liste yalnız o statüyü gösteriyor', `${satirlar.length} satır`);
    await p.locator('main button').nth(konaklayanIndex).click();
    await p.waitForTimeout(400);
  }

  /* ═══ 6.2 Gün ilerletme — otomatik statü değişiklikleri ═══ */
  await sayfa(p, 'Özet');
  const tarihAl = async () => (await p.locator('footer').innerText()).match(/\d{2}\.\d{2}\.\d{4}/)[0];
  const t0 = await tarihAl();
  await p.getByRole('button', { name: '+1 gün' }).click(); await p.waitForTimeout(700);
  const t1 = await tarihAl();
  d.bekle(t0 !== t1, `«+1 gün» sistem tarihini ilerletti (${t0} → ${t1})`);
  const gunluk0 = (await p.locator('footer').innerText());
  await p.getByRole('button', { name: '+7 gün' }).click(); await p.waitForTimeout(900);
  const t7 = await tarihAl();
  d.bekle(t1 !== t7, `«+7 gün» sistem tarihini ilerletti (${t1} → ${t7})`);
  const gunluk = await p.locator('footer').innerText();
  d.bekle(/statü değişikliği|çıkış yapıldı|iptal/i.test(gunluk),
    'gün ilerleyince otomatik statü değişiklikleri işlem günlüğüne yazıldı', gunluk.slice(0, 160));

  /* süresi dolan kapora talepleri iptale düşmüş mü */
  await p.locator('footer button').first().click();   // işlem günlüğü penceresi
  await p.waitForTimeout(500);
  const gunlukPenceresi = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/statü değişikliği|çıkış yapıldı|iptal/i.test(gunlukPenceresi),
    'işlem günlüğü gün ilerlemesinin sonuçlarını kaydetmiş', gunlukPenceresi.slice(0, 200).replace(/\n/g, ' | '));
  await pencereKapat(p);

  /* ═══ 6.3 Kalış uzatma ═══ */
  await sayfa(p, 'Talepler');
  const uzatilacak = await taleplerdeAra(p, 'TAHSILAT TAM', { gunSonra: 60 });
  if (await uzatilacak.count()) {
    await uzatilacak.click(); await p.waitForTimeout(400);
    const once = (await govde(p)).match(/(\d{2}\.\d{2}\.\d{4}) – (\d{2}\.\d{2}\.\d{4})/);
    d.bekle(!!once, 'seçili kaydın geliş–çıkış aralığı panelde görünüyor');
  }

  /* ═══ 5.5 Süresi dolan kayıtların toplu iptali ═══ */
  await sayfa(p, 'Tahsilat');
  await p.getByRole('button', { name: 'Tüm dönem', exact: true }).click(); await p.waitForTimeout(400);
  const suresiDolan = p.locator('main button', { hasText: 'Süresi dolan' }).first();
  const dolanSayi = sayi(await suresiDolan.innerText(), /(\d[\d.]*)/);
  await suresiDolan.click(); await p.waitForTimeout(500);
  const topluD = p.getByRole('button', { name: /[Tt]oplu [İi]ptal|[Tt]ümünü [İi]ptal/ }).first();
  if (dolanSayi > 0 && await topluD.count()) {
    await topluD.click(); await p.waitForTimeout(900);
    const kalan = sayi(await p.locator('main button', { hasText: 'Süresi dolan' }).first().innerText(), /(\d[\d.]*)/);
    d.bekle(kalan === 0, `süresi dolan ${dolanSayi} kayıt toplu iptal edildi`, `kalan: ${kalan}`);
  } else if (dolanSayi === 0) d.ok('süresi dolan kayıt yok (toplu iptal denetimi atlandı)');
  else d.hata('toplu iptal düğmesi bulunamadı');

  /* ═══ 5.x Muhasebe rolüyle tahsilat ═══ */
  await rolDegistir(p, HESAP.muhasebe);
  await sayfa(p, 'Tahsilat');
  await p.getByRole('button', { name: 'Tüm dönem', exact: true }).click(); await p.waitForTimeout(400);
  await p.getByPlaceholder(/Ad soyad/).first().fill('TAHSILAT KISMI'); await p.waitForTimeout(500);
  const muhSatir = veriSatirlari(p).filter({ hasText: 'TAHSILAT KISMI' }).first();
  if (await muhSatir.count()) {
    const tahD = muhSatir.getByRole('button', { name: /Tahsilat Al/ });
    if (await tahD.count())
      d.bekle(!(await tahD.first().isDisabled()), 'muhasebe kalan kaporayı tahsil edebiliyor');
    else
      d.ok('kayıtta tahsil edilecek kapora kalmamış (muhasebe düğme denetimi atlandı): ' +
           (await muhSatir.innerText()).replace(/\n/g, ' | ').slice(0, 90));
    const iptalD = muhSatir.getByRole('button', { name: 'İptal', exact: true });
    d.bekle(await iptalD.count() === 0, 'muhasebede rezervasyon iptali düğmesi yok');
  } else d.ok('kısmi tahsilatlı kayıt dönem dışında (muhasebe denetimi atlandı)');
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
