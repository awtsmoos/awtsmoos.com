// B"H
// Quality is a ladder: the world descends or ascends with the frame.
export function qualityFor(w = 1, h = 1, reduced = false) {
  const mobile = Math.min(w, h) < 740, wide = w > 1100;
  const dpr = reduced ? .7 : mobile ? .82 : 1;
  return { dpr, mobile, wide, reduced, emergency: false, stars: reduced ? 36 : mobile ? 90 : 150,
    bands: reduced ? 1 : mobile ? 2 : 4, ripples: reduced ? 2 : mobile ? 3 : 6, roots: reduced ? 3 : mobile ? 5 : 9,
    portals: reduced ? 1 : mobile ? 2 : 4, parallax: reduced ? 1 : mobile ? 2 : 4, fog: reduced ? 0 : mobile ? 2 : 4,
    maxBodies: reduced ? 36 : mobile ? 64 : 110, reflections: reduced ? 12 : mobile ? 24 : 44, moteCap: reduced ? 12 : mobile ? 24 : 46, trailCap: reduced ? 3 : mobile ? 5 : 8 };
}
export function emergencyQuality(q) {
  return { ...q, emergency: true, bands: 1, ripples: 1, roots: 2, portals: 1, parallax: 1, fog: 0, maxBodies: Math.min(q.maxBodies, 36), reflections: 8, moteCap: 8, trailCap: 2 };
}
