//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the factory vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
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

/**
 * Reveals the bounds behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} left The left value entering this behavior.
 * @param {*} right The right value entering this behavior.
 * @param {*} top The top value entering this behavior.
 * @param {*} bottom The bottom value entering this behavior.
 */
export const bounds = (left, right, top = -1200, bottom = 1300) => ({ left, right, top, bottom });
/**
 * Reveals the point behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export const point = (x, y) => ({ x, y });
/**
 * Reveals the platform behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} w The w value entering this behavior.
 * @param {*} h The h value entering this behavior.
 * @param {*} tag The tag value entering this behavior.
 */
export const platform = (x, y, w, h = 34, tag = 'stone') => ({ x, y, w, h, tag });
/**
 * Reveals the wall behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} w The w value entering this behavior.
 * @param {*} h The h value entering this behavior.
 * @param {*} tag The tag value entering this behavior.
 */
export const wall = (x, y, w, h, tag = 'wall') => ({ x, y, w, h, tag });
/**
 * Reveals the hole behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} w The w value entering this behavior.
 */
export const hole = (x, w) => ({ x, w });
/**
 * Reveals the points behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pairs The pairs value entering this behavior.
 */
export const points = (...pairs) => pairs.map(([x, y]) => point(x, y));

/**
 * Reveals the enrich map behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 */
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

/**
 * Reveals the solid floor behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} w The w value entering this behavior.
 * @param {*} h The h value entering this behavior.
 * @param {*} holes The holes value entering this behavior.
 */
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

/**
 * Reveals the side walls behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} left The left value entering this behavior.
 * @param {*} right The right value entering this behavior.
 * @param {*} top The top value entering this behavior.
 * @param {*} bottom The bottom value entering this behavior.
 * @param {*} thickness The thickness value entering this behavior.
 */
export function sideWalls(left, right, top, bottom, thickness = 72) {
	return boxWalls(left, right, top, bottom, thickness);
}
/**
 * Reveals the box walls behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} left The left value entering this behavior.
 * @param {*} right The right value entering this behavior.
 * @param {*} top The top value entering this behavior.
 * @param {*} bottom The bottom value entering this behavior.
 * @param {*} thickness The thickness value entering this behavior.
 */
export function boxWalls(left, right, top, bottom, thickness = 72) {
	return [
		wall(left - thickness, top, thickness, bottom - top, 'left-wall'),
		wall(right, top, thickness, bottom - top, 'right-wall'),
		wall(left - thickness, top - thickness, right - left + thickness * 2, thickness, 'ceiling')
	];
}
/**
 * Reveals the lane behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} start The start value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} count The count value entering this behavior.
 */
export function lane(start, y, count) {
	return Array.from({ length: count }, (_, i) =>
		platform(start + i * 860, y, 700 + (i % 2) * 120, 42)
	);
}
/**
 * Reveals the steps behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} count The count value entering this behavior.
 */
export function steps(x, y, count) {
	return Array.from({ length: count }, (_, i) =>
		platform(x + i * 540, y - (i % 3) * 115, 270 + (i % 2) * 70, 24, 'altar')
	);
}
