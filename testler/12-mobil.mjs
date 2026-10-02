/* Mobil arayüz — 390 px'te (telefon) bütün sayfalar ve yeni kayıt akışı */
import { defter, tarayici, giris, sayfa, sayfaVar, govde, HESAP, SAYFALAR, tasma,
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

  /* Telefonda sayfa şeridi yerine «☰» çekmecesi çıkmalı */
  const seritGorunur = await p.locator('nav').getByRole('button', { name: 'Talepler', exact: true }).isVisible().catch(() => false);
  d.bekle(!seritGorunur, 'telefonda sayfa şeridi gizli — gezinme çekmeceden');
  await p.locator('nav button').first().click(); await p.waitForTimeout(300);
  const cekmece = p.locator('.fixed.inset-0').getByRole('button', { name: /^Rezervasyon Talepleri/ });
  d.bekle(await cekmece.count() === 1, 'sayfa çekmecesi bütün sayfaları listeliyor');
  await p.keyboard.press('Escape');
  await p.locator('.fixed.inset-0 button[aria-label="Kapat"]').click().catch(() => {});
  await p.waitForTimeout(300);

  /* Her sayfa telefonda taşmamalı */
  for (const sf of TUM_SAYFALAR) {
    if (!(await sayfaVar(p, sf))) continue;      /* rolün yetkisi yoksa atla */
    await sayfa(p, sf);
    const t = await tasma(p);
    d.bekle(t <= 2, `${sf}: telefonda yatay taşma yok`, `${t} px`);
  }

  /* Satır işlemi olan listeler telefonda kart görünümüne geçmeli */
  await sayfa(p, 'Talepler'); await p.waitForTimeout(400);
  const kart = await p.evaluate(() => {
    const t = document.querySelector('main table.veri.mobil-kart');
    if (!t) return { yok: true };
    const bas = t.querySelector('thead');
    const hucre = [...t.querySelectorAll('tbody td[data-b]')].find(h => h.getAttribute('data-b'));
    return {
      basGizli: getComputedStyle(bas).display === 'none',
      etiketli: !!hucre && !!hucre.getAttribute('data-b'),
      adUstte: !!t.querySelector('tbody td.kart-baslik'),
    };
  });
  d.bekle(!kart.yok && kart.basGizli, 'telefonda talep listesi tablo değil kart görünümünde');
  d.bekle(kart.etiketli, 'kart hücrelerinde sütun başlığı etiketi var (data-b)');
  d.bekle(kart.adUstte, 'kartın başlığı misafirin adı');

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

  /* Dokunma hedefleri — WCAG 2.5.8 (AA) asgari 24x24 px ister. Eşik önceden
     26 px'ti ve denetim yalnız tek sayfada koşuyordu; 21 px'lik kat hizmetleri
     çipleri hiç ölçülmemişti. Artık bütün sayfalarda koşar. */
  const olcKucuk = (esik) => p.evaluate((e) => {
    const kucukler = [...document.querySelectorAll('nav button, main button, main [role="radio"]')]
      .map(el => ({ ad: (el.innerText || el.ariaLabel || '').replace(/\s+/g, ' ').slice(0, 24),
                    r: el.getBoundingClientRect() }))
      .filter(x => x.r.width > 0 && x.r.height > 0 && (x.r.height < e || x.r.width < e));
    return kucukler.slice(0, 4).map(x => `${x.ad} (${Math.round(x.r.width)}×${Math.round(x.r.height)}px)`);
  }, esik);

  for (const ad of [...TUM_SAYFALAR, 'Kat Hizmetleri']) {
    if (!(await sayfaVar(p, ad))) continue;      /* rolün yetkisi yoksa atla */
    await sayfa(p, ad);
    await p.waitForTimeout(300);
    const kucuk = await olcKucuk(24);
    d.bekle(kucuk.length === 0, `${ad}: dokunma hedefleri 24 px altına düşmüyor`, kucuk.join(' · '));
  }

  /* Kat Hizmetleri sahada tablette, ayakta, çoğu zaman eldivenli elle kullanılır:
     TABLONUN KENDİ denetimleri (durum bölmeleri, görevli seçimi) 44 px olmalı —
     WCAG 2.5.5 (AAA). Üst bant ve gezinme 30 px'tir; AA sınırını (24 px) geçer,
     AAA'ya çıkarmak yoğunluk anahtarı gerektirir (plan: P2-4) ve bu denetimin
     kapsamı dışındadır. */
  await sayfa(p, 'Kat Hizmetleri');
  await p.waitForTimeout(400);
  const katKucuk = await p.evaluate(() => {
    const hedefler = [...document.querySelectorAll('main table button, main table select, main table [role="radio"]')]
      .map(el => ({ ad: (el.innerText || el.ariaLabel || '').replace(/\s+/g, ' ').slice(0, 24),
                    r: el.getBoundingClientRect() }))
      .filter(x => x.r.width > 0 && x.r.height > 0 && (x.r.height < 44 || x.r.width < 44));
    return hedefler.slice(0, 4).map(x => `${x.ad} (${Math.round(x.r.width)}×${Math.round(x.r.height)}px)`);
  });
  d.bekle(katKucuk.length === 0, 'Kat Hizmetleri tablosundaki denetimler 44 px', katKucuk.join(' · '));
  const segmentSatirlari = await p.evaluate(() => {
    const g = document.querySelector('main [role="radiogroup"]');
    if (!g) return null;
    const ustler = [...g.querySelectorAll('[role="radio"]')].map(x => Math.round(x.getBoundingClientRect().top));
    return { bolme: ustler.length, satir: new Set(ustler).size };
  });
  d.bekle(segmentSatirlari && segmentSatirlari.bolme === 4 && segmentSatirlari.satir === 1,
    'temizlik durum kontrolü dört bölme ve tek satır', JSON.stringify(segmentSatirlari));

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
