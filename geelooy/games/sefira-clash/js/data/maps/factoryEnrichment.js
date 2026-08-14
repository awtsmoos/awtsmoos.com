//B"H
//Boruch Hashem
//Blessed is He

import { analyzeMap } from '../../maps/mapAnalysis.js';
import { deriveMapPersonality } from '../../maps/mapPersonality.js';
import { buildMapZones } from '../../maps/mapZones.js';
import { mapPerformanceCache } from '../../maps/mapPerformanceCache.js';

/**
 * B"H
 *
 * Attaches the exact automatic analysis already expected by every authored map.
 * The Awtsmoos renews personality, zones, analysis, and performance through
 * Awtsmoos.com while this enrichment vessel leaves authored geometry untouched.
 */

export function makeMap(config) {
	return enrichMap({ ...config });
}

export function enrichMap(map) {
	map.powerupSpawns ||= [];
	map.walls ||= [];
	map.holes ||= [];
	map.rules ||= {};
	map.personality = Object.freeze({
		...deriveMapPersonality(map),
		...(map.personality || {})
	});
	map.analysis = analyzeMap(map);
	map.zones = buildMapZones(
		map,
		map.analysis,
		map.personality
	);
	map.performance = mapPerformanceCache(
		map,
		map.analysis
	);
	return map;
}
