/**
 * B"H
 * Stage-danger sense.
 *
 * Chapter 234: the stage receives a moral geography. Center is safe, edge is
 * danger, gaps are exile, high ledges are risk, and routes now pay a price for
 * foolish ground. Bots should move like they know where death lives.
 */
export function stageDangerAt(x, y, map, platform = null) {
  const p = platform || nearestPlatformAt(x, y, map.platforms || []);
  if (!p) return { score: 999, label: 'void', inward: 0 };
  const safe = safeBand(p);
  const edgeDistance = Math.min(Math.abs(x - p.x), Math.abs(x - (p.x + p.w)));
  const offPlatform = x < p.x || x > p.x + p.w || y > p.y + 180;
  const overHole = isOverHole(x, map.holes || []);
  const edgeRisk = edgeDistance < 95 ? 120 - edgeDistance : 0;
  const holeRisk = overHole ? 180 : 0;
  const offRisk = offPlatform ? 260 : 0;
  const heightRisk = y < -200 ? 20 : 0;
  const score = Math.max(0, edgeRisk + holeRisk + offRisk + heightRisk);
  return { score, label: label(score), inward: Math.sign(safe.center - x) || 1, safe };
}

export function safestPointOn(platform) {
  const safe = safeBand(platform);
  return { x: safe.center, y: platform.y, score: 0 };
}

export function safeBand(p) {
  const margin = Math.min(220, Math.max(120, p.w * 0.16));
  return { left: p.x + margin, right: p.x + p.w - margin, center: p.x + p.w / 2 };
}

function nearestPlatformAt(x, y, platforms) {
  let best = null;
  let bestScore = Infinity;
  for (const p of platforms) {
    const px = clamp(x, p.x, p.x + p.w);
    const dx = Math.abs(x - px);
    const dy = Math.abs(y - p.y);
    const score = dx * 1.25 + dy;
    if (score < bestScore) { best = p; bestScore = score; }
  }
  return best;
}

function isOverHole(x, holes) {
  return holes.some(h => x >= h.x && x <= h.x + h.w);
}

function label(score) {
  if (score > 240) return 'exile';
  if (score > 130) return 'pit';
  if (score > 55) return 'edge';
  return 'safe';
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
