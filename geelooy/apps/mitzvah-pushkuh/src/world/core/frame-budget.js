// B"H
// The frame-budget governor predicts pressure and chooses the vessel size.
export function createFrameBudget(policy = { tierBias: () => 0 }) {
  let bad = 0, good = 0, tier = policy.tierBias?.() || 0, avg = 16.67, trend = 0;
  function sample(delta) {
    const prior = avg; avg = avg * .92 + delta * .08; trend = avg - prior;
    const pressure = policy.tierBias?.() || 0, targetTier = Math.max(tier, pressure);
    bad = delta > 19 || trend > .18 ? bad + 1 : Math.max(0, bad - 1); good = delta < 17.2 && trend <= .04 ? good + 1 : 0;
    if ((bad > 18 || targetTier > tier) && tier < 2) { tier++; bad = 0; good = 0; return "down"; }
    if (good > 180 && tier > pressure) { tier--; bad = 0; good = 0; return "up"; }
    return "hold";
  }
  return { sample, tier: () => tier, avg: () => avg, trend: () => trend };
}
export function tieredQuality(base, tier) {
  if (tier === 0) return { ...base, emergency: false };
  if (tier === 1) return { ...base, dpr: base.dpr * .78, bands: 1, ripples: 2, portals: 2, maxBodies: Math.min(base.maxBodies, 64), moteCap: 16, trailCap: 4 };
  return { ...base, dpr: base.dpr * .62, emergency: true, bands: 1, ripples: 1, portals: 1, parallax: 1, fog: 0, maxBodies: Math.min(base.maxBodies, 36), reflections: 8, moteCap: 8, trailCap: 2 };
}
