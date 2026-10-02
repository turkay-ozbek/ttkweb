/* Test planı bölüm 12–15 — arayüz iyileştirme planının ilk sprinti:
   renk anlamı ayrımı, bekleyen işler sayacı, dekont tutar mutabakatı,
   boş/sonuç yok durumları, sayaç tutarlılığı ve kat görevlisi seçim listesi.
   Dokunma hedefi ve segment kontrolü denetimleri 12 ve 16 numaralı dosyalardadır. */
import { readFileSync } from 'fs';
import { defter, tarayici, giris, HESAP, sayfa, govde, veriSatirlari } from './ortak.mjs';

const d = defter('19 — Arayüz iyileştirmeleri');
const { b, p } = await tarayici(d);
await giris(p, HESAP.mudur);

/* ═══ 1) Renk anlamı ayrımı — amber yalnız «bekliyor / dikkat» ═══ */
const demoSinif = await p.locator('header span:has-text("DEMO")').first().getAttribute('class');
d.bekle(!/amber/.test(demoSinif), 'DEMO rozeti amber kullanmıyor (bildirim rozetiyle çakışmaz)', demoSinif);
const zilRozet = p.locator('header button[aria-label^="Bekleyen işler"] span.num');
if (await zilRozet.count()) {
  d.bekle(/amber|rose/.test(await zilRozet.getAttribute('class')),
    'bildirim rozeti durum rengi (amber: dikkat · rose: acil) kullanıyor');
}
await sayfa(p, 'Özet');
const demoBandi = await p.locator('main span:has-text("DEMO ARACI")').first().getAttribute('class');
d.bekle(!/amber/.test(demoBandi), 'Özet ekranındaki demo bandı da amber kullanmıyor', demoBandi);

/* ═══ 2) Bekleyen işler sayacı — yalnız yapılacak işi sayar ═══ */
const etiket = await p.locator('header button[aria-label^="Bekleyen işler"]').getAttribute('aria-label');
const zilSayi = Number((etiket.match(/\((\d+)\)/) || [])[1]);
await p.locator('header button[aria-label^="Bekleyen işler"]').click();
await p.waitForTimeout(400);
const panel = p.locator('.fixed.inset-0').last();
const pm = await panel.innerText();
d.bekle(/YAPILACAK [Iİ]ŞLER/.test(pm) && /BUGÜNÜN HAREKET[Iİ]/.test(pm),
  'panel «yapılacak iş» ile «bugünün hareketi»ni ayırıyor');
const isToplam = await panel.locator('[data-blok="isler"] button').evaluateAll(xs =>
  xs.reduce((t, x) => t + Number((x.innerText.match(/^\s*(\d+)/) || [])[1] || 0), 0));
d.bekle(isToplam === zilSayi, 'sayaç yalnız yapılacak işleri topluyor', `zil ${zilSayi} · iş ${isToplam}`);
const tumToplam = await panel.locator('button:has-text("›")').evaluateAll(xs =>
  xs.reduce((t, x) => t + Number((x.innerText.match(/^\s*(\d+)/) || [])[1] || 0), 0));
d.bekle(tumToplam > zilSayi, 'bilgi satırları panelde var ama sayaca girmiyor', `panel ${tumToplam} · zil ${zilSayi}`);
await p.keyboard.press('Escape');
await p.waitForTimeout(300);

/* ═══ 3) Dekont tutar mutabakatı ═══ */
await sayfa(p, 'Dekont/Onay');
await p.waitForTimeout(500);
let g = await govde(p);
d.bekle(/[Iİ]STENEN/.test(g) && /YATIRILAN/.test(g) && /FARK/.test(g),
  'listede istenen / yatırılan / fark kolonları ayrı ayrı var');
const ilk = veriSatirlari(p).first();
d.bekle(/Tam|−|\+/.test(await ilk.innerText()), 'her satırda fark rozeti var');
await ilk.click();
await p.waitForTimeout(400);
g = await govde(p);
d.bekle(/[Iİ]STENEN KAPORA[\s\S]{0,140}YATIRILAN[\s\S]{0,140}FARK/.test(g),
  'detayda mutabakat bloğu (istenen → yatırılan → fark) var');
d.bekle(/birebir aynı|Eksik ödeme|Fazla ödeme/.test(g), 'farkın sonucu cümleyle açıklanıyor');

/* fark varsa onay bilinçli kabul ister */
const tamMi = /birebir aynı/.test(g);
const onayD = p.getByRole('button', { name: /Onayla ve Rezervasyon/ });
if (tamMi) {
  d.bekle(await onayD.isEnabled(), 'tutar tamsa onay düğmesi doğrudan açık');
} else {
  d.bekle(!(await onayD.isEnabled()), 'tutar tutmuyorsa onay düğmesi kapalı');
  await p.locator('input[aria-label="Tutar farkını kabul ediyorum"]').check();
  await p.waitForTimeout(300);
  d.bekle(await onayD.isEnabled(), 'farkı kabul kutusu işaretlenince onay açılıyor');
}

/* «yalnız tutarı tutmayan» süzgeci */
const suzgec = p.locator('main input[type="checkbox"]').first();
if (await suzgec.count()) {
  const oncekiSatir = await veriSatirlari(p).count();
  await suzgec.check();
  await p.waitForTimeout(500);
  const farkli = await veriSatirlari(p).count();
  d.bekle(farkli <= oncekiSatir, 'tutarı tutmayan süzgeci listeyi daraltıyor', `${oncekiSatir} → ${farkli}`);
  const hepsiFarkli = await veriSatirlari(p).evaluateAll(xs => xs.every(x => !/Tam/.test(x.innerText)));
  d.bekle(farkli === 0 || hepsiFarkli, 'süzgeçte yalnız farkı olan kayıtlar kalıyor');
  await suzgec.uncheck();
  await p.waitForTimeout(400);
}

/* ═══ 4) Red gerekçesi misafire aynen iletiliyor ═══ */
await veriSatirlari(p).first().click();
await p.waitForTimeout(400);
await p.getByRole('button', { name: 'Reddet', exact: true }).click();
await p.waitForTimeout(400);
g = await govde(p);
d.bekle(/Misafire gidecek mesaj/i.test(g), 'red penceresinde gönderilecek mesajın önizlemesi var');
d.bekle(/Hazır gerekçe/.test(g), 'hazır gerekçe çipleri var (metin tekilleşsin diye)');
await p.locator('main button').filter({ hasText: /okunmuyor/ }).first().click();
await p.waitForTimeout(400);
g = await govde(p);
d.bekle(/Gerekce: Dekont goruntusu okunmuyor/.test(g),
  'seçilen gerekçe önizleme metnine aynen giriyor', (g.match(/Gerekce:[^\n]*/) || [])[0]);
d.bekle(/\d+ hane · \d+ SMS/.test(g), 'hane sayısı ve kaç SMS olacağı yazıyor',
  (g.match(/\d+ hane · \d+ SMS/) || [])[0]);

const smsSay = async () => Number(await p.locator('footer button:has-text("SMS") b').innerText());
const oncekiSms = await smsSay();
await p.getByRole('button', { name: 'Dekontu Reddet' }).click();
await p.waitForTimeout(800);
d.bekle(await smsSay() === oncekiSms + 1, 'red işlemi misafire bildirim gönderdi');
await p.locator('footer button:has-text("SMS")').click();
await p.waitForTimeout(500);
d.bekle(/Dekont goruntusu okunmuyor/.test(await p.locator('.fixed.inset-0').last().innerText()),
  'gönderilen mesaj önizlemedeki gerekçeyi aynen taşıyor');
await p.keyboard.press('Escape');
await p.locator('.fixed.inset-0 header button').last().click().catch(() => {});
await p.waitForTimeout(300);

/* ═══ 5) Kat görevlisi — serbest metin değil, tanımlı personel ═══ */
await sayfa(p, 'Kat Hizmetleri');
await p.waitForTimeout(500);
const satir = veriSatirlari(p).filter({ hasText: /Çıkış temizliği|Günlük temizlik/ }).first();
const secim = satir.locator('select[aria-label*="kat görevlisi"]').first();
d.bekle(await secim.count() === 1, 'görevli alanı seçim listesi');
d.bekle(await p.locator('main input[placeholder="ad soyad"]').count() === 0,
  'serbest metinli görevli alanı hiçbir satırda kalmadı');
const adaylar = (await secim.locator('option').allInnerTexts()).slice(1);
d.bekle(adaylar.length >= 3, 'listede tesisin kat görevlileri var', adaylar.join(' · '));
const kisi = adaylar[0];
await secim.selectOption({ label: kisi });
await satir.locator('xpath=following-sibling::tr[1]').count();
const satir2 = veriSatirlari(p).filter({ hasText: /Çıkış temizliği|Günlük temizlik/ }).nth(1);
await satir2.locator('select[aria-label*="kat görevlisi"]').first().selectOption({ label: kisi });
await p.waitForTimeout(500);
const degerler = await p.locator('main select[aria-label*="kat görevlisi"]')
  .evaluateAll(xs => xs.map(x => x.value).filter(Boolean));
d.bekle(new Set(degerler).size === 1 && degerler.length === 2,
  'aynı kişi iki satırda birebir aynı değerle kayıtlı — rapor üretilebilir', JSON.stringify(degerler));

const [indirme] = await Promise.all([
  p.waitForEvent('download'),
  p.locator('main').getByRole('button', { name: /Excel\/CSV/ }).first().click(),
]);
const csv = readFileSync(await indirme.path(), 'utf8');
const gorevliler = csv.split('\r\n').slice(1).map(r => (r.split(';')[4] || '').replace(/^"|"$/g, '')).filter(Boolean);
d.bekle(gorevliler.length > 0 && gorevliler.every(v => v === kisi),
  'CSV görevli kolonu yalnız tanımlı değer içeriyor', [...new Set(gorevliler)].join(' · '));

/* ═══ 6) Boş / sonuç yok durumları ═══ */
await p.locator('main input[placeholder*="Oda no"]').fill('kesinlikleolmayanbirmetin');
await p.waitForTimeout(600);
g = await govde(p);
d.bekle(/Süzgeçle eşleşen oda yok/.test(g), 'kat hizmetlerinde «sonuç yok» ayrı metin veriyor');
d.bekle(/Süzgeci temizle/.test(g), '«sonuç yok» durumunda süzgeç temizleme düğmesi var');
await p.getByRole('button', { name: 'Süzgeci temizle' }).click();
await p.waitForTimeout(500);
d.bekle(await veriSatirlari(p).count() > 0, 'süzgeç temizlenince liste geri geliyor');

await sayfa(p, 'Denetim');
await p.waitForTimeout(400);
await p.locator('main input[placeholder*="ara"]').fill('kesinlikleolmayanbirmetin');
await p.waitForTimeout(600);
g = await govde(p);
d.bekle(/Süzgeçle eşleşen işlem yok/.test(g), 'denetimde «sonuç yok» ayrı metin veriyor');
await p.getByRole('button', { name: 'Süzgeçleri temizle' }).click();
await p.waitForTimeout(500);
d.bekle(await veriSatirlari(p, 'main').count() > 0, 'denetimde süzgeç temizlenince liste geri geliyor');

/* ═══ 7) Sayaç tutarlılığı — aynı veri, aynı sayı ═══ */
await sayfa(p, 'Kat Hizmetleri');
await p.waitForTimeout(400);
g = await govde(p);
const sayfaTemizlenecek = Number((g.match(/TEM[Iİ]ZLENECEK ODA\s*\n\s*(\d+)/) || [])[1]);
await sayfa(p, 'Ana Menü');
await p.waitForTimeout(400);
g = await govde(p);
const katKart = g.match(/Kat Hizmetleri[\s\S]{0,160}?(\d+)\s*oda temizlenecek/);
d.bekle(!!katKart, 'ana menüde Kat Hizmetleri kartında sayı var');
d.bekle(katKart && Number(katKart[1]) === sayfaTemizlenecek,
  'ana menü ile Kat Hizmetleri sayfası aynı sayıyı veriyor',
  `menü ${katKart && katKart[1]} · sayfa ${sayfaTemizlenecek}`);
const menuDenetim = Number((g.match(/(\d+)\s*işlem kaydı/) || [])[1]);
d.bekle(menuDenetim > 1, 'ana menü denetim sayacı kayıt hareketlerini de sayıyor', String(menuDenetim));

/* ═══ 8) KPI alt metni kullanıcı bilgisi, geliştirici notu değil ═══ */
await sayfa(p, 'Özet');
await p.waitForTimeout(400);
g = await govde(p);
d.bekle(!/dolu\+boş\+temizlik/.test(g), 'KPI altındaki formül karttan kalktı');
d.bekle(/çıkış temizliği bloğu/.test(g), 'yerine okunur bir açıklama geldi');
const ipucu = await p.locator('main [data-ipucu*="kapasite"]').first().getAttribute('data-ipucu');
d.bekle(ipucu && /dolu .* boş .* temizlikte .* servis dışı .* kapasite/.test(ipucu),
  'formül ipucuna taşındı — isteyen hesabı görebiliyor', (ipucu || '').slice(0, 80));

await b.close();
d.bitir();
