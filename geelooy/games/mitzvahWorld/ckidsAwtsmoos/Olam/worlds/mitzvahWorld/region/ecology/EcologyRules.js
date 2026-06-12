// B"H
/**
 * @file EcologyRules.js
 * @description Chapter 980: the invisible law beneath grass, roads, and beasts.
 * The Awtsmoos breathes each cell as a small judgment: wet or dry, walked or
 * wild, shaded or open. No prop is random when the land itself speaks first.
 */
export const clamp01 = v => Math.max(0, Math.min(1, Number(v) || 0));
export const dist2 = (a, b, c, d) => Math.hypot((a || 0) - (c || 0), (b || 0) - (d || 0));
export const influence = (d, r) => clamp01(1 - (d / Math.max(1, r)));

export function nearestRoadInfluence(x, z, roads = {}) {
  let best = 0;
  for (const road of Object.values(roads || {})) {
    const paths = Array.isArray(road) ? road : [road];
    for (const path of paths) best = Math.max(best, roadPathInfluence(x, z, path));
  }
  return clamp01(best);
}

function roadPathInfluence(x, z, road = {}) {
  const points = road.points || [];
  let best = 9999;
  for (let i = 1; i < points.length; i += 1) best = Math.min(best, distanceToSegment(x, z, points[i - 1], points[i]));
  return influence(best, (road.width || 4) * 3.2);
}

function distanceToSegment(x, z, a = [0, 0], b = [0, 0]) {
  const ax = a[0], az = a[1], bx = b[0], bz = b[1];
  const dx = bx - ax, dz = bz - az, len = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len));
  return Math.hypot(x - (ax + dx * t), z - (az + dz * t));
}

export function scoreZone(cell, zone) {
  const d = dist2(cell.x, cell.z, zone.center[0], zone.center[1]);
  const radial = influence(d, zone.radius || 80);
  return radial * (zone.priority || 1) + (zone.moisture || 0) * cell.moisture * .2 + (zone.traffic || 0) * cell.traffic * .15;
}

export function chooseBiome(cell, zones = []) {
  let best = zones[0] || null, score = -Infinity;
  for (const zone of zones) {
    const s = scoreZone(cell, zone);
    if (s > score) { best = zone; score = s; }
  }
  return best?.id || "wilderness";
}

export function shapeCell(x, z, roads, waterPoints = []) {
  const village = influence(dist2(x, z, 0, 0), 95);
  const highland = Math.max(influence(dist2(x, z, -210, 135), 185), influence(dist2(x, z, 190, 130), 160));
  const water = waterPoints.reduce((m, p) => Math.max(m, influence(dist2(x, z, p[0], p[1]), p[2] || 75)), 0);
  const road = nearestRoadInfluence(x, z, roads);
  const forest = influence(dist2(x, z, 160, 65), 190);
  return {
    x, z,
    altitude: clamp01(.18 + highland * .75 - water * .25),
    slope: clamp01(highland * .65 + road * .08),
    moisture: clamp01(.28 + water * .62 + forest * .18 - highland * .18),
    fertility: clamp01(.38 + water * .25 + forest * .15 - highland * .2 - village * .1),
    traffic: clamp01(village * .75 + road * .95),
    shade: clamp01(forest * .68 + highland * .08),
    sunlight: clamp01(.9 - forest * .45 - water * .05),
    roadInfluence: road,
    waterInfluence: water,
    villageInfluence: village
  };
}
