/* Test planı bölüm 1.4 ve 8 — rol × yetki matrisi, kullanıcı ve yetki yönetimi */
import { defter, tarayici, giris, rolDegistir, sayfa, anaMenu, govde, HESAP, yeniKayit, pencereKapat } from './ortak.mjs';

const d = defter('06 — Yetki matrisi ve kullanıcı yönetimi');
const { b, p } = await tarayici(d);

/* Rol × düğme beklentileri (test planı 1.4 tablosu) */
const BEKLENTI = {
  admin:      { kullanicilarSekmesi: true,  yeniKayit: true,  yerlestir: true,  tahsilat: true,  onay: true },
  mudur:      { kullanicilarSekmesi: false, yeniKayit: true,  yerlestir: true,  tahsilat: true,  onay: true },
  resepsiyon: { kullanicilarSekmesi: false, yeniKayit: true,  yerlestir: true,  tahsilat: false, onay: false },
  muhasebe:   { kullanicilarSekmesi: false, yeniKayit: false, yerlestir: false, tahsilat: true,  onay: false },
};
const etkin = async (loc) => (await loc.count()) > 0 && !(await loc.first().isDisabled());

try {
  let ilk = true;
  for (const [rol, bek] of Object.entries(BEKLENTI)) {
    ilk ? await giris(p, HESAP[rol]) : await rolDegistir(p, HESAP[rol]);
    ilk = false;

    /* a) Kullanıcılar sekmesi */
    const navMetni = await p.locator('nav').innerText();
    d.bekle(navMetni.includes('Kullanıcılar') === bek.kullanicilarSekmesi,
      `${rol}: «Kullanıcılar» sekmesi ${bek.kullanicilarSekmesi ? 'görünüyor' : 'gizli'}`);

    /* b) Talepler sayfası düğmeleri */
    await sayfa(p, 'Talepler');
    d.bekle(await etkin(p.getByRole('button', { name: /Yeni Kayıt/ })) === bek.yeniKayit,
      `${rol}: «+ Yeni Kayıt» ${bek.yeniKayit ? 'etkin' : 'pasif'}`);
    await p.locator('table tbody tr').first().click();
    await p.waitForTimeout(400);
    d.bekle(await etkin(p.getByRole('button', { name: /Otomatik Yerleştir/ })) === bek.yerlestir,
      `${rol}: «Otomatik Yerleştir» ${bek.yerlestir ? 'etkin' : 'pasif'}`);
    d.bekle(await etkin(p.getByRole('button', { name: /Manuel Yerleştir/ })) === bek.yerlestir,
      `${rol}: «Manuel Yerleştir» ${bek.yerlestir ? 'etkin' : 'pasif'}`);
    /* Dekont yükleme her rolde açık olmalı */
    const dekontD = p.getByRole('button', { name: /Dekont Yükle/ });
    if (await dekontD.count()) d.bekle(await etkin(dekontD), `${rol}: «Dekont Yükle» etkin`);

    /* c) Pasif düğmede gerekçe ipucu */
    if (!bek.yerlestir) {
      /* İpuçları artık data-ipucu ile taşınıyor (bkz. 11-ipucu-arama-bot.mjs);
         eski title'lar da devralındığı için ikisine de bakılıyor. */
      const dugme = p.getByRole('button', { name: /Otomatik Yerleştir/ }).first();
      const ipucu = (await dugme.getAttribute('data-ipucu')) || (await dugme.getAttribute('title'));
      d.bekle(/yetki/i.test(ipucu || ''), `${rol}: pasif düğmede yetki gerekçesi ipucu var`, ipucu || 'ipucu yok');
    }

    /* d) Tahsilat düğmesi */
    await sayfa(p, 'Tahsilat');
    await p.getByRole('button', { name: 'Tüm dönem' }).click();
    await p.waitForTimeout(400);
    const tahD = p.getByRole('button', { name: /Tahsilat Al/ });
    if (await tahD.count())
      d.bekle(await etkin(tahD) === bek.tahsilat, `${rol}: «₺ Tahsilat Al» ${bek.tahsilat ? 'etkin' : 'pasif'}`);
    else d.ok(`${rol}: tahsilat bekleyen kayıt yok (düğme denetimi atlandı)`);

    /* e) Dekont onay yetkisi */
    await sayfa(p, 'Dekont/Onay');
    const onayMetni = await govde(p);
    d.bekle(/onay yetkiniz yok/i.test(onayMetni) !== bek.onay,
      `${rol}: dekont onay yetkisi ${bek.onay ? 'açık' : 'kapalı ve gerekçesi yazıyor'}`);
  }

  /* ═══ Bölüm 8 — Kullanıcı ve yetki yönetimi (Admin) ═══ */
  await rolDegistir(p, HESAP.admin);
  await sayfa(p, 'Kullanıcılar');

  /* 8.2 yetki matrisi */
  await p.getByRole('button', { name: /Yetki matrisini göster/ }).click();
  await p.waitForTimeout(400);
  const matris = p.locator('main table').first();   // matris, kullanıcı tablosundan önce gelir
  const satir = await matris.locator('tbody tr').count();
  const sutun = await matris.locator('thead th').count();
  /* Yetki sayısı sürümle birlikte artar; sabit sayı yerine yapı denetlenir. */
  d.bekle(satir >= 14 && sutun === 6, `yetki matrisi ${satir} yetki × 4 rol olarak açıldı`, `${satir} satır / ${sutun} sütun`);
  /* Admin sütunu tamamen ✓ olmalı, muhasebede yerleştirme ✗ */
  const adminSutun = await matris.locator('tbody tr td:nth-child(3)').allInnerTexts();
  d.bekle(adminSutun.every(x => x.trim() === '✓'), 'matriste Admin bütün yetkilere sahip');
  const yerlestirSatiri = await matris.locator('tbody tr', { hasText: 'Yatak tahsisi' }).first().innerText();
  d.bekle(/—/.test(yerlestirSatiri), 'matriste yerleştirme yetkisi bazı rollere kapalı', yerlestirSatiri.replace(/\n/g, ' | '));
  const kullaniciSatiri = await matris.locator('tbody tr', { hasText: 'Kullanıcı ve yetki yönetimi' }).first().innerText();
  const isaretler = kullaniciSatiri.split('\t').slice(2);
  d.bekle(isaretler.filter(x => x.trim() === '✓').length === 1, 'kullanıcı yönetimi yalnız Admin rolünde açık',
    kullaniciSatiri.replace(/\n/g, ' | '));

  /* 8.5 yeni kullanıcı ekle ve o hesapla gir */
  await p.getByRole('button', { name: /Yeni Kullanıcı/ }).click();
  await p.waitForTimeout(400);
  await p.getByLabel(/Kullanıcı Adı/).fill('TST7');
  await p.getByLabel(/^Şifre/).fill('4242');
  await p.getByLabel(/Adı Soyadı/).fill('Test Resepsiyon');
  await p.getByLabel(/^Rol/).selectOption('RESEPSIYON');
  await p.getByRole('button', { name: /Kullanıcıyı Kaydet/ }).click();
  await p.waitForTimeout(600);
  d.bekle((await govde(p)).includes('TST7'), 'admin yeni kullanıcı ekledi');

  /* aynı kullanıcı adıyla ikinci kayıt engelleniyor mu */
  await p.getByRole('button', { name: /Yeni Kullanıcı/ }).click();
  await p.waitForTimeout(400);
  await p.getByLabel(/Kullanıcı Adı/).fill('TST7');
  await p.getByLabel(/^Şifre/).fill('1111');
  await p.getByLabel(/Adı Soyadı/).fill('Kopya');
  d.bekle(await p.getByRole('button', { name: /Kullanıcıyı Kaydet/ }).isDisabled(),
    'aynı kullanıcı adıyla ikinci kayıt engellendi');
  await pencereKapat(p);

  /* yeni hesapla giriş ve rol yetkileri */
  await rolDegistir(p, ['TST7', '4242']);
  const nav7 = await p.locator('nav').innerText();
  d.bekle(!nav7.includes('Kullanıcılar'), 'yeni resepsiyon hesabı kullanıcı yönetimini görmüyor');
  await sayfa(p, 'Talepler');
  d.bekle(await etkin(p.getByRole('button', { name: /Yeni Kayıt/ })), 'yeni resepsiyon hesabı kayıt açabiliyor');

  /* 8.3 rol değiştirme etkisi: TST7 → Muhasebe */
  await rolDegistir(p, HESAP.admin);
  await sayfa(p, 'Kullanıcılar');
  const tst7Satiri = p.locator('main table tbody tr', { hasText: 'TST7' }).first();
  await tst7Satiri.locator('select').first().selectOption('MUHASEBE');
  await p.waitForTimeout(500);
  await rolDegistir(p, ['TST7', '4242']);
  await sayfa(p, 'Talepler');
  d.bekle(!(await etkin(p.getByRole('button', { name: /Yeni Kayıt/ }))), 'rol Muhasebe yapılınca kayıt açma kapandı');

  /* 8.4 misafirhane kapsamını değiştirme */
  await rolDegistir(p, HESAP.admin);
  await sayfa(p, 'Kullanıcılar');
  const satir4 = p.locator('main table tbody tr', { hasText: 'TST7' }).first();
  const yayla = satir4.getByRole('button', { name: 'Yayla', exact: true });
  if (await yayla.count()) { await yayla.click(); await p.waitForTimeout(400); }
  const ankara = satir4.getByRole('button', { name: 'Ankara', exact: true });
  if (await ankara.count()) { await ankara.click(); await p.waitForTimeout(400); }
  await rolDegistir(p, ['TST7', '4242']);
  const ust = await p.locator('header > div').first().innerText();
  d.bekle(/Yayla Konağı Bilgi Sistemi/.test(ust), 'misafirhane kapsamı değişikliği kullanıcıya yansıdı', ust.replace(/\n/g, ' | '));
  const menu = await govde(p);
  d.bekle(!menu.includes('Ankara Misafirhanesi'), 'yetkisi alınan misafirhane artık görünmüyor');

  /* 8.6 pasife alma → giriş reddedilmeli */
  await rolDegistir(p, HESAP.admin);
  await sayfa(p, 'Kullanıcılar');
  const satir6 = p.locator('main table tbody tr', { hasText: 'TST7' }).first();
  await satir6.getByRole('button', { name: /Aktif/ }).click();
  await p.waitForTimeout(500);
  d.bekle((await satir6.innerText()).includes('Pasif'), 'kullanıcı pasife alındı');
  await p.locator('header button[aria-label="Oturumu kapat"]').click();
  await p.waitForTimeout(400);
  await p.locator('input[placeholder="Örn. TTK7719"]').fill('TST7');
  await p.locator('input[type=password]').fill('4242');
  await p.getByRole('button', { name: 'BAĞLAN' }).click();
  await p.waitForTimeout(500);
  d.bekle((await p.locator('nav').count()) === 0, 'pasif hesapla giriş reddedildi');
  d.bekle(/pasif|kapalı|yetkili değil/i.test(await p.locator('body').innerText()), 'pasif hesap için gerekçe gösteriliyor');
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
