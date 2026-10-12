// B"H
/**
 * @file jpegDecoder.js
 * @description
 * From-scratch baseline (SOF0) + progressive (SOF2) JPEG decoder for the
 * Merkava browser's image-decoding subsystem. No npm dependencies, ES module.
 *
 * decodeJpeg(bytes: Uint8Array) ->
 *   { width, height, data: Uint8ClampedArray (RGBA, row-major), format: 'jpeg' }
 * Throws an Error on invalid, truncated, or unsupported input.
 *
 * Supported: SOI, APPn/COM skip, DQT (8/16-bit), SOF0, SOF2 (progressive),
 * DHT, DRI, SOS, EOI; byte stuffing (FF00); restart markers FFD0-FFD7
 * (reset DC predictors); 1- and 3-component scans; sampling factors H,V in
 * {1,2} (4:4:4, 4:2:2, 4:2:0) with bilinear chroma upsampling; AAN fast IDCT;
 * YCbCr->RGB. Progressive: spectral selection (Ss/Se), successive
 * approximation (Ah/Al), EOB runs, DC/AC refine scans.
 * Rejected cleanly: CMYK/Adobe, other SOF markers, bad sampling factors,
 * truncation.
 */

// Zigzag index -> natural (row-major) index.
const ZZ = new Uint8Array([
  0, 1, 8,16, 9, 2, 3,10,
 17,24,32,25,18,11, 4, 5,
 12,19,26,33,40,48,41,34,
 27,20,13, 6, 7,14,21,28,
 35,42,49,56,57,50,43,36,
 29,22,15,23,30,37,44,51,
 58,59,52,45,38,31,39,46,
 53,60,61,54,47,55,62,63]);

// AAN scale factors; the 1-D inverse below is the exact algebraic inverse of
// the AAN forward factorization, so dequant folds in diag(sqrt(8)*AAN[k]):
// dq = qtbl * 8 * AAN[row] * AAN[col]  (verified <2e-6 vs direct DCT formula).
const AAN = [1.0, 1.387039845, 1.306562965, 1.175875602,
             1.0, 0.785694958, 0.541196100, 0.275899379];

const IC2 = 0.923879533;  // cos(2*pi/16)
const IC6 = 0.382683433;  // cos(6*pi/16)
const IC4 = 0.707106781;  // cos(4*pi/16)

class BitReader {
  constructor(buf){ this.b = buf; this.i = 0; this.acc = 0; this.nb = 0; }
  get bitsRead(){ return this.i * 8 - this.nb; }
  fill(){
    const b = this.b;
    let i = this.i, acc = this.acc, nb = this.nb;
    while (nb <= 16 && i < b.length){ acc = (acc << 8) | b[i++]; nb += 8; }
    this.i = i; this.acc = acc; this.nb = nb;
  }
  get(n){
    this.fill();
    if (this.nb < n) throw new Error('truncated scan data');
    this.nb -= n;
    return (this.acc >>> this.nb) & ((1 << n) - 1);
  }
}

// Canonical Huffman table from BITS/HUFFVAL: 8-bit fast prefix lookup + fallback.
function buildHuffman(bits, vals){
  const fast = new Uint16Array(256); // (sym<<4)|len, 0 = miss/long code
  const mincode = new Int32Array(17), maxcode = new Int32Array(17), valptr = new Int32Array(17);
  let code = 0, k = 0;
  for (let len = 1; len <= 16; len++){
    const n = bits[len - 1];
    mincode[len] = code; valptr[len] = k;
    for (let i = 0; i < n; i++){
      const sym = vals[k++];
      if (len <= 8){
        const e = (sym << 4) | len;
        const start = code << (8 - len), end = start + (1 << (8 - len));
        for (let j = start; j < end; j++) fast[j] = e;
      }
      code++;
    }
    maxcode[len] = code - 1;
    code <<= 1;
  }
  return { fast, mincode, maxcode, valptr, vals };
}

function huffDecode(br, t){
  br.fill();
  if (br.nb >= 8){
    const e = t.fast[(br.acc >>> (br.nb - 8)) & 255];
    if (e !== 0){ br.nb -= (e & 15); return e >>> 4; }
  }
  let code = 0;
  for (let len = 1; len <= 16; len++){
    code = (code << 1) | br.get(1);
    if (code <= t.maxcode[len]) return t.vals[t.valptr[len] + code - t.mincode[len]];
  }
  throw new Error('invalid Huffman code');
}

// 1-D inverse of the AAN forward DCT (exact algebraic inversion of its
// butterfly/rotation stages). Reads src[si + k*ss], writes dst[di + k*ds].
function idct1d(src, si, ss, dst, di, ds){
  const y0 = src[si], y1 = src[si + ss], y2 = src[si + 2 * ss], y3 = src[si + 3 * ss],
        y4 = src[si + 4 * ss], y5 = src[si + 5 * ss], y6 = src[si + 6 * ss], y7 = src[si + 7 * ss];
  if (y1 === 0 && y2 === 0 && y3 === 0 && y4 === 0 && y5 === 0 && y6 === 0 && y7 === 0){
    const dc = y0 * 0.125;
    dst[di] = dc; dst[di + ds] = dc; dst[di + 2 * ds] = dc; dst[di + 3 * ds] = dc;
    dst[di + 4 * ds] = dc; dst[di + 5 * ds] = dc; dst[di + 6 * ds] = dc; dst[di + 7 * ds] = dc;
    return;
  }
  const b10 = (y0 + y4) * 0.5, b11 = (y0 - y4) * 0.5, b13 = (y2 + y6) * 0.5;
  const b12 = (y2 - y6) * IC4 - b13;
  const a0 = (b10 + b13) * 0.5, a3 = (b10 - b13) * 0.5;
  const a1 = (b11 + b12) * 0.5, a2 = (b11 - b12) * 0.5;
  const z13 = (y5 + y3) * 0.5, z2 = (y5 - y3) * 0.5;
  const z11 = (y1 + y7) * 0.5, z4 = (y1 - y7) * 0.5;
  const c10 = IC2 * z2 + IC6 * z4, c12 = IC2 * z4 - IC6 * z2;
  const a7 = (z11 + z13) * 0.5, c11 = (z11 - z13) * IC4;
  const a5 = a7 - c12 + c11, a4 = c10 - a5, a6 = c11 - a5;
  dst[di] = (a0 + a7) * 0.5;          dst[di + 7 * ds] = (a0 - a7) * 0.5;
  dst[di + ds] = (a1 + a6) * 0.5;     dst[di + 6 * ds] = (a1 - a6) * 0.5;
  dst[di + 2 * ds] = (a2 + a5) * 0.5; dst[di + 5 * ds] = (a2 - a5) * 0.5;
  dst[di + 3 * ds] = (a3 + a4) * 0.5; dst[di + 4 * ds] = (a3 - a4) * 0.5;
}

const _ws = new Float64Array(64);
function aanIDCT(s, d){
  for (let c = 0; c < 8; c++) idct1d(s, c, 8, _ws, c, 8); // col c -> _ws[y][c]
  for (let r = 0; r < 8; r++) idct1d(_ws, r * 8, 1, d, r * 8, 1);
}

// Test hook: pure inverse DCT of 64 raw coefficients (unit quant table).
const UNIT_DQ = new Float64Array(64);
for (let i = 0; i < 64; i++) UNIT_DQ[i] = AAN[i >> 3] * AAN[i & 7] * 8;
export function idctBlock(src){
  const s = new Float64Array(64), d = new Float64Array(64);
  for (let i = 0; i < 64; i++) s[i] = src[i] * UNIT_DQ[i];
  aanIDCT(s, d);
  return d;
}

// Decodes one 8x8 block of raw integer coefficients into _coef (natural order).
// Sets _blockHasAC when any AC coefficient is nonzero (drives the DC-only fast path).
const _coef = new Int16Array(64);
let _blockHasAC = false;
function decodeBlock(br, dcT, acT){
  _coef.fill(0);
  _blockHasAC = false;
  const cat = huffDecode(br, dcT);
  if (cat < 0 || cat > 16) throw new Error('bad DC category');
  if (cat !== 0){
    let diff = br.get(cat);
    if (diff < (1 << (cat - 1))) diff += ((-1) << cat) + 1;
    _coef[0] = diff;
  }
  let k = 1;
  while (k < 64){
    const rs = huffDecode(br, acT);
    const r = rs >> 4, s = rs & 15;
    if (s === 0){
      if (r === 15){ k += 16; continue; } // ZRL
      if (r !== 0) throw new Error('bad AC symbol');
      break; // EOB
    }
    k += r;
    if (k >= 64) throw new Error('block overrun');
    let v = br.get(s);
    if (v < (1 << (s - 1))) v += ((-1) << s) + 1;
    _coef[ZZ[k]] = v;
    _blockHasAC = true;
    k++;
  }
}

function parseDQT(bytes, p, end, qtbl){
  while (p < end){
    const info = bytes[p++], tq = info & 15, prec = info >> 4;
    if (tq > 3 || prec > 1) throw new Error('bad DQT');
    const t = new Float64Array(64);
    for (let i = 0; i < 64; i++){
      let v;
      if (prec === 0) v = bytes[p++];
      else { v = (bytes[p] << 8) | bytes[p + 1]; p += 2; }
      if (v <= 0) throw new Error('bad quantization value');
      t[ZZ[i]] = v;
    }
    qtbl[tq] = t;
  }
}

function parseSOF(bytes, p){
  const u16at = o => (bytes[o] << 8) | bytes[o + 1];
  if (bytes[p] !== 8) throw new Error('unsupported JPEG sample precision');
  const h = u16at(p + 1), w = u16at(p + 3);
  if (w <= 0 || h <= 0 || w > 16384 || h > 16384) throw new Error('invalid JPEG dimensions');
  const n = bytes[p + 5];
  if (n === 4) throw new Error('CMYK/Adobe JPEG unsupported');
  if (n !== 1 && n !== 3) throw new Error('unsupported JPEG component count: ' + n);
  const comps = [];
  let q = p + 6;
  for (let i = 0; i < n; i++){
    const id = bytes[q], hv = bytes[q + 1], tq = bytes[q + 2]; q += 3;
    const hh = hv >> 4, vv = hv & 15;
    if (hh < 1 || hh > 2 || vv < 1 || vv > 2) throw new Error('unsupported JPEG sampling factors');
    comps.push({ id, h: hh, v: vv, tq });
  }
  return { w, h, comps };
}

function parseDHT(bytes, p, end, dcH, acH){
  while (p < end){
    const info = bytes[p++], th = info & 15, tc = info >> 4;
    if (th > 3 || tc > 1) throw new Error('bad DHT');
    const bits = new Uint8Array(16);
    let total = 0;
    for (let i = 0; i < 16; i++){ bits[i] = bytes[p++]; total += bits[i]; }
    if (total === 0 || total > 256) throw new Error('bad DHT');
    const vals = new Uint8Array(total);
    for (let i = 0; i < total; i++) vals[i] = bytes[p++];
    const t = buildHuffman(bits, vals);
    if (tc === 0) dcH[th] = t; else acH[th] = t;
  }
}

function parseSOS(bytes, p, sof, dcH, acH, progressive){
  const ns = bytes[p++];
  if (!sof) throw new Error('SOS before SOF');
  if (ns < 1 || ns > 4) throw new Error('bad SOS component count');
  // Baseline: single scan must cover all components. Progressive: each scan
  // covers 1-4 components (typically 1 for AC scans, all for DC scans).
  if (!progressive && ns !== sof.comps.length)
    throw new Error('bad SOS component count');
  const comps = [];
  for (let i = 0; i < ns; i++){
    const cs = bytes[p], tdta = bytes[p + 1]; p += 2;
    const c = sof.comps.find(x => x.id === cs);
    if (!c) throw new Error('SOS references unknown component');
    const td = tdta >> 4, ta = tdta & 15;
    if (!dcH[td]) throw new Error('missing Huffman DC table ' + td);
    comps.push({ ...c, dcT: dcH[td], _ta: ta });
  }
  const Ss = bytes[p], Se = bytes[p + 1], AhAl = bytes[p + 2];
  const Ah = AhAl >> 4, Al = AhAl & 15;
  const isDC = (Ss === 0 && Se === 0);
  if (!progressive){
    if (Ss !== 0 || Se !== 63 || AhAl !== 0)
      throw new Error('unsupported JPEG scan (not baseline sequential)');
    for (const c of comps){
      if (!acH[c._ta]) throw new Error('missing Huffman AC table ' + c._ta);
      c.acT = acH[c._ta];
    }
  } else {
    if (Ss > 63 || Se > 63 || Ss > Se) throw new Error('bad progressive spectral selection');
    if (Ah > 13 || Al > 13) throw new Error('bad progressive successive approximation');
    if (!isDC && ns !== 1) throw new Error('progressive AC scan must have exactly 1 component');
    if (!isDC){
      for (const c of comps){
        if (!acH[c._ta]) throw new Error('missing Huffman AC table ' + c._ta);
        c.acT = acH[c._ta];
      }
    }
  }
  return { comps, Ss, Se, Ah, Al };
}

// Unstuff scan data (FF00 -> FF), recording restart-marker bit positions.
// Writes directly into a pre-sized Uint8Array (output can only shrink vs
// input, so input length is a safe upper bound) — no JS Array of numbers.
function extractScan(bytes, pos){
  const out = new Uint8Array(bytes.length - pos);
  let w = 0;
  const restarts = [];
  let i = pos;
  const n = bytes.length;
  while (i < n){
    const b = bytes[i];
    if (b !== 0xFF){ out[w++] = b; i++; continue; }
    if (i + 1 >= n) throw new Error('truncated scan data');
    const m = bytes[i + 1];
    if (m === 0x00){ out[w++] = 0xFF; i += 2; continue; }
    if (m >= 0xD0 && m <= 0xD7){ restarts.push(w * 8); i += 2; continue; }
    return { data: out.subarray(0, w), restarts, endPos: i };
  }
  throw new Error('truncated scan data');
}

export function decodeJpeg(bytes){
  if (!(bytes instanceof Uint8Array)) throw new Error('decodeJpeg: expected Uint8Array');
  const u16at = o => (bytes[o] << 8) | bytes[o + 1];
  if (bytes.length < 2 || u16at(0) !== 0xFFD8) throw new Error('not a JPEG: missing SOI');
  let p = 2;
  const qtbl = [null, null, null, null];
  const dcH = [null, null, null, null], acH = [null, null, null, null];
  let sof = null, progressive = false, adobe = -1;
  const scans = [];
  for (;;){
    if (p + 2 > bytes.length) throw new Error('truncated JPEG headers');
    if (bytes[p] !== 0xFF) throw new Error('expected JPEG marker at offset ' + p);
    let m = bytes[p + 1]; p += 2;
    while (m === 0xFF){
      if (p >= bytes.length) throw new Error('truncated JPEG headers');
      m = bytes[p++];
    }
    if (m === 0xD9){
      if (scans.length === 0) throw new Error('unexpected EOI before SOS');
      break;
    }
    if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) continue; // standalone
    if (p + 2 > bytes.length) throw new Error('truncated JPEG headers');
    const len = u16at(p); p += 2;
    if (len < 2 || p + len - 2 > bytes.length) throw new Error('truncated JPEG segment');
    const end = p + len - 2;
    if (m === 0xDA){
      const sos = parseSOS(bytes, p, sof, dcH, acH, progressive);
      const scan = extractScan(bytes, end);
      scans.push({ sos, ...scan });
      p = scan.endPos;
      continue;
    }
    switch (m){
      case 0xDB: parseDQT(bytes, p, end, qtbl); break;
      case 0xC0: sof = parseSOF(bytes, p); progressive = false; break;
      case 0xC2: sof = parseSOF(bytes, p); progressive = true; break;
      case 0xC1: case 0xC3: case 0xC5: case 0xC6: case 0xC7:
      case 0xC9: case 0xCA: case 0xCB: case 0xCD: case 0xCE: case 0xCF:
        throw new Error('unsupported JPEG SOF marker');
      case 0xC4: parseDHT(bytes, p, end, dcH, acH); break;
      case 0xDD: break; // DRI: restart interval; markers themselves drive resets
      case 0xEE: // APP14 (Adobe)
        if (end - p >= 12 && bytes[p] === 0x41 && bytes[p + 1] === 0x64 &&
            bytes[p + 2] === 0x6F && bytes[p + 3] === 0x62 && bytes[p + 4] === 0x65)
          adobe = bytes[p + 11];
        break;
      default: break; // APPn, COM, and other segments: skip
    }
    p = end;
  }
  if (!sof) throw new Error('JPEG missing SOF');
  if (adobe === 0) throw new Error('unsupported JPEG colorspace (Adobe transform 0)');
  if (scans.length === 0) throw new Error('JPEG has no scans');

  return progressive
    ? decodeProgressiveScans(sof, qtbl, scans)
    : decodeBaselineScan(bytes, sof, qtbl, scans[0]);
}

// Baseline sequential scan decode (SOF0).
function decodeBaselineScan(bytes, sof, qtbl, scan){
  const comps = scan.sos.comps;
  let maxH = 1, maxV = 1;
  for (const c of comps){
    maxH = Math.max(maxH, c.h); maxV = Math.max(maxV, c.v);
    const qt = qtbl[c.tq];
    if (!qt) throw new Error('missing quantization table ' + c.tq);
    const dq = new Float64Array(64);
    for (let i = 0; i < 64; i++) dq[i] = qt[i] * AAN[i >> 3] * AAN[i & 7] * 8;
    c.dq = dq; c.pred = 0;
  }
  const mcuCols = Math.ceil(sof.w / (maxH * 8)), mcuRows = Math.ceil(sof.h / (maxV * 8));
  for (const c of comps){ c.pw = mcuCols * c.h * 8; c.ph = mcuRows * c.v * 8; c.plane = new Float32Array(c.pw * c.ph); }

  const s = new Float64Array(64), d = new Float64Array(64);
  const br = new BitReader(scan.data);
  let rsi = 0;
  for (let my = 0; my < mcuRows; my++){
    for (let mx = 0; mx < mcuCols; mx++){
      for (const c of comps){
        for (let by = 0; by < c.v; by++) for (let bx = 0; bx < c.h; bx++){
          decodeBlock(br, c.dcT, c.acT);
          c.pred += _coef[0];
          const dq = c.dq;
          const x0 = (mx * c.h + bx) * 8, y0 = (my * c.v + by) * 8;
          const pl = c.plane, pw = c.pw;
          if (!_blockHasAC){
            // DC-only block: the 2-D IDCT of a lone DC coefficient is a
            // constant block (each 1-D pass scales by 1/8), so skip the IDCT.
            const dcVal = c.pred * dq[0] * 0.015625 + 128;
            for (let y = 0; y < 8; y++){
              const ro = (y0 + y) * pw + x0;
              for (let x = 0; x < 8; x++) pl[ro + x] = dcVal;
            }
            continue;
          }
          s[0] = c.pred * dq[0];
          for (let i = 1; i < 64; i++) s[i] = _coef[i] * dq[i];
          aanIDCT(s, d);
          for (let y = 0; y < 8; y++){
            const ro = (y0 + y) * pw + x0, so = y * 8;
            for (let x = 0; x < 8; x++) pl[ro + x] = d[so + x] + 128;
          }
        }
      }
      while (rsi < scan.restarts.length && br.bitsRead >= scan.restarts[rsi]){
        for (const c of comps) c.pred = 0;
        rsi++;
      }
    }
  }

  let e = scan.endPos;
  if (bytes[e] !== 0xFF) throw new Error('missing EOI');
  while (bytes[e] === 0xFF) e++;
  if (bytes[e] !== 0xD9) throw new Error('missing EOI');

  return jpegPostProcess(sof, comps, mcuCols, mcuRows, maxH, maxV);
}

// --- Progressive (SOF2) decoding -------------------------------------------
// Multiple SOS scans refine DCT coefficients:
//  - DC first (Ss=0,Se=0,Ah=0): DC differences, stored << Al.
//  - DC refine (Ss=0,Se=0,Ah>0): one bit per block -> bit Al of DC.
//  - AC first (Ah=0): coefficients Ss..Se, stored << Al, with EOB runs.
//  - AC refine (Ah>0): correct nonzeros in Ss..Se, code new ones, EOB runs.
// Single-component AC scans use raster block order (not MCU order).

function decodeProgDCRfirst(br, sos, mcuCols, mcuRows){
  const { Al } = sos;
  for (const c of sos.comps) c.pred = 0;
  for (let my = 0; my < mcuRows; my++)
    for (let mx = 0; mx < mcuCols; mx++)
      for (const c of sos.comps){
        const buf = c.buf;
        for (let by = 0; by < c.v; by++) for (let bx = 0; bx < c.h; bx++){
          const cat = huffDecode(br, c.dcT);
          if (cat < 0 || cat > 16) throw new Error('bad progressive DC category');
          let diff = 0;
          if (cat !== 0){
            diff = br.get(cat);
            if (diff < (1 << (cat - 1))) diff += ((-1) << cat) + 1;
          }
          c.pred += diff;
          const bi = ((my * c.v + by) * (mcuCols * c.h) + (mx * c.h + bx));
          buf[bi * 64] = c.pred << Al;
        }
      }
}

function decodeProgDCRefine(br, sos, mcuCols, mcuRows){
  const bit = 1 << sos.Al;
  for (const c of sos.comps){
    const buf = c.buf;
    for (let my = 0; my < mcuRows; my++)
      for (let mx = 0; mx < mcuCols; mx++)
        for (let by = 0; by < c.v; by++) for (let bx = 0; bx < c.h; bx++){
          const bi = ((my * c.v + by) * (mcuCols * c.h) + (mx * c.h + bx));
          if (br.get(1)) buf[bi * 64] |= bit;
        }
  }
}

function decodeProgACFirst(br, sos, mcuCols, mcuRows){
  const { Ss, Se, Al } = sos;
  const c = sos.comps[0], buf = c.buf;
  const bw = mcuCols * c.h, bh = mcuRows * c.v;
  const total = bw * bh;
  let eobRun = 0;
  for (let bi = 0; bi < total; bi++){
    const base = bi * 64;
    if (eobRun > 0){ eobRun--; continue; }
    let k = Ss;
    while (k <= Se){
      const rs = huffDecode(br, c.acT);
      const r = rs >> 4, s = rs & 15;
      if (s === 0){
        if (r === 15){ k += 16; continue; }
        eobRun = r > 0 ? (1 << r) + br.get(r) - 1 : 0;
        break;
      }
      k += r;
      if (k > Se) throw new Error('progressive AC overflow');
      let v = br.get(s);
      if (v < (1 << (s - 1))) v += ((-1) << s) + 1;
      buf[base + ZZ[k]] = v << Al;
      k++;
    }
  }
}

function decodeProgACRefine(br, sos, mcuCols, mcuRows){
  const { Ss, Se, Al } = sos;
  const c = sos.comps[0], buf = c.buf;
  const bit = 1 << Al;
  const bw = mcuCols * c.h, bh = mcuRows * c.v;
  const total = bw * bh;
  let eobRun = 0;
  for (let bi = 0; bi < total; bi++){
    const base = bi * 64;
    let k = Ss;
    if (eobRun > 0){
      while (k <= Se){
        const idx = base + ZZ[k];
        if (buf[idx] !== 0 && br.get(1)) buf[idx] += (buf[idx] > 0 ? bit : -bit);
        k++;
      }
      eobRun--;
      continue;
    }
    while (k <= Se){
      const idx = base + ZZ[k];
      if (buf[idx] !== 0){
        if (br.get(1)) buf[idx] += (buf[idx] > 0 ? bit : -bit);
        k++;
        continue;
      }
      const rs = huffDecode(br, c.acT);
      const r = rs >> 4, s = rs & 15;
      if (s === 0){
        if (r === 15){ k += 16; continue; }
        eobRun = r > 0 ? (1 << r) + br.get(r) - 1 : 0;
        k++;
        while (k <= Se){
          const ridx = base + ZZ[k];
          if (buf[ridx] !== 0 && br.get(1)) buf[ridx] += (buf[ridx] > 0 ? bit : -bit);
          k++;
        }
        break;
      }
      let zerosSkipped = 0;
      while (zerosSkipped < r){
        const zidx = base + ZZ[k];
        if (buf[zidx] !== 0){
          if (br.get(1)) buf[zidx] += (buf[zidx] > 0 ? bit : -bit);
        } else {
          zerosSkipped++;
        }
        k++;
        if (k > Se) throw new Error('progressive AC refine overflow');
      }
      const nidx = base + ZZ[k];
      let v = br.get(s);
      if (v < (1 << (s - 1))) v += ((-1) << s) + 1;
      let nv = v << Al;
      if (br.get(1)) nv += (nv > 0 ? bit : -bit);
      buf[nidx] = nv;
      k++;
    }
  }
}

function decodeProgressiveScans(sof, qtbl, scans){
  let maxH = 1, maxV = 1;
  for (const c of sof.comps){ maxH = Math.max(maxH, c.h); maxV = Math.max(maxV, c.v); }
  const mcuCols = Math.ceil(sof.w / (maxH * 8)), mcuRows = Math.ceil(sof.h / (maxV * 8));

  for (const c of sof.comps){
    const qt = qtbl[c.tq];
    if (!qt) throw new Error('missing quantization table ' + c.tq);
    const dq = new Float64Array(64);
    for (let i = 0; i < 64; i++) dq[i] = qt[i] * AAN[i >> 3] * AAN[i & 7] * 8;
    c.dq = dq; c.pred = 0;
    c.pw = mcuCols * c.h * 8; c.ph = mcuRows * c.v * 8;
    c.plane = new Float32Array(c.pw * c.ph);
    c.buf = new Int32Array(mcuCols * c.h * mcuRows * c.v * 64);
  }
  const compById = new Map(sof.comps.map(c => [c.id, c]));

  for (const scan of scans){
    const sos = scan.sos;
    const active = sos.comps.map(sc => {
      const c = compById.get(sc.id);
      if (!c) throw new Error('SOS references unknown component');
      return { ...c, dcT: sc.dcT, acT: sc.acT };
    });
    const aso = { ...sos, comps: active };
    const br = new BitReader(scan.data);
    if (sos.Ss === 0 && sos.Se === 0){
      if (sos.Ah === 0) decodeProgDCRfirst(br, aso, mcuCols, mcuRows);
      else decodeProgDCRefine(br, aso, mcuCols, mcuRows);
    } else {
      if (sos.Ah === 0) decodeProgACFirst(br, aso, mcuCols, mcuRows);
      else decodeProgACRefine(br, aso, mcuCols, mcuRows);
    }
  }

  const s = new Float64Array(64), d = new Float64Array(64);
  for (const c of sof.comps){
    const buf = c.buf, dq = c.dq, pl = c.plane, pw = c.pw;
    const bw = mcuCols * c.h;
    const totalBlocks = mcuRows * c.v * bw;
    for (let bi = 0; bi < totalBlocks; bi++){
      const base = bi * 64;
      const x0 = (bi % bw) * 8, y0 = ((bi / bw) | 0) * 8;
      let hasAC = false;
      for (let i = 1; i < 64; i++) if (buf[base + i] !== 0){ hasAC = true; break; }
      if (!hasAC){
        const dcVal = buf[base] * dq[0] * 0.015625 + 128;
        for (let y = 0; y < 8; y++){
          const ro = (y0 + y) * pw + x0;
          for (let x = 0; x < 8; x++) pl[ro + x] = dcVal;
        }
        continue;
      }
      for (let i = 0; i < 64; i++) s[i] = buf[base + i] * dq[i];
      aanIDCT(s, d);
      for (let y = 0; y < 8; y++){
        const ro = (y0 + y) * pw + x0, so = y * 8;
        for (let x = 0; x < 8; x++) pl[ro + x] = d[so + x] + 128;
      }
    }
  }

  return jpegPostProcess(sof, sof.comps, mcuCols, mcuRows, maxH, maxV);
}

// Shared final stage: chroma upsample + YCbCr->RGB.
function jpegPostProcess(sof, comps, mcuCols, mcuRows, maxH, maxV){
  const fullW = mcuCols * maxH * 8, fullH = mcuRows * maxV * 8;
  const gray = comps.length === 1;
  const lum = comps[0].plane;
  const w = sof.w, h = sof.h;
  const out = new Uint8ClampedArray(w * h * 4);

  if (gray) {
    // Branch hoisted out of the pixel loop.
    let o = 0;
    for (let y = 0; y < h; y++){
      const r0 = y * fullW;
      for (let x = 0; x < w; x++){
        const Y = lum[r0 + x];
        out[o] = Y; out[o + 1] = Y; out[o + 2] = Y; out[o + 3] = 255; o += 4;
      }
    }
    return { width: w, height: h, data: out, format: 'jpeg' };
  }

  // Chroma upsampling fused into the YCbCr->RGB loop: the old pipeline
  // materialized two full-resolution Float32 Cb/Cr planes (6MB of traffic for
  // 1024x768); here bilinear is evaluated on the fly from the small chroma
  // planes. Math.fround reproduces the old Float32Array store/load rounding
  // bit-for-bit, so output is identical.
  const cbSrc = comps[1].plane, crSrc = comps[2].plane;
  const csw = comps[1].pw, csh = comps[1].ph;
  const x0a = new Int32Array(fullW), x1a = new Int32Array(fullW);
  const wx0a = new Float32Array(fullW), wx1a = new Float32Array(fullW);
  for (let x = 0; x < fullW; x++){
    const sx = (x + 0.5) * csw / fullW - 0.5;
    let x0 = Math.floor(sx), fx = sx - x0;
    if (x0 < 0){ x0 = 0; fx = 0; } else if (x0 >= csw - 1){ x0 = csw - 1; fx = 0; }
    x0a[x] = x0;
    x1a[x] = x0 + 1 < csw ? x0 + 1 : csw - 1;
    wx0a[x] = 1 - fx;
    wx1a[x] = fx;
  }
  let o = 0;
  for (let y = 0; y < h; y++){
    const sy = (y + 0.5) * csh / fullH - 0.5;
    let y0 = Math.floor(sy), fy = sy - y0;
    if (y0 < 0){ y0 = 0; fy = 0; } else if (y0 >= csh - 1){ y0 = csh - 1; fy = 0; }
    const y1 = y0 + 1 < csh ? y0 + 1 : csh - 1;
    const cr0 = y0 * csw, cr1 = y1 * csw;
    const wy0 = 1 - fy, wy1 = fy;
    const lr = y * fullW;
    for (let x = 0; x < w; x++){
      const Y = lum[lr + x];
      const x0 = x0a[x], x1 = x1a[x], wx0 = wx0a[x], wx1 = wx1a[x];
      const Cb = Math.fround((cbSrc[cr0 + x0] * wx0 + cbSrc[cr0 + x1] * wx1) * wy0
                           + (cbSrc[cr1 + x0] * wx0 + cbSrc[cr1 + x1] * wx1) * wy1) - 128;
      const Cr = Math.fround((crSrc[cr0 + x0] * wx0 + crSrc[cr0 + x1] * wx1) * wy0
                           + (crSrc[cr1 + x0] * wx0 + crSrc[cr1 + x1] * wx1) * wy1) - 128;
      out[o] = Y + 1.402 * Cr;
      out[o + 1] = Y - 0.344136 * Cb - 0.714136 * Cr;
      out[o + 2] = Y + 1.772 * Cb;
      out[o + 3] = 255;
      o += 4;
    }
  }
  return { width: w, height: h, data: out, format: 'jpeg' };
}
