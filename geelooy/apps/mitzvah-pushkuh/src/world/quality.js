// B"H
// Quality is mercy: maximum wonder, minimum waste.
export function qualityFor(w = 1, h = 1, reduced = false) {
  const area = w * h, mobile = Math.min(w, h) < 740, wide = w > 1250;
  const dpr = reduced ? 1 : mobile ? 1.25 : area > 1400000 ? 1.55 : 1.85;
  return {
    dpr, mobile, wide,
    stars: reduced ? 40 : mobile ? 120 : 240,
    comets: reduced ? 0 : mobile ? 2 : 6,
    ripples: reduced ? 4 : mobile ? 8 : 13,
    roots: reduced ? 5 : mobile ? 9 : 17,
    portals: reduced ? 2 : mobile ? 3 : 5,
    maxBodies: reduced ? 80 : mobile ? 170 : 280,
    reflections: reduced ? 24 : mobile ? 52 : 96,
    moteCap: reduced ? 50 : mobile ? 135 : 290,
    trailCap: reduced ? 6 : mobile ? 12 : 22
  };
}
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
