/* Kullanım rehberi — dört rolle erişim ve «rolünüze kapalı» rozetleri */
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
for (const [kod, sifre, rol] of [['MSF1001','1234','Müdür'],['MSF2001','1234','Resepsiyon'],['MSF3001','1234','Muhasebe'],['2697','123','Admin(test)']]) {
  const p = await b.newPage({ viewport: { width: 1366, height: 850 } });
  p.on('pageerror', e => hata.push(`${kod}: ${e.message}`));
  await p.goto(url);
  await p.locator('input[placeholder="Örn. TTK7719"]').fill(kod);
  await p.locator('input[type=password]').fill(sifre);
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
  await p.waitForSelector('nav');
  const d = p.locator('header').getByRole('button', { name: /Rehber/ });
  if (!(await d.count())) { hata.push(`${kod}: Rehber düğmesi yok`); await p.close(); continue; }
  await d.click(); await p.waitForTimeout(300);
  const t = await p.locator('main').innerText();
  if (!t.includes('Kullanım Rehberi')) hata.push(`${kod}: rehber açılmadı`);
  // rolüne kapalı başlık rozeti doğru mu
  for (const [bas, kapali] of [['Yeni rezervasyon kaydı', kod === 'MSF3001'],
                               ['Kapora / peşinat alındığında', kod === 'MSF2001'],
                               ['Oda ve yatak yerleştirmesi', kod === 'MSF3001']]) {
    await p.getByRole('button', { name: new RegExp(bas) }).first().click();
    await p.waitForTimeout(150);
    const rozet = await p.locator('main span.inline-flex').filter({ hasText: /^rolünüze kapalı$/ }).count();
    if (kapali && !rozet) hata.push(`${kod}/${bas}: «rolünüze kapalı» rozeti bekleniyordu`);
    if (!kapali && rozet) hata.push(`${kod}/${bas}: rozet olmamalıydı`);
  }
  const tasma = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (tasma > 2) hata.push(`${kod}: rehberde yatay taşma ${tasma}px`);
  await p.screenshot({ path: cikti(`rehber-${kod}.png`) });
  await p.close();
}
await b.close();
console.log(hata.length ? 'HATA:\n' + hata.join('\n') : 'ROL TESTLERİ GEÇTİ');
