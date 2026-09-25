/* Ortak test yardımcıları — yeni test dosyaları bunu kullanır.
   Eski 01-05 dosyaları kendi içinde bağımsızdır, dokunulmadı. */
import { chromium } from 'playwright';

export const HEDEF = process.env.HEDEF || new URL('../misafirhane-prototip.html', import.meta.url).pathname;
export const URL_ = 'file://' + HEDEF;

/* Basit sonuç toplayıcı */
export function defter(baslik) {
  const gecen = [], kalan = [];
  return {
    ok: (m) => gecen.push('  ✓ ' + m),
    hata: (m) => kalan.push('  ✗ ' + m),
    /* koşul doğruysa geç, değilse kal */
    bekle: (kosul, m, ek = '') => kosul ? gecen.push('  ✓ ' + m) : kalan.push('  ✗ ' + m + (ek ? ' → ' + ek : '')),
    bitir() {
      console.log(gecen.join('\n'));
      if (kalan.length) { console.log('\nHATA:\n' + kalan.join('\n')); console.log(`\n${baslik}: ${gecen.length} geçti, ${kalan.length} KALDI`); process.exitCode = 1; }
      else console.log(`\n${baslik}: ${gecen.length} denetimin tamamı geçti`);
      return kalan.length;
    },
  };
}

/* Tarayıcıyı aç, sayfayı yükle, konsol/JS hatalarını defterle */
export async function tarayici(d, { genislik = 1680, yukseklik = 1050 } = {}) {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const p = await b.newPage({ viewport: { width: genislik, height: yukseklik } });
  p.on('pageerror', e => d.hata('JS hatası: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') d.hata('konsol: ' + m.text()); });
  await p.goto(URL_);
  await p.waitForSelector('text=TTKNET', { timeout: 20000 });
  return { b, p };
}

export const HESAP = {
  admin:      ['TTK7719', '7719'],
  mudur:      ['MSF1001', '1234'],   // Ankara
  bolgeMudur: ['MSF1002', '1234'],   // Yayla + Amasra + Armutçuk
  resepsiyon: ['MSF2001', '1234'],   // Ankara
  resepsiyon2:['MSF2002', '1234'],   // Yayla
  muhasebe:   ['MSF3001', '1234'],
  pasif:      ['MSF2003', '1234'],
};

export const girisFormu = async (p, [kod, sifre]) => {
  await p.locator('input[placeholder="Örn. TTK7719"]').fill(kod);
  await p.locator('input[type=password]').fill(sifre);
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
};
export const giris = async (p, hesap) => { await girisFormu(p, hesap); await p.waitForSelector('nav', { timeout: 15000 }); };
/* Rol değiştirirken sayfa YENİLENMEZ — veriler bellekte, yenileme her şeyi sıfırlar. */
export const rolDegistir = async (p, hesap) => {
  await p.locator('header button[aria-label="Oturumu kapat"]').click();
  await p.waitForTimeout(400);
  await giris(p, hesap);
};
/* Sayfa şeridi 640 px altında gizlenir; telefonda gezinme «☰» çekmecesinden olur.
   Çekmecede sayfanın tam adı yazar (şeritte kısa adı), eşlemesi aşağıdadır. */
export const CEKMECE_ADI = {
  'Özet': 'Bugünkü Durum', 'Takvim': 'Doluluk Takvimi', 'Odalar': 'Oda ve Yatak Durumu',
  'Yatak Listesi': 'Yatak Listesi', 'Talepler': 'Rezervasyon Talepleri', 'Dekont/Onay': 'Dekont ve Onay',
  'Tahsilat': 'Peşinat ve Tahsilat', 'Statü': 'Statü Takibi', 'Kahvaltı': 'Kahvaltı Takibi',
  'Ay Sonu': 'Ay Sonu Belgesi', 'Kullanıcılar': 'Kullanıcı ve Yetki', 'Ana Menü': 'Ana Menü',
};
export const sayfa = async (p, ad) => {
  const serit = p.locator('nav').getByRole('button', { name: ad, exact: true });
  if (await serit.count() && await serit.first().isVisible()) {
    await serit.first().click();
  } else {
    await p.locator('nav button').first().click();            /* ☰ sayfa çekmecesi */
    await p.waitForTimeout(250);
    const tam = CEKMECE_ADI[ad] || ad;
    await p.locator('.fixed.inset-0').getByRole('button', { name: new RegExp('^' + tam) }).first().click();
  }
  await p.waitForTimeout(400);
};
/* Sayfa, giriş yapan rolün yetkisiyle açılabiliyor mu? (şeritte ya da çekmecede) */
export const sayfaVar = async (p, ad) => {
  const serit = p.locator('nav').getByRole('button', { name: ad, exact: true });
  if (await serit.count() && await serit.first().isVisible()) return true;
  await p.locator('nav button').first().click();
  await p.waitForTimeout(250);
  const tam = CEKMECE_ADI[ad] || ad;
  const var_ = await p.locator('.fixed.inset-0').getByRole('button', { name: new RegExp('^' + tam) }).count() > 0;
  await p.locator('.fixed.inset-0 button[aria-label="Kapat"]').first().click().catch(() => {});
  await p.waitForTimeout(200);
  return var_;
};
export const anaMenu = async (p) => sayfa(p, 'Ana Menü');
export const tesisSec = async (p, ad) => {
  await anaMenu(p);
  const d = p.locator('main').getByRole('button', { name: ad, exact: true });
  if (await d.count()) { await d.click(); await p.waitForTimeout(300); }
};
export const govde = (p) => p.locator('main').innerText();

/* GG.AA.YYYY — bugünden n gün sonrası */
export const trTarih = (p, n) => p.evaluate(x => {
  const d = new Date(), y = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + x));
  return String(y.getUTCDate()).padStart(2, '0') + '.' + String(y.getUTCMonth() + 1).padStart(2, '0') + '.' + y.getUTCFullYear();
}, n);

/* Tarih kutusu GG.AA.YYYY metin kutusudur; Enter ile uygulanır. */
export const tarihYaz = async (kutu, deger) => { await kutu.fill(deger); await kutu.press('Enter'); await kutu.page().waitForTimeout(200); };

/* Talepler sayfasında geliş aralığını ve statü süzgecini aç */
export const taleplerdeAra = async (p, ad, { statu = 'HEPSI', gunSonra = 60 } = {}) => {
  const bas = p.getByPlaceholder('GG.AA.YYYY').first(), son = p.getByPlaceholder('GG.AA.YYYY').nth(1);
  await tarihYaz(bas, await trTarih(p, -60));
  await tarihYaz(son, await trTarih(p, gunSonra));
  await p.locator('main select').first().selectOption(statu);
  await p.getByPlaceholder(/Ad soyad/).first().fill(ad);
  await p.waitForTimeout(450);
  return p.locator('table tbody tr', { hasText: ad }).first();
};

/* Yeni kayıt aç. dolgu: { ad, ekGun, gece, kisi, sahis, aile } */
export async function yeniKayit(p, dolgu) {
  const { ad, ekGun = 10, gece = 3, kisi = 1, sahis = false, aile = false } = dolgu;
  await p.getByRole('button', { name: /Yeni Kayıt/ }).first().click();
  await p.waitForTimeout(400);
  await p.getByLabel(/Adı Soyadı/).first().fill(ad);
  await tarihYaz(p.getByLabel(/Geliş Tarihi/), await trTarih(p, ekGun));
  await tarihYaz(p.getByLabel(/Çıkış Tarihi/), await trTarih(p, ekGun + gece));
  /* Kişi sayısı düğmeleri «Kişi Sayısı» etiketinin içindedir (− ve +). */
  const kisiDugme = p.locator('.fixed.inset-0 label:has-text("Kişi Sayısı") button');
  for (let i = 1; i < kisi; i++) { await kisiDugme.nth(1).click(); await p.waitForTimeout(150); }
  if (sahis) { await p.getByLabel(/Kurum-Şahıs/).selectOption('SAHIS'); await p.waitForTimeout(250); }
  if (aile) { await p.getByText('Aile / birlikte kalacak').click(); await p.waitForTimeout(200); }
  /* DİKKAT: arama kutusunun placeholder'ı da «Ad soyad …» ile başlar; bu yüzden
     misafir satırı alanları yalnız açık pencere (.fixed.inset-0) içinde aranır. */
  const tcler = await p.locator('.fixed.inset-0 input[placeholder="11 hane"]').all();
  const adlar = await p.locator('.fixed.inset-0 input[placeholder="Ad Soyad"]').all();
  for (let i = 0; i < tcler.length; i++) await tcler[i].fill(String(12345678901 + i * 111));
  for (let i = 0; i < adlar.length; i++) await adlar[i].fill(`${ad} ${i + 1}`);
  await p.waitForTimeout(200);
  return {
    kaydet: p.getByRole('button', { name: 'Kaydet', exact: true }),
    altlik: () => p.locator('.fixed.inset-0').last().innerText(),
  };
}
export const kaydet = async (p, form) => { await form.kaydet.click(); await p.waitForTimeout(700); };
export const pencereKapat = async (p) => {
  const x = p.locator('.fixed.inset-0 header button').last();
  if (await x.count()) { await x.click(); await p.waitForTimeout(300); }
};

/* Açık penceredeki misafir satırı alanları */
export const formTc = (p) => p.locator('.fixed.inset-0 input[placeholder="11 hane"]');
export const formAd = (p) => p.locator('.fixed.inset-0 input[placeholder="Ad Soyad"]');
export const kisiDugmeleri = (p) => p.locator('.fixed.inset-0 label:has-text("Kişi Sayısı") button');

/* HTML5 sürükle-bırak (gerçek fare olayları dragstart/drop üretmez) */
export async function surukle(p, kaynak, hedef, yalnizUzerinde = false) {
  const kh = await kaynak.elementHandle(), hh = await hedef.elementHandle();
  await p.evaluate(([a, t, u]) => {
    const dt = new DataTransfer();
    const yolla = (el, ad) => el.dispatchEvent(new DragEvent(ad, { bubbles: true, cancelable: true, dataTransfer: dt }));
    yolla(a, 'dragstart'); yolla(t, 'dragover');
    if (u) return;
    yolla(t, 'drop'); yolla(a, 'dragend');
  }, [kh, hh, yalnizUzerinde]);
  await p.waitForTimeout(400);
}

/* Veri satırı sayısı — «… kayıt yok» gibi boş durum satırları (td colspan) sayılmaz. */
export const veriSatirlari = (p, kapsam = 'main') => p.locator(`${kapsam} table tbody tr:not(:has(td[colspan]))`);
export const satirSayisi = (p, kapsam = 'main') => veriSatirlari(p, kapsam).count();

/* Sayfada yatay taşma var mı? */
export const tasma = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

export const SAYFALAR = ['Özet', 'Takvim', 'Odalar', 'Yatak Listesi', 'Talepler', 'Dekont/Onay', 'Tahsilat', 'Statü', 'Kullanıcılar'];
