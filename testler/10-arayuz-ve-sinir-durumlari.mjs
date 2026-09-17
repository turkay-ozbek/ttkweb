/* Test planı bölüm 10 (arayüz, okunurluk, sınır durumları) ve 1.6 / 9.4 */
import { defter, tarayici, giris, rolDegistir, sayfa, govde, HESAP, SAYFALAR,
         yeniKayit, kaydet, trTarih, tarihYaz, taleplerdeAra, tasma,
         veriSatirlari, satirSayisi, pencereKapat, formTc, formAd } from './ortak.mjs';

const d = defter('10 — Arayüz, ölçek ve sınır durumları');
const { b, p } = await tarayici(d);
const num = (m, r) => { const x = m.match(r); return x ? Number(x[1].replace(/\./g, '')) : null; };

try {
  await giris(p, HESAP.admin);

  /* ═══ 10.2 Yazı ölçeği: sınırlar, sıfırlama, kalıcılık ═══ */
  const olcekOku = () => p.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--olcek')));
  const buyut = p.locator('.fixed.right-3 button[aria-label="Yazıyı büyüt"]');
  const kucult = p.locator('.fixed.right-3 button[aria-label="Yazıyı küçült"]');
  const sifirla = p.locator('.fixed.right-3 button[aria-label="Varsayılan boyuta dön"]');

  for (let i = 0; i < 12; i++) { if (await buyut.isDisabled()) break; await buyut.click(); await p.waitForTimeout(120); }
  const enBuyuk = await olcekOku();
  d.bekle(enBuyuk <= 1.36 && enBuyuk >= 1.3, `ölçek üst sınırda duruyor (%${Math.round(enBuyuk * 100)})`);
  d.bekle(await buyut.isDisabled(), 'üst sınırda «büyüt» düğmesi pasif');
  d.bekle(await tasma(p) <= 2, `en büyük ölçekte yatay taşma yok`, `${await tasma(p)}px`);

  for (let i = 0; i < 16; i++) { if (await kucult.isDisabled()) break; await kucult.click(); await p.waitForTimeout(120); }
  const enKucuk = await olcekOku();
  d.bekle(enKucuk >= 0.84 && enKucuk <= 0.9, `ölçek alt sınırda duruyor (%${Math.round(enKucuk * 100)})`);
  d.bekle(await kucult.isDisabled(), 'alt sınırda «küçült» düğmesi pasif');

  await sifirla.click(); await p.waitForTimeout(300);
  d.bekle(Math.abs(await olcekOku() - 1) < 0.001, 'yüzde düğmesi ölçeği %100\'e döndürüyor');

  await buyut.click(); await buyut.click(); await p.waitForTimeout(300);
  const secilen = await olcekOku();
  const saklanan = await p.evaluate(() => { try { return localStorage.getItem('msfh_olcek'); } catch (_) { return null; } });
  d.bekle(saklanan !== null, 'ölçek ayarı tarayıcıda saklanıyor', 'localStorage: ' + saklanan);
  /* Sayfa yeniden yüklenince (uygulamayı yeniden açmaya denk) ölçek hatırlanmalı.
     DİKKAT: yenileme demo verisini sıfırlar; bu yüzden veri gerektiren adımlardan önce yapılıyor. */
  await p.reload();
  await p.waitForSelector('text=TTKNET');
  const yeniOlcek = await p.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--olcek')));
  d.bekle(Math.abs(yeniOlcek - secilen) < 0.001,
    `uygulama yeniden açılınca ölçek hatırlanıyor (%${Math.round(yeniOlcek * 100)})`);
  await giris(p, HESAP.admin);
  await sifirla.click(); await p.waitForTimeout(300);

  /* ═══ 10.1 Çözünürlük — her sayfada taşma ve ölçek birlikte ═══ */
  for (const [g, y] of [[1280, 800], [1366, 768], [1920, 1080]]) {
    await p.setViewportSize({ width: g, height: y });
    await p.waitForTimeout(300);
    for (const sf of SAYFALAR) {
      const dugme = p.locator('nav').getByRole('button', { name: sf, exact: true });
      if (!(await dugme.count())) continue;
      await dugme.click(); await p.waitForTimeout(250);
      const t = await tasma(p);
      if (t > 2) d.hata(`${g}px / ${sf}: yatay taşma ${t}px`);
    }
    d.ok(`${g}px genişlikte dokuz sayfada yatay taşma yok`);
  }
  /* en büyük ölçek + en dar ekran birlikte */
  await p.setViewportSize({ width: 1280, height: 800 });
  for (let i = 0; i < 12; i++) { if (await buyut.isDisabled()) break; await buyut.click(); await p.waitForTimeout(100); }
  let enKotu = 0;
  for (const sf of SAYFALAR) {
    const dugme = p.locator('nav').getByRole('button', { name: sf, exact: true });
    if (!(await dugme.count())) continue;
    await dugme.click(); await p.waitForTimeout(250);
    enKotu = Math.max(enKotu, await tasma(p));
  }
  d.bekle(enKotu <= 2, '1280px + %135 ölçekte de yatay taşma yok', `${enKotu}px`);
  await sifirla.click(); await p.waitForTimeout(300);
  await p.setViewportSize({ width: 1680, height: 1050 });
  await p.waitForTimeout(300);

  /* ═══ 10.3 Ekranda görünmemesi gerekenler ═══ */
  for (const sf of SAYFALAR) {
    const dugme = p.locator('nav').getByRole('button', { name: sf, exact: true });
    if (!(await dugme.count())) continue;
    await dugme.click(); await p.waitForTimeout(250);
    const govdeMetni = await p.locator('body').innerText();
    const kod = govdeMetni.match(/MSFH-W\d+/g);
    if (kod) d.hata(`${sf}: ekranda form kodu görünüyor (${[...new Set(kod)].join(', ')})`);
  }
  d.ok('hiçbir sayfada MSFH-W form kodu görünmüyor');
  const altBar = await p.locator('footer').innerText();
  d.bekle(!/yetkili misafirhane|Sistem Yöneticisi \(/.test(altBar), 'alt barda uzun oturum metni yok', altBar.slice(0, 120));
  const ustBar = await p.locator('header > div').first().innerText();
  d.bekle(await p.locator('header').getByRole('button', { name: '?', exact: true }).count() === 0,
    'üst bantta «?» bilgi düğmesi yok');
  d.bekle(await p.locator('header select').count() === 0, 'üst bantta misafirhane seçicisi yok');

  /* ═══ 9.4 Rehberi yazdır ═══ */
  await p.locator('header').getByRole('button', { name: /Rehber/ }).click();
  await p.waitForTimeout(400);
  await p.evaluate(() => { window.__yazdirildi = false; window.print = () => { window.__yazdirildi = true; }; });
  await p.getByRole('button', { name: /Rehberi yazdır/ }).click();
  await p.waitForTimeout(400);
  d.bekle(await p.evaluate(() => window.__yazdirildi === true), '«Rehberi yazdır» yazdırma penceresini çağırıyor');
  const yazdirmaGizli = await p.evaluate(() => {
    const el = document.querySelector('.fixed.right-3');
    return el ? [...el.classList].some(c => c.startsWith('print:hidden')) : false;
  });
  d.bekle(yazdirmaGizli, 'ölçek kutusu çıktıda gizleniyor (print:hidden)');

  /* ═══ 1.6 Oturum kapatınca veri korunuyor ═══ */
  await sayfa(p, 'Talepler');
  const f = await yeniKayit(p, { ad: 'OTURUM TESTI', ekGun: 12, gece: 2 });
  await kaydet(p, f);
  await rolDegistir(p, HESAP.mudur);
  await sayfa(p, 'Talepler');
  const korunan = await taleplerdeAra(p, 'OTURUM TESTI');
  d.bekle(await korunan.count() === 1, 'oturum kapatıp yeniden girince kayıtlar korunuyor');

  /* ═══ 10.5 Sınır durumları ═══ */
  /* a) geçmiş tarihe kayıt */
  const g2 = await yeniKayit(p, { ad: 'GECMIS TARIH', ekGun: -5, gece: 3 });
  const gecmisAltlik = await g2.altlik();
  d.bekle(/statü: ?Talep/i.test(gecmisAltlik.replace(/\s+/g, ' ')),
    'geçmiş tarihli kayıt yataksızken «Talep» statüsünde', (gecmisAltlik.match(/statü:.*/i) || [''])[0]);
  /* yatak verilince geçmiş tarihli kayıt doğrudan konaklamaya/çıkışa geçmeli */
  await p.getByRole('button', { name: /Uygun Yatağı Otomatik Bul/ }).click();
  await p.waitForTimeout(700);
  const gecmisYatakli = await g2.altlik();
  d.bekle(/statü: ?(Konaklıyor|Çıkış)/i.test(gecmisYatakli.replace(/\s+/g, ' ')),
    'geçmiş tarihli kayıt yatak verilince «Konaklıyor»/«Çıkış» oluyor', (gecmisYatakli.match(/statü:.*/i) || [''])[0]);
  await kaydet(p, g2);

  /* b) kişi sayısını 1'e düşürüp tekrar artırmak — satırlar tutarlı kalmalı */
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(400);
  const kisiDugme = p.locator('.fixed.inset-0 label:has-text("Kişi Sayısı") button');
  for (let i = 0; i < 3; i++) { await kisiDugme.nth(1).click(); await p.waitForTimeout(150); }
  await formTc(p).first().fill('99887766554');
  await formAd(p).first().fill('ILK MISAFIR');
  for (let i = 0; i < 3; i++) { await kisiDugme.nth(0).click(); await p.waitForTimeout(150); }
  for (let i = 0; i < 2; i++) { await kisiDugme.nth(1).click(); await p.waitForTimeout(150); }
  d.bekle(await formTc(p).count() === 3, 'kişi sayısı azaltılıp artırılınca satır sayısı tutarlı');
  d.bekle(await formTc(p).first().inputValue() === '99887766554', 'kalan satırın bilgileri korunuyor');
  d.bekle(await formTc(p).nth(2).inputValue() === '', 'yeni eklenen satır boş geliyor');
  await p.getByRole('button', { name: 'Vazgeç', exact: true }).click();
  await p.waitForTimeout(400);

  /* c) tahsilatta kapora üstü tutar — kalan eksiye düşmemeli */
  await sayfa(p, 'Talepler');
  const f3 = await yeniKayit(p, { ad: 'ASIRI TAHSILAT', ekGun: 40, gece: 3, sahis: true });
  await kaydet(p, f3);
  await sayfa(p, 'Tahsilat');
  await p.getByRole('button', { name: 'Tüm dönem', exact: true }).click(); await p.waitForTimeout(400);
  await p.getByPlaceholder(/Ad soyad/).first().fill('ASIRI TAHSILAT'); await p.waitForTimeout(500);
  const satir = veriSatirlari(p).filter({ hasText: 'ASIRI TAHSILAT' }).first();
  if (await satir.count()) {
    await satir.getByRole('button', { name: /Tahsilat Al/ }).click(); await p.waitForTimeout(400);
    await p.getByLabel(/Tahsil edilen tutar/).fill('999999');
    await p.getByLabel(/Makbuz No/).fill('8888');
    await p.getByRole('button', { name: /Kaydet/ }).last().click(); await p.waitForTimeout(700);
    const sonrasi = (await veriSatirlari(p).filter({ hasText: 'ASIRI TAHSILAT' }).first().innerText());
    d.bekle(!/[-−]\s*[\d.]+\s*₺/.test(sonrasi), 'kapora üstü tahsilatta eksi tutar görünmüyor',
      sonrasi.replace(/\n/g, ' | '));
    /* tahsil edilen, istenen kaporayı aşmamalı */
    const tutarlar = [...sonrasi.matchAll(/([\d.]+) ₺/g)].map(x => Number(x[1].replace(/\./g, '')));
    d.bekle(tutarlar.length >= 2 && Math.max(...tutarlar.slice(1)) <= tutarlar[0],
      'tahsil edilen tutar istenen kaporayı aşmıyor', tutarlar.join(' / '));
    d.bekle(/Onaylı|Konaklıyor/.test(sonrasi), 'tutar tamamlanınca statü onaylıya geçiyor');
  } else d.hata('aşırı tahsilat testi için kayıt bulunamadı');

  /* d) aynı Tc ile ikinci kayıt kabul ediliyor, arama ikisini de buluyor */
  await sayfa(p, 'Talepler');
  const f4 = await yeniKayit(p, { ad: 'AYNI TC BIR', ekGun: 42, gece: 2 });
  await kaydet(p, f4);
  const f5 = await yeniKayit(p, { ad: 'AYNI TC IKI', ekGun: 43, gece: 2 });
  await kaydet(p, f5);
  await taleplerdeAra(p, '12345678901');
  d.bekle(await satirSayisi(p) >= 2, `aynı Tc ile açılan kayıtların hepsi aranınca bulunuyor (${await satirSayisi(p)} kayıt)`);

  /* e) boş aramada liste boşalıyor, temizleyince geri geliyor */
  await p.getByPlaceholder(/Ad soyad/).first().fill('zzzyokboyle'); await p.waitForTimeout(500);
  d.bekle(await satirSayisi(p) === 0, 'bulunmayan aramada talep listesi boşalıyor');
  await p.getByPlaceholder(/Ad soyad/).first().fill(''); await p.waitForTimeout(500);
  d.bekle(await satirSayisi(p) > 0, 'arama temizlenince liste geri geliyor');
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
