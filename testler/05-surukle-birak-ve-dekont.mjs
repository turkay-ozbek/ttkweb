/* Sürükle-bırak yerleştirme ve dekont önizlemesi (PDF/PNG) + kapora tutarlılığı */
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
const hata = [], adim = []; const ok = s => adim.push('  ✓ ' + s);
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } });
p.on('pageerror', e => hata.push('JS hatası: ' + e.message));
p.on('console', m => { if (m.type() === 'error') hata.push('console: ' + m.text()); });

const girisFormu = async (k, sf) => { await p.locator('input[placeholder="Örn. TTK7719"]').fill(k);
  await p.locator('input[type=password]').fill(sf); await p.getByRole('button',{name:'BAĞLAN'}).click(); await p.waitForSelector('nav'); };
const sayfa = async a => { await p.locator('nav').getByRole('button',{name:a,exact:true}).click(); await p.waitForTimeout(400); };
const govde = () => p.locator('main').innerText();
const trTarih = n => p.evaluate(x => { const d=new Date(); const y=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()+x));
  return String(y.getUTCDate()).padStart(2,'0')+'.'+String(y.getUTCMonth()+1).padStart(2,'0')+'.'+y.getUTCFullYear(); }, n);

/* HTML5 sürükle-bırak: gerçek fare olayları dragstart/drop üretmez, bu yüzden
   tek bir DataTransfer üzerinden sentetik DragEvent zinciri gönderiyoruz. */
const surukle = async (kaynak, hedef, yalnizUzerinde = false) => {
  const kh = await kaynak.elementHandle(), hh = await hedef.elementHandle();
  await p.evaluate(([a, t, uzerinde]) => {
    const dt = new DataTransfer();
    const yolla = (el, ad) => el.dispatchEvent(new DragEvent(ad, { bubbles: true, cancelable: true, dataTransfer: dt }));
    yolla(a, 'dragstart');
    yolla(t, 'dragover');
    if (uzerinde) return;
    yolla(t, 'drop');
    yolla(a, 'dragend');
  }, [kh, hh, yalnizUzerinde]);
  await p.waitForTimeout(400);
};
const yatak = (desen) => p.locator(`.yatak-hucre[title*="${desen}"]`);
const MUSAIT = 'tamamında müsait', DOLU = 'Kesintisiz müsait değil', TAHSIS = 'bu talebe tahsis edildi';

try {
  /* ═══════════════ HAZIRLIK: kaporasız kurum kaydı aç ═══════════════ */
  await p.goto(url); await girisFormu('MSF1001','1234');
  await sayfa('Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click(); await p.waitForTimeout(400);
  await p.getByLabel(/Adı Soyadı/).fill('SURUKLE TESTI');
  const g = await trTarih(20), c = await trTarih(22);
  await p.getByLabel(/Geliş Tarihi/).fill(g); await p.getByLabel(/Geliş Tarihi/).press('Enter'); await p.waitForTimeout(150);
  await p.getByLabel(/Çıkış Tarihi/).fill(c); await p.getByLabel(/Çıkış Tarihi/).press('Enter'); await p.waitForTimeout(200);
  const tc = p.getByPlaceholder(/11 hane|Tc/i).first(); if (await tc.count()) await tc.fill('67890123456');
  const ma = p.locator('input[placeholder*="Ad Soyad"], input[placeholder*="Adı Soyadı"]'); if (await ma.count()) await ma.first().fill('SURUKLE TESTI');
  await p.getByRole('button', { name: 'Kaydet', exact: true }).click(); await p.waitForTimeout(600);
  await p.locator('main select').first().selectOption('HEPSI');
  await p.getByPlaceholder(/Ad soyad/).first().fill('SURUKLE TESTI'); await p.waitForTimeout(400);
  await p.locator('table tbody tr', { hasText: 'SURUKLE TESTI' }).first().click(); await p.waitForTimeout(300);

  /* ═══════════════ 1) Haritada yerleştirme modu ═══════════════ */
  await p.getByRole('button', { name: /Haritada Yerleştir/ }).click(); await p.waitForTimeout(600);
  const baslik = await govde();
  if (/Yerleştirme modu/.test(baslik)) ok('«Haritada Yerleştir» yerleştirme modunu açtı');
  else hata.push('1: yerleştirme modu açılmadı');
  /* Yerleştirme modunda harita tek güne değil, konaklanacak gecelerin tamamına göre
     boyanır: «Müsait» = her gece boş. Üstteki şeritte kaç yatağın uygun olduğu yazar. */
  if (/kesintisiz müsait/.test(baslik)) ok('harita konaklanacak gecelerin tamamına göre hesaplanıyor');
  else hata.push('1b: kesintisiz müsaitlik şeridi yok');

  const kart = p.locator('main div[draggable="true"]').first();
  if (!(await kart.count())) hata.push('1: sürüklenebilir misafir kartı yok');
  else ok('misafir kartı sürüklenebilir (draggable)');

  /* ═══════════════ 2) dragover hedefi vurguluyor mu ═══════════════ */
  const bosYatak = yatak(MUSAIT).first();
  if (!(await bosYatak.count())) hata.push('2: haritada müsait yatak yok');
  await surukle(kart, bosYatak, true);
  if (await p.locator('.yatak-hucre.surukle-hedef').count()) ok('dragover hedef yatağı vurguluyor');
  else hata.push('2: dragover vurgusu (surukle-hedef) çıkmadı');

  /* ═══════════════ 3) DOLU yatağa bırakma reddediliyor mu ═══════════════ */
  const doluYatak = yatak(DOLU).first();
  await surukle(kart, doluYatak);
  const t3 = await govde();
  if (/müsait değil/i.test(t3) && /yerleşmedi/.test(t3)) ok('dolu yatağa bırakma reddedildi ve gerekçe yazıldı');
  else hata.push('3: dolu yatağa bırakma engellenmedi');

  /* ═══════════════ 4) BOŞ yatağa bırakma yerleştiriyor mu ═══════════════ */
  const hedef = yatak(MUSAIT).first();
  await surukle(kart, hedef);
  const t4 = await govde();
  if (/Oda \d+\/\d+/.test(t4)) ok('müsait yatağa sürükle-bırak yerleştirdi (' + (t4.match(/Oda \d+\/\d+/) || [''])[0] + ')');
  else hata.push('4: sürükle-bırak yerleştirmedi');
  const tahsisli = p.locator(`.yatak-hucre[title*="${TAHSIS}"]`);
  if (await tahsisli.count()) {
    const b = await tahsisli.first().getAttribute('title');
    if (b.includes('SURUKLE TESTI')) ok('yerleştirilen misafirin adı yatakta görünüyor');
    else hata.push('4b: yatak başlığında misafir adı yok → ' + b);
  } else hata.push('4b: tahsis edilmiş yatak haritada işaretlenmedi');

  /* ═══════════════ 5) Kart üzerindeki × tahsisi kaldırıyor mu ═══════════════ */
  await p.locator('main div[draggable="true"] button[title="Tahsisi kaldır"]').first().click();
  await p.waitForTimeout(500);
  if (/yerleşmedi/.test(await govde())) ok('kart üzerindeki × tahsisi kaldırdı');
  else hata.push('5: tahsis kalkmadı');

  /* ═══════════════ 6) Tıklayarak yerleştirme ═══════════════ */
  await p.locator('main div[draggable="true"]').first().click(); await p.waitForTimeout(200);
  await yatak(MUSAIT).first().click(); await p.waitForTimeout(600);
  if (/Oda \d+\/\d+/.test(await govde())) ok('kart seçip yatağa tıklayarak da yerleştirilebiliyor');
  else hata.push('6: tıklayarak yerleştirme çalışmadı');

  /* ═══════════════ 7) Yerleştirmeyi bitir ═══════════════ */
  await p.getByRole('button', { name: /Yerleştirmeyi Bitir/ }).click(); await p.waitForTimeout(500);
  if (!/Yerleştirme modu/.test(await govde())) ok('«Yerleştirmeyi Bitir» modu kapattı');
  else hata.push('7: yerleştirme modu kapanmadı');

  /* ═══════════════ 8) Kaporası onaylanmamış kayıtta sürükle-bırak ═══════════════ */
  await sayfa('Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click(); await p.waitForTimeout(400);
  await p.getByLabel(/Adı Soyadı/).fill('KAPORALI SURUKLE');
  const g8 = await trTarih(24), c8 = await trTarih(26);
  await p.getByLabel(/Geliş Tarihi/).fill(g8); await p.getByLabel(/Geliş Tarihi/).press('Enter'); await p.waitForTimeout(150);
  await p.getByLabel(/Çıkış Tarihi/).fill(c8); await p.getByLabel(/Çıkış Tarihi/).press('Enter');
  await p.getByLabel(/Kurum-Şahıs/).selectOption('SAHIS'); await p.waitForTimeout(250);
  const tc8 = p.getByPlaceholder(/11 hane|Tc/i).first(); if (await tc8.count()) await tc8.fill('78901234567');
  const ma8 = p.locator('input[placeholder*="Ad Soyad"], input[placeholder*="Adı Soyadı"]'); if (await ma8.count()) await ma8.first().fill('KAPORALI SURUKLE');
  await p.getByRole('button', { name: 'Kaydet', exact: true }).click(); await p.waitForTimeout(600);
  await p.locator('main select').first().selectOption('HEPSI');
  await p.getByPlaceholder(/Ad soyad/).first().fill('KAPORALI SURUKLE'); await p.waitForTimeout(400);
  await p.locator('table tbody tr', { hasText: 'KAPORALI SURUKLE' }).first().click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Haritada Yerleştir/ }).click(); await p.waitForTimeout(600);
  const kart8 = p.locator('main div[draggable="true"]').first();
  const bos8 = yatak(MUSAIT).first();
  await surukle(kart8, bos8);
  const t8 = await govde();
  if (/yatak tahsis edilemez|onaylanmadan|Kapora/i.test(t8) && /yerleşmedi/.test(t8))
    ok('kaporası onaylanmamış kayıt sürükle-bırakla da yerleştirilemiyor');
  else hata.push('8: kapora kuralı sürükle-bırakta uygulanmadı');
  await p.getByRole('button', { name: /Yerleştirmeyi Bitir/ }).click(); await p.waitForTimeout(400);

  /* ═══════════════ 9) DEKONT — örnek PDF üretimi ve önizleme ═══════════════ */
  await sayfa('Talepler');
  await p.locator('main select').first().selectOption('HEPSI');
  await p.getByPlaceholder(/Ad soyad/).first().fill('KAPORALI SURUKLE'); await p.waitForTimeout(400);
  await p.locator('table tbody tr', { hasText: 'KAPORALI SURUKLE' }).first().click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Dekont Yükle/ }).first().click(); await p.waitForTimeout(400);
  const dekontNo = await p.getByLabel(/Dekont \/ Referans No/).inputValue();
  await p.getByRole('button', { name: /Örnek dekont üret/ }).click(); await p.waitForTimeout(700);
  const pencere9 = await p.locator('.fixed.inset-0').last().innerText();
  if (/\.pdf/i.test(pencere9) && /KB/.test(pencere9)) ok('örnek dekont üretildi (dosya adı ve boyutu görünüyor)');
  else hata.push('9: örnek dekont üretilmedi');
  await p.getByRole('button', { name: /Onaya Gönder/ }).click(); await p.waitForTimeout(700);

  /* ═══════════════ 10) Talep ekranından «Dekontu Gör» ═══════════════ */
  await p.getByRole('button', { name: /Dekontu Gör/ }).first().click(); await p.waitForTimeout(700);
  const cerceve = p.locator('iframe[title="Kapora dekontu"]');
  if (await cerceve.count()) ok('«Dekontu Gör» penceresinde PDF önizlemesi (iframe) açıldı');
  else hata.push('10: dekont önizleme çerçevesi yok');
  const kaynak = await cerceve.first().getAttribute('src');
  if ((kaynak || '').startsWith('data:application/pdf')) ok('önizleme kaynağı data:application/pdf');
  else hata.push('10b: önizleme kaynağı PDF değil → ' + (kaynak || '').slice(0, 40));

  /* PDF içeriğini çöz ve doğrula */
  const b64 = (kaynak || '').split(',')[1] || '';
  const pdf = Buffer.from(b64, 'base64').toString('latin1');
  fs.writeFileSync(cikti('dekont-ornek.pdf'), Buffer.from(b64, 'base64'));
  const kontrol = [
    ['%PDF-1.4 başlığı', pdf.startsWith('%PDF-1.4')],
    ['%%EOF sonu',       /%%EOF\s*$/.test(pdf)],
    ['xref tablosu',     pdf.includes('xref') && pdf.includes('trailer')],
    ['Helvetica yazı tipi', pdf.includes('Helvetica')],
    ['dekont no',        pdf.includes(dekontNo)],
    ['rezervasyon no',   /MSF-\d{4}-\d+/.test(pdf)],
    ['banka adı',        /Ziraat|Vakif|Halk|Is Bankasi|Garanti|Yapi|Bank/i.test(pdf)],
  ];
  for (const [ad, sonuc] of kontrol) sonuc ? ok('üretilen PDF: ' + ad + ' var') : hata.push('10c: üretilen PDF: ' + ad + ' YOK');
  // dosyayı tarayıcıda açıp gerçekten render oluyor mu
  const pdfSayfa = await b.newPage();
  await pdfSayfa.goto('file://' + cikti('dekont-ornek.pdf'));
  await pdfSayfa.waitForTimeout(1500);
  const boyut = fs.statSync(cikti('dekont-ornek.pdf')).size;
  if (boyut > 500) ok(`üretilen PDF tarayıcıda açıldı (${boyut} bayt)`);
  else hata.push('10d: PDF çok küçük/bozuk');
  await pdfSayfa.close();
  await p.locator('.fixed.inset-0 header button').last().click(); await p.waitForTimeout(400);

  /* ═══════════════ 11) Onay sayfasında önizleme ═══════════════ */
  await sayfa('Dekont/Onay'); await p.waitForTimeout(500);
  await p.locator('button, tr').filter({ hasText: 'KAPORALI SURUKLE' }).first().click(); await p.waitForTimeout(600);
  const t11 = await govde();
  if (await p.locator('iframe[title="Kapora dekontu"]').count()) ok('onay sayfasında dekont önizlemesi açılıyor');
  else hata.push('11: onay sayfasında önizleme yok');
  if (/demo/.test(t11)) ok('üretilmiş dekontta «demo» rozeti var');
  else hata.push('11b: demo rozeti yok');
  if (await p.locator('a', { hasText: /Yeni sekmede aç/ }).count()) ok('«Yeni sekmede aç» bağlantısı var');
  else hata.push('11c: yeni sekmede aç bağlantısı yok');

  /* ═══════════════ 12) Görsel (PNG) dekont önizlemesi ═══════════════ */
  await sayfa('Talepler');
  // sayfa yeniden kurulduğunda geliş aralığı bugün..+21'e döner; kaydımız +24'te
  const aralikSon = p.getByPlaceholder('GG.AA.YYYY').nth(1);
  await aralikSon.fill(await trTarih(40)); await aralikSon.press('Enter'); await p.waitForTimeout(400);
  await p.locator('main select').first().selectOption('HEPSI');
  await p.getByPlaceholder(/Ad soyad/).first().fill('KAPORALI SURUKLE'); await p.waitForTimeout(400);
  await p.locator('table tbody tr', { hasText: 'KAPORALI SURUKLE' }).first().click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Dekont Yükle/ }).first().click(); await p.waitForTimeout(400);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAG0lEQVQoz2P8//8/AzZgYmDEBaMGjBowagAAtqQG8bLxTxkAAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(cikti('ornek-dekont.png'), png);
  await p.getByLabel(/Dekont \/ Referans No/).fill('550012345');
  await p.locator('input[type=file]').setInputFiles(cikti('ornek-dekont.png'));
  await p.waitForTimeout(700);
  const t12 = await p.locator('.fixed.inset-0').last().innerText();
  if (/ornek-dekont\.png/.test(t12)) ok('PNG dekont dosyası kabul edildi');
  else hata.push('12: PNG dosya kabul edilmedi');
  await p.getByRole('button', { name: /Onaya Gönder/ }).click(); await p.waitForTimeout(700);
  await p.getByRole('button', { name: /Dekontu Gör/ }).first().click(); await p.waitForTimeout(700);
  const resim = p.locator('img[alt="Dekont"]');
  if (await resim.count()) {
    const src = await resim.first().getAttribute('src');
    if ((src || '').startsWith('data:image/png')) ok('PNG dekont <img> ile önizleniyor (iframe değil)');
    else hata.push('12b: PNG önizleme kaynağı yanlış → ' + (src || '').slice(0, 30));
    const gercek = await resim.first().evaluate(el => el.complete && el.naturalWidth > 0);
    if (gercek) ok('PNG önizlemesi gerçekten yüklendi (naturalWidth > 0)');
    else hata.push('12c: PNG görüntüsü yüklenmedi');
  } else hata.push('12: PNG için <img> önizlemesi yok');
  await p.screenshot({ path: cikti('dekont-onizleme.png') });
  await p.locator('.fixed.inset-0 header button').last().click(); await p.waitForTimeout(300);

  /* ═══════════════ 13) Dekont dosya boyutu sınırı ═══════════════ */
  await p.getByRole('button', { name: /Dekont Yükle/ }).first().click(); await p.waitForTimeout(400);
  fs.writeFileSync(cikti('buyuk.pdf'), Buffer.alloc(6 * 1024 * 1024, 0x41));
  await p.locator('input[type=file]').setInputFiles(cikti('buyuk.pdf'));
  await p.waitForTimeout(900);
  const t13 = await p.locator('.fixed.inset-0').last().innerText();
  if (/5 MB|büyük|⛔/i.test(t13)) ok('5 MB üzeri dosya reddediliyor');
  else hata.push('13: büyük dosya sınırı uygulanmadı');



  /* ═══ 14) Tutarlılık: «Kapora Bekleniyor» kaydının kaporası olmalı ═══ */
  await p.locator('.fixed.inset-0 header button').last().click().catch(()=>{});
  await p.waitForTimeout(300);
  await sayfa('Ana Menü');
  for (const tesis of ['Yayla Konağı', 'Ankara Misafirhanesi', 'Amasra Misafirhanesi', 'Armutçuk Misafirhanesi']) {
    const d = p.locator('main').getByRole('button', { name: tesis, exact: true });
    if (await d.count()) { await d.click(); await p.waitForTimeout(300); }
    await sayfa('Talepler');
    const bas = p.getByPlaceholder('GG.AA.YYYY').first(), son = p.getByPlaceholder('GG.AA.YYYY').nth(1);
    await bas.fill('01.01.2026'); await bas.press('Enter');
    await son.fill('31.12.2026'); await son.press('Enter'); await p.waitForTimeout(400);
    for (const [kod, ad] of [['PESINAT_BEKLENIYOR','Kapora Bekleniyor'], ['ONAY_BEKLIYOR','Müdür Onayı Bekliyor']]) {
      await p.locator('main select').first().selectOption(kod); await p.waitForTimeout(400);
      const satirlar = await p.locator('table tbody tr').allInnerTexts();
      const celiskili = satirlar.filter(x => /aranmıyor/.test(x));
      if (celiskili.length) hata.push(`14: ${tesis} — «${ad}» statüsünde kaporası aranmayan ${celiskili.length} kayıt var`);
    }
    await sayfa('Ana Menü');
  }
  if (!hata.some(x => x.startsWith('14:'))) ok('dört misafirhanede kapora statüsü/tutarı tutarlı (çelişkili kayıt yok)');
} catch (e) {
  hata.push('KOŞU DURDU: ' + e.message.split('\n').slice(0,4).join(' / '));
  console.log(e.stack.split('\n').slice(0, 6).join('\n'));
}
await b.close();
console.log(adim.join('\n'));
console.log(hata.length ? '\nHATA:\n' + hata.join('\n') : '\nSÜRÜKLE-BIRAK VE DEKONT TESTLERİ GEÇTİ');
