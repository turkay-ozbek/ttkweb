/* Arayüz ve rol kapsamı — dört çözünürlükte sayfa başlıkları, taşma, üst bant, misafirhane değiştirme */
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
const hata = [];
const SAYFALAR = ['Özet','Takvim','Odalar','Yatak Listesi','Talepler','Dekont/Onay','Tahsilat','Statü','Kullanıcılar'];

for (const [w, h] of [[1280,800],[1440,900],[1600,1000],[1920,1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => hata.push(`${w}: ${e.message}`));
  p.on('console', m => { if (m.type() === 'error') hata.push(`${w} console: ${m.text()}`); });
  await p.goto(url);
  await p.locator('input[placeholder="Örn. TTK7719"]').fill('TTK7719');
  await p.locator('input[type=password]').fill('7719');
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
  await p.waitForSelector('nav');

  const ust = await p.locator('header > div').first().innerText();
  // 1) üst bar: yalnız DEMO + Rehber; ? yok, kişi simgesi yok, tesis seçici yok
  if (!ust.includes('Rehber')) hata.push(`${w}: üst barda Rehber yok`);
  // «?» bilgi düğmesi kaldırıldı (arama kutusundaki soru cümlesiyle karışmasın diye
  // metin değil, düğmenin erişilebilir adı denetleniyor)
  if (await p.locator('header').getByRole('button', { name: '?', exact: true }).count())
    hata.push(`${w}: «?» düğmesi hâlâ var`);
  if (!ust.includes('Hangi işlemi yapmak istiyorsunuz?')) hata.push(`${w}: üst bantta işlem arama kutusu yok`);
  if (await p.locator('header select').count()) hata.push(`${w}: üst barda misafirhane seçicisi hâlâ var`);
  if (await p.locator('header button[aria-label="Kullanıcı bilgileri"]').count()) hata.push(`${w}: kişi simgesi hâlâ var`);
  if (!(await p.locator('header button[aria-label="Oturumu kapat"]').isVisible())) hata.push(`${w}: çıkış düğmesi yok`);
  // başlık tesise göre
  if (!ust.includes('Ankara Misafirhanesi Bilgi Sistemi')) hata.push(`${w}: üst bar başlığı tesise göre yazmıyor — «${ust.replace(/\n/g,' | ')}»`);

  // 2) sayfa şeridinde ve ana menüde Rehber yok
  const nav = await p.locator('nav').innerText();
  if (nav.includes('Rehber')) hata.push(`${w}: sayfa şeridinde Rehber var`);
  const menu = await p.locator('main').innerText();
  if (menu.includes('Kullanım Rehberi') || menu.includes('YARDIM')) hata.push(`${w}: ana menüde rehber kartı var`);

  // 3) MSFH-W kodu hiçbir yerde görünmüyor
  const govde = await p.locator('body').innerText();
  const kod = govde.match(/MSFH-W\d+/g);
  if (kod) hata.push(`${w}: ekranda form kodu görünüyor: ${[...new Set(kod)].join(', ')}`);

  // 4) alt barda uzun oturum metni yok
  const alt = await p.locator('footer').innerText();
  if (alt.includes('yetkili misafirhane') || alt.includes('Sistem Yöneticisi')) hata.push(`${w}: alt barda uzun oturum metni duruyor`);

  // 5) ana menüde misafirhane seçimi (admin 4 tesis)
  for (const t of ['Yayla Konağı','Ankara Misafirhanesi','Amasra Misafirhanesi','Armutçuk Misafirhanesi'])
    if (!menu.includes(t)) hata.push(`${w}: ana menüde «${t}» seçeneği yok`);

  // 6) sayfa başlıklarında tesis adı
  for (const sf of SAYFALAR) {
    await p.locator('nav').getByRole('button', { name: sf, exact: true }).click();
    await p.waitForTimeout(250);
    const h1 = await p.locator('main h1').first().innerText();
    const tesisliOlmali = sf !== 'Kullanıcılar';
    if (tesisliOlmali && !h1.includes('Ankara Misafirhanesi')) hata.push(`${w}/${sf}: başlıkta tesis adı yok — «${h1}»`);
    if (!tesisliOlmali && h1.includes('Ankara Misafirhanesi')) hata.push(`${w}/${sf}: başlıkta olmaması gereken tesis adı var`);
    const t = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (t > 2) hata.push(`${w}/${sf}: yatay taşma ${t}px`);
  }

  // 7) rehber sağ üstten açılıyor
  await p.locator('header').getByRole('button', { name: /Rehber/ }).click();
  await p.waitForTimeout(300);
  if (!(await p.locator('main').innerText()).includes('Kullanım Rehberi')) hata.push(`${w}: rehber açılmadı`);

  // 8) misafirhane değiştirme ana menüden çalışıyor
  await p.locator('nav').getByRole('button', { name: 'Ana Menü', exact: true }).click();
  await p.waitForTimeout(200);
  await p.locator('main').getByRole('button', { name: 'Yayla Konağı', exact: true }).click();
  await p.waitForTimeout(300);
  const ust2 = await p.locator('header > div').first().innerText();
  if (!ust2.includes('Yayla Konağı Bilgi Sistemi')) hata.push(`${w}: tesis değişince başlık güncellenmedi`);
  await p.locator('nav').getByRole('button', { name: 'Odalar', exact: true }).click();
  await p.waitForTimeout(300);
  const h1 = await p.locator('main h1').first().innerText();
  if (!h1.includes('Yayla Konağı')) hata.push(`${w}: sayfa başlığı tesis değişikliğini yansıtmadı — «${h1}»`);

  if (w === 1600) { await p.locator('nav').getByRole('button', { name: 'Ana Menü', exact: true }).click(); await p.waitForTimeout(300); await p.screenshot({ path: cikti('v23-menu.png') }); }
  await p.close();
}

// tek tesisli kullanıcı: ana menüde seçici çıkmasın, başlık kendi tesisi olsun
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => hata.push(`MSF2002: ${e.message}`));
  await p.goto(url);
  await p.locator('input[placeholder="Örn. TTK7719"]').fill('MSF2002');
  await p.locator('input[type=password]').fill('1234');
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
  await p.waitForSelector('nav');
  const ust = await p.locator('header > div').first().innerText();
  if (!ust.includes('Yayla Konağı Bilgi Sistemi')) hata.push(`MSF2002: başlık «${ust.replace(/\n/g,' | ')}»`);
  const menu = await p.locator('main').innerText();
  if (menu.includes('MİSAFİRHANE') || menu.includes('Misafirhane\n')) hata.push('MSF2002: tek tesisli kullanıcıda seçici görünüyor');
  await p.screenshot({ path: cikti('v23-tekTesis.png') });
  await p.close();
}
await b.close();
console.log(hata.length ? 'HATA:\n' + hata.join('\n') : 'TÜM TESTLER GEÇTİ');
