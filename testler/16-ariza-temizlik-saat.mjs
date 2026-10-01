/* Test planı bölüm 16 — servis dışı (arızalı) yatak, kat hizmetleri (temizlik)
   ekranı ve giriş/çıkış saatleri. Üçü de misafirhanenin günlük işleyişinde
   doluluk hesabını doğrudan etkiler; bu yüzden hem arayüz hem sayı tutarlılığı
   birlikte denetlenir. */
import { defter, tarayici, giris, HESAP, sayfa, govde, veriSatirlari, trTarih, tarihYaz } from './ortak.mjs';

const d = defter('16 — Servis dışı yatak, kat hizmetleri ve saatler');
const { b, p } = await tarayici(d);
await giris(p, HESAP.admin);

/* ═══ 1) Özet ekranında «servis dışı» sayacı ve kapasite eşitliği ═══ */
await sayfa(p, 'Özet');
let g = await govde(p);
d.bekle(/SERV[Iİ]S DIŞI/.test(g), 'Özet ekranında servis dışı yatak sayacı var');
/* KPI kutuları «etiket / sayı / alt açıklama» olarak alt alta yazılır */
const oku = (etiket) => {
  const m = g.match(new RegExp(etiket + '\\s*\\n\\s*(\\d+)'));
  return m ? Number(m[1]) : null;
};
const kapasiteOku = () => { const m = g.match(/(\d+) yatak kapasite/); return m ? Number(m[1]) : null; };
const kapasite = kapasiteOku(), dolu = oku('DOLU YATAK'), bos = oku('BOŞ YATAK'),
      temizlikte = oku('TEM[Iİ]ZL[Iİ]KTE'), servisDisi = oku('SERV[Iİ]S DIŞI');
d.bekle([kapasite, dolu, bos, temizlikte, servisDisi].every(x => x !== null),
  'beş sayaç da okunabiliyor', `${kapasite} / ${dolu} / ${bos} / ${temizlikte} / ${servisDisi}`);
d.bekle(dolu + bos + temizlikte + servisDisi === kapasite,
  'dolu + boş + temizlikte + servis dışı = kapasite',
  `${dolu}+${bos}+${temizlikte}+${servisDisi} ≠ ${kapasite}`);

/* ═══ 2) Yatağı servis dışı bırakma ve hizmete alma ═══ */
await sayfa(p, 'Yatak Listesi');
await p.locator('main select').first().selectOption('BOS');
await p.waitForTimeout(400);
const bosSatir = veriSatirlari(p).first();
const odaNo = (await bosSatir.locator('td').first().innerText()).trim();
await bosSatir.click();
await p.waitForTimeout(500);
let pencere = p.locator('.fixed.inset-0').last();
d.bekle(/Servis Dışı Bırak/.test(await pencere.innerText()), 'boş yatak penceresinde servis dışı düğmesi var');
await pencere.getByRole('button', { name: /Servis Dışı Bırak/ }).click();
await p.waitForTimeout(400);
pencere = p.locator('.fixed.inset-0').last();
d.bekle(await pencere.locator('input[placeholder*="Klima"]').count() === 1,
  'servis dışı formu gerekçe istiyor');
const kaydetD = pencere.getByRole('button', { name: 'Servis Dışı Bırak', exact: true });
d.bekle(!(await kaydetD.isEnabled()), 'gerekçe yazılmadan kaydedilemiyor');
await pencere.locator('input[placeholder*="Klima"]').fill('Klima arızası — teknik servis');
await p.waitForTimeout(250);
await kaydetD.click();
await p.waitForTimeout(800);

await sayfa(p, 'Yatak Listesi');
await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill(odaNo);
await p.waitForTimeout(500);
g = await govde(p);
d.bekle(/Servis Dışı/.test(g), `Oda ${odaNo} yatağı listede «Servis Dışı» görünüyor`);

await sayfa(p, 'Özet');
g = await govde(p);
const yeniServis = oku('SERV[Iİ]S DIŞI');
d.bekle(yeniServis === servisDisi + 1, 'servis dışı sayacı bir arttı', `${servisDisi} → ${yeniServis}`);
const yeniKapasite = kapasiteOku(), yeniDolu = oku('DOLU YATAK'), yeniBos = oku('BOŞ YATAK'), yeniTemiz = oku('TEM[Iİ]ZL[Iİ]KTE');
d.bekle(yeniDolu + yeniBos + yeniTemiz + yeniServis === yeniKapasite,
  'servis dışı yatak kapasiteden değil boş yataktan düşüyor',
  `${yeniDolu}+${yeniBos}+${yeniTemiz}+${yeniServis} ≠ ${yeniKapasite}`);

/* hizmete alma */
await sayfa(p, 'Yatak Listesi');
await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill(odaNo);
await p.waitForTimeout(400);
const arizaSatir = veriSatirlari(p).filter({ hasText: 'Servis Dışı' }).first();
await arizaSatir.click();
await p.waitForTimeout(500);
pencere = p.locator('.fixed.inset-0').last();
d.bekle(/Yatak servis dışı/.test(await pencere.innerText()), 'arıza kaydı pencerede gerekçesiyle gösteriliyor');
d.bekle(/Klima arızası/.test(await pencere.innerText()), 'girilen gerekçe korunuyor');
await pencere.getByRole('button', { name: /Hizmete Al/ }).click();
await p.waitForTimeout(800);
await sayfa(p, 'Özet');
g = await govde(p);
d.bekle(oku('SERV[Iİ]S DIŞI') === servisDisi, 'hizmete alınınca sayaç eski değerine döndü');

/* ═══ 3) Kat hizmetleri ekranı ═══ */
await sayfa(p, 'Kat Hizmetleri');
g = await govde(p);
d.bekle(/Kat Hizmetleri/.test(g), 'Kat Hizmetleri sayfası açıldı');
d.bekle(/TEM[Iİ]ZLENECEK ODA/.test(g) && /BEKL[Iİ]YOR/.test(g) && /TEM[Iİ]ZLEN[Iİ]YOR/.test(g),
  'kat hizmetleri KPI kutuları var');
const isSatir = veriSatirlari(p).filter({ hasText: /Çıkış temizliği|Günlük temizlik/ }).first();
d.bekle(await isSatir.count() === 1, 'temizlenecek oda listelendi');
const isTuru = await isSatir.innerText();
d.bekle(/Çıkış temizliği|Günlük temizlik/.test(isTuru), 'iş türü (çıkış / günlük temizlik) yazıyor');

/* durum çipleri — dört durumun hepsi her satırda duruyor, tıklanan seçili olur */
const cipler = isSatir.locator('td').nth(2).locator('button');
d.bekle(await cipler.count() === 4, 'her satırda dört temizlik durumu çipi var', await cipler.count() + ' çip');
const seciliCip = async () => {
  const n = await cipler.count();
  for (let i = 0; i < n; i++) {
    const sinif = await cipler.nth(i).getAttribute('class');
    if (/ring-1/.test(sinif)) return (await cipler.nth(i).innerText()).trim();
  }
  return '';
};
await isSatir.getByRole('button', { name: 'Temizleniyor' }).click();
await p.waitForTimeout(500);
d.bekle(await seciliCip() === 'Temizleniyor', 'oda «Temizleniyor» durumuna geçti', await seciliCip());
await isSatir.getByRole('button', { name: 'Temizlendi' }).click();
await p.waitForTimeout(500);
d.bekle(await seciliCip() === 'Temizlendi', 'oda «Temizlendi» olarak işaretlendi', await seciliCip());
const saatHucre = (await isSatir.locator('td').last().innerText()).trim();
d.bekle(/^\d{2}:\d{2}$/.test(saatHucre), 'durum değişince işlem saati yazıldı', saatHucre);

/* kat görevlisi */
const gorevliKutu = isSatir.locator('input[placeholder="ad soyad"]').first();
await gorevliKutu.fill('F. Yıldız');
await p.waitForTimeout(500);
d.bekle(await gorevliKutu.inputValue() === 'F. Yıldız', 'kat görevlisi kaydedildi');
await sayfa(p, 'Özet');
await sayfa(p, 'Kat Hizmetleri');
await p.waitForTimeout(400);
const kaliciSayi = await p.locator('main input[placeholder="ad soyad"]')
  .evaluateAll(xs => xs.filter(x => x.value === 'F. Yıldız').length);
d.bekle(kaliciSayi === 1, 'kat görevlisi sayfa değişince de duruyor', kaliciSayi + ' satırda yazılı');

/* ═══ 4) Giriş / çıkış saatleri ═══ */
await sayfa(p, 'Talepler');
await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
await p.waitForTimeout(400);
const form = p.locator('.fixed.inset-0').last();
d.bekle(await form.getByLabel('Giriş saati').count() === 1, 'formda giriş saati alanı var');
d.bekle(await form.getByLabel('Çıkış saati').count() === 1, 'formda çıkış saati alanı var');
d.bekle(await form.getByLabel('Giriş saati').inputValue() === '14:00', 'giriş saati standart 14:00 ile açılıyor');
d.bekle(await form.getByLabel('Çıkış saati').inputValue() === '12:00', 'çıkış saati standart 12:00 ile açılıyor');

await form.getByLabel(/Adı Soyadı/).first().fill('SAAT DENEMESİ');
await tarihYaz(form.getByLabel(/Geliş Tarihi/), await trTarih(p, 6));
await tarihYaz(form.getByLabel(/Çıkış Tarihi/), await trTarih(p, 8));
await form.getByLabel('Giriş saati').fill('09:30');
await form.getByLabel('Çıkış saati').fill('17:00');
await form.getByLabel('Erken giriş').check();
await form.getByLabel('Geç çıkış').check();
await form.locator('input[placeholder="Ad Soyad"]').first().fill('SAAT MİSAFİRİ');
await form.locator('input[placeholder="11 hane"]').first().fill('19876543210');
await p.waitForTimeout(300);
await form.getByRole('button', { name: 'Kaydet', exact: true }).click();
await p.waitForTimeout(900);

await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill('SAAT DENEMESİ');
await p.waitForTimeout(500);
await veriSatirlari(p).first().click();
await p.waitForTimeout(400);
g = await govde(p);
d.bekle(/09:30/.test(g), 'kaydedilen giriş saati detay panelinde görünüyor', g.match(/Geliş.{0,40}/)?.[0]);
d.bekle(/17:00/.test(g), 'kaydedilen çıkış saati detay panelinde görünüyor');

await b.close();
d.bitir();
