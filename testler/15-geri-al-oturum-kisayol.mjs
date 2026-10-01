/* Test planı bölüm 15 — işi geri alma şeridi, oturum zaman aşımı, klavye
   kısayolları ve listelerin Excel/CSV dışa aktarımı.
   Bu dört işlev «yanlış tıkladım» ve «bilgisayarı açık bıraktım» durumlarının
   karşılığıdır; hepsi arayüzün görünür bir parçası olduğu için ayrı denetlenir. */
import { readFileSync } from 'fs';
import { defter, tarayici, giris, HESAP, sayfa, govde, veriSatirlari } from './ortak.mjs';

const d = defter('15 — Geri al, oturum ve kısayollar');
const { b, p } = await tarayici(d);
await giris(p, HESAP.admin);

/* ═══ 1) Geri alma şeridi — tahsis kaldırma geri alınabiliyor ═══ */
await sayfa(p, 'Yatak Listesi');
await p.waitForTimeout(400);
const doluSatir = veriSatirlari(p).filter({ hasNot: p.locator('text=— boş —') }).first();
const misafirAdi = (await doluSatir.locator('td').nth(5).innerText()).trim().split('\n')[0];
d.bekle(misafirAdi.length > 3, 'yatak listesinden yerleşik bir misafir seçildi', misafirAdi);

await sayfa(p, 'Talepler');
await p.locator('main select').first().selectOption('HEPSI');
await p.getByPlaceholder(/Ad soyad/).first().fill(misafirAdi);
await p.waitForTimeout(500);
const satir = veriSatirlari(p).first();
await satir.click();
await p.waitForTimeout(400);
let g = await govde(p);
d.bekle(/Oda \d+ \/ Yatak \d+/.test(g), 'seçili kayıtta yatak tahsisi görünüyor');

await p.getByRole('button', { name: 'Tahsisi Kaldır' }).click();
await p.waitForTimeout(600);
const serit = p.locator('[role="status"]');
d.bekle(await serit.count() > 0, 'tahsis kaldırılınca geri alma şeridi çıktı');
const seritMetni = await serit.first().innerText();
d.bekle(/Geri Al/.test(seritMetni), 'şeritte «Geri Al» düğmesi var', seritMetni.replace(/\n/g, ' | '));
g = await govde(p);
d.bekle(/yerleşmedi/.test(g), 'tahsis gerçekten kaldırıldı');

await serit.first().getByRole('button', { name: /Geri Al/ }).click();
await p.waitForTimeout(700);
g = await govde(p);
d.bekle(/Oda \d+ \/ Yatak \d+/.test(g), 'geri alma tahsisi eski hâline döndürdü');
d.bekle(await p.locator('[role="status"]').count() === 0, 'geri alındıktan sonra şerit kapandı');

/* ═══ 2) Klavye kısayolları ═══ */
await p.locator('body').click({ position: { x: 5, y: 5 } });
await p.keyboard.press('?');
await p.waitForTimeout(400);
let pencere = p.locator('.fixed.inset-0').last();
d.bekle(/Klavye kısayolları/.test(await pencere.innerText()), '«?» tuşu kısayol listesini açıyor');
const kisayolSatir = await pencere.locator('tbody tr').count();
d.bekle(kisayolSatir >= 9, 'kısayol listesinde bütün tuşlar yazılı', kisayolSatir + ' satır');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
d.bekle(await p.locator('.fixed.inset-0').count() === 0, 'Esc kısayol listesini kapatıyor');

await p.keyboard.press('n');
await p.waitForTimeout(500);
d.bekle(/Yeni Rezervasyon/.test(await p.locator('.fixed.inset-0').last().innerText()),
  '«N» yeni kayıt formunu açıyor');
await p.getByRole('button', { name: 'Vazgeç' }).first().click();
await p.waitForTimeout(400);

await p.keyboard.press('b');
await p.waitForTimeout(400);
d.bekle(/Bekleyen İşler/.test(await p.locator('.fixed.inset-0').last().innerText()),
  '«B» bekleyen işler penceresini açıyor');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);

await p.keyboard.press('g');
await p.waitForTimeout(500);
d.bekle(/Hangi işi yapacaksınız|Ana Menü|Bugünkü Durum/.test(await govde(p)), '«G» ana menüye dönüyor');

/* ═══ 3) Excel/CSV dışa aktarımı ═══ */
const csvSayfalari = ['Yatak Listesi', 'Talepler', 'Tahsilat', 'Kahvaltı', 'Kat Hizmetleri'];
for (const ad of csvSayfalari) {
  await sayfa(p, ad);
  await p.waitForTimeout(400);
  const dugme = p.locator('main').getByRole('button', { name: /Excel\/CSV/ }).first();
  const varMi = await dugme.count() > 0;
  d.bekle(varMi && await dugme.isEnabled(), `${ad}: Excel/CSV düğmesi etkin`);
}

await sayfa(p, 'Yatak Listesi');
await p.waitForTimeout(400);
const [indirme] = await Promise.all([
  p.waitForEvent('download'),
  p.locator('main').getByRole('button', { name: /Excel\/CSV/ }).first().click(),
]);
const yol = await indirme.path();
const icerik = readFileSync(yol, 'utf8');
d.bekle(/\.csv$/.test(indirme.suggestedFilename()), 'dosya adı .csv ile bitiyor', indirme.suggestedFilename());
d.bekle(icerik.charCodeAt(0) === 0xfeff, 'dosya UTF-8 BOM ile başlıyor (Excel Türkçe karakterleri doğru okur)');
d.bekle(icerik.split('\r\n')[0].split(';').length > 5, 'başlık satırı noktalı virgülle ayrılmış',
  icerik.split('\r\n')[0].slice(0, 90));
d.bekle(icerik.split('\r\n').length > 2, 'dosyada veri satırları var', icerik.split('\r\n').length + ' satır');

await b.close();

/* ═══ 4) Oturum zaman aşımı — kısa süreli ayarla ayrı tarayıcıda ═══ */
const { b: b2, p: p2 } = await tarayici(d, { ayar: { oturumBostaDk: 0.08, oturumUyariDk: 0.06 } });
await giris(p2, HESAP.resepsiyon);
await p2.waitForTimeout(4000);
const uyari = p2.locator('.fixed.inset-0').last();
const uyariMetni = await uyari.innerText().catch(() => '');
d.bekle(/Oturum kapanmak üzere/.test(uyariMetni), 'boşta kalan oturum için geri sayımlı uyarı çıkıyor',
  uyariMetni.replace(/\n/g, ' | ').slice(0, 120));
d.bekle(/saniye içinde kapanacak/.test(uyariMetni), 'uyarıda kalan saniye yazıyor');
await uyari.getByRole('button', { name: 'Devam Et' }).click();
await p2.waitForTimeout(600);
d.bekle(await p2.locator('.fixed.inset-0').count() === 0 && await p2.locator('nav').count() > 0,
  '«Devam Et» oturumu sürdürüyor');

await p2.waitForTimeout(8000);
const girisKutusu = await p2.locator('input[placeholder="Örn. TTK7719"]').count();
d.bekle(girisKutusu === 1 && await p2.locator('nav').count() === 0,
  'süre dolduğunda oturum kapanıp giriş ekranına dönülüyor',
  (await p2.locator('body').innerText()).slice(0, 90).replace(/\n/g, ' | '));

await b2.close();
d.bitir();
