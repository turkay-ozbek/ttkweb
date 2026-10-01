/* Test planı bölüm 18 — yönetim raporları, denetim izi ve bekleyen işler
   (bildirim) merkezi. Üçü de veriyi değiştirmez, okur; bu yüzden denetim
   ağırlıklı olarak sayı tutarlılığı ve yetki sınırları üzerinedir. */
import { defter, tarayici, giris, HESAP, sayfa, sayfaVar, govde, veriSatirlari, rolDegistir } from './ortak.mjs';

const d = defter('18 — Raporlar, denetim izi ve bekleyen işler');
const { b, p } = await tarayici(d);
await giris(p, HESAP.admin);

/* ═══ 1) Bekleyen işler (bildirim zili) ═══ */
const zil = p.locator('header button[aria-label^="Bekleyen işler"]');
d.bekle(await zil.count() === 1, 'üst bantta bekleyen işler zili var');
const zilEtiket = await zil.getAttribute('aria-label');
const zilSayi = Number((zilEtiket.match(/\((\d+)\)/) || [])[1]);
d.bekle(!Number.isNaN(zilSayi), 'zil etiketinde bekleyen iş sayısı yazıyor', zilEtiket);
await zil.click();
await p.waitForTimeout(400);
let pencere = p.locator('.fixed.inset-0').last();
let pm = await pencere.innerText();
d.bekle(/Bekleyen İşler/.test(pm), 'bekleyen işler penceresi açıldı', pm.slice(0, 80));
const satirlar = pencere.locator('button:has-text("›")');
const satirSay = await satirlar.count();
d.bekle(satirSay > 0, 'panelde iş satırları listelendi', satirSay + ' satır');
const toplam = await satirlar.evaluateAll(xs => xs.reduce((t, x) =>
  t + Number((x.innerText.match(/^\s*(\d+)/) || [])[1] || 0), 0));
d.bekle(toplam === zilSayi, 'zildeki sayı panel satırlarının toplamına eşit', `${zilSayi} ≠ ${toplam}`);
const ilkSatir = await satirlar.first().innerText();
await satirlar.first().click();
await p.waitForTimeout(700);
d.bekle(await p.locator('.fixed.inset-0').count() === 0, 'iş satırına tıklayınca pencere kapanıyor');
const hedefSayfa = ilkSatir.trim().split('\n').pop().replace('›', '').trim();
d.bekle(new RegExp(hedefSayfa.slice(0, 6), 'i').test(await p.locator('nav').innerText()),
  'satır ilgili sayfaya götürdü', hedefSayfa);

/* ═══ 2) Yönetim raporları ═══ */
await sayfa(p, 'Raporlar');
let g = await govde(p);
d.bekle(/Yönetim Raporları/.test(g), 'Yönetim Raporları sayfası açıldı');
d.bekle(/DOLULUK/.test(g) && /M[Iİ]SAF[Iİ]R-GECE/.test(g) && /ORT\. KONAKLAMA/.test(g)
     && /TAHS[Iİ]LAT/.test(g) && /[Iİ]PTAL ORANI/.test(g), 'altı rapor KPI kutusu var');
d.bekle(/M[Iİ]SAF[Iİ]RHANE KARŞILAŞTIRMASI/.test(g), 'misafirhane karşılaştırma tablosu var');

/* dört misafirhane + toplam satırı */
const raporSatir = await veriSatirlari(p, 'main').count();
d.bekle(raporSatir >= 5, 'karşılaştırma tablosunda dört misafirhane ve toplam satırı var', raporSatir + ' satır');

/* doluluk hesabı: dolu yatak-gece / yatak-gece kapasitesi */
const toplamSatiri = await p.locator('main table tbody tr', { hasText: 'TOPLAM' }).first().innerText();
const sayilar = toplamSatiri.split('\t').map(x => x.trim());
d.bekle(/%\d+/.test(toplamSatiri), 'toplam satırında doluluk oranı yazıyor', toplamSatiri.replace(/\t/g, ' | '));

/* dönem kısayolları */
for (const [ad, bekGun] of [['Son 30 gün', 30], ['Son 90 gün', 90]]) {
  await p.getByRole('button', { name: ad }).click();
  await p.waitForTimeout(600);
  g = await govde(p);
  d.bekle(new RegExp(`· ${bekGun} gün`).test(g), `«${ad}» kısayolu aralığı ${bekGun} güne ayarlıyor`,
    (g.match(/· \d+ gün/) || [])[0]);
}
d.bekle(/GEL[Iİ]Ş NEDEN[Iİ]/.test(g) && /EN ÇOK KONAKLAYAN KURUMLAR/.test(g)
     && /KONAKLAMA SÜRES[Iİ] DAĞILIMI/.test(g), 'üç kırılım kartı (neden, kurum, süre) var');

/* Excel/CSV ve yazdırma */
d.bekle(await p.locator('main').getByRole('button', { name: /Excel\/CSV/ }).first().isEnabled(),
  'dönem raporu Excel/CSV olarak aktarılabiliyor');
await p.locator('main').getByRole('button', { name: /Yazdır/ }).first().click();
await p.waitForTimeout(500);
pm = await p.locator('.fixed.inset-0').last().innerText();
d.bekle(/Dönem Raporunu Yazdır/.test(pm), 'yazdırma penceresi rapor başlığıyla açılıyor', pm.slice(0, 80));
d.bekle(/M[Iİ]SAF[Iİ]RHANE DÖNEM RAPORU/.test(pm), 'çıktı önizlemesinde rapor başlığı var');
await p.locator('.fixed.inset-0').last().getByRole('button', { name: 'Vazgeç' }).click();
await p.waitForTimeout(400);

/* ═══ 3) Denetim izi ═══ */
await sayfa(p, 'Denetim');
g = await govde(p);
d.bekle(/Denetim İzi/.test(g), 'Denetim İzi sayfası açıldı');
const hepsiSatir = await veriSatirlari(p, 'main').count();
d.bekle(hepsiSatir > 0, 'işlem kayıtları listeleniyor', hepsiSatir + ' satır');
d.bekle(/Kayıt/.test(g) && /Sistem/.test(g), 'kayıt hareketleri ve sistem günlüğü birlikte görünüyor');

await p.locator('main select[aria-label="Kayıt kaynağı"]').selectOption('SISTEM');
await p.waitForTimeout(500);
const sistemSatir = await veriSatirlari(p, 'main').count();
d.bekle(sistemSatir > 0 && sistemSatir < hepsiSatir, 'kaynak süzgeci yalnız sistem günlüğünü bırakıyor',
  `${hepsiSatir} → ${sistemSatir}`);
await p.locator('main select[aria-label="Kayıt kaynağı"]').selectOption('KAYIT');
await p.waitForTimeout(500);
const kayitSatir = await veriSatirlari(p, 'main').count();
d.bekle(kayitSatir > 0, 'yalnız kayıt hareketleri süzgeci çalışıyor', kayitSatir + ' satır');

const kullaniciSecim = p.locator('main select[aria-label="Kullanıcı"]');
const kullaniciSayi = await kullaniciSecim.locator('option').count();
d.bekle(kullaniciSayi > 1, 'kullanıcı süzgecinde işlem yapan kullanıcılar listelendi', (kullaniciSayi - 1) + ' kullanıcı');
const kod = await kullaniciSecim.locator('option').nth(1).getAttribute('value');
await kullaniciSecim.selectOption(kod);
await p.waitForTimeout(500);
const tekKullanici = await p.locator('main table tbody tr:not(:has(td[colspan]))')
  .evaluateAll(xs => [...new Set(xs.map(x => x.children[2].innerText.trim()))]);
d.bekle(tekKullanici.length === 1 && tekKullanici[0] === kod,
  'kullanıcı süzgeci yalnız o kullanıcının işlemlerini bırakıyor', tekKullanici.join(', '));
await kullaniciSecim.selectOption('HEPSI');
await p.waitForTimeout(400);

await p.locator('main input[placeholder*="ara"]').fill('kapora');
await p.waitForTimeout(600);
const aramaSatir = await p.locator('main table tbody tr:not(:has(td[colspan]))')
  .evaluateAll(xs => xs.filter(x => /kapora/i.test(x.innerText)).length);
const toplamAramaSatir = await veriSatirlari(p, 'main').count();
d.bekle(toplamAramaSatir > 0 && aramaSatir === toplamAramaSatir,
  'metin araması yalnız eşleşen işlemleri bırakıyor', `${aramaSatir}/${toplamAramaSatir}`);
d.bekle(await p.locator('main').getByRole('button', { name: /Excel\/CSV/ }).first().isEnabled(),
  'denetim izi Excel/CSV olarak aktarılabiliyor');

/* ═══ 4) Yetki sınırları ═══ */
await rolDegistir(p, HESAP.resepsiyon);
d.bekle(await sayfaVar(p, 'Raporlar'), 'resepsiyon yönetim raporlarını görebiliyor');
d.bekle(!(await sayfaVar(p, 'Denetim')), 'resepsiyonda denetim izi kapalı');
await rolDegistir(p, HESAP.mudur);
d.bekle(await sayfaVar(p, 'Raporlar') && await sayfaVar(p, 'Denetim'),
  'müdür hem raporları hem denetim izini görebiliyor');

await b.close();
d.bitir();
