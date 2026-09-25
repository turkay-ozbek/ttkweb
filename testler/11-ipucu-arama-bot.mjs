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
  const hedefKutu = await oto.boundingBox();
  d.bekle(kutu.x >= 0 && kutu.x + kutu.width <= 1680, 'ipucu ekran dışına taşmıyor');
  d.bekle(Math.abs((kutu.x + kutu.width / 2) - (hedefKutu.x + hedefKutu.width / 2)) <= 2,
    'ipucu düğmenin ortasına hizalı');
  await uzaklas();
  d.bekle(await balon.count() === 0, 'imleç ayrılınca ipucu kayboluyor');

  /* Açılırken kaymamalı: balon konumu betikte ölçülüp piksel olarak veriliyor,
     beliriş animasyonu yalnız saydamlığı değiştiriyor. */
  const manuel = p.getByRole('button', { name: '✋ Manuel Yerleştir', exact: true });
  const mk = await manuel.boundingBox();
  await p.mouse.move(mk.x + 2, mk.y + 2);
  await p.mouse.move(mk.x + mk.width / 2, mk.y + mk.height / 2);
  await p.waitForTimeout(250);
  const ilkKonum = await balon.boundingBox();
  await p.waitForTimeout(500);
  const sonKonum = await balon.boundingBox();
  d.bekle(Math.abs(sonKonum.x - ilkKonum.x) <= 1 && Math.abs(sonKonum.y - ilkKonum.y) <= 1,
    'ipucu açılırken yerinden kaymıyor', `kayma: ${Math.round(sonKonum.x - ilkKonum.x)} px`);
  await uzaklas();

  /* Ekranın sağ ucundaki düğmede balon kenardan taşmamalı */
  const cikisD = p.locator('header button[aria-label="Oturumu kapat"]');
  await uzerineGel(cikisD);
  const sagKutu = await balon.boundingBox();
  d.bekle(sagKutu.x + sagKutu.width <= 1680 - 6, 'sağ kenardaki düğmede balon ekran içinde kalıyor',
    `sağ kenar: ${Math.round(sagKutu.x + sagKutu.width)}`);
  await uzaklas();

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
  const aramaDugmesi = p.locator('nav button').filter({ hasText: 'Hangi işlemi' }).first();
  d.bekle(await aramaDugmesi.count() === 1, 'arama kutusu sayfa şeridinde duruyor');
  d.bekle(!(await aramaDugmesi.innerText()).includes('Ctrl'), 'arama kutusunda Ctrl K rozeti yok');
  d.bekle(/Ctrl \+ K/.test(await aramaDugmesi.getAttribute('data-ipucu') || ''),
    'kısayol arama kutusunun ipucunda yazıyor');
  const ak = await aramaDugmesi.boundingBox();
  const ck = await p.locator('header button[aria-label="Oturumu kapat"]').boundingBox();
  d.bekle(Math.abs((ak.x + ak.width) - (ck.x + ck.width)) <= 2,
    'arama kutusu çıkış düğmesiyle sağdan hizalı',
    `arama: ${Math.round(ak.x + ak.width)} · çıkış: ${Math.round(ck.x + ck.width)}`);

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
  const ak2 = await acDugmesi.boundingBox();
  d.bekle(ak2.width >= 68, `yardımcı düğmesi büyük (${Math.round(ak2.width)} px)`);
  await uzerineGel(acDugmesi);
  d.bekle(/^Madenci/.test(await balon.innerText()), 'yardımcının ipucunda adı «Madenci» yazıyor',
    await balon.innerText());
  await uzaklas();
  await acDugmesi.click(); await p.waitForTimeout(500);
  const panel = p.locator('[role=dialog][aria-label="Yardımcı bot"]');
  d.bekle(await panel.count() === 1, 'yardımcı penceresi açılıyor');
  d.bekle((await panel.innerText()).includes('Madenci'), 'yardımcının adı başlıkta yazıyor');
  d.bekle(/demo asistan|yapay zekâ servisine bağlanılmaz/i.test(await panel.innerText()),
    'demo asistan olduğu açıkça yazıyor');
  d.bekle(await acDugmesi.count() === 0, 'pencere açıkken açma düğmesi gizleniyor');

  /* önerilen sorular — bulunulan sayfaya göre değişir */
  const cipler = await panel.locator('button').filter({ hasText: /\?$/ }).allInnerTexts();
  d.bekle(cipler.length >= 2, `sayfaya göre öneri çipleri gösteriliyor (${cipler.length} adet)`, cipler.join(' · '));
  await p.locator('button[aria-label="Yardımcıyı kapat"]').click(); await p.waitForTimeout(300);
  await sayfa(p, 'Özet'); await p.waitForTimeout(300);
  await p.locator('button[aria-label="Yardımcıyı aç"]').click(); await p.waitForTimeout(400);
  const oneri = p.getByRole('button', { name: 'Bugün kaç yatak boş?' });
  d.bekle(await oneri.count() === 1, 'Özet sayfasında doluluk sorusu öneriliyor');
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
    ['kahvaltı yoklaması nasıl işlenir?', /Kahvaltı|kahvaltıya inmeyen/i],
    ['ay sonu belgesi nasıl hazırlanır?', /Ay sonu|belgeyi/i],
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

  /* Pencere açıkken yardımcı düğmesi gizlenmeli: pencerenin sağ alt köşesindeki
     düğmelerin (Kaydet, Reddet…) üstüne binmesin. */
  await sayfa(p, 'Talepler');
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(600);
  d.bekle(!(await p.locator('button[aria-label="Yardımcıyı aç"]').isVisible()),
    'pencere açıkken yardımcı düğmesi gizleniyor');
  await p.getByRole('button', { name: 'Vazgeç', exact: true }).first().click();
  await p.waitForTimeout(400);
  d.bekle(await p.locator('button[aria-label="Yardımcıyı aç"]').isVisible(),
    'pencere kapanınca yardımcı düğmesi geri geliyor');
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
