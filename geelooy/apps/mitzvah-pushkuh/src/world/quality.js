// B"H
// Hard smoothness mode: beauty bows to the living frame.
export function qualityFor(w = 1, h = 1, reduced = false) {
  const mobile = Math.min(w, h) < 740;
  const dpr = reduced ? .7 : mobile ? .82 : 1;
  return {
    dpr, mobile, reduced, emergency: false,
    stars: reduced ? 36 : mobile ? 80 : 130,
    bands: reduced ? 1 : mobile ? 2 : 3,
    ripples: reduced ? 2 : mobile ? 3 : 5,
    roots: reduced ? 3 : mobile ? 5 : 8,
    portals: reduced ? 1 : mobile ? 2 : 3,
    maxBodies: reduced ? 36 : mobile ? 64 : 96,
    reflections: reduced ? 12 : mobile ? 24 : 36,
    moteCap: reduced ? 12 : mobile ? 24 : 42,
    trailCap: reduced ? 3 : mobile ? 5 : 8
  };
}
export function emergencyQuality(q) {
  return { ...q, emergency: true, bands: 1, ripples: 1, roots: 2, portals: 1, maxBodies: Math.min(q.maxBodies, 36), reflections: 8, moteCap: 8, trailCap: 2 };
}
