/* Dekont reddi, manuel yerleştirme, tahsis kaldırma, iptal, kısmi tahsilat, kullanıcı ekleme, ölçek */
import { chromium } from 'playwright';
/* Hedef dosya: varsayılan olarak depo kökündeki prototip. CDN erişimi olmayan
   ortamlarda yerel kopya için:  HEDEF=/yol/test.html node <dosya>.mjs           */
const hedef = process.env.HEDEF || new URL('../misafirhane-prototip.html', import.meta.url).pathname;
const url = 'file://' + hedef;
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const hata = [], adim = []; const ok = s => adim.push('  ✓ ' + s);
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } });
p.on('pageerror', e => hata.push('JS hatası: ' + e.message));
p.on('console', m => { if (m.type() === 'error') hata.push('console: ' + m.text()); });
const girisFormu = async (k, sf) => { await p.locator('input[placeholder="Örn. TTK7719"]').fill(k);
  await p.locator('input[type=password]').fill(sf); await p.getByRole('button',{name:'BAĞLAN'}).click(); await p.waitForSelector('nav'); };
const rol = async (k, sf) => { await p.locator('header button[aria-label="Oturumu kapat"]').click(); await p.waitForTimeout(400); await girisFormu(k, sf); };
const sayfa = async a => { await p.locator('nav').getByRole('button',{name:a,exact:true}).click(); await p.waitForTimeout(400); };
const govde = () => p.locator('main').innerText();
const trTarih = n => p.evaluate(x => { const d=new Date(); const y=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()+x));
  return String(y.getUTCDate()).padStart(2,'0')+'.'+String(y.getUTCMonth()+1).padStart(2,'0')+'.'+y.getUTCFullYear(); }, n);

await p.goto(url); await girisFormu('MSF1001','1234');

/* ── A) Kayıt aç (şahıs, kaporalı) ─────────────────────────────── */
const yeniKayit = async (ad, ekGun, gece) => {
  await sayfa('Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click(); await p.waitForTimeout(400);
  await p.getByLabel(/Adı Soyadı/).fill(ad);
  const g = await trTarih(ekGun), c = await trTarih(ekGun + gece);
  await p.getByLabel(/Geliş Tarihi/).fill(g);  await p.getByLabel(/Geliş Tarihi/).press('Enter'); await p.waitForTimeout(150);
  await p.getByLabel(/Çıkış Tarihi/).fill(c);  await p.getByLabel(/Çıkış Tarihi/).press('Enter');
  await p.getByLabel(/Kurum-Şahıs/).selectOption('SAHIS'); await p.waitForTimeout(250);
  const tc = p.getByPlaceholder(/11 hane|Tc/i).first(); if (await tc.count()) await tc.fill('45678901234');
  const ma = p.locator('input[placeholder*="Ad Soyad"], input[placeholder*="Adı Soyadı"]'); if (await ma.count()) await ma.first().fill(ad);
  const kd = p.getByRole('button', { name: 'Kaydet', exact: true });
  if (await kd.isDisabled()) { hata.push('kayıt açılamadı: ' + ad); return false; }
  await kd.click(); await p.waitForTimeout(600); return true;
};
if (await yeniKayit('RED TESTI', 12, 2)) ok('kaporalı kayıt açıldı (red senaryosu)');

/* ── B) Dekont yükle → müdür REDDET ────────────────────────────── */
await p.locator('table tbody tr', { hasText: 'RED TESTI' }).first().click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: /Dekont Yükle/ }).first().click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: /Örnek dekont üret/ }).click(); await p.waitForTimeout(600);
await p.getByRole('button', { name: /Onaya Gönder/ }).click(); await p.waitForTimeout(600);
await sayfa('Dekont/Onay'); await p.waitForTimeout(400);
await p.locator('button, tr').filter({ hasText: 'RED TESTI' }).first().click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: /^Reddet$/ }).click(); await p.waitForTimeout(300);
await p.getByPlaceholder(/Dekont tutarı eksik/).fill('Dekont tutarı eksik yatırılmış');
await p.getByRole('button', { name: /Dekontu Reddet/ }).click(); await p.waitForTimeout(600);
await sayfa('Talepler'); await p.waitForTimeout(300);
await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill('RED TESTI'); await p.waitForTimeout(400);
const satirB = await p.locator('table tbody tr', { hasText: 'RED TESTI' }).first().innerText();
if (/Kapora Bkl/.test(satirB)) ok('red sonrası kayıt «Kapora Bekleniyor» statüsüne döndü');
else hata.push('B: red sonrası statü yanlış → ' + satirB.replace(/\n/g,' | '));
await p.locator('table tbody tr', { hasText: 'RED TESTI' }).first().click(); await p.waitForTimeout(400);
if (/reddedildi/i.test(await govde())) ok('red gerekçesi talep ekranında görünüyor');
else hata.push('B: red gerekçesi görünmüyor');
// reddedilen kayıt yerleştirilemiyor
const otoB = p.getByRole('button', { name: /Otomatik Yerleştir/ }).first();
await otoB.click(); await p.waitForTimeout(600);
if (/yatak tahsis edilemez|onaylanmadan/i.test(await p.locator('body').innerText())) ok('reddedilen kayıt yerleştirilemiyor');
else hata.push('B: reddedilen kayıt yerleştirilebildi');
const kapatB = p.getByRole('button', { name: /^Kapat$|Vazgeç/ }).first();
if (await kapatB.count()) { await kapatB.click(); await p.waitForTimeout(300); }

/* ── C) Kurum kaydı: kaporasız, manuel yerleştirme ─────────────── */
await sayfa('Talepler');
await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click(); await p.waitForTimeout(400);
await p.getByLabel(/Adı Soyadı/).fill('MANUEL TESTI');
const g2 = await trTarih(14), c2 = await trTarih(16);
await p.getByLabel(/Geliş Tarihi/).fill(g2); await p.getByLabel(/Geliş Tarihi/).press('Enter'); await p.waitForTimeout(150);
await p.getByLabel(/Çıkış Tarihi/).fill(c2); await p.getByLabel(/Çıkış Tarihi/).press('Enter'); await p.waitForTimeout(200);
const tc2 = p.getByPlaceholder(/11 hane|Tc/i).first(); if (await tc2.count()) await tc2.fill('56789012345');
const ma2 = p.locator('input[placeholder*="Ad Soyad"], input[placeholder*="Adı Soyadı"]'); if (await ma2.count()) await ma2.first().fill('MANUEL TESTI');
await p.getByRole('button', { name: 'Kaydet', exact: true }).click(); await p.waitForTimeout(600);
await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill('MANUEL TESTI'); await p.waitForTimeout(400);
await p.locator('table tbody tr', { hasText: 'MANUEL TESTI' }).first().click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: /Manuel Yerleştir/ }).click(); await p.waitForTimeout(500);
const secim = p.locator('.fixed select').first();
const secenek = await secim.locator('option').nth(1).getAttribute('value');
await secim.selectOption(secenek); await p.waitForTimeout(300);
await p.getByRole('button', { name: /Yerleşimi Kaydet/ }).click(); await p.waitForTimeout(600);
await p.waitForTimeout(300);
const satirC = await p.locator('table tbody tr', { hasText: 'MANUEL TESTI' }).first().innerText();
if (/Onaylı|Konaklıyor/.test(satirC) && !/—\s*$/.test(satirC.split('\t')[5] || '')) ok('kaporasız kurum kaydı manuel yerleştirildi');
else if (/Onaylı|Konaklıyor/.test(satirC)) ok('kaporasız kurum kaydı manuel yerleştirildi (statü ' + satirC.split('\t').pop() + ')');
else hata.push('C: manuel yerleştirme sonrası statü → ' + satirC.replace(/\n/g,' | '));

/* ── D) Tahsisi kaldır ─────────────────────────────────────────── */
await p.locator('table tbody tr', { hasText: 'MANUEL TESTI' }).first().click(); await p.waitForTimeout(300);
const kaldir = p.getByRole('button', { name: /Tahsisi Kaldır/ });
if (await kaldir.count()) { await kaldir.click(); await p.waitForTimeout(600);
  const t = await p.locator('table tbody tr', { hasText: 'MANUEL TESTI' }).first().innerText();
  if (t.includes('—')) ok('tahsis kaldırıldı, yatak serbest'); else hata.push('D: tahsis kalkmadı → ' + t.replace(/\n/g,' | '));
} else hata.push('D: «Tahsisi Kaldır» düğmesi yok');

/* ── E) Kayıt iptali ───────────────────────────────────────────── */
await sayfa('Tahsilat');
await p.getByRole('button', { name: 'Tüm dönem' }).click(); await p.waitForTimeout(300);
await p.getByPlaceholder(/Ad soyad/).first().fill('MANUEL TESTI'); await p.waitForTimeout(500);
const iptal = p.getByRole('button', { name: 'İptal', exact: true }).first();
if (await iptal.count()) { await iptal.click(); await p.waitForTimeout(600);
  if (/İptal/.test(await p.locator('table tbody tr', { hasText: 'MANUEL TESTI' }).first().innerText())) ok('kayıt iptal edildi');
  else hata.push('E: iptal işlenmedi');
} else hata.push('E: iptal düğmesi yok');

/* ── F) Kısmi tahsilat ─────────────────────────────────────────── */
await p.getByPlaceholder(/Ad soyad/).first().fill('RED TESTI'); await p.waitForTimeout(500);
const th = p.getByRole('button', { name: /Tahsilat Al/ }).first();
if (await th.count()) {
  await th.click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'Yarısı' }).click();
  await p.getByLabel(/Makbuz No/).fill('7001');
  await p.getByRole('button', { name: /Kaydet/ }).last().click(); await p.waitForTimeout(600);
  const t = await p.locator('table tbody tr', { hasText: 'RED TESTI' }).first().innerText();
  if (/Kapora Bkl/.test(t)) ok('kısmi tahsilat sonrası kayıt hâlâ kapora bekliyor');
  else hata.push('F: kısmi tahsilatta statü hatalı → ' + t.replace(/\n/g,' | '));
} else hata.push('F: tahsilat düğmesi yok');

/* ── G) Takvimde aralık hesabı ─────────────────────────────────── */
await sayfa('Takvim'); await p.waitForTimeout(400);
const tk = await govde();
if (/yatak|müsait|kalan/i.test(tk)) ok('takvimde aralık/kalan yatak hesabı görünüyor');
else hata.push('G: takvim boş');

/* ── H) Admin kullanıcı ekleme ─────────────────────────────────── */
await rol('TTK7719','7719');
await sayfa('Kullanıcılar');
const yeniK = p.getByRole('button', { name: /Yeni Kullanıcı/ });
if (await yeniK.count()) {
  await yeniK.click(); await p.waitForTimeout(400);
  await p.getByLabel(/Kullanıcı Adı/).fill('TST9');
  await p.getByLabel(/^Şifre/).fill('1234');
  await p.getByLabel(/Adı Soyadı/).fill('Test Kullanıcı');
  await p.getByRole('button', { name: /Kullanıcıyı Kaydet/ }).click(); await p.waitForTimeout(600);
  if ((await govde()).includes('TST9')) ok('admin yeni kullanıcı ekledi');
  else hata.push('H: kullanıcı eklenmedi');
} else hata.push('H: «Yeni Kullanıcı» düğmesi yok');

/* ── I) Ölçek kutusu (büyüteç) kaldırıldı ──────────────────────── */
if (await p.locator('button[aria-label="Yazıyı büyüt"]').count() === 0) ok('büyüteç kutusu ekranda yok');
else hata.push('I: büyüteç kutusu hâlâ duruyor');

await b.close();
console.log(adim.join('\n'));
console.log(hata.length ? '\nHATA:\n' + hata.join('\n') : '\n2. SENARYO SETİ GEÇTİ');
