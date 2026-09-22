/* Açılır takvim ve işlemi kısaltan düğmeler: süre kısayolları, statü çipleri,
   daha önce kalmış misafirin bulunup bilgilerinin doldurulması */
import { defter, tarayici, giris, sayfa, govde, HESAP, trTarih, veriSatirlari,
         satirSayisi, pencereKapat, formTc, formAd } from './ortak.mjs';

const d = defter('14 — Takvim ve kısayollar');
const { b, p } = await tarayici(d);
const pencere = () => p.locator('.fixed.inset-0').last();
const takvim = p.locator('[role=dialog][aria-label="Takvim"]');

try {
  await giris(p, HESAP.mudur);

  /* ═══ 1) Takvim simgesi ve paneli ═══ */
  await sayfa(p, 'Takvim');
  const takvimDugmesi = p.locator('main').getByRole('button', { name: 'Takvimden seç' }).first();
  d.bekle(await takvimDugmesi.count() === 1, 'tarih kutusunun yanında takvim simgesi var');
  await takvimDugmesi.click(); await p.waitForTimeout(500);
  d.bekle(await takvim.count() === 1, 'simgeye tıklayınca takvim açılıyor');

  const baslik = (await takvim.innerText()).split('\n').find(x => /\d{4}/.test(x)) || '';
  d.bekle(/(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık) \d{4}/.test(baslik),
    'takvim başlığında ay ve yıl yazıyor', baslik);
  const gunler = await takvim.locator('button').filter({ hasText: /^\d{1,2}$/ }).count();
  d.bekle(gunler >= 28 && gunler <= 31, `ayın günleri listeleniyor (${gunler} gün)`);
  const haftaBasliklari = await takvim.locator('div.grid-cols-7').first().innerText();
  d.bekle(/Pt\s*Sa\s*Ça\s*Pe\s*Cu\s*Ct\s*Pz/.test(haftaBasliklari.replace(/\n/g, ' ')),
    'hafta pazartesiden başlıyor', haftaBasliklari.replace(/\n/g, ' '));

  /* Panel ekran içinde ve yerinde durmalı */
  const k1 = await takvim.boundingBox();
  await p.waitForTimeout(400);
  const k2 = await takvim.boundingBox();
  d.bekle(Math.abs(k1.x - k2.x) <= 1 && Math.abs(k1.y - k2.y) <= 1, 'takvim açılırken yerinden kaymıyor');
  d.bekle(k2.x >= 0 && k2.x + k2.width <= 1680 && k2.y >= 0, 'takvim ekran içinde kalıyor');

  /* Ay ileri-geri */
  await takvim.getByRole('button', { name: '▶' }).click(); await p.waitForTimeout(300);
  const sonraki = (await takvim.innerText()).split('\n').find(x => /\d{4}/.test(x));
  d.bekle(sonraki !== baslik, 'sonraki ay düğmesi ayı ilerletiyor', `${baslik} → ${sonraki}`);
  await takvim.getByRole('button', { name: '◀' }).click(); await p.waitForTimeout(300);
  d.bekle((await takvim.innerText()).includes(baslik.split(' ')[0]), 'önceki ay düğmesi geri alıyor');

  /* Gün seçimi kutuya yazılmalı */
  const hedefKutu = p.locator('main input[placeholder="GG.AA.YYYY"]').first();
  await takvim.getByRole('button', { name: '15', exact: true }).click(); await p.waitForTimeout(400);
  d.bekle((await hedefKutu.inputValue()).startsWith('15.'), 'takvimden seçilen gün kutuya yazılıyor',
    await hedefKutu.inputValue());
  d.bekle(await takvim.count() === 0, 'gün seçilince takvim kapanıyor');

  /* Kısayol düğmeleri ve Esc */
  await takvimDugmesi.click(); await p.waitForTimeout(400);
  d.bekle(await takvim.getByRole('button', { name: 'Bugün' }).count() === 1, 'takvimde «Bugün» kısayolu var');
  await takvim.getByRole('button', { name: '+1 hafta' }).click(); await p.waitForTimeout(400);
  const haftaSonra = await trTarih(p, 7);
  d.bekle(await hedefKutu.inputValue() === haftaSonra, '«+1 hafta» bir hafta sonrasını seçiyor',
    `${await hedefKutu.inputValue()} ≠ ${haftaSonra}`);
  await takvimDugmesi.click(); await p.waitForTimeout(400);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  d.bekle(await takvim.count() === 0, 'Esc takvimi kapatıyor');

  /* ═══ 2) Sınırlı takvim: çıkış tarihi gelişten önce seçilemez ═══ */
  await sayfa(p, 'Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click(); await p.waitForTimeout(600);
  const form = pencere();
  const gelisDeger = await p.getByLabel(/Geliş Tarihi/).inputValue();
  const cikisTakvimi = form.locator('label:has-text("Çıkış Tarihi") button[aria-label="Takvimden seç"]');
  await cikisTakvimi.click(); await p.waitForTimeout(500);
  const gelisGunu = Number(gelisDeger.slice(0, 2));
  const kapaliGun = takvim.locator('button').filter({ hasText: new RegExp(`^${gelisGunu}$`) }).first();
  d.bekle(await kapaliGun.isDisabled(), 'çıkış takviminde geliş günü ve öncesi seçilemiyor');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  /* ═══ 3) Süre kısayolları ═══ */
  const sureler = await form.locator('button').filter({ hasText: /^(1 gece|2 gece|3 gece|1 hafta|2 hafta|1 ay)$/ }).allInnerTexts();
  d.bekle(sureler.length === 6, 'altı süre kısayolu gösteriliyor', sureler.join(' · '));
  await form.getByRole('button', { name: '3 gece', exact: true }).click(); await p.waitForTimeout(400);
  d.bekle((await form.innerText()).match(/KALDIĞI GÜN\s*\n\s*−\s*\n?\s*3/),
    '«3 gece» kısayolu kalış süresini 3 yapıyor');
  await form.getByRole('button', { name: '1 hafta', exact: true }).click(); await p.waitForTimeout(400);
  const cikis = await p.getByLabel(/Çıkış Tarihi/).inputValue();
  d.bekle(cikis !== gelisDeger, '«1 hafta» çıkış tarihini bir hafta ileri alıyor', `${gelisDeger} → ${cikis}`);

  /* ═══ 4) Daha önce kalmış misafiri bulma ═══ */
  const bulDugmesi = form.locator('tbody button[data-ipucu*="Daha önce kalmış"]').first();
  d.bekle(await bulDugmesi.count() === 1, 'misafir satırında geçmiş arama düğmesi var');
  await bulDugmesi.click(); await p.waitForTimeout(600);
  const aramaPenceresi = pencere();
  d.bekle(/Daha Önce Kalmış Misafiri Bul/.test(await aramaPenceresi.innerText()), 'arama penceresi açılıyor');
  await aramaPenceresi.locator('input').first().fill('me'); await p.waitForTimeout(400);
  d.bekle(/en az üç karakter/.test(await aramaPenceresi.innerText()), 'üç karakterden kısa aramada yol gösteriliyor');
  await aramaPenceresi.locator('input').first().fill('zzzyokboyle'); await p.waitForTimeout(500);
  d.bekle(/bulunamadı/.test(await aramaPenceresi.innerText()), 'bulunamayan misafirde açıklama veriliyor');

  await aramaPenceresi.locator('input').first().fill('mehmet'); await p.waitForTimeout(600);
  const sonuc = aramaPenceresi.locator('button').filter({ hasText: /kez kaldı/ });
  d.bekle(await sonuc.count() > 0, `adla arama sonuç veriyor (${await sonuc.count()} misafir)`);
  const ilkSonuc = await sonuc.first().innerText();
  d.bekle(/MEHMET/i.test(ilkSonuc), 'sonuçlar aranan adla eşleşiyor', ilkSonuc.split('\n')[0]);
  d.bekle(/son çıkış \d{2}\.\d{2}\.\d{4}/.test(ilkSonuc), 'sonuçta son konaklama tarihi yazıyor');
  d.bekle(/kez kaldı/.test(ilkSonuc), 'sonuçta kaç kez kaldığı yazıyor');

  const secilenAd = (ilkSonuc.split('\n')[0] || '').replace('★', '').trim().split('\t')[0];
  await sonuc.first().click(); await p.waitForTimeout(600);
  const dolanAd = await formAd(p).first().inputValue();
  const dolanTc = await formTc(p).first().inputValue();
  d.bekle(dolanAd.length > 3, 'seçilen misafirin adı satıra dolduruldu', dolanAd);
  d.bekle(dolanTc.replace(/\D/g, '').length === 11, 'Tc kimlik no da dolduruldu', dolanTc);

  /* Tc kimlik no elle yazılınca geçmiş hatırlatması çıkmalı */
  await formTc(p).first().fill('');
  await formAd(p).first().fill('');
  await p.waitForTimeout(300);
  await formTc(p).first().fill(dolanTc.replace(/\D/g, ''));
  await p.waitForTimeout(600);
  const hatirlatma = form.locator('button').filter({ hasText: /kez kaldı/ });
  d.bekle(await hatirlatma.count() === 1, 'Tc kimlik no tamamlanınca geçmiş konaklama hatırlatılıyor');
  await hatirlatma.first().click(); await p.waitForTimeout(500);
  d.bekle((await formAd(p).first().inputValue()).length > 3, '«bilgileri doldur» kısayolu satırı dolduruyor');
  await form.getByRole('button', { name: 'Vazgeç', exact: true }).click(); await p.waitForTimeout(400);

  /* ═══ 5) Talep listesi statü çipleri ═══ */
  const cipler = await p.locator('main button').filter({ hasText: /^(Bekleyen işler|Yatağı yok|Kapora bekleyen|Onayda|Tümü)$/ }).allInnerTexts();
  d.bekle(cipler.length === 5, 'beş statü çipi gösteriliyor', cipler.join(' · '));
  const oncekiSayi = await satirSayisi(p);
  await p.getByRole('button', { name: 'Kapora bekleyen', exact: true }).click(); await p.waitForTimeout(500);
  const kaporaSatirlari = await veriSatirlari(p).allInnerTexts();
  d.bekle(kaporaSatirlari.length > 0 && kaporaSatirlari.every(x => /Kapora Bkl/.test(x)),
    'çip listeyi tek statüye süzüyor', `${kaporaSatirlari.length} satır`);
  await p.getByRole('button', { name: 'Tümü', exact: true }).click(); await p.waitForTimeout(500);
  d.bekle(await satirSayisi(p) >= oncekiSayi, '«Tümü» çipi bütün kayıtları getiriyor');
  const secili = await p.locator('main button.bg-ttk-600').filter({ hasText: /^Tümü$/ }).count();
  d.bekle(secili === 1, 'seçili çip görsel olarak işaretleniyor');
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
