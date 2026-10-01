/* Test planı bölüm 7 (görüntüleme sayfaları) ve 4.2 / 4.5 (toplu yerleştirme, temizlik boşluğu) */
import { defter, tarayici, giris, sayfa, tesisSec, govde, HESAP,
         trTarih, tarihYaz, veriSatirlari, satirSayisi, pencereKapat } from './ortak.mjs';

const d = defter('09 — Görüntüleme tutarlılığı ve yerleştirme kuralları');
const { b, p } = await tarayici(d);
const num = (metin, desen) => { const m = metin.match(desen); return m ? Number(m[1].replace(/\./g, '')) : null; };

try {
  await giris(p, HESAP.admin);

  /* ═══ 7.1 Bugünkü Durum — dolu + boş = kapasite, oran tutarlı ═══ */
  for (const tesis of ['Ankara Misafirhanesi', 'Yayla Konağı', 'Amasra Misafirhanesi', 'Armutçuk Misafirhanesi']) {
    await tesisSec(p, tesis);
    await sayfa(p, 'Özet');
    const t = await govde(p);
    const dolu = num(t, /DOLU YATAK\s*\n\s*(\d[\d.]*)/);
    const bos = num(t, /BOŞ YATAK\s*\n\s*(\d[\d.]*)/);
    const temizlik = num(t, /TEMİZLİKTE\s*\n\s*(\d[\d.]*)/);
    const ariza = num(t, /SERVİS DIŞI\s*\n\s*(\d[\d.]*)/) || 0;
    const kapasite = num(t, /(\d[\d.]*) yatak kapasite/);
    const oran = num(t, /DOLULUK\s*\n\s*%(\d+)/);
    /* Temizlikteki ve servis dışı yatak ne dolu ne boştur:
       dolu + boş + temizlik + servis dışı = kapasite */
    d.bekle(dolu + bos + temizlik + ariza === kapasite,
      `${tesis}: dolu (${dolu}) + boş (${bos}) + temizlik (${temizlik}) + servis dışı (${ariza}) = kapasite (${kapasite})`);
    d.bekle(oran === Math.round(dolu / kapasite * 100),
      `${tesis}: doluluk oranı (%${oran}) dolu/kapasite ile tutarlı`);
    const bosYuzde = num(t, /kapasitenin %(\d+)/);
    d.bekle(bosYuzde === Math.round(bos / kapasite * 100),
      `${tesis}: «Boş Yatak» kartındaki yüzde (%${bosYuzde}) kartın sayısıyla tutarlı`);
  }

  /* 7.1 karşılaştırma tablosundan misafirhane değiştirme */
  await tesisSec(p, 'Ankara Misafirhanesi');
  await sayfa(p, 'Özet');
  await p.locator('main table').first().getByRole('button', { name: 'Amasra Misafirhanesi' }).click();
  await p.waitForTimeout(500);
  d.bekle((await p.locator('header > div').first().innerText()).includes('Amasra Misafirhanesi Bilgi Sistemi'),
    'karşılaştırma tablosundan misafirhane değiştirilebiliyor');
  await tesisSec(p, 'Ankara Misafirhanesi');

  /* ═══ 7.2 Doluluk Takvimi ═══ */
  await sayfa(p, 'Takvim');
  const takvimMetni = await govde(p);
  const gunler = await p.locator('main [title*="Dolu"]').count();
  d.bekle(gunler >= 28, `takvim şeridinde ${gunler} gün gösteriliyor`);
  const ilkGun = await p.locator('main [title*="Dolu"]').first().getAttribute('title');
  await p.getByRole('button', { name: /Sonraki 30 gün/ }).click();
  await p.waitForTimeout(600);
  const sonrakiIlk = await p.locator('main [title*="Dolu"]').first().getAttribute('title');
  d.bekle(ilkGun !== sonrakiIlk, '«Sonraki 30 gün» dönemi ileri kaydırıyor');
  await p.getByRole('button', { name: /Önceki 30 gün/ }).click();
  await p.waitForTimeout(600);
  d.bekle(await p.locator('main [title*="Dolu"]').first().getAttribute('title') === ilkGun,
    '«Önceki 30 gün» dönemi geri alıyor');

  /* Şerit uzunluğu: 7 / 14 / 30 gün */
  for (const uzunluk of [7, 14, 30]) {
    await p.getByRole('button', { name: `${uzunluk} gün`, exact: true }).click();
    await p.waitForTimeout(500);
    const adet = await p.locator('main [title*="Dolu"]').count();
    d.bekle(adet === uzunluk, `şerit «${uzunluk} gün» seçilince ${uzunluk} gün gösteriyor`, `${adet} gün`);
    d.bekle(new RegExp(`${uzunluk} GÜNLÜK DOLULUK`).test(await govde(p)),
      `kart başlığı «${uzunluk} Günlük Doluluk» oluyor`);
    d.bekle(await p.getByRole('button', { name: new RegExp(`Sonraki ${uzunluk} gün`) }).count() === 1,
      `gezinme düğmesi ${uzunluk} günlük adımı yazıyor`);
  }
  /* 7 günlük şeritte ileri gidince tam bir hafta ilerlemeli */
  await p.getByRole('button', { name: '7 gün', exact: true }).click(); await p.waitForTimeout(500);
  const haftaIlk = await p.locator('main [title*="Dolu"]').first().getAttribute('title');
  await p.getByRole('button', { name: /Sonraki 7 gün/ }).click(); await p.waitForTimeout(500);
  const haftaSonraki = await p.locator('main [title*="Dolu"]').first().getAttribute('title');
  d.bekle(haftaIlk !== haftaSonraki, '«Sonraki 7 gün» şeridi bir hafta ileri alıyor',
    `${(haftaIlk || '').slice(0, 10)} → ${(haftaSonraki || '').slice(0, 10)}`);
  await p.getByRole('button', { name: 'Bugün', exact: true }).first().click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: '30 gün', exact: true }).click(); await p.waitForTimeout(500);

  /* 7.2 aralık daraldıkça kesintisiz boş yatak azalmamalı */
  const aralikKutulari = p.getByPlaceholder('GG.AA.YYYY');
  const musaitOku = async () => num(await govde(p), /Kesintisiz aynı yatakta müsait\s*\n?\s*(\d[\d.]*) yatak/i);
  await tarihYaz(aralikKutulari.first(), await trTarih(p, 3));
  await tarihYaz(aralikKutulari.nth(1), await trTarih(p, 5));
  await p.waitForTimeout(500);
  const kisaAralik = await musaitOku();
  await tarihYaz(aralikKutulari.nth(1), await trTarih(p, 12));
  await p.waitForTimeout(500);
  const uzunAralik = await musaitOku();
  d.bekle(kisaAralik !== null && uzunAralik !== null && uzunAralik <= kisaAralik,
    `aralık uzayınca kesintisiz müsait yatak artmıyor (2 gece: ${kisaAralik} → 9 gece: ${uzunAralik})`);

  /* ═══ 7.3 Oda ve Yatak Durumu ═══ */
  await sayfa(p, 'Odalar');
  const odaMetni = await govde(p);
  for (const durum of ['Boş', 'Dolu', 'Rezerve', 'Çıkış Bekliyor', 'Temizlik'])
    d.bekle(odaMetni.includes(durum), `oda haritası lejantında «${durum}» var`);
  const doluHucre = p.locator('.yatak-hucre[title*="— Dolu"]').first();
  d.bekle(await doluHucre.count() > 0, 'haritada dolu yatak var');
  const doluBaslik = await doluHucre.getAttribute('title');
  d.bekle(/Oda \d+ \/ Yatak \d+/.test(doluBaslik) && doluBaslik.split('\n').length > 1,
    'dolu yatağın ipucunda oda/yatak no ve misafir bilgisi var', doluBaslik.replace(/\n/g, ' | '));
  /* görünüm değiştirme */
  await p.getByRole('button', { name: 'Kompakt', exact: true }).click();
  await p.waitForTimeout(400);
  d.bekle(!(await govde(p)).includes(doluBaslik.split('\n')[1].split(' · ')[0]),
    'kompakt görünümde yataklarda isim yazmıyor');
  await p.getByRole('button', { name: 'İsimli', exact: true }).click();
  await p.waitForTimeout(400);

  /* ═══ 7.x Ankara oda krokisi — kurumun kâğıt krokisiyle aynı düzen ═══ */
  await tesisSec(p, 'Ankara Misafirhanesi');
  await sayfa(p, 'Odalar');
  const krokiDugme = p.getByRole('button', { name: 'Kroki', exact: true });
  d.bekle(await krokiDugme.count() === 1, 'Ankara\'da «Kroki» görünümü var');
  await krokiDugme.click(); await p.waitForTimeout(600);
  const krokiDuzen = await p.evaluate(() => {
    /* kat başlıkları ve her satırdaki oda sırası, krokideki gibi okunur */
    const kutular = [...document.querySelectorAll('main .grid')]
      .filter(g => g.querySelector(':scope > div > div')?.textContent?.startsWith('Oda '));
    const satirlar = kutular.map(g => [...g.children].map(h => {
      const b = h.querySelector('div');
      return b && /^Oda /.test(b.textContent) ? Number(b.textContent.replace('Oda ', '')) : null;
    }));
    const yatak = {};
    document.querySelectorAll('main .grid > div').forEach(h => {
      const b = h.querySelector('div');
      if (!b || !/^Oda /.test(b.textContent)) return;
      yatak[Number(b.textContent.replace('Oda ', ''))] = h.querySelectorAll('.yatak-hucre').length;
    });
    const katlar = [...document.querySelectorAll('main')].map(m => m.innerText)
      .join('\n').match(/\d\. KAT/g) || [];
    return { satirlar, yatak, katlar };
  });
  d.bekle(JSON.stringify(krokiDuzen.satirlar) === JSON.stringify(
    [[12, 15, 16], [13, 14, 17], [21, 23, 24, 27, 29], [22, 25, 26, 28, null],
     [31, 33, 34, 37, 38], [32, 35, 36, 39, null]]),
    'kroki düzeni (kat/satır/sütun) kurumun krokisiyle birebir aynı',
    JSON.stringify(krokiDuzen.satirlar));
  d.bekle(krokiDuzen.katlar.join(' ') === '1. KAT 2. KAT 3. KAT', 'üç kat krokideki sırayla yazılı',
    krokiDuzen.katlar.join(' '));
  /* 16, 29 ve 38'de tek bir çift kişilik yatak var: iki yatma yeri, tek yatak numarası */
  const beklenenYatak = { 12:2, 13:2, 14:2, 15:2, 16:2, 17:3, 21:2, 22:2, 23:2, 24:2, 25:2, 26:2,
                          27:2, 28:3, 29:2, 31:2, 32:2, 33:2, 34:2, 35:2, 36:2, 37:2, 38:2, 39:3 };
  const yatakFark = Object.entries(beklenenYatak).filter(([no, adet]) => krokiDuzen.yatak[no] !== adet);
  d.bekle(yatakFark.length === 0, 'her odanın yatak sayısı krokideki gibi (24 oda / 51 yatak)',
    yatakFark.map(([no, adet]) => `Oda ${no}: ${krokiDuzen.yatak[no]} ≠ ${adet}`).join(' · '));
  /* Çift kişilik yatakta numara tek hücrede birleşik yazılır */
  const ciftYatakli = await p.evaluate(() => {
    const sonuc = {};
    document.querySelectorAll('main .grid > div').forEach(h => {
      const b = h.querySelector('div');
      if (!b || !/^Oda /.test(b.textContent)) return;
      const no = Number(b.textContent.replace('Oda ', ''));
      sonuc[no] = [...h.querySelectorAll('.num')].map(x => x.textContent.trim()).filter(x => /^\d$/.test(x)).join(',');
    });
    return sonuc;
  });
  const ciftHata = [16, 21, 22, 29, 38].filter(no => ciftYatakli[no] !== '1')
    .concat([12, 17].filter(no => ciftYatakli[no] === '1'));
  d.bekle(ciftHata.length === 0,
    'çift kişilik yataklı odada (16 · 21 · 22 · 29 · 38) tek yatak numarası, iki ad satırı var',
    ciftHata.map(no => `Oda ${no}: ${ciftYatakli[no]}`).join(' · '));
  d.bekle(Object.keys(krokiDuzen.yatak).length === 24, 'krokide 24 oda var',
    String(Object.keys(krokiDuzen.yatak).length));

  /* Krokide de misafir adları yazıyor (kroki, yatak listesiyle aynı veriyi gösterir) */
  const krokiDolu = await p.locator('.yatak-hucre[title*="— Dolu"]').first();
  d.bekle(await krokiDolu.count() > 0 && (await krokiDolu.innerText()).trim().length > 1,
    'krokide dolu yatakta misafirin adı yazıyor', (await krokiDolu.innerText()).replace(/\n/g, ' '));

  /* Çıktı: aynı düzen + tarih başlığı */
  await p.locator('main').getByRole('button', { name: /Yazdır/ }).first().click(); await p.waitForTimeout(700);
  const cikti = await p.locator('.yazdir-alan').innerText();
  d.bekle(/TÜRKİYE TAŞKÖMÜRÜ KURUMU ANKARA MİSAFİRHANESİ/.test(cikti), 'çıktının başlığı kroki başlığıyla aynı');
  d.bekle(/TARİHLİ ODA DURUMU/.test(cikti), 'çıktıda «… TARİHLİ ODA DURUMU» satırı var');
  d.bekle((cikti.match(/Oda \d+/g) || []).length === 24, 'çıktıda 24 odanın tamamı var',
    String((cikti.match(/Oda \d+/g) || []).length));
  d.bekle(/1\. KAT[\s\S]*2\. KAT[\s\S]*3\. KAT/.test(cikti), 'çıktı kat sırasını koruyor');
  await pencereKapat(p);
  await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'İsimli', exact: true }).click(); await p.waitForTimeout(400);

  /* Krokisi olmayan misafirhanede görünüm sunulmaz */
  await tesisSec(p, 'Yayla Konağı');
  await sayfa(p, 'Odalar');
  d.bekle(await p.getByRole('button', { name: 'Kroki', exact: true }).count() === 0,
    'krokisi tanımlı olmayan misafirhanede «Kroki» görünümü çıkmıyor');
  await tesisSec(p, 'Ankara Misafirhanesi');
  await sayfa(p, 'Odalar');

  /* tarih ileri alınca harita değişiyor mu */
  const bugunDolu = await p.locator('.yatak-hucre[title*="— Dolu"]').count();
  const haritaTarih = p.getByPlaceholder('GG.AA.YYYY').first();
  await tarihYaz(haritaTarih, await trTarih(p, 25));
  await p.waitForTimeout(600);
  const ileriDolu = await p.locator('.yatak-hucre[title*="— Dolu"]').count();
  d.bekle(bugunDolu !== ileriDolu, `tarih ileri alınınca doluluk değişiyor (bugün ${bugunDolu} → +25 gün ${ileriDolu})`);
  await tarihYaz(haritaTarih, await trTarih(p, 0));
  await p.waitForTimeout(500);

  /* ═══ 4.5 Temizlik boşluğu — çıkış günü yatak yeniden verilemiyor ═══ */
  const temizlikHucre = p.locator('.yatak-hucre[title*="Temizlik"]').first();
  if (await temizlikHucre.count()) {
    d.ok('haritada temizlik bloğundaki yataklar ayrı renkle gösteriliyor');
  } else {
    await tarihYaz(haritaTarih, await trTarih(p, 2));
    await p.waitForTimeout(500);
    d.bekle(await p.locator('.yatak-hucre[title*="Temizlik"]').count() > 0,
      'çıkış sonrası temizlik bloğu haritada görünüyor');
    await tarihYaz(haritaTarih, await trTarih(p, 0));
  }

  /* ═══ 7.4 Yatak Listesi ═══ */
  await sayfa(p, 'Yatak Listesi');
  const toplamSatir = await satirSayisi(p);
  const ozetMetni = await govde(p);
  d.bekle(toplamSatir > 0, `yatak listesi ${toplamSatir} satır gösteriyor`);
  /* sıralama: oda no artan */
  const odalar = (await veriSatirlari(p).allInnerTexts()).map(x => Number((x.match(/^\s*(\d+)/) || [])[1])).filter(Boolean);
  d.bekle(odalar.every((v, i, a) => i === 0 || a[i - 1] <= v), 'yatak listesi oda numarasına göre sıralı');
  /* dolu/boş süzgeci */
  const suzgec = p.locator('main select').first();
  await suzgec.selectOption('DOLU'); await p.waitForTimeout(500);
  const doluSatir = await veriSatirlari(p).allInnerTexts();
  d.bekle(doluSatir.length > 0 && doluSatir.length < toplamSatir,
    `«Yalnız dolu yataklar» süzgeci listeyi daraltıyor (${doluSatir.length}/${toplamSatir})`);
  d.bekle(doluSatir.every(x => !/\tBoş\t|\tBoş$/.test(x)), '«Yalnız dolu» süzgecinde boş yatak satırı yok');
  await suzgec.selectOption('BOS'); await p.waitForTimeout(500);
  const bosSatir = await veriSatirlari(p).allInnerTexts();
  d.bekle(bosSatir.length > 0 && bosSatir.length + doluSatir.length === toplamSatir,
    `dolu (${doluSatir.length}) + boş (${bosSatir.length}) = tüm yataklar (${toplamSatir})`);
  await suzgec.selectOption('HEPSI'); await p.waitForTimeout(400);
  /* arama */
  const listeArama = p.getByPlaceholder(/ara|Ad/i).first();
  if (await listeArama.count()) {
    await listeArama.fill('zzzyokboyle'); await p.waitForTimeout(500);
    d.bekle(await satirSayisi(p) === 0, 'yatak listesinde bulunmayan arama listeyi boşaltıyor');
    await listeArama.fill(''); await p.waitForTimeout(400);
  }

  /* ═══ 4.2 Toplu otomatik yerleştirme ═══ */
  /* Liste günlüktür; toplu öneri için listede yerleşmemiş kayıt bulunsun diye
     arama kutusuyla bütün günlerdeki kayıtlar listelenir. */
  await sayfa(p, 'Talepler');
  await p.getByPlaceholder(/Ad soyad/).first().fill('A'); await p.waitForTimeout(600);
  const oncekiYerlesmemis = num(await govde(p), /yerleştirilmemiş\s*(\d[\d.]*)/);
  await p.getByRole('button', { name: /Listeyi Otomatik Yerleştir/ }).click();
  await p.waitForTimeout(1500);
  const oneriMetni = await p.locator('.fixed.inset-0').last().innerText();
  d.bekle(/yerleş|öneri/i.test(oneriMetni), 'toplu yerleştirme öneri penceresi açıldı');
  d.bekle(/gerekçe|yerleştirilemedi|kapora|dolu/i.test(oneriMetni),
    'yerleşemeyen talepler için gerekçe yazılıyor');
  /* onaylamadan kapatınca doluluk değişmemeli */
  await pencereKapat(p);
  await p.waitForTimeout(500);
  const sonrakiYerlesmemis = num(await govde(p), /yerleştirilmemiş\s*(\d[\d.]*)/);
  d.bekle(oncekiYerlesmemis === sonrakiYerlesmemis,
    'öneri onaylanmadan kapatılınca doluluk değişmiyor', `${oncekiYerlesmemis} → ${sonrakiYerlesmemis}`);
} catch (e) {
  d.hata('KOŞU DURDU: ' + e.message.split('\n').slice(0, 3).join(' / '));
}
await b.close();
d.bitir();
