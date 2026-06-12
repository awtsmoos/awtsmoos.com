/**
 * B"H
 * Map analysis: static facts for AI, diagnostics, and performance.
 *
 * Chapter 57: before the fight begins, the map confesses its shape: center,
 * edges, lanes, platform mass, spawn spread, and opening engagement pressure.
 */
export function analyzeMap(map) {
  const platforms = map.platforms || [];
  const bounds = map.bounds;
  const center = { x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 };
  const main = [...platforms].sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 4);
  const edge = platforms.filter(p => p.x < center.x - width(bounds) * 0.28 || p.x + p.w > center.x + width(bounds) * 0.28);
  return Object.freeze({
    center, width: width(bounds), height: bounds.bottom - bounds.top,
    platformCount: platforms.length, wallCount: map.walls?.length || 0, holeCount: map.holes?.length || 0,
    mainPlatforms: main.map(summary), edgePlatforms: edge.map(summary),
    spawnSpread: spawnSpread(map.spawns || []), engagementScore: engagementScore(map, center),
    staticComplexity: platforms.length + (map.walls?.length || 0) + (map.holes?.length || 0)
  });
}

function summary(p) { return { x: p.x, y: p.y, w: p.w, h: p.h, tag: p.tag || 'platform', center: p.x + p.w / 2 }; }
function width(b) { return Math.max(1, b.right - b.left); }
function spawnSpread(spawns) {
  if (spawns.length < 2) return 0;
  const xs = spawns.map(s => s.x), ys = spawns.map(s => s.y);
  return Math.round(Math.hypot(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) * 0.6));
}
function engagementScore(map, center) {
  const spread = spawnSpread(map.spawns || []);
  const centerPull = (map.spawns || []).reduce((n, s) => n + Math.abs(s.x - center.x), 0) / Math.max(1, (map.spawns || []).length);
  return Math.round(Math.max(0, 1000 - spread * 0.25 - centerPull * 0.08));
}
