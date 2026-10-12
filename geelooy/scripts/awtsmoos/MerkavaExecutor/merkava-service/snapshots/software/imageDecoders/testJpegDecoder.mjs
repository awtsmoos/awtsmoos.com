// B"H — self-tests for jpegDecoder.js. Run: node testJpegDecoder.mjs
import { decodeJpeg, idctBlock } from './jpegDecoder.js';
import { performance } from 'perf_hooks';

let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('PASS', name); }
  catch (e){ failed++; console.log('FAIL', name, '-', e.message); }
}
function assert(c, msg){ if (!c) throw new Error(msg || 'assertion failed'); }
function assertThrows(fn, re){
  let threw = false;
  try { fn(); } catch (e){ threw = true; if (re && !re.test(e.message)) throw new Error('wrong error: ' + e.message); }
  if (!threw) throw new Error('did not throw');
}

// Direct-formula inverse DCT (reference).
function naiveIDCT(f){
  const out = new Float64Array(64);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++){
    let s = 0;
    for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++){
      const cu = u === 0 ? Math.SQRT1_2 : 1, cv = v === 0 ? Math.SQRT1_2 : 1;
      s += cu * cv * f[v * 8 + u]
         * Math.cos((2 * x + 1) * u * Math.PI / 16)
         * Math.cos((2 * y + 1) * v * Math.PI / 16);
    }
    out[y * 8 + x] = s / 4;
  }
  return out;
}

test('AAN IDCT vs naive (50 random blocks, max abs err < 1)', () => {
  let maxErr = 0, seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let t = 0; t < 50; t++){
    const f = new Float64Array(64);
    for (let i = 0; i < 64; i++) f[i] = Math.floor(rnd() * 2047) - 1023;
    if (t === 0) f.fill(0);              // all-zero block
    if (t === 1){ f.fill(0); f[0] = 800; } // DC-only block
    const a = idctBlock(f), b = naiveIDCT(f);
    for (let i = 0; i < 64; i++) maxErr = Math.max(maxErr, Math.abs(a[i] - b[i]));
  }
  console.log('   max abs err =', maxErr);
  globalThis.__idctMaxErr = maxErr;
  assert(maxErr < 1, 'IDCT error too large: ' + maxErr);
});

// Hand-built minimal baseline JPEG: 8x8 grayscale, 1 MCU, DC-only block -> flat 128.
function buildMinimalJpeg(){
  const b = [];
  const push = (...xs) => { for (const x of xs) b.push(x & 255); };
  push(0xFF, 0xD8);                                            // SOI
  push(0xFF, 0xDB, 0x00, 0x43, 0x00);                           // DQT
  for (let i = 0; i < 64; i++) push(1);                         // quant table (zigzag), all 1
  push(0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x08, 0x00, 0x08,
       0x01, 0x01, 0x11, 0x00);                                 // SOF0: 8x8, 1 comp, tq 0
  push(0xFF, 0xC4, 0x00, 0x26);                                 // DHT
  push(0x00, 0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00); // DC: cat0 = "00"
  push(0x10, 0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00); // AC: EOB = "0000"
  push(0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00); // SOS
  push(0x03);                                                  // "00"+"0000"+fill(1,1)
  push(0xFF, 0xD9);                                            // EOI
  return new Uint8Array(b);
}

test('hand-built minimal JPEG decodes to exact flat RGB', () => {
  const r = decodeJpeg(buildMinimalJpeg());
  assert(r.width === 8 && r.height === 8, 'dims');
  assert(r.format === 'jpeg', 'format');
  const exp = new Uint8ClampedArray(8 * 8 * 4);
  for (let i = 0; i < exp.length; i += 4){ exp[i] = 128; exp[i + 1] = 128; exp[i + 2] = 128; exp[i + 3] = 255; }
  assert(r.data.length === exp.length, 'length');
  for (let i = 0; i < exp.length; i++)
    if (r.data[i] !== exp[i]) throw new Error('pixel mismatch at byte ' + i + ': got ' + r.data[i]);
});

test('truncated scan throws', () => {
  const full = buildMinimalJpeg();
  assertThrows(() => decodeJpeg(full.slice(0, full.length - 3)), /truncated/i);
  assertThrows(() => decodeJpeg(full.slice(0, 24)), /truncated/i);
});

test('progressive (SOF2) is supported (no longer throws unsupported)', () => {
  const j = buildMinimalJpeg();
  j[72] = 0xC2; // SOF0 marker -> SOF2
  // A single-scan SOF2 is technically valid progressive (one DC+AC scan).
  // It should NOT throw "progressive unsupported".
  let threw = null;
  try { decodeJpeg(j); } catch (e) { threw = e; }
  assert(!threw || !/progressive.*unsupported/i.test(threw.message),
    'SOF2 should not throw progressive-unsupported, got: ' + (threw && threw.message));
});

// 16x8 grayscale, DRI=1: block0 has DC+7 and one AC coef, RST0, block1 has DC-7.
// Verifies AC RLE decode, dequant, IDCT wiring, and restart DC-predictor reset.
function buildRestartJpeg(){
  const b = [];
  const push = (...xs) => { for (const x of xs) b.push(x & 255); };
  push(0xFF, 0xD8);
  push(0xFF, 0xDB, 0x00, 0x43, 0x00);
  for (let i = 0; i < 64; i++) push(1);
  push(0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x08, 0x00, 0x10, 0x01, 0x01, 0x11, 0x00);
  push(0xFF, 0xC4, 0x00, 0x2A);
  push(0x00, 0x00,0x04,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
       0x00,0x01,0x02,0x03);                       // DC: "00","01","10","11" -> cat 0..3
  push(0x10, 0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
       0x00,0x03);                                 // AC: "0000"=EOB, "0001"=(0,3)
  push(0xFF, 0xDD, 0x00, 0x04, 0x00, 0x01);         // DRI = 1
  push(0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00);
  push(0xF8, 0xD0);                                // blk0: DC "11"+"111"=+7, AC "0001"+"101"=5@zz1, "0000"
  push(0xFF, 0xD0);                                // RST0
  push(0xC0, 0x7F);                                // blk1: DC "11"+"000"=-7, "0000" + fill(1s)
  push(0xFF, 0xD9);
  return new Uint8Array(b);
}

test('AC coeffs + restart DC reset decode exactly', () => {
  const r = decodeJpeg(buildRestartJpeg());
  assert(r.width === 16 && r.height === 8, 'dims');
  const clamp = v => new Uint8ClampedArray([v])[0];
  const exp = new Uint8ClampedArray(16 * 8 * 4);
  const blocks = [
    { x0: 0, f: (() => { const F = new Float64Array(64); F[0] = 7; F[1] = 5; return F; })() },
    { x0: 8, f: (() => { const F = new Float64Array(64); F[0] = -7; return F; })() }, // pred reset by RST0
  ];
  for (const { x0, f } of blocks){
    const s = naiveIDCT(f);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++){
      const g = clamp(s[y * 8 + x] + 128), o = ((y * 16) + (x0 + x)) * 4;
      exp[o] = g; exp[o + 1] = g; exp[o + 2] = g; exp[o + 3] = 255;
    }
  }
  assert(r.data.length === exp.length, 'length');
  for (let i = 0; i < exp.length; i++)
    if (r.data[i] !== exp[i]) throw new Error('pixel mismatch at byte ' + i + ': got ' + r.data[i] + ' want ' + exp[i]);
  // restart provably reset the predictor: -7/8+128 = 127.125 -> 127 (no reset would give 128)
  assert(r.data[((0 * 16) + 8) * 4] === 127, 'restart reset check');
});

// Tiny flat-color builds for 4:4:4 and 4:2:2 MCU assembly paths.
function buildFlatColorJpeg(w, h, samp){
  const b = [];
  const push = (...xs) => { for (const x of xs) b.push(x & 255); };
  const push16 = v => push(v >> 8, v & 255);
  push(0xFF, 0xD8);
  push(0xFF, 0xDB); push16(2 + 65);
  push(0x00); for (let i = 0; i < 64; i++) push(1);
  push(0xFF, 0xC0); push16(8 + 3 * 3);
  push(0x08); push16(h); push16(w); push(0x03);
  const ids = [1, 2, 3];
  for (let c = 0; c < 3; c++) push(ids[c], (samp[c][0] << 4) | samp[c][1], 0x00);
  push(0xFF, 0xC4); push16(2 + 2 * (1 + 16 + 1));
  push(0x00, 0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00);
  push(0x10, 0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00);
  push(0xFF, 0xDA); push16(6 + 2 * 3);
  push(0x03, 0x01,0x00, 0x02,0x00, 0x03,0x00, 0x00,0x3F,0x00);
  let acc = 0, nbits = 0;
  const wbits = (v, n) => { acc = (acc << n) | v; nbits += n; while (nbits >= 8){ nbits -= 8; push((acc >>> nbits) & 255); } };
  const maxH = Math.max(...samp.map(s => s[0])), maxV = Math.max(...samp.map(s => s[1]));
  const mcus = Math.ceil(w / (maxH * 8)) * Math.ceil(h / (maxV * 8));
  const blksPerMcu = samp.reduce((a, s) => a + s[0] * s[1], 0);
  for (let m = 0; m < mcus; m++) for (let k = 0; k < blksPerMcu; k++){ wbits(0b00, 2); wbits(0b0000, 4); }
  if (nbits > 0) push(((acc << (8 - nbits)) & 255) | ((1 << (8 - nbits)) - 1));
  push(0xFF, 0xD9);
  return new Uint8Array(b);
}

for (const [name, samp] of [['4:4:4', [[1,1],[1,1],[1,1]]], ['4:2:2', [[2,1],[1,1],[1,1]]]]){
  test(`flat ${name} 16x8 decodes exact`, () => {
    const r = decodeJpeg(buildFlatColorJpeg(16, 8, samp));
    assert(r.width === 16 && r.height === 8, 'dims');
    for (const [x, y] of [[0,0],[15,7],[7,3]]){
      const o = (y * 16 + x) * 4;
      for (let i = 0; i < 4; i++)
        if (r.data[o + i] !== [128,128,128,255][i]) throw new Error(`${name} pixel (${x},${y}) mismatch`);
    }
  });
}

// Synthetic 1920x1080 4:2:0 JPEG: flat mid-gray, DC-only + EOB blocks.
function buildSyntheticJpeg(w, h){
  const b = [];
  const push = (...xs) => { for (const x of xs) b.push(x & 255); };
  const push16 = v => push(v >> 8, v & 255);
  const dcBits = [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], dcVals = [0];
  const acBits = [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0], acVals = [0];
  push(0xFF, 0xD8);
  push(0xFF, 0xDB); push16(2 + 65 + 65);
  push(0x00); for (let i = 0; i < 64; i++) push(8);
  push(0x01); for (let i = 0; i < 64; i++) push(8);
  push(0xFF, 0xC0); push16(8 + 3 * 3);
  push(0x08); push16(h); push16(w); push(0x03);
  push(0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01);
  push(0xFF, 0xC4); push16(2 + 4 * (1 + 16 + 1));
  for (const [t, th] of [[0,0],[0,1],[1,0],[1,1]]){
    push((t << 4) | th);
    push(...(t === 0 ? dcBits : acBits), ...(t === 0 ? dcVals : acVals));
  }
  push(0xFF, 0xDA); push16(6 + 2 * 3);
  push(0x03, 0x01,0x00, 0x02,0x11, 0x03,0x11, 0x00,0x3F,0x00);
  let acc = 0, nbits = 0;
  const wbits = (v, n) => {
    acc = (acc << n) | v; nbits += n;
    while (nbits >= 8){ nbits -= 8; push((acc >>> nbits) & 255); }
  };
  const mcusX = Math.ceil(w / 16), mcusY = Math.ceil(h / 16);
  for (let m = 0; m < mcusX * mcusY; m++)
    for (let blk = 0; blk < 6; blk++){ wbits(0b00, 2); wbits(0b0000, 4); } // DC cat0 + EOB
  if (nbits > 0) push(((acc << (8 - nbits)) & 255) | ((1 << (8 - nbits)) - 1));
  push(0xFF, 0xD9);
  return new Uint8Array(b);
}

test('speed: synthetic 1920x1080 4:2:0 decodes', () => {
  const jpg = buildSyntheticJpeg(1920, 1080);
  const t0 = performance.now();
  const r = decodeJpeg(jpg);
  const ms = performance.now() - t0;
  assert(r.width === 1920 && r.height === 1080, 'dims');
  assert(r.data.length === 1920 * 1080 * 4, 'length');
  for (let i = 0; i < 4; i++) assert(r.data[i] === [128,128,128,255][i], 'pixel(0,0)');
  const mid = ((540 * 1920) + 960) * 4;
  for (let i = 0; i < 4; i++) assert(r.data[mid + i] === [128,128,128,255][i], 'pixel(960,540)');
  const mp = (1920 * 1080 / 1e6);
  console.log(`   ${ms.toFixed(1)} ms  (${(mp / (ms / 1000)).toFixed(1)} MP/s), scan ${(jpg.length / 1024).toFixed(1)} KB`);
  globalThis.__speedMs = ms;
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
