/* Test planı bölüm 2 (yeni rezervasyon kaydı) ve 10.5 (sınır durumları) */
import { defter, tarayici, giris, sayfa, govde, HESAP, yeniKayit, kaydet,
         trTarih, tarihYaz, taleplerdeAra, formTc, formAd, kisiDugmeleri } from './ortak.mjs';

const d = defter('07 — Yeni kayıt doğrulamaları ve sınır durumları');
const { b, p } = await tarayici(d);

try {
  await giris(p, HESAP.resepsiyon);
  await sayfa(p, 'Talepler');

  /* ═══ 2.1 Zorunlu alan denetimi ═══ */
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(400);
  d.bekle(await p.getByRole('button', { name: 'Kaydet', exact: true }).isDisabled(),
    'boş formda «Kaydet» pasif');
  const bosAltlik = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/eksik\/hatalı alan/.test(bosAltlik), 'eksik alan sayısı formun altında yazıyor');

  /* geçersiz Tc kimlik no */
  await p.getByLabel(/Adı Soyadı/).first().fill('DOGRULAMA TESTI');
  await formTc(p).first().fill('12345');
  await formAd(p).first().fill('DOGRULAMA TESTI');
  await p.waitForTimeout(400);
  const kisaTc = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/eksik\/hatalı alan/.test(kisaTc), '5 haneli Tc kimlik no hata sayısına giriyor');
  await formTc(p).first().fill('01234567890');
  await p.waitForTimeout(400);
  const sifirTc = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/eksik\/hatalı alan/.test(sifirTc), '0 ile başlayan Tc kimlik no reddediliyor');
  await formTc(p).first().fill('11223344556');
  await p.waitForTimeout(400);
  d.bekle(!(await p.getByRole('button', { name: 'Kaydet', exact: true }).isDisabled()),
    'geçerli Tc girilince «Kaydet» etkinleşiyor');

  /* ═══ 10.5 Tarih kutusu sınır durumları ═══ */
  const gelisKutu = p.getByLabel(/Geliş Tarihi/), cikisKutu = p.getByLabel(/Çıkış Tarihi/);
  const oncekiGelis = await gelisKutu.inputValue();
  await tarihYaz(gelisKutu, '32.13.2026');
  d.bekle(await gelisKutu.inputValue() === oncekiGelis, 'geçersiz tarih (32.13.2026) eski değere dönüyor');
  await tarihYaz(gelisKutu, 'abc');
  d.bekle(await gelisKutu.inputValue() === oncekiGelis, 'metin girilen tarih kutusu eski değere dönüyor');

  /* çıkış tarihini gelişten öne almak */
  await tarihYaz(gelisKutu, await trTarih(p, 15));
  await tarihYaz(cikisKutu, await trTarih(p, 12));
  await p.waitForTimeout(300);
  const ters = await p.locator('.fixed.inset-0').last().innerText();
  const cikisSon = await cikisKutu.inputValue();
  d.bekle(/eksik\/hatalı alan/.test(ters) || cikisSon !== await trTarih(p, 12),
    'çıkış tarihi gelişten öne alınamıyor (reddediliyor ya da düzeltiliyor)', 'çıkış: ' + cikisSon);

  /* geliş tarihini ileri alınca çıkış kendiliğinden kayıyor mu */
  await tarihYaz(gelisKutu, await trTarih(p, 10));
  await tarihYaz(cikisKutu, await trTarih(p, 13));
  await tarihYaz(gelisKutu, await trTarih(p, 20));
  await p.waitForTimeout(300);
  d.bekle(await cikisKutu.inputValue() !== await trTarih(p, 13), 'geliş ileri alınınca çıkış tarihi de kaydırılıyor');

  /* ok tuşlarıyla gün değiştirme */
  await tarihYaz(gelisKutu, await trTarih(p, 10));
  await gelisKutu.press('ArrowUp'); await p.waitForTimeout(250);
  d.bekle(await gelisKutu.inputValue() === await trTarih(p, 11), 'yukarı ok tarihi bir gün ileri alıyor');
  await gelisKutu.press('ArrowDown'); await p.waitForTimeout(250);
  d.bekle(await gelisKutu.inputValue() === await trTarih(p, 10), 'aşağı ok tarihi bir gün geri alıyor');

  /* ═══ 2.4 Kişi sayısı ve aile ═══ */
  for (let i = 0; i < 2; i++) { await kisiDugmeleri(p).nth(1).click(); await p.waitForTimeout(200); }
  d.bekle(await formTc(p).count() === 3, 'kişi sayısı 3 olunca misafir satırı 3 oldu');
  await kisiDugmeleri(p).nth(0).click(); await p.waitForTimeout(250);
  d.bekle(await formTc(p).count() === 2, 'kişi sayısı azaltılınca satır siliniyor');
  const tcler = await formTc(p).all();
  const adlar = await formAd(p).all();
  for (let i = 0; i < tcler.length; i++) { await tcler[i].fill(String(11223344556 + i * 11)); await adlar[i].fill(`DOGRULAMA TESTI ${i + 1}`); }
  await p.getByText('Aile / birlikte kalacak').click();
  await p.waitForTimeout(300);

  /* ═══ 2.3 Kurum kaydı — kapora aranmaz ═══ */
  const kurumAltlik = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/statü: ?Talep/i.test(kurumAltlik.replace(/\s+/g, ' ')), 'kurum kaydında açılış statüsü «Talep»',
    (kurumAltlik.match(/statü:.*/i) || [''])[0]);

  /* ═══ 2.5 Formdan otomatik yatak bulma ═══ */
  await p.getByRole('button', { name: /Uygun Yatağı Otomatik Bul/ }).click();
  await p.waitForTimeout(700);
  const otoAltlik = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/statü: ?(Onaylı|Konaklıyor)/i.test(otoAltlik.replace(/\s+/g, ' ')),
    'otomatik yatak bulunca statü «Onaylı»ya dönüyor', (otoAltlik.match(/statü:.*/i) || [''])[0]);
  await kaydet(p, { kaydet: p.getByRole('button', { name: 'Kaydet', exact: true }) });
  const satir = await taleplerdeAra(p, 'DOGRULAMA TESTI', { gunSonra: 60 });
  const satirMetni = await satir.innerText();
  d.bekle(/Onaylı|Konaklıyor/.test(satirMetni), 'kayıt yatağıyla birlikte açıldı', satirMetni.replace(/\n/g, ' | '));
  d.bekle(/⚭/.test(satirMetni), 'aile işareti (⚭) listede görünüyor', satirMetni.replace(/\n/g, ' | '));
  d.bekle(/aranmıyor/.test(satirMetni), 'kurum kaydında kapora «aranmıyor»', satirMetni.replace(/\n/g, ' | '));

  /* ═══ 2.2 Şahıs kaydı — kapora doğuyor ═══ */
  const f2 = await yeniKayit(p, { ad: 'SAHIS TESTI', ekGun: 18, gece: 4, sahis: true });
  const sahisAltlik = await f2.altlik();
  d.bekle(/Kapora|Peşinat/i.test(sahisAltlik), 'şahıs kaydında kapora tutarı formda görünüyor');
  d.bekle(/statü: ?Kapora Bekleniyor/i.test(sahisAltlik.replace(/\s+/g, ' ')),
    'şahıs kaydında açılış statüsü «Kapora Bekleniyor»', (sahisAltlik.match(/statü:.*/i) || [''])[0]);
  await kaydet(p, f2);
  const satir2 = await taleplerdeAra(p, 'SAHIS TESTI', { gunSonra: 60 });
  const satir2Metni = await satir2.innerText();
  d.bekle(/₺/.test(satir2Metni), 'şahıs kaydının kapora tutarı listede yazıyor', satir2Metni.replace(/\n/g, ' | '));
  d.bekle(/Kapora Bkl/.test(satir2Metni), 'şahıs kaydı «Kapora Bekleniyor» statüsünde');

  /* ═══ 10.5 «Vazgeç» hiçbir kayıt oluşturmuyor ═══ */
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(400);
  await p.getByLabel(/Adı Soyadı/).first().fill('VAZGECILEN KAYIT');
  await p.getByRole('button', { name: 'Vazgeç', exact: true }).click();
  await p.waitForTimeout(500);
  const vazgecSatir = await taleplerdeAra(p, 'VAZGECILEN KAYIT', { gunSonra: 60 });
  d.bekle(await vazgecSatir.count() === 0, '«Vazgeç» ile kapatılan form kayıt oluşturmuyor');

  /* ═══ 10.5 Aynı Tc ile ikinci kayıt — kabul, arama ikisini de bulur ═══ */
  const f3 = await yeniKayit(p, { ad: 'IKINCI KAYIT', ekGun: 25, gece: 2 });
  await kaydet(p, f3);
  const ayniTc = await taleplerdeAra(p, '12345678901', { gunSonra: 60 });
  d.bekle(await p.locator('table tbody tr').count() >= 2,
    'aynı Tc kimlik no ile arama birden çok kaydı buluyor', `${await p.locator('table tbody tr').count()} satır`);

  /* ═══ Arama alanları: ad soyad, Tc, rezervasyon no ═══ */
  const rezSatir = await taleplerdeAra(p, 'SAHIS TESTI', { gunSonra: 60 });
  const rezNo = (await govde(p)).match(/MSF-\d{4}-\d+/);
  if (rezNo) {
    await p.getByPlaceholder(/Ad soyad/).first().fill(rezNo[0]);
    await p.waitForTimeout(450);
    d.bekle(await p.locator('table tbody tr').count() === 1, 'rezervasyon numarasıyla arama tek kaydı buluyor');
  }
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
