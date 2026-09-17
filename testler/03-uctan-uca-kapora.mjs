/* Uçtan uca: kayıt açma → kapora engeli → dekont → müdür onayı → yerleştirme → tahsilat → gün ilerletme */
import { chromium } from 'playwright';
import fs from 'fs';
/* Hedef dosya: varsayılan olarak depo kökündeki prototip. CDN erişimi olmayan
   ortamlarda yerel kopya için:  HEDEF=/yol/test.html node <dosya>.mjs           */
const hedef = process.env.HEDEF || new URL('../misafirhane-prototip.html', import.meta.url).pathname;
const url = 'file://' + hedef;
/* Test çıktıları (ekran görüntüsü, üretilen dosyalar) bu dizinin altına yazılır. */
const cikti = (ad) => new URL('./cikti/' + ad, import.meta.url).pathname;
fs.mkdirSync(new URL('./cikti/', import.meta.url).pathname, { recursive: true });
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const hata = [], adim = [];
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } });
p.on('pageerror', e => hata.push('JS hatası: ' + e.message));
p.on('console', m => { if (m.type() === 'error') hata.push('console: ' + m.text()); });
const ok = (s) => adim.push('  ✓ ' + s);
const girisFormu = async (kod, sifre) => {
  await p.locator('input[placeholder="Örn. TTK7719"]').fill(kod);
  await p.locator('input[type=password]').fill(sifre);
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
  await p.waitForSelector('nav', { timeout: 15000 });
};
/* Rol değiştirirken sayfa YENİLENMEZ: veriler bellekte, yenileme her şeyi sıfırlar. */
const rolDegistir = async (kod, sifre) => {
  await p.locator('header button[aria-label="Oturumu kapat"]').click();
  await p.waitForTimeout(400);
  await girisFormu(kod, sifre);
};
const giris = async (kod, sifre) => {
  await p.goto(url);
  await p.locator('input[placeholder="Örn. TTK7719"]').fill(kod);
  await p.locator('input[type=password]').fill(sifre);
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
  await p.waitForSelector('nav', { timeout: 15000 });
};
const sayfa = async (ad) => { await p.locator('nav').getByRole('button', { name: ad, exact: true }).click(); await p.waitForTimeout(400); };
const govde = () => p.locator('main').innerText();

/* ══ 1) Resepsiyon yeni kayıt açıyor (kapora doğuyor) ═════════════ */
await giris('MSF2001', '1234');
await sayfa('Talepler');
await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
await p.waitForTimeout(400);
await p.getByLabel(/Adı Soyadı/).fill('TEST MISAFIR BIR');
/* Tarih alanları GG.AA.YYYY metin kutusu; Enter ile uygulanır. */
const trTarih = async (ekGun) => p.evaluate((n) => { const d=new Date(); const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()+n));
  return String(x.getUTCDate()).padStart(2,'0')+'.'+String(x.getUTCMonth()+1).padStart(2,'0')+'.'+x.getUTCFullYear(); }, ekGun);
const gelisTr = await trTarih(10), cikisTr = await trTarih(13);
await p.getByLabel(/Geliş Tarihi/).fill(gelisTr);
await p.getByLabel(/Geliş Tarihi/).press('Enter');
await p.waitForTimeout(200);
await p.getByLabel(/Çıkış Tarihi/).fill(cikisTr);
await p.getByLabel(/Çıkış Tarihi/).press('Enter');
await p.getByLabel(/Kurum-Şahıs/).selectOption('SAHIS');   // kapora doğsun
await p.waitForTimeout(300);
// misafir satırı
const tc = p.getByPlaceholder(/11 hane|Tc/i).first();
if (await tc.count()) await tc.fill('12345678901');
const misafirAd = p.locator('input[placeholder*="Ad Soyad"], input[placeholder*="Adı Soyadı"]');
if (await misafirAd.count()) await misafirAd.first().fill('TEST MISAFIR BIR');
const altBilgi = await p.locator('.fixed').last().innerText();
if (!/Kapora|Peşinat/i.test(altBilgi)) hata.push('1: formda kapora bilgisi görünmüyor');
const kaydet = p.getByRole('button', { name: 'Kaydet', exact: true });
if (await kaydet.isDisabled()) {
  hata.push('1: Kaydet pasif — eksik alan var: ' + (altBilgi.match(/\d+ eksik\/hatalı alan/) || ['?'])[0]);
} else {
  await kaydet.click(); await p.waitForTimeout(600);
  const t = await govde();
  if (!t.includes('TEST MISAFIR BIR')) hata.push('1: kayıt listede görünmedi');
  else ok('yeni kayıt açıldı ve talep listesine düştü');
}

/* ══ 2) Kapora ödenmeden yerleştirme engelleniyor mu? ═════════════ */
await p.locator('table tbody tr', { hasText: 'TEST MISAFIR BIR' }).first().click().catch(()=>{});
await p.waitForTimeout(400);
let panel = await govde();
if (/Kapora/.test(panel)) ok('seçili kayıtta kapora şeridi görünüyor');
const otoD = p.getByRole('button', { name: /Otomatik Yerleştir/ }).first();
if (await otoD.count() && !(await otoD.isDisabled())) {
  await otoD.click(); await p.waitForTimeout(600);
  const t = await p.locator('body').innerText();
  if (/onaylanmadan yatak tahsis edilemez|müdür onayında/i.test(t)) ok('kapora onayı olmadan yerleştirme reddedildi (gerekçeli)');
  else hata.push('2: kapora onayı olmadan yerleştirme engellenmedi');
  const kapatD = p.getByRole('button', { name: /^Kapat$|Vazgeç/ }).first();
  if (await kapatD.count()) await kapatD.click();
  await p.waitForTimeout(300);
}

/* ══ 3) Dekont yükleme (resepsiyon) ══════════════════════════════ */
await sayfa('Talepler');
await p.locator('table tbody tr', { hasText: 'TEST MISAFIR BIR' }).first().click();
await p.waitForTimeout(400);
const yukleD = p.getByRole('button', { name: /Dekont Yükle/ }).first();
if (await yukleD.count()) {
  await yukleD.click(); await p.waitForTimeout(400);
  const ornek = p.getByRole('button', { name: /Örnek dekont üret/ });
  if (await ornek.count()) { await ornek.click(); await p.waitForTimeout(600); }
  const gonderD = p.getByRole('button', { name: /Onaya Gönder/ });
  if (await gonderD.count() && !(await gonderD.isDisabled())) {
    await gonderD.click(); await p.waitForTimeout(600);
    ok('dekont yüklendi ve onaya gönderildi');
  } else hata.push('3: «Onaya Gönder» düğmesi pasif/yok');
} else hata.push('3: «Dekont Yükle» düğmesi yok');

/* ══ 4) Resepsiyon dekont onaylayamıyor ══════════════════════════ */
await sayfa('Dekont/Onay');
const t4 = await govde();
if (/onay yetkiniz yok/i.test(t4)) ok('resepsiyonda onay yetkisi kapalı uyarısı var');
else hata.push('4: resepsiyona onay yetkisi kapalı uyarısı gösterilmedi');

/* ══ 5) Müdür dekontu onaylıyor ══════════════════════════════════ */
await rolDegistir('MSF1001', '1234');
await sayfa('Dekont/Onay');
await p.waitForTimeout(400);
const satir = p.locator('button, tr').filter({ hasText: 'TEST MISAFIR BIR' }).first();
if (await satir.count()) {
  await satir.click(); await p.waitForTimeout(500);
  const onayD = p.getByRole('button', { name: /Onayla ve Rezervasyon Listesine Al/ });
  if (await onayD.count()) {
    await onayD.click(); await p.waitForTimeout(600);
    ok('müdür dekontu onayladı');
  } else hata.push('5: onay düğmesi bulunamadı');
} else hata.push('5: onay kuyruğunda test kaydı yok');

/* ══ 6) Onay sonrası otomatik yerleştirme ════════════════════════ */
await sayfa('Talepler');
await p.waitForTimeout(400);
const bekleyenListe = await p.locator('table tbody tr', { hasText: 'TEST MISAFIR BIR' }).count();
if (!bekleyenListe) hata.push('6a: onaylanmış ama yatağı olmayan kayıt «Bekleyen işler» listesinde görünmüyor');
else ok('onay sonrası kayıt «Bekleyen işler» listesinde kaldı');
await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill('TEST MISAFIR BIR');
await p.waitForTimeout(400);
const satir6 = p.locator('table tbody tr', { hasText: 'TEST MISAFIR BIR' }).first();
if (!(await satir6.count())) {
  const gd = await govde();
  const i = gd.indexOf('TEST');
  console.log('--- TEST kaydı sayfada mı? ---', i >= 0 ? gd.slice(Math.max(0,i-200), i+200) : 'YOK');
  console.log('--- satır sayısı:', await p.locator('table tbody tr').count());
}
if (await satir6.count()) {
  await satir6.click(); await p.waitForTimeout(400);
  const oto = p.getByRole('button', { name: /Otomatik Yerleştir/ }).first();
  await oto.click(); await p.waitForTimeout(700);
  const onayla = p.getByRole('button', { name: /Öneriyi Uygula|Onayla|Uygula/ }).first();
  if (await onayla.count()) { await onayla.click(); await p.waitForTimeout(600); ok('otomatik yerleştirme önerisi onaylandı'); }
  else hata.push('6: yerleştirme öneri penceresinde onay düğmesi yok');
} else hata.push('6: talep listesinde kayıt yok');

/* ══ 7) Yatak listesinde misafir görünüyor mu ════════════════════ */
await sayfa('Yatak Listesi');
await p.waitForTimeout(400);
// liste bugünü gösterir; konaklama 10 gün sonra başlıyor, tarihi ileri alalım
const tarihKutu = p.getByPlaceholder('GG.AA.YYYY').first();
await tarihKutu.fill(gelisTr); await tarihKutu.press('Enter'); await p.waitForTimeout(400);
const ara = p.getByPlaceholder(/ara|Ad/i).first();
if (await ara.count()) { await ara.fill('TEST MISAFIR'); await p.waitForTimeout(400); }
if ((await govde()).includes('TEST MISAFIR BIR')) ok('misafir yatak listesinde görünüyor');
else hata.push('7: yerleştirilen misafir yatak listesinde yok');

/* ══ 8) Muhasebe tahsilat giriyor ════════════════════════════════ */
await rolDegistir('MSF3001', '1234');
await sayfa('Tahsilat');
await p.getByRole('button', { name: 'Tüm dönem' }).click(); await p.waitForTimeout(300);
const ara8 = p.getByPlaceholder(/Ad soyad/).first();
await ara8.fill('TEST MISAFIR BIR'); await p.waitForTimeout(500);
const t8 = await govde();
if (!t8.includes('TEST MISAFIR BIR')) hata.push('8: kayıt tahsilat listesinde bulunamadı');
else ok('kayıt tahsilat listesinde bulundu');
const tahD = p.getByRole('button', { name: /Tahsilat Al/ }).first();
if (await tahD.count() && !(await tahD.isDisabled())) {
  await tahD.click(); await p.waitForTimeout(400);
  const mkb = p.getByLabel(/Makbuz No/);
  if (await mkb.count()) await mkb.fill('9911');
  const kaydetD = p.getByRole('button', { name: /Tahsilatı Kaydet|Kaydet/ }).last();
  await kaydetD.click(); await p.waitForTimeout(600);
  ok('muhasebe tahsilat girdi');
} else adim.push('  – tahsilat düğmesi yok (kapora zaten kapanmış olabilir)');

/* ══ 9) Muhasebe yerleştirme yapamıyor ═══════════════════════════ */
await sayfa('Talepler');
await p.waitForTimeout(400);
const oto9 = p.getByRole('button', { name: /Otomatik Yerleştir/ }).first();
if (await oto9.count() && await oto9.isDisabled()) ok('muhasebede yerleştirme düğmeleri pasif');
else if (await oto9.count()) hata.push('9: muhasebe yerleştirme yapabiliyor');

/* ══ 10) Yetkisiz sayfa gizli mi ═════════════════════════════════ */
const nav10 = await p.locator('nav').innerText();
if (nav10.includes('Kullanıcılar')) hata.push('10: muhasebe kullanıcı yönetimini görüyor');
else ok('muhasebeye kapalı sayfa menüde yok');

/* ══ 11) Tesis kapsamı ═══════════════════════════════════════════ */
await rolDegistir('MSF2002', '1234');
const ust11 = await p.locator('header > div').first().innerText();
if (!ust11.includes('Yayla Konağı Bilgi Sistemi')) hata.push('11: tek tesisli kullanıcının başlığı yanlış: ' + ust11.replace(/\n/g,' | '));
else ok('tek tesisli kullanıcı yalnız kendi misafirhanesini görüyor');
const menu11 = await govde();
if (menu11.includes('Ankara Misafirhanesi')) hata.push('11: yetkisiz misafirhane görünüyor');

/* ══ 12) Sistem tarihi ilerletme + otomatik iptal ════════════════ */
await rolDegistir('TTK7719', '7719');
await sayfa('Özet');
const oncekiKayit = await p.locator('footer').innerText();
await p.getByRole('button', { name: '+7 gün' }).click(); await p.waitForTimeout(700);
await p.getByRole('button', { name: '+7 gün' }).click(); await p.waitForTimeout(700);
const sonra = await p.locator('footer').innerText();
if (oncekiKayit === sonra) hata.push('12: gün ilerletme çalışmadı');
else ok('sistem tarihi ilerletildi, otomatik statü değişiklikleri işledi');

await p.screenshot({ path: cikti('e2e-son.png') });
await b.close();
console.log(adim.join('\n'));
console.log(hata.length ? '\nHATA:\n' + hata.join('\n') : '\nUÇTAN UCA SENARYO GEÇTİ');
