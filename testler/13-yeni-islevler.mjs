/* Alan doğrulama, kapora muafiyeti, SMS, kahvaltı yoklaması, ay sonu belgesi,
   talep süzgecinin kalıcılığı ve yatak listesi yazdırma */
import { defter, tarayici, giris, rolDegistir, sayfa, govde, HESAP, yeniKayit, kaydet,
         trTarih, taleplerdeAra, veriSatirlari, satirSayisi, pencereKapat,
         formTc, formAd } from './ortak.mjs';

const d = defter('13 — Yeni işlevler');
const { b, p } = await tarayici(d);
const pencere = () => p.locator('.fixed.inset-0').last();

try {
  await giris(p, HESAP.mudur);

  /* ═══ 1) Uzunluğu belli alanların doğrulanması ═══ */
  await sayfa(p, 'Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(500);

  const tc = formTc(p).first();
  await tc.fill('123'); await p.waitForTimeout(250);
  d.bekle(/3 hane eksik|8 hane eksik/.test(await pencere().innerText()),
    'eksik Tc kimlik no için «hane eksik» uyarısı çıkıyor');
  await tc.fill('1234567890123456'); await p.waitForTimeout(350);
  d.bekle(await tc.inputValue() === '12345678901', 'fazla rakam alınmıyor — 11 hanede duruyor',
    await tc.inputValue());
  d.bekle(/Fazla rakam/.test(await pencere().innerText()), 'fazla rakam girilince uyarı gösteriliyor');
  await tc.fill('abcdef'); await p.waitForTimeout(250);
  d.bekle(await tc.inputValue() === '', 'harf girilemiyor');
  await tc.fill('01234567890'); await p.waitForTimeout(250);
  d.bekle(/0 ile başlayamaz/.test(await pencere().innerText()), '0 ile başlayan Tc kimlik no reddediliyor');
  await tc.fill('11223344556'); await p.waitForTimeout(250);
  d.bekle(!/hane eksik|0 ile başlayamaz/.test(await pencere().innerText()), 'geçerli Tc kimlik no uyarıyı kaldırıyor');

  const tel = p.locator('.fixed.inset-0 input[aria-label="Telefon no"]');
  await tel.fill('53212345678901'); await p.waitForTimeout(350);
  d.bekle((await tel.inputValue()).replace(/\D/g, '').length === 10, 'telefon 10 hanede duruyor',
    await tel.inputValue());
  d.bekle(/\d{3} \d{3} \d{2} \d{2}/.test(await tel.inputValue()), 'telefon okunur biçimde gösteriliyor',
    await tel.inputValue());

  await formAd(p).first().fill('DOGRULAMA MISAFIRI');
  await p.getByLabel(/Adı Soyadı/).first().fill('DOGRULAMA MISAFIRI');
  await p.getByLabel(/Kurum-Şahıs/).selectOption('SAHIS');
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await p.waitForTimeout(700);

  /* ═══ 2) SMS gönderimi ═══ */
  await p.locator('footer').getByRole('button', { name: /✉ SMS/ }).click();
  await p.waitForTimeout(600);
  const smsMetni = await pencere().innerText();
  d.bekle(/gönderildi/.test(smsMetni), 'kayıt açılınca misafire SMS gönderildi');
  d.bekle(/rezervasyon talebiniz alindi/i.test(smsMetni), 'SMS metni rezervasyon bilgisini içeriyor');
  d.bekle(/Kapora .* TL/.test(smsMetni), 'SMS kapora tutarını ve son ödeme tarihini yazıyor');
  d.bekle(/karakter · \d+ SMS/.test(smsMetni), 'SMS uzunluğu ve kaç mesaja böleceği gösteriliyor');
  await pencereKapat(p);

  /* ═══ 3) Kapora muafiyeti — öncelikli misafir ═══ */
  const satir = await taleplerdeAra(p, 'DOGRULAMA MISAFIRI');
  await satir.click(); await p.waitForTimeout(400);
  const oto = p.getByRole('button', { name: '⚙ Otomatik Yerleştir', exact: true });
  await oto.click(); await p.waitForTimeout(700);
  d.bekle(/yatak tahsis edilemez|onaylanmadan/i.test(await p.locator('body').innerText()),
    'muafiyet verilmeden kapora kilidi çalışıyor');
  const kapatD = p.getByRole('button', { name: /^Kapat$|Vazgeç/ }).first();
  if (await kapatD.count()) { await kapatD.click(); await p.waitForTimeout(300); }

  await p.getByRole('button', { name: /Kaporadan Muaf Tut/ }).click(); await p.waitForTimeout(500);
  d.bekle(await p.getByRole('button', { name: /Muafiyeti Ver/ }).isDisabled(),
    'gerekçe yazılmadan muafiyet verilemiyor');
  await p.getByRole('button', { name: /Protokol misafiri/ }).first().click();
  await p.waitForTimeout(250);
  await p.getByRole('button', { name: /Muafiyeti Ver/ }).click(); await p.waitForTimeout(700);
  const panelMetni = await govde(p);
  d.bekle(/kapora muafiyeti/i.test(panelMetni), 'muafiyet rozeti ve gerekçesi panelde görünüyor');
  d.bekle(/Kapora borcu düşmedi/.test(panelMetni), 'kapora borcunun silinmediği açıkça yazıyor');

  await p.getByRole('button', { name: '⚙ Otomatik Yerleştir', exact: true }).click();
  await p.waitForTimeout(800);
  const onayla = p.getByRole('button', { name: /Seçilenleri Onayla|Öneriyi Uygula/ }).first();
  d.bekle(await onayla.count() > 0, 'muafiyetli kayıt için öneri penceresi açılıyor');
  d.bekle(!/yatak tahsis edilemez|kapora .*onaylanmadan/i.test(await p.locator('body').innerText()),
    'muafiyetli kayıt kapora beklemeden yerleştirilebiliyor (kapora kilidi kalktı)');
  /* Motor yalnız o tarihlerde boş yatak varsa öneri üretir; doluluk demo tarihine
     göre değişebildiği için yerleşim denetimi öneri çıktığında yapılır. */
  if (await onayla.count() && !(await onayla.isDisabled())) {
    await onayla.click(); await p.waitForTimeout(600);
    const sonSatir = await taleplerdeAra(p, 'DOGRULAMA MISAFIRI');
    d.bekle(!/—\s*$/.test((await sonSatir.innerText()).split('\t')[5] || ''),
      'yerleştirme gerçekleşti (oda no doldu)', (await sonSatir.innerText()).replace(/\n/g, ' | '));
  } else {
    d.ok('bu tarihlerde boş yatak yok — engel kapora değil kapasite');
    await p.getByRole('button', { name: 'Vazgeç', exact: true }).first().click().catch(() => {});
    await p.waitForTimeout(300);
  }

  /* ═══ 4) Talep süzgeci sayfa değişince korunuyor ═══ */
  const f2 = await yeniKayit(p, { ad: 'UZAK TARIHLI', ekGun: 60, gece: 2 });
  await kaydet(p, f2);
  d.bekle(await veriSatirlari(p).filter({ hasText: 'UZAK TARIHLI' }).count() === 1,
    'uzak tarihli kayıt açılınca listede');
  await sayfa(p, 'Özet'); await sayfa(p, 'Talepler'); await p.waitForTimeout(500);
  d.bekle(await veriSatirlari(p).filter({ hasText: 'UZAK TARIHLI' }).count() === 1,
    'sayfadan çıkıp dönünce kayıt hâlâ listede (süzgeç sıfırlanmıyor)');

  /* Süzgeç dışında kayıt kalırsa uyarı ve tek tuşla temizleme */
  await p.getByPlaceholder(/Ad soyad/).first().fill('zzzyokboyle'); await p.waitForTimeout(500);
  d.bekle(/süzgeç dışında kaldı/i.test(await govde(p)), 'süzgeç dışında kalan kayıt sayısı uyarılıyor');
  await p.getByRole('button', { name: /Süzgeci temizle/ }).click(); await p.waitForTimeout(500);
  d.bekle(await satirSayisi(p) > 0, '«Süzgeci temizle» listeyi geri getiriyor');

  /* ═══ 5) Yatak listesi yazdırma ═══ */
  await sayfa(p, 'Yatak Listesi');
  await p.evaluate(() => { window.__basildi = 0; window.print = () => { window.__basildi++; }; });
  await p.getByRole('button', { name: /Yazdır/ }).first().click(); await p.waitForTimeout(600);
  d.bekle(await pencere().locator('table').count() >= 1, 'yazdırma önizlemesi açılıyor');
  d.bekle(/TÜRKİYE TAŞKÖMÜRÜ KURUMU/.test(await pencere().innerText()), 'çıktı başlığında kurum adı var');
  d.bekle(/A4 (dikey|yatay)/.test(await pencere().innerText()), 'kâğıt yönü seçeneği gösteriliyor');
  await p.getByRole('radio').nth(1).check(); await p.waitForTimeout(300);
  await pencere().locator('footer').getByRole('button', { name: /Yazdır/ }).click();
  await p.waitForTimeout(600);
  d.bekle(await p.evaluate(() => window.__basildi) === 1, 'yazdırma çağrısı yapıldı');
  const kural = await p.evaluate(() => { const e = document.getElementById('yazdirma-yonu'); return e ? e.textContent : ''; });
  d.bekle(/landscape/.test(kural), 'yatay seçilince @page kuralı landscape oluyor', kural);
  await p.getByRole('radio').nth(0).check(); await p.waitForTimeout(300);
  await pencere().locator('footer').getByRole('button', { name: /Yazdır/ }).click();
  await p.waitForTimeout(600);
  const kural2 = await p.evaluate(() => document.getElementById('yazdirma-yonu').textContent);
  d.bekle(/portrait/.test(kural2), 'dikey seçilince @page kuralı portrait oluyor', kural2);
  const basilanSatir = await p.locator('.yazdir-alan table tbody tr').count();
  d.bekle(basilanSatir > 25, `çıktıya listenin tamamı giriyor (${basilanSatir} satır)`);
  await pencereKapat(p);

  /* ═══ 6) Kahvaltı yoklaması — resepsiyon ═══ */
  await rolDegistir(p, HESAP.resepsiyon);
  await sayfa(p, 'Kahvaltı'); await p.waitForTimeout(600);
  const kutular = p.locator('main input[type=checkbox]');
  const konaklayan = await kutular.count();
  d.bekle(konaklayan > 0, `kahvaltı listesinde ${konaklayan} konaklayan misafir var`);
  /* Kutucuğun yanındaki etiket ne yapıldığını değil, işaretlemenin anlamını söyler */
  const kutuEtiketi = await p.locator('main table.veri tbody tr').first().innerText();
  d.bekle(/yapmadı/.test(kutuEtiketi) && !/\byaptı\b/.test(kutuEtiketi),
    'kutucuğun yanında «yapmadı» yazıyor', kutuEtiketi.split('\n')[0].slice(0, 40));
  /* Başlıklar CSS ile büyük harfe çevriliyor; Türkçe «ı» yüzünden desen
     doğrudan büyük harfli hâliyle aranır (JS'in /i bayrağı I ↔ ı eşlemez). */
  d.bekle(/KAHVALTI\s+YAPMADI/.test(await p.locator('main table.veri thead').first().innerText()),
    'sütun başlığı «Kahvaltı Yapmadı»');
  await kutular.nth(0).check(); await kutular.nth(1).check(); await p.waitForTimeout(500);
  const kahvaltiMetni = await govde(p);
  d.bekle(/KAHVALTI YAPMADI\s*\n\s*2/.test(kahvaltiMetni), 'işaretlenen misafir sayacı artıyor');
  d.bekle(new RegExp(`KAHVALTI VERİLDİ\\s*\\n\\s*${konaklayan - 2}`).test(kahvaltiMetni),
    'verilen kahvaltı sayısı buna göre düşüyor');
  await sayfa(p, 'Özet'); await sayfa(p, 'Kahvaltı'); await p.waitForTimeout(500);
  d.bekle(await p.locator('main input[type=checkbox]:checked').count() === 2,
    'yoklama sayfa değişince korunuyor');

  /* Muhasebe görebilir ama işaretleyemez */
  await rolDegistir(p, HESAP.muhasebe);
  await sayfa(p, 'Kahvaltı'); await p.waitForTimeout(600);
  d.bekle(/işaretlemesi resepsiyon görevlisi/.test(await govde(p)),
    'muhasebede kahvaltı sayfası salt okunur uyarısı veriyor');
  d.bekle(await p.locator('main input[type=checkbox]:disabled').count() > 0,
    'muhasebede kahvaltı kutuları pasif');

  /* ═══ 7) Ay sonu belgesi: muhasebe ister, resepsiyon hazırlar ═══ */
  await sayfa(p, 'Ay Sonu'); await p.waitForTimeout(500);
  d.bekle(await p.getByRole('button', { name: 'Belgeyi İste' }).count() === 1,
    'muhasebe belge talebi açabiliyor');
  await p.getByRole('button', { name: 'Belgeyi İste' }).click(); await p.waitForTimeout(700);
  const talepSatiri = await veriSatirlari(p).first().innerText();
  d.bekle(/Talep edildi/.test(talepSatiri), 'talep listeye düştü', talepSatiri.replace(/\n/g, ' | '));
  d.bekle(await p.getByRole('button', { name: 'Belgeyi Hazırla' }).count() === 0,
    'muhasebe belgeyi kendisi hazırlayamıyor');

  await rolDegistir(p, HESAP.resepsiyon);
  await sayfa(p, 'Ay Sonu'); await p.waitForTimeout(500);
  d.bekle(await p.getByRole('button', { name: 'Belgeyi İste' }).count() === 0,
    'resepsiyon belge talebi açamıyor');
  await p.getByRole('button', { name: 'Belgeyi Hazırla' }).click(); await p.waitForTimeout(900);
  const hazirSatir = await veriSatirlari(p).first().innerText();
  d.bekle(/Teslim edildi/.test(hazirSatir), 'resepsiyon belgeyi hazırladı', hazirSatir.replace(/\n/g, ' | '));
  d.bekle(/MSF2001/.test(hazirSatir), 'belgeyi kimin hazırladığı yazıyor');
  await p.getByRole('button', { name: 'Belgeyi Gör' }).click(); await p.waitForTimeout(800);
  const kaynak = await p.locator('iframe[title="Ay sonu belgesi"]').getAttribute('src');
  d.bekle((kaynak || '').startsWith('data:application/pdf'), 'belge PDF olarak üretildi');
  const pdf = Buffer.from((kaynak || '').split(',')[1] || '', 'base64').toString('latin1');
  for (const [ad, desen] of [['%PDF başlığı', /^%PDF-1\.4/], ['xref tablosu', /xref/], ['%%EOF', /%%EOF\s*$/],
                             ['kahvaltı satırı', /Verilen kahvalti/], ['konaklama gecesi', /konaklama gecesi/i],
                             ['tahsilat satırı', /Tahsil edilen/]])
    d.bekle(desen.test(pdf), `üretilen belgede ${ad} var`);
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
