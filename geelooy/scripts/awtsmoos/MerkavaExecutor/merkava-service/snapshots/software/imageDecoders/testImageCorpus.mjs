// B"H
/**
 * Real-world corpus test: decode every image in /tmp/imgtest/ via the
 * unified imageLoader, verify structural correctness, and benchmark.
 * Run with: node testImageCorpus.mjs
 */
import { decodeImage, detectFormat } from './imageLoader.js';
import { readFileSync, readdirSync, statSync } from 'fs';

const DIR = '/tmp/imgtest';
const files = readdirSync(DIR).filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));

let pass = 0, fail = 0;
const results = [];

for (const f of files) {
  const path = DIR + '/' + f;
  const bytes = new Uint8Array(readFileSync(path));
  const fmt = detectFormat(bytes);
  const sizeKb = (statSync(path).size / 1024).toFixed(1);
  try {
    const t0 = performance.now();
    const img = await decodeImage(bytes);
    const dt = performance.now() - t0;
    // Structural checks
    if (!(img.width > 0 && img.height > 0)) throw new Error('bad dims');
    if (img.data.length !== img.width * img.height * 4) throw new Error('bad buffer size');
    // Content sanity: not all zeros, not all 255 (skip tiny test patterns)
    let sane = true;
    if (img.width * img.height > 1000) {
      let sum = 0, n = 0;
      for (let i = 0; i < img.data.length; i += 97) { sum += img.data[i]; n++; }
      const avg = sum / n;
      sane = avg > 1 && avg < 254;
      if (!sane) console.log('WARN (flat?)', f, 'avg=' + avg.toFixed(1));
    }
    const mp = (img.width * img.height / 1e6).toFixed(2);
    const mps = (img.width * img.height / 1e6 / (dt / 1000)).toFixed(1);
    results.push({ f, fmt, dims: img.width + 'x' + img.height, sizeKb, ms: dt.toFixed(1), mps, sane });
    if (sane) { pass++; }
    else { fail++; }
  } catch (e) {
    fail++;
    results.push({ f, fmt, error: e.message });
    console.log('FAIL', f, '(' + fmt + '):', e.message);
  }
}

console.log('\n' + '='.repeat(78));
console.log('CORPUS RESULTS: ' + pass + ' decoded+sane, ' + fail + ' failed');
console.log('='.repeat(78));
for (const r of results) {
  if (r.error) continue;
  console.log(
    (r.sane ? 'ok  ' : 'WARN') + ' ' +
    r.f.padEnd(36) + ' ' +
    String(r.fmt).padEnd(5) + ' ' +
    String(r.dims).padEnd(11) + ' ' +
    String(r.sizeKb + 'KB').padEnd(9) + ' ' +
    String(r.ms + 'ms').padEnd(9) + ' ' +
    r.mps + ' MP/s'
  );
}
process.exit(fail ? 1 : 0);
