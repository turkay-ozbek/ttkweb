/* Test planı bölüm 17 — konaklama uzatma, nakil (oda değişikliği), grup/blok
   kaydı, bekleme listesi ve misafir kartı. Hepsi resepsiyonun gün içinde en sık
   yaptığı değişikliklerdir; kayıt geçmişine yazılmaları ayrıca denetlenir. */
import { defter, tarayici, giris, HESAP, sayfa, govde, veriSatirlari, trTarih, tarihYaz } from './ortak.mjs';

const d = defter('17 — Uzatma, nakil, grup kaydı ve misafir kartı');
const { b, p } = await tarayici(d);
await giris(p, HESAP.admin);

/* Yerleşik bir misafir bul — uzatma ve nakil bunun üzerinden denenecek */
await sayfa(p, 'Yatak Listesi');
await p.waitForTimeout(400);
const doluSatir = veriSatirlari(p).filter({ hasNot: p.locator('text=— boş —') }).first();
const misafirAdi = (await doluSatir.locator('td').nth(5).innerText()).trim().split('\n')[0];

const kaydiAc = async (ad) => {
  await sayfa(p, 'Talepler');
  await p.locator('main select').first().selectOption('HEPSI');
  await p.getByPlaceholder(/Ad soyad/).first().fill(ad);
  await p.waitForTimeout(500);
  await veriSatirlari(p).first().click();
  await p.waitForTimeout(400);
};

/* ═══ 1) Konaklamayı uzatma ═══ */
await kaydiAc(misafirAdi);
let g = await govde(p);
const eskiCikis = (g.match(/–\s*(\d\d\.\d\d\.\d{4})/) || [])[1];
d.bekle(/Uzat/.test(g), 'detay panelinde «Uzat» düğmesi var');
await p.getByRole('button', { name: /Uzat/ }).click();
await p.waitForTimeout(500);
let pencere = p.locator('.fixed.inset-0').last();
let pm = await pencere.innerText();
d.bekle(/Konaklamayı Uzat/.test(pm), 'uzatma penceresi açıldı', pm.slice(0, 90));
d.bekle(/aynı yatakta kalabilir|yeni gecelerde dolu/.test(pm),
  'her misafir için yeni gecelerde yatak uygunluğu denetleniyor');
const uzatKaydet = pencere.getByRole('button', { name: 'Uzatmayı Kaydet' });
if (await uzatKaydet.isEnabled()) {
  await uzatKaydet.click();
  await p.waitForTimeout(800);
  g = await govde(p);
  const yeniCikis = (g.match(/–\s*(\d\d\.\d\d\.\d{4})/) || [])[1];
  d.bekle(yeniCikis && yeniCikis !== eskiCikis, 'çıkış tarihi ileri alındı', `${eskiCikis} → ${yeniCikis}`);
  d.bekle(/uzatıldı|Uzatma/i.test(await p.locator('footer').innerText()),
    'uzatma işlem günlüğüne yazıldı', await p.locator('footer').innerText());
} else {
  d.bekle(/yeni gecelerde dolu/.test(pm),
    'yatak yeni gecelerde doluysa uzatma kilitli ve gerekçesi yazıyor');
  await pencere.getByRole('button', { name: 'Vazgeç' }).click();
  await p.waitForTimeout(300);
}

/* ═══ 2) Nakil ═══ */
await kaydiAc(misafirAdi);
g = await govde(p);
const eskiOda = (g.match(/Oda (\d+) \/ Yatak/) || [])[1];
await p.getByRole('button', { name: /Nakil/ }).click();
await p.waitForTimeout(500);
pencere = p.locator('.fixed.inset-0').last();
d.bekle(/Nakil \(Oda Değişikliği\)/.test(await pencere.innerText()), 'nakil penceresi açıldı');
const hedefSecim = pencere.locator('select').nth(1);
const secenek = await hedefSecim.locator('option').count();
d.bekle(secenek > 1, 'kalan gecelerde boş yataklar listelendi', (secenek - 1) + ' yatak');
const deger = await hedefSecim.locator('option').nth(1).getAttribute('value');
await hedefSecim.selectOption(deger);
await pencere.locator('input[placeholder*="oda arızası"]').fill('Misafir talebi — üst kat');
await p.waitForTimeout(250);
await pencere.getByRole('button', { name: 'Nakli Kaydet' }).click();
await p.waitForTimeout(900);
g = await govde(p);
const yeniOda = (g.match(/Oda (\d+) \/ Yatak/) || [])[1];
d.bekle(yeniOda && yeniOda !== eskiOda, 'misafir yeni odaya nakledildi', `Oda ${eskiOda} → Oda ${yeniOda}`);
d.bekle(/nakledildi|Nakil/i.test(await p.locator('footer').innerText()), 'nakil işlem günlüğüne yazıldı');

/* ═══ 3) Grup / blok kaydı ═══ */
await sayfa(p, 'Talepler');
await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
await p.waitForTimeout(400);
let form = p.locator('.fixed.inset-0').last();
await form.getByLabel(/Adı Soyadı/).first().fill('EĞİTİM GRUBU');
await tarihYaz(form.getByLabel(/Geliş Tarihi/), await trTarih(p, 12));
await tarihYaz(form.getByLabel(/Çıkış Tarihi/), await trTarih(p, 14));
const kisiArtir = form.locator('label:has-text("Kişi Sayısı") button').nth(1);
for (let i = 0; i < 3; i++) { await kisiArtir.click(); await p.waitForTimeout(120); }
const blokKutu = form.locator('input[aria-label="Grup kaydı"]');
d.bekle(await blokKutu.count() === 1, 'formda «grup / blok kaydı» kutusu var');
await blokKutu.check();
await p.waitForTimeout(300);
const bosAdlar = await form.locator('input[placeholder="sonra bildirilecek"]').count();
d.bekle(bosAdlar === 3, 'ilk misafir dışındaki ad alanları «sonra bildirilecek» olarak işaretlendi',
  bosAdlar + ' satır');
await form.locator('input[placeholder="Ad Soyad"]').first().fill('GRUP SORUMLUSU');
await form.locator('input[placeholder="11 hane"]').first().fill('12345678901');
await p.waitForTimeout(300);
const kaydetD = form.getByRole('button', { name: 'Kaydet', exact: true });
d.bekle(await kaydetD.isEnabled(), 'adların üçü boş olmasına rağmen grup kaydı açılabiliyor');
await kaydetD.click();
await p.waitForTimeout(900);

await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill('EĞİTİM GRUBU');
await p.waitForTimeout(500);
const grupSatiri = veriSatirlari(p).first();
d.bekle(/EĞİTİM GRUBU Grubu/.test(await grupSatiri.innerText()), 'kayıt adı «… Grubu» olarak açıldı',
  await grupSatiri.innerText());
d.bekle(/👥/.test(await grupSatiri.innerText()), 'listede grup işareti görünüyor');
await grupSatiri.click();
await p.waitForTimeout(500);
g = await govde(p);
d.bekle((g.match(/AD BİLDİRİLECEK/g) || []).length === 3, 'üç yatağın adı «bildirilecek» olarak duruyor');
d.bekle(/İsim Bildir/.test(g), '«İsim Bildir» düğmesi var');

await p.getByRole('button', { name: /İsim Bildir/ }).click();
await p.waitForTimeout(500);
pencere = p.locator('.fixed.inset-0').last();
d.bekle(/Grup İsim Bildirimi/.test(await pencere.innerText()), 'isim bildirimi penceresi açıldı');
await pencere.locator('input[placeholder="Adı bildirilince yazın"]').first().fill('AHMET KAYA');
await pencere.locator('input[placeholder="11 hane"]').nth(1).fill('23456789012');
await p.waitForTimeout(300);
await pencere.getByRole('button', { name: /Bildirilen İsimleri Kaydet/ }).click();
await p.waitForTimeout(800);
g = await govde(p);
d.bekle(/AHMET KAYA/.test(g), 'bildirilen isim kayda işlendi');
d.bekle((g.match(/AD BİLDİRİLECEK/g) || []).length === 2, 'kalan isimsiz yatak sayısı ikiye düştü');

/* kısmi serbest bırakma */
await p.getByRole('button', { name: /Yatak Serbest Bırak/ }).click();
await p.waitForTimeout(400);
pencere = p.locator('.fixed.inset-0').last();
d.bekle(/adı henüz bildirilmedi/.test(await pencere.innerText()),
  'serbest bırakma penceresi isimsiz yatak sayısını yazıyor', (await pencere.innerText()).slice(0, 160));
await pencere.getByRole('button', { name: /Yatağı Serbest Bırak/ }).click();
await p.waitForTimeout(900);
g = await govde(p);
d.bekle(/3 kişi/.test(g), 'kişi sayısı dörtten üçe düştü', (g.match(/\d+ kişi/) || [])[0]);
const seritVar = await p.locator('[role="status"]').count();
d.bekle(seritVar > 0, 'serbest bırakma geri alınabiliyor (geri al şeridi çıktı)');

/* ═══ 4) Bekleme listesi ═══ */
g = await govde(p);
d.bekle(/BEKLEME L[Iİ]STES[Iİ]/.test(g), 'Talepler sayfasında bekleme listesi kartı var');
const beklemeDugme = p.getByRole('button', { name: /Bekleme Listesine Al/ }).first();
d.bekle(await beklemeDugme.count() === 1, 'yerleşmemiş kayıt için bekleme listesi düğmesi çıkıyor');
await beklemeDugme.click();
await p.waitForTimeout(400);
pencere = p.locator('.fixed.inset-0').last();
d.bekle(/Bekleme Listesine Al/.test(await pencere.innerText()), 'bekleme penceresi açıldı');
await pencere.locator('input').last().fill('Aynı odada olmaları şart değil');
await pencere.getByRole('button', { name: 'Bekleme Listesine Al', exact: true }).click();
await p.waitForTimeout(800);
g = await govde(p);
d.bekle(/EĞİTİM GRUBU/.test(g) && /Aynı odada olmaları şart değil/.test(g),
  'kayıt notuyla birlikte bekleme listesine düştü');
d.bekle(/yatak boş/.test(g), 'bekleme kartı o tarihlerde boş yatak sayısını yazıyor');
d.bekle(/bekleme listesinde/.test(g), 'kayıt ikinci kez bekleme listesine alınamıyor (rozet gösteriliyor)');
await p.getByRole('button', { name: 'Çıkar' }).first().click();
await p.waitForTimeout(600);
g = await govde(p);
d.bekle(/Bekleme listesi boş/.test(g), '«Çıkar» kaydı bekleme listesinden düşürüyor');

/* ═══ 5) Misafir kartı ═══ */
await sayfa(p, 'Yatak Listesi');
await p.waitForTimeout(500);
const adDugmesi = p.locator('main table tbody tr td:nth-child(6) button').first();
d.bekle(await adDugmesi.count() === 1, 'yatak listesinde misafir adı karta açılıyor');
const kartAdi = (await adDugmesi.innerText()).trim();
await adDugmesi.click();
await p.waitForTimeout(500);
pencere = p.locator('.fixed.inset-0').last();
pm = await pencere.innerText();
d.bekle(/Misafir Kartı/.test(pm), 'misafir kartı açıldı', pm.slice(0, 80));
d.bekle(/KONAKLAMA/.test(pm) && /TOPLAM GECE/.test(pm) && /SIK KALDIĞI ODA/.test(pm) && /TAHS[Iİ]L ED[Iİ]LEN/.test(pm),
  'kartta geçmiş özeti (konaklama, gece, oda, tahsilat) var');
d.bekle(/KONAKLAMA GEÇM[Iİ]Ş[Iİ]/.test(pm), 'kartta konaklama geçmişi tablosu var');
await pencere.locator('input[type="checkbox"]').first().check();
await pencere.locator('input[placeholder*="Oda 21"]').fill('Zemin kat, asansöre yakın');
await pencere.locator('textarea').fill('Sessiz oda tercih ediyor.');
await p.waitForTimeout(300);
await pencere.getByRole('button', { name: /Notları Kaydet/ }).click();
await p.waitForTimeout(800);
d.bekle(/Misafir kartı güncellendi/.test(await p.locator('footer').innerText()),
  'misafir kartı güncellemesi işlem günlüğüne yazıldı', await p.locator('footer').innerText());

await adDugmesi.click();
await p.waitForTimeout(500);
pencere = p.locator('.fixed.inset-0').last();
pm = await pencere.innerText();
d.bekle(/Zemin kat, asansöre yakın/.test(pm) || await pencere.locator('input[placeholder*="Oda 21"]').inputValue() === 'Zemin kat, asansöre yakın',
  'kaydedilen tercih kart yeniden açılınca duruyor');
d.bekle(await pencere.locator('input[type="checkbox"]').first().isChecked(), 'öncelikli misafir işareti korunuyor');
await pencere.getByRole('button', { name: 'Kapat', exact: true }).last().click();
await p.waitForTimeout(400);
const rozetli = await p.locator('main table tbody tr', { hasText: kartAdi }).first().innerText();
d.bekle(/★/.test(rozetli), 'öncelikli misafir listede ★ ile işaretli', rozetli.replace(/\n/g, ' | ').slice(0, 90));

await b.close();
d.bitir();
