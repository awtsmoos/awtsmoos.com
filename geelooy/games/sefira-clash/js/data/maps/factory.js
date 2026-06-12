import { analyzeMap } from '../../maps/mapAnalysis.js';
import { deriveMapPersonality } from '../../maps/mapPersonality.js';
import { buildMapZones } from '../../maps/mapZones.js';
import { mapPerformanceCache } from '../../maps/mapPerformanceCache.js';

/**
 * B"H
 * Map factory vessels with automatic analysis.
 *
 * Chapter 62: no arena is born naked. Each receives personality, zones,
 * analysis, and a performance key before the first fighter enters.
 */
export const makeMap = config => enrichMap({ ...config });

export const bounds = (left, right, top = -1200, bottom = 1300) => ({ left, right, top, bottom });
export const point = (x, y) => ({ x, y });
export const platform = (x, y, w, h = 34, tag = 'stone') => ({ x, y, w, h, tag });
export const wall = (x, y, w, h, tag = 'wall') => ({ x, y, w, h, tag });
export const hole = (x, w) => ({ x, w });
export const points = (...pairs) => pairs.map(([x, y]) => point(x, y));

export function enrichMap(map) {
  map.powerupSpawns ||= [];
  map.walls ||= [];
  map.holes ||= [];
  map.rules ||= {};
  map.personality = Object.freeze({ ...deriveMapPersonality(map), ...(map.personality || {}) });
  map.analysis = analyzeMap(map);
  map.zones = buildMapZones(map, map.analysis, map.personality);
  map.performance = mapPerformanceCache(map, map.analysis);
  return map;
}

export function solidFloor(x, y, w, h = 56, holes = []) {
  const pieces = [];
  let cursor = x;
  for (const gap of holes.sort((a, b) => a.x - b.x)) {
    if (gap.x > cursor) pieces.push(platform(cursor, y, gap.x - cursor, h, 'solid-floor'));
    cursor = gap.x + gap.w;
  }
  if (cursor < x + w) pieces.push(platform(cursor, y, x + w - cursor, h, 'solid-floor'));
  return pieces;
}

export function sideWalls(left, right, top, bottom, thickness = 72) { return boxWalls(left, right, top, bottom, thickness); }
export function boxWalls(left, right, top, bottom, thickness = 72) {
  return [wall(left - thickness, top, thickness, bottom - top, 'left-wall'), wall(right, top, thickness, bottom - top, 'right-wall'), wall(left - thickness, top - thickness, right - left + thickness * 2, thickness, 'ceiling')];
}
export function lane(start, y, count) { return Array.from({ length: count }, (_, i) => platform(start + i * 860, y, 700 + (i % 2) * 120, 42)); }
export function steps(x, y, count) { return Array.from({ length: count }, (_, i) => platform(x + i * 540, y - (i % 3) * 115, 270 + (i % 2) * 70, 24, 'altar')); }
