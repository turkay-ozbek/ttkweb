/* Mobil arayüz — 390 px'te (telefon) bütün sayfalar ve yeni kayıt akışı */
import { defter, tarayici, giris, sayfa, govde, HESAP, SAYFALAR, tasma,
         yeniKayit, kaydet, taleplerdeAra, formTc, formAd } from './ortak.mjs';

import fs from 'fs';
const cikti = (ad) => new URL('./cikti/' + ad, import.meta.url).pathname;
fs.mkdirSync(new URL('./cikti/', import.meta.url).pathname, { recursive: true });

const d = defter('12 — Mobil arayüz');
const { b, p } = await tarayici(d, { genislik: 390, yukseklik: 844 });
const TUM_SAYFALAR = [...SAYFALAR, 'Kahvaltı', 'Ay Sonu'];

try {
  await giris(p, HESAP.mudur);
  d.bekle(await tasma(p) <= 2, 'giriş sonrası ana menüde yatay taşma yok');

  /* Her sayfa telefonda taşmamalı */
  for (const sf of TUM_SAYFALAR) {
    const dugme = p.locator('nav').getByRole('button', { name: sf, exact: true });
    if (!(await dugme.count())) continue;
    await dugme.click(); await p.waitForTimeout(300);
    const t = await tasma(p);
    d.bekle(t <= 2, `${sf}: telefonda yatay taşma yok`, `${t} px`);
  }

  /* Geniş tablo sayfayı değil kendi kutusunu kaydırmalı */
  await sayfa(p, 'Yatak Listesi');
  const kaydirabilir = await p.evaluate(() => {
    const t = document.querySelector('main table.veri');
    if (!t) return false;
    let el = t.parentElement;
    while (el && el !== document.body) {
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible') return true;
      el = el.parentElement;
    }
    return false;
  });
  d.bekle(kaydirabilir, 'geniş tablo kendi kutusunda yatay kayıyor');

  /* Yeni kayıt formu telefonda tek sütun ve taşmasız */
  await sayfa(p, 'Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(600);
  d.bekle(await tasma(p) <= 2, 'yeni kayıt formu telefonda taşmıyor', `${await tasma(p)} px`);
  const sutun = await p.evaluate(() => {
    const sol = document.querySelector('.fixed.inset-0 .col-span-12');
    return sol ? Math.round(sol.getBoundingClientRect().width) : 0;
  });
  d.bekle(sutun > 300, `form sütunu tam genişlikte (${sutun} px) — tek sütuna düştü`);

  /* Sayısal alanlar telefonda rakam klavyesi açmalı */
  const tcKipi = await formTc(p).first().getAttribute('inputmode');
  d.bekle(tcKipi === 'numeric', 'Tc kimlik alanı rakam klavyesi açıyor (inputmode=numeric)', String(tcKipi));
  const telKipi = await p.locator('.fixed.inset-0 input[aria-label="Telefon no"]').getAttribute('inputmode');
  d.bekle(telKipi === 'numeric', 'telefon alanı rakam klavyesi açıyor', String(telKipi));

  /* Telefondan uçtan uca kayıt açma */
  await p.getByRole('button', { name: 'Vazgeç', exact: true }).click(); await p.waitForTimeout(400);
  const f = await yeniKayit(p, { ad: 'MOBIL KAYIT', ekGun: 9, gece: 2 });
  await p.locator('.fixed.inset-0 input[aria-label="Telefon no"]').fill('5551234567');
  await p.waitForTimeout(300);
  d.bekle(!(await f.kaydet.isDisabled()), 'telefonda form doldurulabiliyor');
  await kaydet(p, f);
  const satir = await taleplerdeAra(p, 'MOBIL KAYIT');
  d.bekle(await satir.count() === 1, 'telefondan açılan kayıt listeye düştü');

  /* Dokunma hedefleri yeterince büyük olmalı */
  const kucukDugme = await p.evaluate(() => {
    const kucukler = [...document.querySelectorAll('nav button, main button')]
      .map(el => ({ ad: (el.innerText || el.ariaLabel || '').slice(0, 24), r: el.getBoundingClientRect() }))
      .filter(x => x.r.width > 0 && x.r.height > 0 && x.r.height < 26);
    return kucukler.slice(0, 3).map(x => `${x.ad} (${Math.round(x.r.height)}px)`);
  });
  d.bekle(kucukDugme.length === 0, 'dokunma hedefleri yeterince yüksek', kucukDugme.join(' · '));

  /* Yardımcı telefonda ekranı taşırmamalı */
  await p.locator('button[aria-label="Yardımcıyı aç"]').click(); await p.waitForTimeout(500);
  d.bekle(await tasma(p) <= 2, 'yardımcı açıkken telefonda taşma yok');
  const panel = await p.locator('[role=dialog][aria-label="Yardımcı bot"]').boundingBox();
  d.bekle(panel.x >= 0 && panel.x + panel.width <= 392, 'yardımcı penceresi ekran içinde kalıyor',
    `${Math.round(panel.x)} – ${Math.round(panel.x + panel.width)}`);
  await p.screenshot({ path: cikti('mobil-yardimci.png') });
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
