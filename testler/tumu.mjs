/* Bütün test dosyalarını sırayla koşturur ve özet rapor basar.
   Kullanım:  node testler/tumu.mjs            (tamamı)
              node testler/tumu.mjs 03 07      (yalnız numarası verilenler) */
import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dizin = dirname(fileURLToPath(import.meta.url));
const secim = process.argv.slice(2);
const dosyalar = readdirSync(dizin)
  .filter(f => /^\d\d-.*\.mjs$/.test(f))
  .filter(f => !secim.length || secim.some(s => f.startsWith(s)))
  .sort();

if (!dosyalar.length) { console.error('Koşturulacak test bulunamadı.'); process.exit(1); }

const sonuclar = [];
const baslangic = Date.now();
for (const dosya of dosyalar) {
  process.stdout.write(`\n══ ${dosya} ${'═'.repeat(Math.max(0, 60 - dosya.length))}\n`);
  const t0 = Date.now();
  const kod = await new Promise(coz => {
    const ip = spawn(process.execPath, [join(dizin, dosya)], { stdio: 'inherit', env: process.env });
    ip.on('close', coz);
  });
  sonuclar.push({ dosya, kod, saniye: ((Date.now() - t0) / 1000).toFixed(1) });
}

console.log('\n' + '═'.repeat(64));
console.log('ÖZET');
for (const r of sonuclar)
  console.log(`  ${r.kod === 0 ? '✓ GEÇTİ ' : '✗ KALDI '} ${r.dosya.padEnd(38)} ${r.saniye} sn`);
const kalan = sonuclar.filter(r => r.kod !== 0);
console.log('─'.repeat(64));
console.log(`  ${sonuclar.length} dosya · ${sonuclar.length - kalan.length} geçti · ${kalan.length} kaldı · ` +
            `${((Date.now() - baslangic) / 1000).toFixed(1)} sn`);
process.exit(kalan.length ? 1 : 0);
