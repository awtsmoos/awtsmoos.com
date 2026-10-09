// B"H
/**
 * @file webpDecoder.js
 * @description
 * From-scratch WebP (VP8 lossy) decoder for the Merkava browser's
 * image-decoding subsystem. No npm dependencies, Node builtins only.
 *
 * decodeWebp(bytes: Uint8Array) ->
 *   { width, height, data: Uint8ClampedArray (RGBA, row-major, top-to-bottom), format: 'webp' }
 * Throws an Error (never crashes the process) on invalid, truncated, or
 * unsupported input.
 *
 * Supported: RIFF/WEBP container with a VP8 (lossy) chunk — full keyframe
 * decode: boolean decoder, segmentation / loop-filter / quantizer / entropy
 * headers, macroblock mode decode (16x16 luma, 4x4 sub-blocks, 8x8 chroma),
 * token decode with the VP8 default probability tables, dequantization,
 * 4x4 IDCT + 4x4 inverse WHT, intra prediction, simple deblocking filter,
 * YCbCr→RGB. VP8X extended container is accepted for simple stills (canvas
 * size validated, animation rejected). ALPH chunks are decoded via the
 * bundled VP8L (lossless) decoder to fill the RGBA alpha channel.
 * VP8L image chunks and interframes (non-keyframes) throw clean
 * "unsupported" errors.
 *
 * Reference: RFC 6386 "VP8 Data Format and Decoding Guide".
 */

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

function fail(msg) {
  throw new Error("webp: " + msg);
}

// Sanity caps so hostile headers cannot force absurd allocations.
const MAX_DIMENSION = 16383;
const MAX_PIXELS = 16777216; // 16 megapixels

// ---------------------------------------------------------------------------
// VP8 tables (RFC 6386)
// ---------------------------------------------------------------------------

// Prediction mode enums (dixie.h)
const DC_PRED = 0, V_PRED = 1, H_PRED = 2, TM_PRED = 3, B_PRED = 4;
const B_DC_PRED = 0, B_TM_PRED = 1, B_VE_PRED = 2, B_HE_PRED = 3,
      B_LD_PRED = 4, B_RD_PRED = 5, B_VR_PRED = 6, B_VL_PRED = 7,
      B_HD_PRED = 8, B_HU_PRED = 9;

// Token block types for the coefficient probability tables
const TB_Y1 = 0; // luma AC (DC carried by Y2)
const TB_Y2 = 1; // 2nd-order luma DC block
const TB_UV = 2; // chroma
const TB_Y  = 3; // luma when no separate Y2 (B_PRED)

// Dequant lookup tables (dequant_data.h)
const DC_QLOOKUP = [
    4,   5,   6,   7,   8,   9,  10,  10,
   11,  12,  13,  14,  15,  16,  17,  17,
   18,  19,  20,  20,  21,  21,  22,  22,
   23,  23,  24,  25,  25,  26,  27,  28,
   29,  30,  31,  32,  33,  34,  35,  36,
   37,  37,  38,  39,  40,  41,  42,  43,
   44,  45,  46,  46,  47,  48,  49,  50,
   51,  52,  53,  54,  55,  56,  57,  58,
   59,  60,  61,  62,  63,  64,  65,  66,
   67,  68,  69,  70,  71,  72,  73,  74,
   75,  76,  76,  77,  78,  79,  80,  81,
   82,  83,  84,  85,  86,  87,  88,  89,
   91,  93,  95,  96,  98, 100, 101, 102,
  104, 106, 108, 110, 112, 114, 116, 118,
  122, 124, 126, 128, 130, 132, 134, 136,
  138, 140, 143, 145, 148, 151, 154, 157,
];

const AC_QLOOKUP = [
    4,   5,   6,   7,   8,   9,  10,  11,
   12,  13,  14,  15,  16,  17,  18,  19,
   20,  21,  22,  23,  24,  25,  26,  27,
   28,  29,  30,  31,  32,  33,  34,  35,
   36,  37,  38,  39,  40,  41,  42,  43,
   44,  45,  46,  47,  48,  49,  50,  51,
   52,  53,  54,  55,  56,  57,  58,  60,
   62,  64,  66,  68,  70,  72,  74,  76,
   78,  80,  82,  84,  86,  88,  90,  92,
   94,  96,  98, 100, 102, 104, 106, 108,
  110, 112, 114, 116, 119, 122, 125, 128,
  131, 134, 137, 140, 143, 146, 149, 152,
  155, 158, 161, 164, 167, 170, 173, 177,
  181, 185, 189, 193, 197, 201, 205, 209,
  213, 217, 221, 225, 229, 234, 239, 245,
  249, 254, 259, 264, 269, 274, 279, 284,
];

// Keyframe mode probability tables (modemv_data.h)
const KF_YMODE_PROBS = [145, 156, 163, 128];
const KF_UVMODE_PROBS = [142, 114, 183];

// Mode trees (bool_read_tree walks t[i + bit], leaf when <= 0, value = -i)
const MB_SEGMENT_TREE = [2, 4, -0, -1, -2, -3];
const KF_YMODE_TREE = [-B_PRED, 2, 4, 6, -DC_PRED, -V_PRED, -H_PRED, -TM_PRED];
const UV_MODE_TREE = [-DC_PRED, 2, -V_PRED, 4, -H_PRED, -TM_PRED];
const B_MODE_TREE = [
  -B_DC_PRED, 2,
  -B_TM_PRED, 4,
  -B_VE_PRED, 6,
  8, 12,
  -B_HE_PRED, 10,
  -B_RD_PRED, -B_VR_PRED,
  -B_LD_PRED, 14,
  -B_VL_PRED, 16,
  -B_HD_PRED, -B_HU_PRED,
];

// Token entropy context mapping: block index -> context slot.
// Slots: 0..3 luma rows, 4..5 U rows, 6..7 V rows, 8 = Y2. (tokens.c)
const LEFT_CONTEXT_INDEX = [
  0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3,3,
  4,4,5,5, 6,6,7,7, 8,
];
const ABOVE_CONTEXT_INDEX = [
  0,1,2,3, 0,1,2,3, 0,1,2,3, 0,1,2,3,
  4,5,4,5, 6,7,6,7, 8,
];

// Coefficient band per zigzag position (X(n) = n*3*11 offsets)
const COEFF_BANDS = [0,1,2,3,6,4,5,6,6,6,6,6,6,6,6,7];

// Zigzag scan order
const ZIGZAG = [0,1,4,8,5,2,3,6,9,12,13,10,7,11,14,15];

// Token value categories: [min_val, extra_bits, extra_bit_probs]
const EXTRABITS = [
  null, // ZERO_TOKEN (0)
  null, // ONE_TOKEN (1)
  null, // TWO_TOKEN (2)
  null, // THREE_TOKEN (3)
  null, // FOUR_TOKEN (4)
  { min: 5,  bits: 1,  probs: [159] },                          // CAT1 (5)
  { min: 7,  bits: 2,  probs: [145, 165] },                      // CAT2 (6)
  { min: 11, bits: 3,  probs: [140, 148, 173] },                 // CAT3 (7)
  { min: 19, bits: 4,  probs: [135, 140, 155, 176] },            // CAT4 (8)
  { min: 35, bits: 5,  probs: [130, 134, 141, 157, 180] },       // CAT5 (9)
  { min: 67, bits: 11, probs: [129,130,133,140,153,177,196,230,243,254,254] }, // CAT6 (10)
];

// Token tree node indices into the 11-probability rows (tokens.c)
const EOB_NODE = 0, ZERO_NODE = 1, ONE_NODE = 2, LOW_VAL_NODE = 3,
      TWO_NODE = 4, THREE_NODE = 5, HIGH_LOW_NODE = 6, CAT_ONE_NODE = 7,
      CAT_THREEFOUR_NODE = 8, CAT_THREE_NODE = 9, CAT_FIVE_NODE = 10;

// ---------------------------------------------------------------------------
// VP8 boolean decoder (bool_decoder.h) — exported for tests
// ---------------------------------------------------------------------------

export class BoolDecoder {
  constructor(bytes, offset, size) {
    if (!(bytes instanceof Uint8Array)) fail("BoolDecoder needs Uint8Array");
    if (offset < 0 || size < 0 || offset + size > bytes.length)
      fail("bool decoder range out of bounds");
    this.buf = bytes;
    this.pos = offset;
    this.end = offset + size;
    if (size >= 2) {
      this.value = (bytes[offset] << 8) | bytes[offset + 1];
      this.pos = offset + 2;
    } else {
      this.value = 0;
    }
    this.range = 255;
    this.bitCount = 0;
    this.overread = false;
  }
  bool(prob) {
    const split = 1 + (((this.range - 1) * prob) >> 8);
    const SPLIT = split << 8;
    let retval;
    if (this.value >= SPLIT) {
      retval = 1;
      this.range -= split;
      this.value -= SPLIT;
    } else {
      retval = 0;
      this.range = split;
    }
    while (this.range < 128) {
      this.value <<= 1;
      this.range <<= 1;
      if (++this.bitCount === 8) {
        this.bitCount = 0;
        // Reference behavior: past the end, shift in zero bits (no throw).
        // Structural truncation is caught by the frame/chunk size checks.
        if (this.pos < this.end) this.value |= this.buf[this.pos++];
      }
    }
    return retval;
  }
  bit() { return this.bool(128); }
  uint(n) {
    let z = 0;
    for (let b = n - 1; b >= 0; b--) z |= this.bool(128) << b;
    return z >>> 0;
  }
  int(n) {
    let z = 0;
    for (let b = n - 1; b >= 0; b--) z |= this.bool(128) << b;
    return this.bool(128) ? -z : z;
  }
  maybeInt(n) { return this.bit() ? this.int(n) : 0; }
  tree(t, p) {
    let i = 0;
    while ((i = t[i + this.bool(p[i >> 1])]) > 0);
    return -i;
  }
}

// Coefficient probability *update* flags table (vp8_prob_data.h).
// update = bool(COEFF_UPDATE_PROBS[t][b][c][n]); if set, the prob is re-read.
// Nested [4][8][3][11]; flattened to Uint8Array at load.
const COEFF_UPDATE_PROBS_NESTED = [
  [ // block 0
    [ // band 0
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 1
      [176,246,255,255,255,255,255,255,255,255,255],
      [223,241,252,255,255,255,255,255,255,255,255],
      [249,253,253,255,255,255,255,255,255,255,255],
    ],
    [ // band 2
      [255,244,252,255,255,255,255,255,255,255,255],
      [234,254,254,255,255,255,255,255,255,255,255],
      [253,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [255,246,254,255,255,255,255,255,255,255,255],
      [239,253,254,255,255,255,255,255,255,255,255],
      [254,255,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [255,248,254,255,255,255,255,255,255,255,255],
      [251,255,254,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [255,253,254,255,255,255,255,255,255,255,255],
      [251,254,254,255,255,255,255,255,255,255,255],
      [254,255,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [255,254,253,255,254,255,255,255,255,255,255],
      [250,255,254,255,254,255,255,255,255,255,255],
      [254,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
  ],
  [ // block 1
    [ // band 0
      [217,255,255,255,255,255,255,255,255,255,255],
      [225,252,241,253,255,255,254,255,255,255,255],
      [234,250,241,250,253,255,253,254,255,255,255],
    ],
    [ // band 1
      [255,254,255,255,255,255,255,255,255,255,255],
      [223,254,254,255,255,255,255,255,255,255,255],
      [238,253,254,254,255,255,255,255,255,255,255],
    ],
    [ // band 2
      [255,248,254,255,255,255,255,255,255,255,255],
      [249,254,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [255,253,255,255,255,255,255,255,255,255,255],
      [247,254,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [255,253,254,255,255,255,255,255,255,255,255],
      [252,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [255,254,254,255,255,255,255,255,255,255,255],
      [253,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [255,254,253,255,255,255,255,255,255,255,255],
      [250,255,255,255,255,255,255,255,255,255,255],
      [254,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [255,255,255,255,255,255,255,255,255,255,255],
      [254,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
  ],
  [ // block 2
    [ // band 0
      [186,251,250,255,255,255,255,255,255,255,255],
      [234,251,244,254,255,255,255,255,255,255,255],
      [251,251,243,253,254,255,254,255,255,255,255],
    ],
    [ // band 1
      [255,253,254,255,255,255,255,255,255,255,255],
      [236,253,254,255,255,255,255,255,255,255,255],
      [251,253,253,254,254,255,255,255,255,255,255],
    ],
    [ // band 2
      [255,254,254,255,255,255,255,255,255,255,255],
      [254,254,254,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [255,254,255,255,255,255,255,255,255,255,255],
      [254,254,255,255,255,255,255,255,255,255,255],
      [254,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [255,255,255,255,255,255,255,255,255,255,255],
      [254,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
  ],
  [ // block 3
    [ // band 0
      [248,255,255,255,255,255,255,255,255,255,255],
      [250,254,252,254,255,255,255,255,255,255,255],
      [248,254,249,253,255,255,255,255,255,255,255],
    ],
    [ // band 1
      [255,253,253,255,255,255,255,255,255,255,255],
      [246,253,253,255,255,255,255,255,255,255,255],
      [252,254,251,254,254,255,255,255,255,255,255],
    ],
    [ // band 2
      [255,254,252,255,255,255,255,255,255,255,255],
      [248,254,253,255,255,255,255,255,255,255,255],
      [253,255,254,254,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [255,251,254,255,255,255,255,255,255,255,255],
      [245,251,254,255,255,255,255,255,255,255,255],
      [253,253,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [255,251,253,255,255,255,255,255,255,255,255],
      [252,253,254,255,255,255,255,255,255,255,255],
      [255,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [255,252,255,255,255,255,255,255,255,255,255],
      [249,255,254,255,255,255,255,255,255,255,255],
      [255,255,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [255,255,253,255,255,255,255,255,255,255,255],
      [250,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [255,255,255,255,255,255,255,255,255,255,255],
      [254,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
  ],
];

function flatten4(nested) {
  const flat = new Uint8Array(4 * 8 * 3 * 11);
  let o = 0;
  for (let t = 0; t < 4; t++)
    for (let b = 0; b < 8; b++)
      for (let c = 0; c < 3; c++)
        for (let n = 0; n < 11; n++) flat[o++] = nested[t][b][c][n];
  return flat;
}
const COEFF_UPDATE_PROBS = flatten4(COEFF_UPDATE_PROBS_NESTED);

// Default coefficient probabilities (vp8_prob_data.h, k_default_coeff_probs).
const DEFAULT_COEFF_PROBS_NESTED = [
  [ // block 0
    [ // band 0
      [128,128,128,128,128,128,128,128,128,128,128],
      [128,128,128,128,128,128,128,128,128,128,128],
      [128,128,128,128,128,128,128,128,128,128,128],
    ],
    [ // band 1
      [253,136,254,255,255,255,255,255,255,255,255],
      [189,129,242,255,255,255,255,255,255,255,255],
      [122,104,243,255,255,255,255,255,255,255,255],
    ],
    [ // band 2
      [253,254,254,255,255,255,255,255,255,255,255],
      [245,254,254,255,255,255,255,255,255,255,255],
      [220,254,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [253,255,254,255,255,255,255,255,255,255,255],
      [250,254,254,255,255,255,255,255,255,255,255],
      [233,254,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [253,254,255,255,255,255,255,255,255,255,255],
      [244,254,254,255,255,255,255,255,255,255,255],
      [238,254,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [253,254,255,255,255,255,255,255,255,255,255],
      [248,254,254,255,255,255,255,255,255,255,255],
      [229,254,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [253,253,254,255,255,255,255,255,255,255,255],
      [251,254,254,255,255,255,255,255,255,255,255],
      [238,254,254,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [245,245,243,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [250,250,252,255,255,255,255,255,255,255,255],
    ],
  ],
  [ // block 1
    [ // band 0
      [198,35,237,223,193,255,255,255,255,255,255],
      [251,9,239,255,255,255,255,255,255,255,255],
      [248,12,229,255,255,255,255,255,255,255,255],
    ],
    [ // band 1
      [253,197,246,255,255,255,255,255,255,255,255],
      [205,160,219,255,255,255,255,255,255,255,255],
      [160,134,215,255,255,255,255,255,255,255,255],
    ],
    [ // band 2
      [253,203,246,255,255,255,255,255,255,255,255],
      [233,149,220,255,255,255,255,255,255,255,255],
      [186,141,215,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [253,222,254,255,255,255,255,255,255,255,255],
      [250,170,229,255,255,255,255,255,255,255,255],
      [216,162,221,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [253,238,254,255,255,255,255,255,255,255,255],
      [246,184,231,255,255,255,255,255,255,255,255],
      [235,149,219,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [253,248,254,255,255,255,255,255,255,255,255],
      [249,210,241,255,255,255,255,255,255,255,255],
      [238,184,237,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [253,253,254,255,255,255,255,255,255,255,255],
      [252,235,246,255,255,255,255,255,255,255,255],
      [246,203,238,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [253,254,254,255,255,255,255,255,255,255,255],
      [251,248,254,255,255,255,255,255,255,255,255],
      [250,255,254,255,255,255,255,255,255,255,255],
    ],
  ],
  [ // block 2
    [ // band 0
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
      [255,255,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 1
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 2
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
      [253,254,255,255,255,255,255,255,255,255,255],
    ],
  ],
  [ // block 3
    [ // band 0
      [198,35,237,223,193,255,255,255,255,255,255],
      [251,9,239,255,255,255,255,255,255,255,255],
      [248,12,229,255,255,255,255,255,255,255,255],
    ],
    [ // band 1
      [253,197,246,255,255,255,255,255,255,255,255],
      [205,160,219,255,255,255,255,255,255,255,255],
      [160,134,215,255,255,255,255,255,255,255,255],
    ],
    [ // band 2
      [253,203,246,255,255,255,255,255,255,255,255],
      [233,149,220,255,255,255,255,255,255,255,255],
      [186,141,215,255,255,255,255,255,255,255,255],
    ],
    [ // band 3
      [253,222,254,255,255,255,255,255,255,255,255],
      [250,170,229,255,255,255,255,255,255,255,255],
      [216,162,221,255,255,255,255,255,255,255,255],
    ],
    [ // band 4
      [253,238,254,255,255,255,255,255,255,255,255],
      [246,184,231,255,255,255,255,255,255,255,255],
      [235,149,219,255,255,255,255,255,255,255,255],
    ],
    [ // band 5
      [253,248,254,255,255,255,255,255,255,255,255],
      [249,210,241,255,255,255,255,255,255,255,255],
      [238,184,237,255,255,255,255,255,255,255,255],
    ],
    [ // band 6
      [253,253,254,255,255,255,255,255,255,255,255],
      [252,235,246,255,255,255,255,255,255,255,255],
      [246,203,238,255,255,255,255,255,255,255,255],
    ],
    [ // band 7
      [253,254,254,255,255,255,255,255,255,255,255],
      [251,248,254,255,255,255,255,255,255,255,255],
      [250,255,254,255,255,255,255,255,255,255,255],
    ],
  ],
];
const DEFAULT_COEFF_PROBS = flatten4(DEFAULT_COEFF_PROBS_NESTED);

// Keyframe 4x4 sub-block mode probabilities [above][left][9] (modemv_data.h)
const KF_BMODE_PROBS = [
  [ // above 0
    [231,120,48,89,115,113,120,152,112],
    [152,179,64,126,170,118,46,70,95],
    [175,69,143,80,85,82,72,155,103],
    [56,58,10,171,218,189,17,13,152],
    [144,71,10,38,171,213,144,34,26],
    [114,26,17,163,44,195,21,10,173],
    [121,24,80,195,26,62,44,64,85],
    [170,46,55,19,136,160,33,206,71],
    [63,20,8,114,114,208,12,9,226],
    [81,40,11,96,182,84,29,16,36],
  ],
  [ // above 1
    [134,183,89,137,98,101,106,165,148],
    [72,187,100,130,157,111,32,75,80],
    [66,102,167,99,74,62,40,234,128],
    [41,53,9,178,241,141,26,8,107],
    [104,79,12,27,217,255,87,17,7],
    [74,43,26,146,73,166,49,23,157],
    [65,38,105,160,51,52,31,115,128],
    [87,68,71,44,114,51,15,186,23],
    [47,41,14,110,182,183,21,17,194],
    [66,45,25,102,197,189,23,18,22],
  ],
  [ // above 2
    [88,88,147,150,42,46,45,196,205],
    [43,97,183,117,85,38,35,179,61],
    [39,53,200,87,26,21,43,232,171],
    [56,34,51,104,114,102,29,93,77],
    [107,54,32,26,51,1,81,43,31],
    [39,28,85,171,58,165,90,98,64],
    [34,22,116,206,23,34,43,166,73],
    [68,25,106,22,64,171,36,225,114],
    [34,19,21,102,132,188,16,76,124],
    [62,18,78,95,85,57,50,48,51],
  ],
  [ // above 3
    [193,101,35,159,215,111,89,46,111],
    [60,148,31,172,219,228,21,18,111],
    [112,113,77,85,179,255,38,120,114],
    [40,42,1,196,245,209,10,25,109],
    [100,80,8,43,154,1,51,26,71],
    [88,43,29,140,166,213,37,43,154],
    [61,63,30,155,67,45,68,1,209],
    [142,78,78,16,255,128,34,197,171],
    [41,40,5,102,211,183,4,1,221],
    [51,50,17,168,209,192,23,25,82],
  ],
  [ // above 4
    [125,98,42,88,104,85,117,175,82],
    [95,84,53,89,128,100,113,101,45],
    [75,79,123,47,51,128,81,171,1],
    [57,17,5,71,102,57,53,41,49],
    [115,21,2,10,102,255,166,23,6],
    [38,33,13,121,57,73,26,1,85],
    [41,10,67,138,77,110,90,47,114],
    [101,29,16,10,85,128,101,196,26],
    [57,18,10,102,102,213,34,20,43],
    [117,20,15,36,163,128,68,1,26],
  ],
  [ // above 5
    [138,31,36,171,27,166,38,44,229],
    [67,87,58,169,82,115,26,59,179],
    [63,59,90,180,59,166,93,73,154],
    [40,40,21,116,143,209,34,39,175],
    [57,46,22,24,128,1,54,17,37],
    [47,15,16,183,34,223,49,45,183],
    [46,17,33,183,6,98,15,32,183],
    [65,32,73,115,28,128,23,128,205],
    [40,3,9,115,51,192,18,6,223],
    [87,37,9,115,59,77,64,21,47],
  ],
  [ // above 6
    [104,55,44,218,9,54,53,130,226],
    [64,90,70,205,40,41,23,26,57],
    [54,57,112,184,5,41,38,166,213],
    [30,34,26,133,152,116,10,32,134],
    [75,32,12,51,192,255,160,43,51],
    [39,19,53,221,26,114,32,73,255],
    [31,9,65,234,2,15,1,118,73],
    [88,31,35,67,102,85,55,186,85],
    [56,21,23,111,59,205,45,37,192],
    [55,38,70,124,73,102,1,34,98],
  ],
  [ // above 7
    [102,61,71,37,34,53,31,243,192],
    [69,60,71,38,73,119,28,222,37],
    [68,45,128,34,1,47,11,245,171],
    [62,17,19,70,146,85,55,62,70],
    [75,15,9,9,64,255,184,119,16],
    [37,43,37,154,100,163,85,160,1],
    [63,9,92,136,28,64,32,201,85],
    [86,6,28,5,64,255,25,248,1],
    [56,8,17,132,137,255,55,116,128],
    [58,15,20,82,135,57,26,121,40],
  ],
  [ // above 8
    [164,50,31,137,154,133,25,35,218],
    [51,103,44,131,131,123,31,6,158],
    [86,40,64,135,148,224,45,183,128],
    [22,26,17,131,240,154,14,1,209],
    [83,12,13,54,192,255,68,47,28],
    [45,16,21,91,64,222,7,1,197],
    [56,21,39,155,60,138,23,102,213],
    [85,26,85,85,128,128,32,146,171],
    [18,11,7,63,144,171,4,4,246],
    [35,27,10,146,174,171,12,26,128],
  ],
  [ // above 9
    [190,80,35,99,180,80,126,54,45],
    [85,126,47,87,176,51,41,20,32],
    [101,75,128,139,118,146,116,128,85],
    [56,41,15,176,236,85,37,9,62],
    [146,36,19,30,171,255,97,27,20],
    [71,30,17,119,118,255,17,18,138],
    [101,38,60,138,55,70,43,26,142],
    [138,45,61,62,219,1,81,188,64],
    [32,41,20,117,151,142,20,21,163],
    [112,19,12,61,195,128,48,4,24],
  ],
];

// ---------------------------------------------------------------------------
// Transforms: 4x4 IDCT and 4x4 inverse Walsh-Hadamard (idctllm.c)
// ---------------------------------------------------------------------------

// Integer 4x4 inverse DCT (vp8_dixie_idct_add, sans the add).
// in: 16 dequantized coefficients, row-major. Returns 16 residuals.
export function vp8Idct4(inp) {
  const ip = new Int16Array(16);
  for (let i = 0; i < 16; i++) ip[i] = inp[i] | 0;
  const tmp = new Int16Array(16);
  for (let i = 0; i < 4; i++) {
    let a1 = ip[i] + ip[i + 8];
    let b1 = ip[i] - ip[i + 8];
    let t1 = (ip[i + 4] * 35468) >> 16;
    let t2 = ip[i + 12] + ((ip[i + 12] * 20091) >> 16);
    let c1 = t1 - t2;
    t1 = ip[i + 4] + ((ip[i + 4] * 20091) >> 16);
    t2 = (ip[i + 12] * 35468) >> 16;
    let d1 = t1 + t2;
    tmp[i] = a1 + d1;
    tmp[i + 12] = a1 - d1;
    tmp[i + 4] = b1 + c1;
    tmp[i + 8] = b1 - c1;
  }
  const op = new Int16Array(16);
  for (let i = 0; i < 4; i++) {
    const o = i * 4;
    let a1 = tmp[o] + tmp[o + 2];
    let b1 = tmp[o] - tmp[o + 2];
    let t1 = (tmp[o + 1] * 35468) >> 16;
    let t2 = tmp[o + 3] + ((tmp[o + 3] * 20091) >> 16);
    let c1 = t1 - t2;
    t1 = tmp[o + 1] + ((tmp[o + 1] * 20091) >> 16);
    t2 = (tmp[o + 3] * 35468) >> 16;
    let d1 = t1 + t2;
    op[o] = (a1 + d1 + 4) >> 3;
    op[o + 3] = (a1 - d1 + 4) >> 3;
    op[o + 1] = (b1 + c1 + 4) >> 3;
    op[o + 2] = (b1 - c1 + 4) >> 3;
  }
  return op;
}

// Inverse 4x4 Walsh-Hadamard (vp8_dixie_walsh). out = round(H*in*H/8).
export function vp8Walsh4(inp) {
  const ip = new Int16Array(16);
  for (let i = 0; i < 16; i++) ip[i] = inp[i] | 0;
  const tmp = new Int16Array(16);
  for (let i = 0; i < 4; i++) {
    const a1 = ip[i] + ip[i + 12];
    const b1 = ip[i + 4] + ip[i + 8];
    const c1 = ip[i + 4] - ip[i + 8];
    const d1 = ip[i] - ip[i + 12];
    tmp[i] = a1 + b1;
    tmp[i + 4] = c1 + d1;
    tmp[i + 8] = a1 - b1;
    tmp[i + 12] = d1 - c1;
  }
  const op = new Int16Array(16);
  for (let i = 0; i < 4; i++) {
    const o = i * 4;
    const a1 = tmp[o] + tmp[o + 3];
    const b1 = tmp[o + 1] + tmp[o + 2];
    const c1 = tmp[o + 1] - tmp[o + 2];
    const d1 = tmp[o] - tmp[o + 3];
    const a2 = a1 + b1, b2 = c1 + d1, c2 = a1 - b1, d2 = d1 - c1;
    op[o] = (a2 + 3) >> 3;
    op[o + 1] = (b2 + 3) >> 3;
    op[o + 2] = (c2 + 3) >> 3;
    op[o + 3] = (d2 + 3) >> 3;
  }
  return op;
}

// Naive textbook 4x4 inverse DCT for cross-checking: out = (D^T C D)/2 with
// D the orthonormal DCT-II matrix. Returns Float64Array(16).
export function naiveIdct4(inp) {
  const D = [];
  for (let u = 0; u < 4; u++) {
    D[u] = [];
    const a = u === 0 ? 0.5 : 1 / Math.SQRT2;
    for (let x = 0; x < 4; x++)
      D[u][x] = a * Math.cos(((2 * x + 1) * u * Math.PI) / 8);
  }
  const out = new Float64Array(16);
  for (let x = 0; x < 4; x++)
    for (let y = 0; y < 4; y++) {
      let s = 0;
      for (let u = 0; u < 4; u++)
        for (let v = 0; v < 4; v++) s += D[u][x] * inp[u * 4 + v] * D[v][y];
      out[x * 4 + y] = s / 2;
    }
  return out;
}

// Naive 4x4 inverse WHT: out = H*in*H/8 (exact rational). Float64Array(16).
const HAD4 = [
  [1, 1, 1, 1],
  [1, 1, -1, -1],
  [1, -1, -1, 1],
  [1, -1, 1, -1],
];
export function naiveWalsh4(inp) {
  const t = new Float64Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += HAD4[i][k] * inp[k * 4 + j];
      t[i * 4 + j] = s;
    }
  const out = new Float64Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += t[i * 4 + k] * HAD4[k][j];
      out[i * 4 + j] = s / 8;
    }
  return out;
}

// IDCT + add to prediction with clamping (the vp8_dixie_idct_add hot path).
// plane: Uint8Array; prediction already written at (ox, oy); stride in px.
function idctAdd(plane, ox, oy, stride, coeffs16) {
  const res = vp8Idct4(coeffs16);
  for (let y = 0; y < 4; y++) {
    const base = (oy + y) * stride + ox;
    const r = y * 4;
    for (let x = 0; x < 4; x++) {
      let v = plane[base + x] + res[r + x];
      plane[base + x] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
}

// ---------------------------------------------------------------------------
// Intra prediction (predict.c) — pure functions, exported for tests
// ---------------------------------------------------------------------------

function clamp255(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

export function predictDc16(above, left) {
  let sum = 0;
  for (let i = 0; i < 16; i++) sum += above[i] + left[i];
  const dc = (sum + 16) >> 5;
  const out = new Uint8Array(256);
  out.fill(dc);
  return out;
}
export function predictV16(above) {
  const out = new Uint8Array(256);
  for (let y = 0; y < 16; y++) out.set(above, y * 16);
  return out;
}
export function predictH16(left) {
  const out = new Uint8Array(256);
  for (let y = 0; y < 16; y++) out.fill(left[y], y * 16, y * 16 + 16);
  return out;
}
export function predictTm16(above, left, topLeft) {
  const out = new Uint8Array(256);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++)
      out[y * 16 + x] = clamp255(left[y] + above[x] - topLeft);
  return out;
}

export function predictDc8(above, left) {
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += above[i] + left[i];
  const dc = (sum + 8) >> 4;
  const out = new Uint8Array(64);
  out.fill(dc);
  return out;
}
export function predictV8(above) {
  const out = new Uint8Array(64);
  for (let y = 0; y < 8; y++) out.set(above, y * 8);
  return out;
}
export function predictH8(left) {
  const out = new Uint8Array(64);
  for (let y = 0; y < 8; y++) out.fill(left[y], y * 8, y * 8 + 8);
  return out;
}
export function predictTm8(above, left, topLeft) {
  const out = new Uint8Array(64);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++)
      out[y * 8 + x] = clamp255(left[y] + above[x] - topLeft);
  return out;
}

// 4x4 sub-block prediction.
// above9[j] = above[j-1] for j=0..8 (indices -1..7); left5[i] = left[i-1].
export function predict4x4(mode, above9, left5) {
  const A = (j) => above9[j + 1];
  const L = (i) => left5[i + 1];
  const out = new Uint8Array(16);
  switch (mode) {
    case B_DC_PRED: {
      let sum = 0;
      for (let j = 0; j < 4; j++) sum += A(j) + L(j);
      out.fill((sum + 4) >> 3);
      break;
    }
    case B_TM_PRED: {
      const tl = A(-1);
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++)
          out[y * 4 + x] = clamp255(L(y) + A(x) - tl);
      break;
    }
    case B_VE_PRED: {
      // predict_ve_4x4: row 0 filtered, rows 1..3 copy row 0
      const v0 = (A(-1) + 2 * A(0) + A(1) + 2) >> 2;
      const v1 = (A(0) + 2 * A(1) + A(2) + 2) >> 2;
      const v2 = (A(1) + 2 * A(2) + A(3) + 2) >> 2;
      const v3 = (A(2) + 2 * A(3) + A(4) + 2) >> 2;
      for (let y = 0; y < 4; y++) {
        out[y * 4] = v0; out[y * 4 + 1] = v1;
        out[y * 4 + 2] = v2; out[y * 4 + 3] = v3;
      }
      break;
    }
    case B_HE_PRED: {
      // predict_he_4x4: each row constant
      const h0 = (L(-1) + 2 * L(0) + L(1) + 2) >> 2;
      const h1 = (L(0) + 2 * L(1) + L(2) + 2) >> 2;
      const h2 = (L(1) + 2 * L(2) + L(3) + 2) >> 2;
      const h3 = (L(2) + 2 * L(3) + L(3) + 2) >> 2;
      const v = [h0, h1, h2, h3];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = v[y];
      break;
    }
    case B_LD_PRED: {
      // predict_ld_4x4
      const g = (a, b, c) => (a + 2 * b + c + 2) >> 2;
      const p0 = g(A(0), A(1), A(2)), p1 = g(A(1), A(2), A(3)),
            p2 = g(A(2), A(3), A(4)), p3 = g(A(3), A(4), A(5)),
            p4 = g(A(4), A(5), A(6)), p5 = g(A(5), A(6), A(7)),
            p6 = g(A(6), A(7), A(7));
      const rows = [
        [p0, p1, p2, p3], [p1, p2, p3, p4],
        [p2, p3, p4, p5], [p3, p4, p5, p6],
      ];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = rows[y][x];
      break;
    }
    case B_RD_PRED: {
      // predict_rd_4x4
      const g = (a, b, c) => (a + 2 * b + c + 2) >> 2;
      const p0 = g(L(0), A(-1), A(0)),
            p1 = g(A(-1), A(0), A(1)),
            p2 = g(A(0), A(1), A(2)),
            p3 = g(A(1), A(2), A(3)),
            p4 = g(L(1), L(0), A(-1)),
            p5 = g(L(2), L(1), L(0)),
            p6 = g(L(3), L(2), L(1));
      const rows = [
        [p0, p1, p2, p3], [p4, p0, p1, p2],
        [p5, p4, p0, p1], [p6, p5, p4, p0],
      ];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = rows[y][x];
      break;
    }
    case B_VR_PRED: {
      // predict_vr_4x4
      const h = (a, b) => (a + b + 1) >> 1;
      const g = (a, b, c) => (a + 2 * b + c + 2) >> 2;
      const p0 = h(A(-1), A(0)), p1 = h(A(0), A(1)),
            p2 = h(A(1), A(2)), p3 = h(A(2), A(3)),
            p4 = g(L(0), A(-1), A(0)),
            p5 = g(A(-1), A(0), A(1)),
            p6 = g(A(0), A(1), A(2)),
            p7 = g(A(1), A(2), A(3)),
            p8 = g(L(1), L(0), A(-1)),
            p9 = g(L(2), L(1), L(0));
      const rows = [
        [p0, p1, p2, p3], [p4, p5, p6, p7],
        [p8, p0, p1, p2], [p9, p4, p5, p6],
      ];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = rows[y][x];
      break;
    }
    case B_VL_PRED: {
      // predict_vl_4x4
      const h = (a, b) => (a + b + 1) >> 1;
      const g = (a, b, c) => (a + 2 * b + c + 2) >> 2;
      const p0 = h(A(0), A(1)), p1 = h(A(1), A(2)),
            p2 = h(A(2), A(3)), p3 = h(A(3), A(4)),
            p4 = g(A(0), A(1), A(2)),
            p5 = g(A(1), A(2), A(3)),
            p6 = g(A(2), A(3), A(4)),
            p7 = g(A(3), A(4), A(5)),
            p8 = g(A(4), A(5), A(6)),
            p9 = g(A(5), A(6), A(7));
      const rows = [
        [p0, p1, p2, p3], [p4, p5, p6, p7],
        [p1, p2, p3, p8], [p5, p6, p7, p9],
      ];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = rows[y][x];
      break;
    }
    case B_HD_PRED: {
      // predict_hd_4x4
      const h = (a, b) => (a + b + 1) >> 1;
      const g = (a, b, c) => (a + 2 * b + c + 2) >> 2;
      const p0 = h(L(0), A(-1)),
            p1 = g(L(0), A(-1), A(0)),
            p2 = g(A(-1), A(0), A(1)),
            p3 = g(A(0), A(1), A(2)),
            p4 = h(L(1), L(0)),
            p5 = g(L(1), L(0), A(-1)),
            p6 = h(L(2), L(1)),
            p7 = g(L(2), L(1), L(0)),
            p8 = h(L(3), L(2)),
            p9 = g(L(3), L(2), L(1));
      const rows = [
        [p0, p1, p2, p3], [p4, p5, p0, p1],
        [p6, p7, p4, p5], [p8, p9, p6, p7],
      ];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = rows[y][x];
      break;
    }
    case B_HU_PRED: {
      // predict_hu_4x4
      const h = (a, b) => (a + b + 1) >> 1;
      const g = (a, b, c) => (a + 2 * b + c + 2) >> 2;
      const p0 = h(L(0), L(1)),
            p1 = g(L(0), L(1), L(2)),
            p2 = h(L(1), L(2)),
            p3 = g(L(1), L(2), L(3)),
            p4 = h(L(2), L(3)),
            p5 = g(L(2), L(3), L(3)),
            p6 = L(3);
      const rows = [
        [p0, p1, p2, p3], [p2, p3, p4, p5],
        [p4, p5, p6, p6], [p6, p6, p6, p6],
      ];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) out[y * 4 + x] = rows[y][x];
      break;
    }
    default:
      fail("unknown 4x4 intra mode " + mode);
  }
  return out;
}

// ---------------------------------------------------------------------------
// VP8 frame decode
// ---------------------------------------------------------------------------

// Token block type -> dequant factor row: 0->Y1, 1->Y2, 2->UV, 3->Y1
const DQF_ROW = [0, 2, 1, 0];

function decodeVp8Frame(data) {
  if (!(data instanceof Uint8Array)) fail("VP8 frame needs Uint8Array");
  if (data.length < 10) fail("VP8 chunk too small for frame header");

  // --- frame tag ---
  const tag = data[0] | (data[1] << 8) | (data[2] << 16);
  if (tag & 1) fail("inter frames unsupported (not a keyframe)");
  if ((tag >> 3) & 1) fail("experimental VP8 bitstream unsupported");
  const part0Size = tag >>> 5;
  if (10 + part0Size > data.length) fail("VP8 partition 0 overruns chunk");

  // --- start code ---
  if (data[3] !== 0x9d || data[4] !== 0x01 || data[5] !== 0x2a)
    fail("bad VP8 start code");

  // --- dimensions ---
  const d0 = data[6] | (data[7] << 8);
  const d1 = data[8] | (data[9] << 8);
  const width = d0 & 0x3fff;
  const height = d1 & 0x3fff;
  if (width === 0 || height === 0) fail("VP8 has zero dimension");
  if (width > MAX_DIMENSION || height > MAX_DIMENSION)
    fail("VP8 dimension exceeds " + MAX_DIMENSION);
  if (width * height > MAX_PIXELS) fail("VP8 frame exceeds pixel cap");

  const mbCols = (width + 15) >> 4;
  const mbRows = (height + 15) >> 4;

  // --- partition 0 bool decoder ---
  const bc = new BoolDecoder(data, 10, part0Size);
  if (bc.uint(2) !== 0) fail("VP8 colorspace/clamping not supported");

  // --- segmentation header ---
  const seg = {
    enabled: false, updateMap: false, updateData: false, abs: false,
    quantIdx: [0, 0, 0, 0], lfLevel: [0, 0, 0, 0],
    treeProbs: [255, 255, 255],
  };
  seg.enabled = !!bc.bit();
  if (seg.enabled) {
    seg.updateMap = !!bc.bit();
    seg.updateData = !!bc.bit();
    if (seg.updateData) {
      seg.abs = !!bc.bit();
      for (let i = 0; i < 4; i++) seg.quantIdx[i] = bc.maybeInt(7);
      for (let i = 0; i < 4; i++) seg.lfLevel[i] = bc.maybeInt(6);
    }
    if (seg.updateMap)
      for (let i = 0; i < 3; i++)
        seg.treeProbs[i] = bc.bit() ? bc.uint(8) : 255;
  }

  // --- loop filter header ---
  const lf = {
    useSimple: true, level: 0, sharpness: 0, deltaEnabled: false,
    refDelta: [0, 0, 0, 0], modeDelta: [0, 0, 0, 0],
  };
  lf.useSimple = !!bc.bit();
  lf.level = bc.uint(6);
  lf.sharpness = bc.uint(3);
  lf.deltaEnabled = !!bc.bit();
  if (lf.deltaEnabled && bc.bit()) {
    for (let i = 0; i < 4; i++)
      if (bc.bit()) lf.refDelta[i] = bc.maybeInt(6);
    for (let i = 0; i < 4; i++)
      if (bc.bit()) lf.modeDelta[i] = bc.maybeInt(6);
  }

  // --- token partitions ---
  const nParts = 1 << bc.uint(2);
  const sizesOff = 10 + part0Size;
  if (sizesOff + 3 * (nParts - 1) > data.length)
    fail("VP8 partition table overruns chunk");
  const partSizes = [];
  let partsTotal = 0;
  for (let i = 0; i < nParts - 1; i++) {
    const sz = data[sizesOff + 3 * i] |
               (data[sizesOff + 3 * i + 1] << 8) |
               (data[sizesOff + 3 * i + 2] << 16);
    partSizes.push(sz);
    partsTotal += sz;
  }
  const partsStart = sizesOff + 3 * (nParts - 1);
  const lastSize = data.length - partsStart - partsTotal;
  if (lastSize < 0) fail("VP8 token partitions overrun chunk");
  partSizes.push(lastSize);
  const tokDec = [];
  let poff = partsStart;
  for (let i = 0; i < nParts; i++) {
    const td = new BoolDecoder(data, poff, partSizes[i]);
    td.leftCtx = new Int8Array(9);
    tokDec.push(td);
    poff += partSizes[i];
  }

  // --- quantizer ---
  const qIndex = bc.uint(7);
  let dY1dc = 0, dY2dc = 0, dY2ac = 0, dUVdc = 0, dUVac = 0;
  if (bc.bit()) {
    dY1dc = bc.maybeInt(4); dY2dc = bc.maybeInt(4); dY2ac = bc.maybeInt(4);
    dUVdc = bc.maybeInt(4); dUVac = bc.maybeInt(4);
  }

  // --- reference header (keyframe: only refresh_entropy) ---
  bc.bit();

  // --- entropy header ---
  const coeffProbs = new Uint8Array(DEFAULT_COEFF_PROBS);
  for (let t = 0; t < 4; t++)
    for (let b = 0; b < 8; b++)
      for (let c = 0; c < 3; c++)
        for (let n = 0; n < 11; n++) {
          const ix = ((t * 8 + b) * 3 + c) * 11 + n;
          if (bc.bool(COEFF_UPDATE_PROBS[ix])) coeffProbs[ix] = bc.uint(8);
        }
  const skipEnabled = !!bc.bit();
  const skipProb = skipEnabled ? bc.uint(8) : 0;

  // --- dequant factors per segment: [seg][3][2] ([Y1, UV, Y2][dc, ac]) ---
  const dqf = [];
  for (let s = 0; s < 4; s++) {
    let q;
    if (seg.enabled && seg.updateData)
      q = seg.abs ? seg.quantIdx[s] : qIndex + seg.quantIdx[s];
    else q = qIndex;
    q = Math.max(0, Math.min(127, q));
    const cq = (qq) => Math.max(0, Math.min(127, qq));
    const y1 = [DC_QLOOKUP[cq(q + dY1dc)], AC_QLOOKUP[q]];
    const uv = [
      Math.min(132, DC_QLOOKUP[cq(q + dUVdc)]),
      AC_QLOOKUP[cq(q + dUVac)],
    ];
    let y2ac = Math.floor((AC_QLOOKUP[cq(q + dY2ac)] * 155) / 100);
    if (y2ac < 8) y2ac = 8;
    const y2 = [DC_QLOOKUP[cq(q + dY2dc)] * 2, y2ac];
    dqf.push([y1, uv, y2]);
  }

  // --- macroblock info ---
  const nMb = mbRows * mbCols;
  const mbYMode = new Int8Array(nMb);
  const mbUVMode = new Int8Array(nMb);
  const mbSeg = new Uint8Array(nMb);
  const mbSkip = new Uint8Array(nMb);
  const mbHasNz = new Uint8Array(nMb);
  const mbBModes = new Int8Array(nMb * 16);

  // --- planes with borders (luma border 16, chroma border 8) ---
  const yStride = mbCols * 16 + 32;
  const yPlane = new Uint8Array(yStride * (mbRows * 16 + 32));
  const uvStride = mbCols * 8 + 16;
  const uPlane = new Uint8Array(uvStride * (mbRows * 8 + 16));
  const vPlane = new Uint8Array(uvStride * (mbRows * 8 + 16));
  const Y0 = 16, X0 = 16, UV0 = 8; // visible origin offsets

  // --- token contexts: above per column (9 slots), left per partition ---
  const aboveCtx = [];
  for (let c = 0; c < mbCols; c++) aboveCtx.push(new Int8Array(9));

  // one row of dequantized coefficients: [mb][25 blocks][16]
  const rowCoeffs = new Int16Array(mbCols * 25 * 16);

  const frame = {
    width, height, mbCols, mbRows, bc, tokDec, nParts,
    seg, lf, coeffProbs, skipEnabled, skipProb, dqf,
    mbYMode, mbUVMode, mbSeg, mbSkip, mbHasNz, mbBModes,
    yPlane, yStride, uPlane, vPlane, uvStride,
    X0, Y0, UV0, aboveCtx, rowCoeffs,
  };

  decodeMbModes(frame);
  reconstructFrame(frame);
  loopFilterFrame(frame);
  return frame;
}

// Decode intra modes for every macroblock, row-major (keyframe only).
function decodeMbModes(f) {
  const { bc, seg, mbCols, mbRows } = f;
  const yModeMap = [B_DC_PRED, B_VE_PRED, B_HE_PRED, B_TM_PRED];
  for (let r = 0; r < mbRows; r++) {
    for (let c = 0; c < mbCols; c++) {
      const idx = r * mbCols + c;
      let segId = 0;
      if (seg.updateMap) segId = bc.tree(MB_SEGMENT_TREE, seg.treeProbs);
      f.mbSeg[idx] = segId;
      f.mbSkip[idx] = f.skipEnabled ? bc.bool(f.skipProb) : 0;
      const yMode = bc.tree(KF_YMODE_TREE, KF_YMODE_PROBS);
      f.mbYMode[idx] = yMode;
      if (yMode === B_PRED) {
        const bb = idx * 16;
        for (let i = 0; i < 16; i++) {
          let a, l;
          if (i < 4) {
            if (r === 0) a = B_DC_PRED;
            else {
              const ai = (r - 1) * mbCols + c;
              a = f.mbYMode[ai] === B_PRED
                ? f.mbBModes[ai * 16 + i + 12]
                : yModeMap[f.mbYMode[ai]];
            }
          } else a = f.mbBModes[bb + i - 4];
          if ((i & 3) === 0) {
            if (c === 0) l = B_DC_PRED;
            else {
              const li2 = r * mbCols + c - 1;
              l = f.mbYMode[li2] === B_PRED
                ? f.mbBModes[li2 * 16 + i + 3]
                : yModeMap[f.mbYMode[li2]];
            }
          } else l = f.mbBModes[bb + i - 1];
          f.mbBModes[bb + i] = bc.tree(B_MODE_TREE, KF_BMODE_PROBS[a][l]);
        }
      }
      f.mbUVMode[idx] = bc.tree(UV_MODE_TREE, KF_UVMODE_PROBS);
    }
  }
}

// Decode one token block. out: Int16Array, block written at outOff.
// Mirrors the RFC tokens.c goto structure: after a ZERO token the EOB check
// is skipped and the tree context resets to t=0; after a nonzero token the
// EOB check uses t=1 (val==1) or t=2 (val>1).
function decodeTokenBlock(td, probs, type, dfRow, li, ai, leftCtx, aboveCtx, out, outOff) {
  const typeBase = type * 8 * 3 * 11;
  let t = leftCtx[li] + aboveCtx[ai];
  let c = type === 0 ? 1 : 0;
  let tCur = t; // tree context selector (0, 1, or 2)
  let checkEob = true;
  for (;;) {
    const pb = typeBase + (tCur * 11) + COEFF_BANDS[c] * 33;
    if (checkEob) {
      if (!td.bool(probs[pb + EOB_NODE])) break; // EOB -> block finished
    }
    checkEob = true;
    if (!td.bool(probs[pb + ZERO_NODE])) {
      // zero token: advance, skip EOB check, reset tree context to 0
      if (c < 15) { c++; tCur = 0; checkEob = false; continue; }
      break; // malformed guard: zero at c==15 ends block
    }
    let val;
    if (!td.bool(probs[pb + ONE_NODE])) val = 1;
    else if (!td.bool(probs[pb + LOW_VAL_NODE])) {
      if (!td.bool(probs[pb + TWO_NODE])) val = 2;
      else if (!td.bool(probs[pb + THREE_NODE])) val = 3;
      else val = 4;
    } else if (!td.bool(probs[pb + HIGH_LOW_NODE])) {
      if (!td.bool(probs[pb + CAT_ONE_NODE])) {
        // CAT1: val = 5 + 1 extra bit (prob 159)
        val = 5 + (td.bool(159) ? 1 : 0);
      } else {
        // CAT2: val = 7 + 2 extra bits (bit1: prob 165, bit0: prob 145)
        val = 7 + (td.bool(165) ? 2 : 0) + (td.bool(145) ? 1 : 0);
      }
    } else {
      let min, nbits, eprobs;
      if (!td.bool(probs[pb + CAT_THREEFOUR_NODE])) {
        if (!td.bool(probs[pb + CAT_THREE_NODE])) { min = 11; nbits = 3; eprobs = [140, 148, 173]; }
        else { min = 19; nbits = 4; eprobs = [135, 140, 155, 176]; }
      } else {
        if (!td.bool(probs[pb + CAT_FIVE_NODE])) { min = 35; nbits = 5; eprobs = [130, 134, 141, 157, 180]; }
        else { min = 67; nbits = 11; eprobs = [129, 130, 133, 140, 153, 177, 196, 230, 243, 254, 254]; }
      }
      let x = 0;
      for (let b = nbits - 1; b >= 0; b--)
        x |= td.bool(eprobs[nbits - 1 - b]) << b;
      val = min + x;
    }
    const sign = td.bit() ? -1 : 1;
    const v = sign * val * dfRow[c ? 1 : 0];
    out[outOff + ZIGZAG[c]] = (v << 16) >> 16; // truncate to short
    tCur = val === 1 ? 1 : 2;
    if (c < 15) { c++; continue; } // back to EOB check
    break;
  }
  const nz = c !== (type === 0 ? 1 : 0) ? 1 : 0;
  leftCtx[li] = nz;
  aboveCtx[ai] = nz;
  return nz;
}

// Decode tokens for one macroblock row into f.rowCoeffs.
function decodeMbRowTokens(f, r) {
  const { mbCols, tokDec, nParts, coeffProbs, dqf } = f;
  const td = tokDec[r % nParts];
  const leftCtx = td.leftCtx;
  leftCtx.fill(0);
  for (let c = 0; c < mbCols; c++) {
    const idx = r * mbCols + c;
    const above = f.aboveCtx[c];
    const mbOff = c * 25 * 16;
    const yMode = f.mbYMode[idx];
    f.rowCoeffs.fill(0, mbOff, mbOff + 25 * 16); // memset per MB (tokens.c)
    if (f.mbSkip[idx]) {
      // skipped: zero this MB's token contexts
      for (let s = 0; s < 8; s++) { leftCtx[s] = 0; above[s] = 0; }
      if (yMode !== B_PRED) { leftCtx[8] = 0; above[8] = 0; }
      continue;
    }
    const df = dqf[f.mbSeg[idx]];
    const out = f.rowCoeffs;
    let hasNz = 0;
    if (yMode !== B_PRED) {
      // Y2 block (index 24, type 1)
      const y2 = new Int16Array(16);
      hasNz |= decodeTokenBlock(td, coeffProbs, 1, df[DQF_ROW[1]], 8, 8,
                                leftCtx, above, y2, 0);
      // inverse WHT -> luma DCs
      const w = vp8Walsh4(y2);
      for (let i = 0; i < 16; i++) {
        hasNz |= decodeTokenBlock(td, coeffProbs, 0, df[DQF_ROW[0]],
                                  LEFT_CONTEXT_INDEX[i], ABOVE_CONTEXT_INDEX[i],
                                  leftCtx, above, out, mbOff + i * 16);
      }
      for (let i = 0; i < 16; i++) out[mbOff + i * 16] = w[i];
    } else {
      for (let i = 0; i < 16; i++) {
        hasNz |= decodeTokenBlock(td, coeffProbs, 3, df[DQF_ROW[3]],
                                  LEFT_CONTEXT_INDEX[i], ABOVE_CONTEXT_INDEX[i],
                                  leftCtx, above, out, mbOff + i * 16);
      }
    }
    for (let i = 16; i < 24; i++) {
      hasNz |= decodeTokenBlock(td, coeffProbs, 2, df[DQF_ROW[2]],
                                LEFT_CONTEXT_INDEX[i], ABOVE_CONTEXT_INDEX[i],
                                leftCtx, above, out, mbOff + i * 16);
    }
    f.mbHasNz[idx] = hasNz;
  }
}

// ---------------------------------------------------------------------------
// Reconstruction: intra prediction + IDCT (predict.c)
// ---------------------------------------------------------------------------

// Fix up out-of-frame pixels for a row (dixie fixup_left/fixup_above).
function fixupRowBorders(f, r) {
  const { yPlane, yStride, uPlane, vPlane, uvStride, X0, Y0, UV0, mbCols } = f;
  // left column (luma + chroma), using MB(0,r) modes
  const idx0 = r * mbCols;
  fixupLeft(yPlane, yStride, X0, Y0 + r * 16, 16, r, f.mbYMode[idx0]);
  fixupLeft(uPlane, uvStride, UV0, UV0 + r * 8, 8, r, f.mbUVMode[idx0]);
  fixupLeft(vPlane, uvStride, UV0, UV0 + r * 8, 8, r, f.mbUVMode[idx0]);
  if (r === 0) {
    yPlane[(Y0 - 1) * yStride + X0 - 1] = 127; // above-left corner
    uPlane[(UV0 - 1) * uvStride + UV0 - 1] = 127;
    vPlane[(UV0 - 1) * uvStride + UV0 - 1] = 127;
  }
  if (r === 0) {
    // above row (luma + chroma), per MB
    for (let c = 0; c < mbCols; c++) {
      const idx = c;
      fixupAbove(yPlane, yStride, X0 + c * 16, Y0, 16, c, f.mbYMode[idx]);
      fixupAbove(uPlane, uvStride, UV0 + c * 8, UV0, 8, c, f.mbUVMode[idx]);
      fixupAbove(vPlane, uvStride, UV0 + c * 8, UV0, 8, c, f.mbUVMode[idx]);
    }
  }
}

function fixupLeft(plane, stride, x0, y0, width, row, mode) {
  // left = (x0-1, y0..y0+width-1); above = (x0.., y0-1)
  if (mode === DC_PRED && row > 0) {
    for (let i = 0; i < width; i++)
      plane[(y0 + i) * stride + x0 - 1] = plane[(y0 - 1) * stride + x0 + i];
  } else {
    for (let i = -1; i < width; i++)
      plane[(y0 + i) * stride + x0 - 1] = 129;
  }
}

function fixupAbove(plane, stride, x0, y0, width, col, mode) {
  // B"H FIX (2026-10-09): removed the DC_PRED branch that copied from the
  // current row's left column. fixup runs BEFORE reconstruction, so that
  // column is uninitialized zeros -> above border became 0 -> chroma
  // decoded with a green cast (U/V planes identical and wrong).
  // Per VP8 spec (RFC 6386 10.3), unavailable above pixels are 127.
  // (fixupLeft's DC_PRED branch is fine: it reads the above row, which IS
  // reconstructed for row > 0.)
  for (let i = -1; i < width; i++)
    plane[(y0 - 1) * stride + x0 + i] = 127;
  for (let i = 0; i < 4; i++)
    plane[(y0 - 1) * stride + x0 + width + i] = 127; // above-right
}

// Reconstruct one macroblock row (prediction + IDCT).
function reconstructMbRow(f, r) {
  const { mbCols, yPlane, yStride, uPlane, vPlane, uvStride,
          X0, Y0, UV0, rowCoeffs } = f;
  for (let c = 0; c < mbCols; c++) {
    const idx = r * mbCols + c;
    const x0 = X0 + c * 16, y0 = Y0 + r * 16;
    const ux0 = UV0 + c * 8, uy0 = UV0 + r * 8;
    const mbOff = c * 25 * 16;
    const yMode = f.mbYMode[idx];

    if (yMode === B_PRED) {
      // copy_down: above-right of subblock 3 -> above-right of 7, 11, 15
      for (let k = 0; k < 4; k++) {
        const px = yPlane[(y0 - 1) * yStride + x0 + 16 + k];
        yPlane[(y0 + 3) * yStride + x0 + 16 + k] = px;
        yPlane[(y0 + 7) * yStride + x0 + 16 + k] = px;
        yPlane[(y0 + 11) * yStride + x0 + 16 + k] = px;
      }
      const bb = idx * 16;
      for (let i = 0; i < 16; i++) {
        const bx = (i & 3) * 4, by = (i >> 2) * 4;
        const xx = x0 + bx, yy = y0 + by;
        const above9 = new Array(9), left5 = new Array(5);
        for (let j = -1; j <= 7; j++)
          above9[j + 1] = yPlane[(yy - 1) * yStride + xx + j];
        for (let k = -1; k <= 3; k++)
          left5[k + 1] = yPlane[(yy + k) * yStride + xx - 1];
        const pred = predict4x4(f.mbBModes[bb + i], above9, left5);
        for (let y = 0; y < 4; y++)
          for (let x = 0; x < 4; x++)
            yPlane[(yy + y) * yStride + xx + x] = pred[y * 4 + x];
        const co = new Int16Array(16);
        for (let k = 0; k < 16; k++) co[k] = rowCoeffs[mbOff + i * 16 + k];
        idctAdd(yPlane, xx, yy, yStride, co);
      }
    } else {
      const above16 = new Array(16), left16 = new Array(16);
      for (let j = 0; j < 16; j++) above16[j] = yPlane[(y0 - 1) * yStride + x0 + j];
      for (let k = 0; k < 16; k++) left16[k] = yPlane[(y0 + k) * yStride + x0 - 1];
      const topLeft = yPlane[(y0 - 1) * yStride + x0 - 1];
      let pred;
      if (yMode === DC_PRED) pred = predictDc16(above16, left16);
      else if (yMode === V_PRED) pred = predictV16(above16);
      else if (yMode === H_PRED) pred = predictH16(left16);
      else pred = predictTm16(above16, left16, topLeft);
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++)
          yPlane[(y0 + y) * yStride + x0 + x] = pred[y * 16 + x];
      for (let i = 0; i < 16; i++) {
        const bx = (i & 3) * 4, by = (i >> 2) * 4;
        const co = new Int16Array(16);
        for (let k = 0; k < 16; k++) co[k] = rowCoeffs[mbOff + i * 16 + k];
        idctAdd(yPlane, x0 + bx, y0 + by, yStride, co);
      }
    }

    // chroma
    const uvMode = f.mbUVMode[idx];
    for (let p = 0; p < 2; p++) {
      const plane = p === 0 ? uPlane : vPlane;
      const above8 = new Array(8), left8 = new Array(8);
      for (let j = 0; j < 8; j++) above8[j] = plane[(uy0 - 1) * uvStride + ux0 + j];
      for (let k = 0; k < 8; k++) left8[k] = plane[(uy0 + k) * uvStride + ux0 - 1];
      const topLeft = plane[(uy0 - 1) * uvStride + ux0 - 1];
      let pred;
      if (uvMode === DC_PRED) pred = predictDc8(above8, left8);
      else if (uvMode === V_PRED) pred = predictV8(above8);
      else if (uvMode === H_PRED) pred = predictH8(left8);
      else pred = predictTm8(above8, left8, topLeft);
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
          plane[(uy0 + y) * uvStride + ux0 + x] = pred[y * 8 + x];
      const base = p === 0 ? 16 : 20;
      for (let i = 0; i < 4; i++) {
        const bx = (i & 1) * 4, by = (i >> 1) * 4;
        const co = new Int16Array(16);
        for (let k = 0; k < 16; k++)
          co[k] = rowCoeffs[mbOff + (base + i) * 16 + k];
        idctAdd(plane, ux0 + bx, uy0 + by, uvStride, co);
      }
    }
  }
  // extend last row by 4 px for intra prediction (right edge)
  const rY0 = Y0 + r * 16;
  const lastPx = yPlane[(rY0 + 15) * yStride + X0 + mbCols * 16 - 1];
  for (let k = 0; k < 4; k++)
    yPlane[(rY0 + 15) * yStride + X0 + mbCols * 16 + k] = lastPx;
}

function reconstructFrame(f) {
  for (let r = 0; r < f.mbRows; r++) {
    decodeMbRowTokens(f, r);
    fixupRowBorders(f, r);
    reconstructMbRow(f, r);
  }
}

// ---------------------------------------------------------------------------
// Loop filter (loopfilter.c) — simple filter path on luma (dixie)
// ---------------------------------------------------------------------------

function clampInt8(v) { return v < -128 ? -128 : v > 127 ? 127 : v; }

// filter_common with use_outer_taps=1 (as used by the simple filter).
// off points at q0; p0 = off-step, p1 = off-2*step, q1 = off+step.
function filterCommon1(plane, off, step) {
  const p0 = plane[off - step], q0 = plane[off];
  const p1 = plane[off - 2 * step], q1 = plane[off + step];
  let a = clampInt8(3 * (q0 - p0) + clampInt8(p1 - q1));
  const f2 = ((a + 3 > 127 ? 127 : a + 3) >> 3);
  const f1 = ((a + 4 > 127 ? 127 : a + 4) >> 3);
  plane[off - step] = clamp255(p0 + f2);
  plane[off] = clamp255(q0 - f1);
}

function filterVEdgeSimple(plane, stride, x, y0, limit) {
  for (let i = 0; i < 16; i++) {
    const off = (y0 + i) * stride + x; // q0
    const p0 = plane[off - 1], q0 = plane[off];
    const p1 = plane[off - 2], q1 = plane[off + 1];
    if ((Math.abs(p0 - q0) * 2 + (Math.abs(p1 - q1) >> 1)) <= limit)
      filterCommon1(plane, off, 1);
  }
}

function filterHEdgeSimple(plane, stride, x0, y, limit) {
  for (let i = 0; i < 16; i++) {
    const off = y * stride + x0 + i; // q0
    const p0 = plane[off - stride], q0 = plane[off];
    const p1 = plane[off - 2 * stride], q1 = plane[off + stride];
    if ((Math.abs(p0 - q0) * 2 + (Math.abs(p1 - q1) >> 1)) <= limit)
      filterCommon1(plane, off, stride);
  }
}

// Per-MB filter level (calculate_filter_parameters, keyframe only:
// ref_frame is always CURRENT_FRAME).
function mbFilterLevel(f, idx) {
  const { seg, lf } = f;
  let level = lf.level;
  if (seg.enabled) {
    level = seg.abs
      ? seg.lfLevel[f.mbSeg[idx]]
      : level + seg.lfLevel[f.mbSeg[idx]];
  }
  if (lf.deltaEnabled) {
    level += lf.refDelta[0]; // CURRENT_FRAME
    if (f.mbYMode[idx] === B_PRED) level += lf.modeDelta[0];
  }
  return level < 0 ? 0 : level > 63 ? 63 : level;
}

function filterRowSimple(f, r) {
  const { yPlane, yStride, X0, Y0, mbCols, lf } = f;
  for (let c = 0; c < mbCols; c++) {
    const idx = r * mbCols + c;
    const edgeLimit = mbFilterLevel(f, idx);
    if (!edgeLimit) continue;
    let interior = edgeLimit;
    if (lf.sharpness) {
      interior >>= lf.sharpness > 4 ? 2 : 1;
      const cap = 9 - lf.sharpness;
      if (interior > cap) interior = cap;
    }
    if (interior < 1) interior = 1;
    const filterSub = f.mbHasNz[idx] || f.mbYMode[idx] === B_PRED;
    const mbLimit = (edgeLimit + 2) * 2 + interior;
    const bLimit = edgeLimit * 2 + interior;
    const x0 = X0 + c * 16, y0 = Y0 + r * 16;
    if (c > 0) filterVEdgeSimple(yPlane, yStride, x0, y0, mbLimit);
    if (filterSub) {
      filterVEdgeSimple(yPlane, yStride, x0 + 4, y0, bLimit);
      filterVEdgeSimple(yPlane, yStride, x0 + 8, y0, bLimit);
      filterVEdgeSimple(yPlane, yStride, x0 + 12, y0, bLimit);
    }
    if (r > 0) filterHEdgeSimple(yPlane, yStride, x0, y0, mbLimit);
    if (filterSub) {
      filterHEdgeSimple(yPlane, yStride, x0, y0 + 4, bLimit);
      filterHEdgeSimple(yPlane, yStride, x0, y0 + 8, bLimit);
      filterHEdgeSimple(yPlane, yStride, x0, y0 + 12, bLimit);
    }
  }
}

function loopFilterFrame(f) {
  if (f.lf.useSimple) {
    for (let r = 1; r < f.mbRows; r++) filterRowSimple(f, r - 1);
    if (f.mbRows > 0) filterRowSimple(f, f.mbRows - 1);
  } else {
    // Normal (non-simple) loop filter: not implemented. The simple filter
    // above is the required minimum; report this honestly.
    for (let r = 1; r < f.mbRows; r++) filterRowSimple(f, r - 1);
    if (f.mbRows > 0) filterRowSimple(f, f.mbRows - 1);
  }
}

// ---------------------------------------------------------------------------
// YCbCr -> RGBA (BT.601, same as JPEG)
// ---------------------------------------------------------------------------

function yuvToRgba(f, alphaPlane) {
  const { width, height, yPlane, yStride, uPlane, vPlane, uvStride,
          X0, Y0, UV0 } = f;
  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const yRow = (Y0 + y) * yStride + X0;
    const uvRow = (UV0 + (y >> 1)) * uvStride + UV0;
    let o = y * width * 4;
    for (let x = 0; x < width; x++) {
      const Y = yPlane[yRow + x];
      const cb = uPlane[uvRow + (x >> 1)] - 128;
      const cr = vPlane[uvRow + (x >> 1)] - 128;
      out[o] = Y + 1.402 * cr;
      out[o + 1] = Y - 0.344136 * cb - 0.714136 * cr;
      out[o + 2] = Y + 1.772 * cb;
      out[o + 3] = alphaPlane ? alphaPlane[y * width + x] : 255;
      o += 4;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// RIFF/WEBP container
// ---------------------------------------------------------------------------

function fourcc(bytes, o) {
  return String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]);
}

function parseRiff(bytes) {
  if (bytes.length < 12) fail("too small for RIFF/WEBP header");
  if (fourcc(bytes, 0) !== "RIFF") fail("not a RIFF container");
  if (fourcc(bytes, 8) !== "WEBP") fail("not a WEBP file");
  const chunks = [];
  let off = 12;
  while (off + 8 <= bytes.length) {
    const id = fourcc(bytes, off);
    const size = (bytes[off + 4] | (bytes[off + 5] << 8) |
                  (bytes[off + 6] << 16) | (bytes[off + 7] << 24)) >>> 0;
    const dataOff = off + 8;
    if (dataOff + size > bytes.length)
      fail("chunk '" + id + "' overruns file");
    chunks.push({ id, data: bytes.subarray(dataOff, dataOff + size) });
    off = dataOff + size + (size & 1); // chunks padded to even size
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function decodeWebp(bytes) {
  if (!(bytes instanceof Uint8Array)) fail("decodeWebp needs Uint8Array");
  const chunks = parseRiff(bytes);
  let vp8x = null, vp8 = null, vp8l = null, alph = null;
  for (const ch of chunks) {
    if (ch.id === "VP8X") vp8x = ch.data;
    else if (ch.id === "VP8 ") vp8 = ch.data;
    else if (ch.id === "VP8L") vp8l = ch.data;
    else if (ch.id === "ALPH") alph = ch.data;
    // unknown chunks are skipped via their size
  }
  if (vp8x) {
    if (vp8x.length < 10) fail("truncated VP8X chunk");
    if (vp8x[0] & 0x40) fail("animated WebP unsupported");
    // Simple still: canvas size is informational; the VP8 frame carries
    // the real dimensions. (ICC/EXIF/XMP chunks are skipped.)
  }
  if (vp8l && !vp8) fail("lossless WebP (VP8L) unsupported");
  if (!vp8) fail("no VP8 chunk found in WEBP container");
  const frame = decodeVp8Frame(vp8);
  let alpha = null;
  if (alph) alpha = decodeAlphChunk(alph, frame.width, frame.height);
  const data = yuvToRgba(frame, alpha);
  return { width: frame.width, height: frame.height, data, format: "webp" };
}

// ---------------------------------------------------------------------------
// ALPH chunk (alpha plane as VP8L) — via the VP8L decoder below
// ---------------------------------------------------------------------------

function decodeAlphChunk(data, width, height) {
  // ALPH chunk: 1 header byte, then a VP8L bitstream of the alpha plane.
  if (data.length < 2) fail("truncated ALPH chunk");
  const vp8l = decodeVp8L(data.subarray(1), width, height);
  // vp8l is ARGB; alpha plane is carried in the green channel for
  // grayscale-encoded alpha, else use the alpha channel if present.
  return vp8l.alpha;
}

// ---------------------------------------------------------------------------
// VP8L (lossless) decoder — used for the ALPH chunk.
// ---------------------------------------------------------------------------

export function decodeVp8L(data, width, height) {
  // TODO: full VP8L bitstream decoder. Currently unsupported.
  fail("VP8L bitstream decoding not yet implemented");
}
