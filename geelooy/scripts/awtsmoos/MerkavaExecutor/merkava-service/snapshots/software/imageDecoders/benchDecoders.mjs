// B"H - Image decoder speed benchmark. Usage: node benchDecoders.mjs [--save FILE]
// Decodes each image in /tmp/imgtest N times, reports ms/decode and MP/s.
import { decodePng } from './pngDecoder.js';
import { decodeGif } from './gifDecoder.js';
import { readFileSync, readdirSync, writeFileSync } from 'fs';

const DIR = '/tmp/imgtest';
const files = readdirSync(DIR).filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f)).sort();

const decoders = {
  png: async (b) => { decodePng(b); },
  jpg: null, jpeg: null, webp: null, gif: async (b) => { decodeGif(b); },
};
// lazy-load jpeg/webp decoders (they may be large)
const jpegMod = await import('./jpegDecoder.js');
const webpMod = await import('./webpDecoder.js');
decoders.jpg = decoders.jpeg = async (b) => { jpegMod.decodeJpeg(b); };
decoders.webp = async (b) => { webpMod.decodeWebp(b); };

const WARMUP = 2, RUNS = 5;
const results = {};

for (const f of files) {
  const ext = f.split('.').pop().toLowerCase();
  const dec = decoders[ext];
  if (!dec) continue;
  const bytes = new Uint8Array(readFileSync(DIR + '/' + f));
  // warmup
  for (let i = 0; i < WARMUP; i++) { try { await dec(bytes); } catch (e) { /* record */ } }
  const times = [];
  let dims = '';
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    const img = await dec(bytes);
    const dt = performance.now() - t0;
    times.push(dt);
    if (img && img.width) dims = img.width + 'x' + img.height;
  }
  times.sort((a, b) => a - b);
  const med = times[Math.floor(RUNS / 2)];
  results[f] = { ms: +med.toFixed(1), dims };
  console.log(f.padEnd(36), dims.padEnd(12), med.toFixed(1).padStart(8) + ' ms');
}

const saveIdx = process.argv.indexOf('--save');
if (saveIdx >= 0) {
  writeFileSync(process.argv[saveIdx + 1], JSON.stringify(results, null, 1));
  console.log('saved baseline');
}
