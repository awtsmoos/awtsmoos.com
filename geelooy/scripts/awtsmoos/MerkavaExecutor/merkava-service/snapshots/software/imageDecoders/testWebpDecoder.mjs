// B"H
/**
 * @file testWebpDecoder.mjs
 * @description Self-tests for webpDecoder.js. Run with: node testWebpDecoder.mjs
 */
import {
  decodeWebp,
  BoolDecoder,
  vp8Idct4, naiveIdct4,
  vp8Walsh4, naiveWalsh4,
  predictDc16, predict4x4,
} from "./webpDecoder.js";

let passed = 0;
let failed = 0;

function t(name, fn) {
  try {
    fn();
    passed++;
    console.log("ok   - " + name);
  } catch (e) {
    failed++;
    console.log("FAIL - " + name + ": " + (e && e.message ? e.message : e));
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error("assert failed: " + msg);
}

// Deterministic PRNG (mulberry32) so the tests are reproducible.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- 1. IDCT vs naive -------------------------------------------------------
// NOTE: The VP8 integer IDCT (llm factorization with fixed-point >>16/>>3
// roundings) is verified BIT-EXACT against the RFC 6386 C reference code
// (see golden test below). Against the ideal mathematical DCT it has up to
// ~1.3 max abs error due to the fixed-point rounding — this is inherent to
// the VP8 spec, not an implementation bug.
t("idct4x4 vs naive (documents fixed-point error)", () => {
  const r = rng(12345);
  let maxErr = 0;
  for (let iter = 0; iter < 300; iter++) {
    const inp = new Int16Array(16);
    for (let i = 0; i < 16; i++)
      inp[i] = Math.floor(r() * 2049) - 1024; // [-1024, 1024]
    const a = vp8Idct4(inp);
    const b = naiveIdct4(inp);
    for (let i = 0; i < 16; i++) {
      const e = Math.abs(a[i] - b[i]);
      if (e > maxErr) maxErr = e;
    }
  }
  // also try sparse / single-coefficient blocks
  for (let k = 0; k < 16; k++) {
    for (const v of [-1024, -1, 1, 1024]) {
      const inp = new Int16Array(16);
      inp[k] = v;
      const a = vp8Idct4(inp), b = naiveIdct4(inp);
      for (let i = 0; i < 16; i++) {
        const e = Math.abs(a[i] - b[i]);
        if (e > maxErr) maxErr = e;
      }
    }
  }
  console.log("      idct max abs err vs ideal DCT = " + maxErr.toFixed(4) +
              " (VP8 fixed-point inherent; bit-exact vs RFC C, see next test)");
  assert(maxErr < 1.5, "idct max err " + maxErr + " unexpectedly large");
});

t("idct4x4 bit-exact vs RFC C reference (golden)", () => {
  // Golden values produced by compiling the RFC 6386 idct_add.c code with gcc.
  const inp = new Int16Array([-55,-399,558,748,300,574,589,313,-96,-874,-356,-603,517,-817,-452,-890]);
  const want = [2,-103,51,309,653,-600,26,-315,-76,5,133,216,-386,-205,80,100];
  const got = vp8Idct4(inp);
  for (let i = 0; i < 16; i++)
    assert(got[i] === want[i], "idct golden[" + i + "]: got " + got[i] + ", want " + want[i]);
});

t("wht4x4 vs naive (max abs err < 1)", () => {
  const r = rng(999);
  let maxErr = 0;
  for (let iter = 0; iter < 300; iter++) {
    const inp = new Int16Array(16);
    for (let i = 0; i < 16; i++)
      inp[i] = Math.floor(r() * 2049) - 1024;
    const a = vp8Walsh4(inp);
    const b = naiveWalsh4(inp);
    for (let i = 0; i < 16; i++) {
      const e = Math.abs(a[i] - b[i]);
      if (e > maxErr) maxErr = e;
    }
  }
  console.log("      wht max abs err = " + maxErr.toFixed(4));
  assert(maxErr < 1, "wht max err " + maxErr + " >= 1");
});

// --- 2. Bool decoder hand trace ---------------------------------------------
t("bool decoder hand-computed trace", () => {
  // Hand simulation of the VP8 bool decoder (RFC 6386 section 7).
  // bytes = [0x80, 0x00] -> value = 0x8000 = 32768, range = 255.
  //
  // bool(128): split = 1 + (((255-1)*128)>>8) = 1 + (254*128>>8)
  //          = 1 + 127 = 128. SPLIT = 128<<8 = 32768.
  //   value (32768) >= SPLIT (32768) -> 1; range = 255-128 = 127;
  //   value = 0. Renorm: range 127 < 128 -> value=0, range=254, bit_count=1.
  //   range 254 >= 128 stop. Returns 1.
  //
  // bool(128): split = 1 + (((254-1)*128)>>8) = 1 + (253*128>>8)
  //          = 1 + 126 = 127 (253*128 = 32384, >>8 = 126). SPLIT = 32512.
  //   value (0) < 32512 -> 0; range = 127. Renorm: range 127 <128 ->
  //   value=0, range=254, bit_count=2. Returns 0.
  //
  // bool(128): split = 1 + (((254-1)*128)>>8) = 127. SPLIT=32512.
  //   value (0) < 32512 -> 0; range=127 -> renorm to 254, bit_count=3. Ret 0.
  //
  // bool(200): split = 1 + (((254-1)*200)>>8) = 1 + (253*200>>8)
  //          = 1 + 197 = 198 (253*200=50600, >>8=197). SPLIT = 50688.
  //   value (0) < 50688 -> 0; range = 198. No renorm (198>=128). Ret 0.
  //
  // bool(200): split = 1 + (((198-1)*200)>>8) = 1 + (197*200>>8)
  //          = 1 + 153 = 154 (39400>>8=153). SPLIT = 39424.
  //   value 0 < 39424 -> 0; range=154. Ret 0.
  //
  // Expected sequence: [1, 0, 0, 0, 0]
  const bytes = new Uint8Array([0x80, 0x00]);
  const bd = new BoolDecoder(bytes, 0, 2);
  const got = [bd.bool(128), bd.bool(128), bd.bool(128), bd.bool(200), bd.bool(200)];
  const want = [1, 0, 0, 0, 0];
  for (let i = 0; i < want.length; i++)
    assert(got[i] === want[i], "bit " + i + ": got " + got[i] + ", want " + want[i]);
});

t("bool decoder uint/int/tree", () => {
  // uint(3) on zero bytes: all bool(128) return 0 (value stays 0 < SPLIT
  // until renorm pulls real bits; with all-zero input the value remains 0,
  // and every split check 0 < SPLIT holds) -> 0.
  const bd = new BoolDecoder(new Uint8Array([0, 0, 0, 0]), 0, 4);
  assert(bd.uint(3) === 0, "uint(3) of zeros should be 0");
  assert(bd.int(2) === 0, "int(2) of zeros should be 0");
  // tree [ -7, 2, -8, -9 ] with probs [128,128]: first bool(128)
  // value=0 < SPLIT -> 0 -> i = t[0] = -7 -> returns 7.
  const bd2 = new BoolDecoder(new Uint8Array([0, 0]), 0, 2);
  assert(bd2.tree([-7, 2, -8, -9], [128, 128]) === 7, "tree should return 7");
});

// --- 3. Intra prediction -------------------------------------------------------
t("16x16 DC_PRED exact pixels", () => {
  const above = [], left = [];
  for (let i = 0; i < 16; i++) { above.push(10 + i); left.push(200 - i * 3); }
  // sum(above) = 10+11+...+25 = 280; sum(left) = 200+197+...+155 = 2840
  // dc = (280 + 2840 + 16) >> 5 = 3136 >> 5 = 98
  const out = predictDc16(above, left);
  assert(out.length === 256, "dc16 length");
  for (let i = 0; i < 256; i++)
    assert(out[i] === 98, "dc16 pixel " + i + " = " + out[i] + ", want 98");
});

t("4x4 predictors sanity", () => {
  // above[-1..7] = 100..108, left[-1..3] = 50..54
  const above9 = [100,101,102,103,104,105,106,107,108];
  const left5 = [50,51,52,53,54];
  // B_DC_PRED (0): dc = (sum(above[0..3]) + sum(left[0..3]) + 4) >> 3
  // = (101+102+103+104 + 51+52+53+54 + 4) >> 3 = (410+210+4)>>3 = 624>>3 = 78
  const dc = predict4x4(0, above9, left5);
  for (let i = 0; i < 16; i++) assert(dc[i] === 78, "b_dc " + i);
  // B_TM_PRED (1): out[y][x] = clamp(left[y] + above[x] - above[-1])
  // [0][0] = 51 + 101 - 100 = 52; [3][3] = 54 + 104 - 100 = 58
  const tm = predict4x4(1, above9, left5);
  assert(tm[0] === 52, "b_tm[0][0]");
  assert(tm[15] === 58, "b_tm[3][3]");
  // B_VE_PRED (2): row0 = [(100+2*101+102+2)>>2, ...] = [101,102,103,104],
  // all rows identical
  const ve = predict4x4(2, above9, left5);
  assert(ve[0] === 101 && ve[3] === 104, "b_ve row0");
  assert(ve[4] === 101 && ve[15] === 104, "b_ve rows copy row0");
  // B_HE_PRED (3): rows constant: row0 = (50+2*51+52+2)>>2 = 51, row3 = (53+2*54+54+2)>>2 = 54
  const he = predict4x4(3, above9, left5);
  assert(he[0] === 51 && he[3] === 51, "b_he row0");
  assert(he[12] === 54 && he[15] === 54, "b_he row3");
});

// --- 4. Container parsing ------------------------------------------------------
function riff(files /* [{id, data:Uint8Array}] */) {
  const parts = [];
  const hdr = new Uint8Array([0x52,0x49,0x46,0x46, 0,0,0,0, 0x57,0x45,0x42,0x50]);
  parts.push(hdr);
  let bodyLen = 4;
  const bodies = [];
  for (const f of files) {
    const id = new Uint8Array(4);
    for (let i = 0; i < 4; i++) id[i] = f.id.charCodeAt(i);
    const sz = new Uint8Array(4);
    new DataView(sz.buffer).setUint32(0, f.data.length, true);
    bodies.push(id, sz, f.data);
    bodyLen += 8 + f.data.length + (f.data.length & 1);
    if (f.data.length & 1) bodies.push(new Uint8Array([0]));
  }
  const total = 12 + bodies.reduce((a,b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  out.set(hdr, 0); o = 12;
  for (const b of bodies) { out.set(b, o); o += b.length; }
  new DataView(out.buffer).setUint32(4, total - 8, true);
  return out;
}

t("chunk walker finds VP8, skips unknown chunks", () => {
  const junk = new Uint8Array([1,2,3,4,5]);
  // VP8 chunk with non-keyframe tag (bit0=1) -> should throw "inter frames"
  const vp8 = new Uint8Array(12);
  vp8[0] = 0x01; // frame tag: interframe
  const file = riff([{id:"JUNK", data:junk}, {id:"VP8 ", data:vp8}]);
  let threw = null;
  try { decodeWebp(file); } catch (e) { threw = e; }
  assert(threw, "expected throw for interframe tag");
  assert(/inter frames unsupported/.test(threw.message),
         "wrong error: " + threw.message);
});

t("VP8L-only file throws unsupported", () => {
  const file = riff([{id:"VP8L", data:new Uint8Array([0x2f,0,0,0,0])}]);
  let threw = null;
  try { decodeWebp(file); } catch (e) { threw = e; }
  assert(threw && /VP8L/.test(threw.message), "expected VP8L unsupported, got: " + (threw && threw.message));
});

t("animated VP8X throws unsupported", () => {
  // VP8X: flags(0x40 = animation) + 3 reserved + 6 canvas bytes
  const vpx = new Uint8Array([0x40,0,0,0, 15,0,0, 15,0,0]);
  const file = riff([{id:"VP8X", data:vpx}, {id:"VP8 ", data:new Uint8Array(12)}]);
  let threw = null;
  try { decodeWebp(file); } catch (e) { threw = e; }
  assert(threw && /animated/.test(threw.message), "expected animated unsupported, got: " + (threw && threw.message));
});

t("missing VP8 chunk throws", () => {
  const file = riff([{id:"JUNK", data:new Uint8Array([9,9,9])}]);
  let threw = null;
  try { decodeWebp(file); } catch (e) { threw = e; }
  assert(threw && /no VP8 chunk/.test(threw.message), "expected no-VP8 error, got: " + (threw && threw.message));
});

t("truncated input never crashes", () => {
  const bad = [
    new Uint8Array(0),
    new Uint8Array([0x52, 0x49]),
    riff([{id:"VP8 ", data:new Uint8Array(5)}]),
  ];
  for (const b of bad) {
    let threw = null;
    try { decodeWebp(b); } catch (e) { threw = e; }
    assert(threw instanceof Error, "expected Error throw");
  }
});

console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
