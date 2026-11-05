// B"H — Reality Engine commit 1: the river spine.
// The river is the scene's structural spine. Everything (terrain carve, banks,
// rocks, foam, flow, camera) derives from this lookup table — never from raw
// control points, never from a sine hack.
//
// S-curve (Catmull-Rom) through hand-placed control points, z-monotonic so
// riverX(z) stays a valid drop-in for all existing call sites. Width profile:
// 7m foreground shallows -> 3.5m rapids narrows -> 5m background (full widths).

const CONTROL = [
  [10, 70], [-2, 40], [-10, 18], [2, -5], [12, -30], [2, -60], [-2, -95], [0, -120],
];
// [t, halfWidthMeters]
const WIDTH_PROFILE = [
  [0.00, 3.5], [0.25, 3.2], [0.42, 1.75], [0.55, 1.9], [0.75, 2.5], [1.00, 2.6],
];
// [t, depthMeters] (below WATER_Y)
const DEPTH_PROFILE = [
  [0.00, 0.6], [0.42, 1.2], [0.60, 1.1], [1.00, 0.9],
];
const SAMPLES = 256;

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

function profileAt(profile, t) {
  if (t <= profile[0][0]) return profile[0][1];
  for (let i = 1; i < profile.length; i++) {
    if (t <= profile[i][0]) {
      const [t0, v0] = profile[i - 1], [t1, v1] = profile[i];
      const k = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (k * k * (3 - 2 * k));
    }
  }
  return profile[profile.length - 1][1];
}

// Build the sampled centerline.
const lut = [];
{
  const pts = CONTROL;
  const n = pts.length;
  const get = i => pts[Math.min(Math.max(i, 0), n - 1)];
  let prev = null;
  for (let i = 0; i < SAMPLES; i++) {
    const gt = (i / (SAMPLES - 1)) * (n - 1);
    const seg = Math.min(Math.floor(gt), n - 2);
    const lt = gt - seg;
    const p = catmullRom(get(seg - 1), get(seg), get(seg + 1), get(seg + 2), lt);
    const t = i / (SAMPLES - 1);
    const s = { x: p[0], z: p[1], t, halfWidth: profileAt(WIDTH_PROFILE, t), depth: profileAt(DEPTH_PROFILE, t) };
    if (prev) {
      const dx = s.x - prev.x, dz = s.z - prev.z;
      const len = Math.hypot(dx, dz) || 1;
      prev.tx = dx / len; prev.tz = dz / len;
    }
    lut.push(s);
    prev = s;
  }
  const last = lut[SAMPLES - 1], pl = lut[SAMPLES - 2];
  const dx = last.x - pl.x, dz = last.z - pl.z, len = Math.hypot(dx, dz) || 1;
  last.tx = dx / len; last.tz = dz / len;
  // z must decrease monotonically for riverX(z) to be valid
  for (let i = 1; i < SAMPLES; i++) {
    if (lut[i].z >= lut[i - 1].z) throw new Error(`river LUT not z-monotonic at sample ${i}`);
  }
}

const Z_MAX = lut[0].z, Z_MIN = lut[SAMPLES - 1].z;

// Binary search samples by z (decreasing), then lerp.
function sampleAtZ(z) {
  const zc = Math.min(Math.max(z, Z_MIN), Z_MAX);
  let lo = 0, hi = SAMPLES - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lut[mid].z > zc) lo = mid; else hi = mid;
  }
  const a = lut[lo], b = lut[hi];
  const k = (a.z - zc) / ((a.z - b.z) || 1);
  return {
    x: a.x + (b.x - a.x) * k,
    t: a.t + (b.t - a.t) * k,
    halfWidth: a.halfWidth + (b.halfWidth - a.halfWidth) * k,
    depth: a.depth + (b.depth - a.depth) * k,
    tx: a.tx + (b.tx - a.tx) * k,
    tz: a.tz + (b.tz - a.tz) * k,
  };
}

/** Drop-in replacement for the old sine riverX(z). */
export function riverX(z) { return sampleAtZ(z).x; }
/** Half-width of the water surface at z (meters). */
export function riverHalfWidth(z) { return sampleAtZ(z).halfWidth; }
/** Water depth below WATER_Y at z (meters). */
export function riverDepthAt(z) { return sampleAtZ(z).depth; }
/** Full sample (x, t, halfWidth, depth, tangent) at z. */
export function riverSampleAtZ(z) { return sampleAtZ(z); }
/** Raw LUT for builders that need the whole spine. */
export function riverLUT() { return lut; }
/** t-range of the rapids narrows (halfWidth < 2.0m) for foam/flow. */
export function rapidsTRange() {
  let t0 = 1, t1 = 0;
  for (const s of lut) {
    if (s.halfWidth < 2.0) { t0 = Math.min(t0, s.t); t1 = Math.max(t1, s.t); }
  }
  return [t0, t1];
}
// Budget accounting (reinforcement): this module adds 0 draw calls, 0 tris.
