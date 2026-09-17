/* Üç yeni yardım öğesi: ipucu (tooltip) katmanı, işlem araması ve yardımcı bot */
import { defter, tarayici, giris, rolDegistir, sayfa, govde, HESAP,
         taleplerdeAra, veriSatirlari, satirSayisi } from './ortak.mjs';

const d = defter('11 — İpucu, işlem araması ve yardımcı bot');
const { b, p } = await tarayici(d);
const balon = p.locator('#ipucu-balonu');
const uzerineGel = async (loc) => {
  const k = await loc.boundingBox();
  await p.mouse.move(k.x + 2, k.y + 2);
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
  await p.waitForTimeout(700);
};
const uzaklas = async () => { await p.mouse.move(5, 5); await p.waitForTimeout(400); };

try {
  await giris(p, HESAP.mudur);

  /* ═══ 1) İPUCU KATMANI ═══ */
  await sayfa(p, 'Talepler');
  await veriSatirlari(p).first().click(); await p.waitForTimeout(400);

  const oto = p.getByRole('button', { name: '⚙ Otomatik Yerleştir', exact: true });
  await uzaklas();   // imleç tıklanan satırın üstünde kalmasın
  d.bekle(await balon.count() === 0, 'ipucu balonu yalnız gerektiğinde çıkıyor');
  await uzerineGel(oto);
  d.bekle(await balon.count() === 1, 'düğmenin üzerine gelince ipucu çıkıyor');
  const metin = await balon.innerText();
  d.bekle(/kapasite|öneri/i.test(metin), 'ipucu düğmenin ne yaptığını anlatıyor', metin.slice(0, 70));
  const kutu = await balon.boundingBox();
  d.bekle(kutu.x >= 0 && kutu.x + kutu.width <= 1680, 'ipucu ekran dışına taşmıyor');
  await uzaklas();
  d.bekle(await balon.count() === 0, 'imleç ayrılınca ipucu kayboluyor');

  /* title'ı olan öğede tarayıcının kendi balonu değil, bizimki çıkmalı */
  const tarihKutusu = p.getByPlaceholder('GG.AA.YYYY').first();
  await uzerineGel(tarihKutusu);
  d.bekle(await balon.count() === 1, 'yalnız title taşıyan öğede de ipucu çıkıyor');
  d.bekle(await tarihKutusu.getAttribute('title') === null,
    'devralınan title kaldırılıyor (tarayıcının sarı balonu çıkmaz)');
  await uzaklas();

  /* pasif düğmede yetki gerekçesi — muhasebe rolü */
  await rolDegistir(p, HESAP.muhasebe);
  await sayfa(p, 'Talepler');
  await veriSatirlari(p).first().click(); await p.waitForTimeout(400);
  const pasif = p.getByRole('button', { name: '⚙ Otomatik Yerleştir', exact: true });
  d.bekle(await pasif.isDisabled(), 'muhasebede yerleştirme düğmesi pasif');
  await uzerineGel(pasif);
  d.bekle(await balon.count() === 1, 'PASİF düğmede de ipucu çıkıyor');
  d.bekle(/yetki/i.test(await balon.innerText()), 'pasif düğmenin ipucu yetki gerekçesini yazıyor',
    (await balon.innerText()).slice(0, 70));
  await uzaklas();
  await rolDegistir(p, HESAP.mudur);

  /* ═══ 2) İŞLEM ARAMASI ═══ */
  const ustBar = await p.locator('header > div').first().innerText();
  d.bekle(ustBar.includes('Hangi işlemi yapmak istiyorsunuz?'), 'üst bantta arama kutusu duruyor');

  await p.keyboard.press('Control+k'); await p.waitForTimeout(400);
  const pencere = p.locator('input[aria-label="İşlem ara"]');
  d.bekle(await pencere.count() === 1, 'Ctrl + K aramayı açıyor');
  d.bekle(await pencere.getAttribute('placeholder') === 'Hangi işlemi yapmak istiyorsunuz?',
    'arama kutusunun yazısı doğru');
  d.bekle(await p.locator('.fixed.inset-0 button').count() > 3, 'arama boşken sık kullanılan işlemler listeleniyor');

  /* sayfa arama */
  await pencere.fill('takvim'); await p.waitForTimeout(400);
  const sonuc1 = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/Doluluk Takvimi/.test(sonuc1), 'sayfa adıyla arama sonuç veriyor');
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  d.bekle((await govde(p)).includes('Doluluk Takvimi'), 'Enter seçili sonuca götürüyor');

  /* işlem arama — yeni kayıt formunu açar */
  await p.keyboard.press('Control+k'); await p.waitForTimeout(400);
  await p.locator('input[aria-label="İşlem ara"]').fill('yeni kayit'); await p.waitForTimeout(400);
  await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  d.bekle((await p.locator('.fixed.inset-0').last().innerText()).includes('Yeni Rezervasyon / Kayıt Girişi'),
    'aramadan «yeni kayıt» işlemi formu açıyor');
  await p.getByRole('button', { name: 'Vazgeç', exact: true }).click(); await p.waitForTimeout(400);

  /* ok tuşlarıyla gezinme */
  await p.keyboard.press('Control+k'); await p.waitForTimeout(400);
  await p.locator('input[aria-label="İşlem ara"]').fill('tahsil'); await p.waitForTimeout(400);
  const ilkSecili = await p.locator('.fixed.inset-0 button[aria-selected="true"]').innerText();
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(250);
  const ikinciSecili = await p.locator('.fixed.inset-0 button[aria-selected="true"]').innerText();
  d.bekle(ilkSecili !== ikinciSecili, 'aşağı ok seçimi bir sonraki sonuca taşıyor');
  await p.keyboard.press('ArrowUp'); await p.waitForTimeout(250);
  d.bekle(await p.locator('.fixed.inset-0 button[aria-selected="true"]').innerText() === ilkSecili,
    'yukarı ok seçimi geri alıyor');

  /* sonuç bulunamayınca yol gösteriyor */
  await p.locator('input[aria-label="İşlem ara"]').fill('zzzyokboyle'); await p.waitForTimeout(400);
  d.bekle(/sonuç yok/i.test(await p.locator('.fixed.inset-0').last().innerText()),
    'sonuç bulunamayınca açıklama gösteriliyor');

  /* Esc kapatıyor */
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  d.bekle(await p.locator('input[aria-label="İşlem ara"]').count() === 0, 'Esc aramayı kapatıyor');

  /* kayıt arama — ad soyad ve rezervasyon no ile */
  await sayfa(p, 'Talepler');
  const ornekSatir = await veriSatirlari(p).first().innerText();
  const ad = ornekSatir.split('\t')[0].replace(/^★/, '').replace(/ ve (Ailesi|Ark\.)$/, '').trim();
  await p.keyboard.press('Control+k'); await p.waitForTimeout(400);
  await p.locator('input[aria-label="İşlem ara"]').fill(ad); await p.waitForTimeout(600);
  const kayitSonuc = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/KAYIT/i.test(kayitSonuc) && kayitSonuc.includes('MSF-'),
    'misafir adıyla arama kayıt sonuçları getiriyor', kayitSonuc.split('\n').slice(0, 3).join(' | '));
  const kayitDugmesi = p.locator('.fixed.inset-0 button').filter({ hasText: 'MSF-' }).first();
  await kayitDugmesi.click(); await p.waitForTimeout(700);
  const govdeSonrasi = await govde(p);
  d.bekle(/aramadan açıldı/.test(govdeSonrasi), 'aramadan seçilen kayıt talep ekranında açılıyor',
    (govdeSonrasi.match(/.*aramadan açıldı.*/) || [''])[0].slice(0, 90));

  /* ═══ 3) YARDIMCI BOT ═══ */
  const acDugmesi = p.locator('button[aria-label="Yardımcıyı aç"]');
  d.bekle(await acDugmesi.count() === 1, 'yardımcı düğmesi ekranda duruyor');
  d.bekle(await acDugmesi.locator('svg').count() === 1, 'yardımcı düğmesinde maskot simgesi var');
  await acDugmesi.click(); await p.waitForTimeout(500);
  const panel = p.locator('[role=dialog][aria-label="Yardımcı bot"]');
  d.bekle(await panel.count() === 1, 'yardımcı penceresi açılıyor');
  d.bekle((await panel.innerText()).includes('Bareti'), 'yardımcının adı başlıkta yazıyor');
  d.bekle(/demo asistan|yapay zekâ servisine bağlanılmaz/i.test(await panel.innerText()),
    'demo asistan olduğu açıkça yazıyor');
  d.bekle(await acDugmesi.count() === 0, 'pencere açıkken açma düğmesi gizleniyor');

  /* önerilen sorular */
  const oneri = p.getByRole('button', { name: 'Bugün kaç yatak boş?' });
  d.bekle(await oneri.count() === 1, 'önerilen sorular gösteriliyor');
  await oneri.click(); await p.waitForTimeout(800);
  const dolulukYaniti = (await panel.innerText());
  d.bekle(/yatak dolu \(%\d+\)/.test(dolulukYaniti), 'doluluk sorusuna canlı veriyle yanıt veriyor',
    (dolulukYaniti.match(/.*yatak dolu.*/) || [''])[0].slice(0, 80));

  /* soru → beklenen yanıt eşleşmeleri */
  const sorular = [
    ['kapora nasıl işlenir?',            /Kapora \/ peşinat alındığında/],
    ['dekont nasıl onaylanır?',          /Dekont yükleme ve müdür onayı/],
    ['misafiri odaya nasıl yerleştiririm?', /Oda ve yatak yerleştirmesi/],
    ['misafir çıkışı nasıl yapılır?',    /Giriş, çıkış, uzatma ve iptal/],
    ['yeni kayıt nasıl açılır?',         /Yeni rezervasyon kaydı nasıl açılır/],
    ['kaç dekont onay bekliyor?',        /onayı bekleyen \d+ dekont/],
    ['tahsilat bekleyen kaç kayıt var?', /Tahsilat bekleyen \d+ kayıt/],
    ['kapora tutarı ne kadar?',          /kuralına göre şahsi misafirde kapora/],
    ['yetkilerim neler?',                /rolündesiniz/],
    ['hava nasıl olacak',                /tam anlayamadım/],
  ];
  const kutu2 = p.locator('input[aria-label="Yardımcıya soru yazın"]');
  for (const [soru, desen] of sorular) {
    await kutu2.fill(soru);
    await p.keyboard.press('Enter');
    await p.waitForTimeout(700);
    const balonlar = await panel.locator('.whitespace-pre-line').allInnerTexts();
    const son = balonlar[balonlar.length - 1] || '';
    d.bekle(desen.test(son), `bot «${soru}» sorusunu doğru anlıyor`, son.split('\n')[0].slice(0, 70));
  }

  /* yanıttaki bağlantı ilgili sayfaya götürüyor */
  await kutu2.fill('dekont nasıl onaylanır?');
  await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  /* Sohbet geçmişinde önceki yanıtların bağlantıları da duruyor; en sonuncusu alınır. */
  const eylem = panel.locator('button').filter({ hasText: /sayfasını aç|Rehberde tamamını oku/ }).last();
  d.bekle(await eylem.count() > 0, 'bot yanıtında ilgili sayfaya bağlantı var');
  await eylem.click(); await p.waitForTimeout(700);
  d.bekle(await p.locator('[role=dialog][aria-label="Yardımcı bot"]').count() === 0,
    'bağlantıya tıklayınca yardımcı kapanıyor');
  d.bekle(/Kullanım Rehberi|Dekont ve Onay/.test(await govde(p)), 'bağlantı doğru sayfayı açıyor');

  /* kapatma düğmesi */
  await p.locator('button[aria-label="Yardımcıyı aç"]').click(); await p.waitForTimeout(500);
  await p.locator('button[aria-label="Yardımcıyı kapat"]').click(); await p.waitForTimeout(400);
  d.bekle(await p.locator('[role=dialog][aria-label="Yardımcı bot"]').count() === 0, 'yardımcı kapatılabiliyor');
  d.bekle(await p.locator('button[aria-label="Yardımcıyı aç"]').count() === 1, 'kapatınca açma düğmesi geri geliyor');

  /* yardımcı ve ölçek kutusu üst üste binmemeli */
  const y1 = await p.locator('button[aria-label="Yardımcıyı aç"]').boundingBox();
  const y2 = await p.locator('.fixed.right-3.bottom-12').boundingBox();
  d.bekle(y1.y + y1.height <= y2.y + 2, 'yardımcı düğmesi ölçek kutusuyla çakışmıyor',
    `bot alt: ${Math.round(y1.y + y1.height)} · ölçek üst: ${Math.round(y2.y)}`);
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
