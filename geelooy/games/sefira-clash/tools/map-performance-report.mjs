#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the map performance report vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { MAPS } from '../js/data/maps.js';
import { cameraRect, visibleMapParts } from '../js/maps/mapCulling.js';

/** B"H - Static map performance and culling report. */
const w = Number(process.argv.includes('--wide') ? 1280 : 720);
const h = Number(process.argv.includes('--wide') ? 720 : 390);
const report = MAPS.map(map => {
	const rect = cameraRect({ x: 0, y: 0, zoom: 1 }, w, h, 260);
	const visible = visibleMapParts(map, rect);
	return {
		id: map.id,
		cacheKey: map.performance.key,
		staticObjects: map.performance.staticObjects,
		recommendedCull: map.performance.recommendedCull,
		visiblePlatformsAtOrigin: visible.platforms.length,
		totalPlatforms: map.platforms.length,
		cullRatio: round(1 - visible.platforms.length / Math.max(1, map.platforms.length))
	};
});
console.log(JSON.stringify(report, null, 2));
function round(v) {
	return Math.round(v * 100) / 100;
}
