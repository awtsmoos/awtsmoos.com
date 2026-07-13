#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the map zone report vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { MAPS } from '../js/data/maps.js';

/** B"H - Prints generated map personality, analysis, and zones. */
const report = MAPS.map(map => ({
	id: map.id,
	personality: map.personality,
	analysis: {
		platforms: map.analysis.platformCount,
		walls: map.analysis.wallCount,
		holes: map.analysis.holeCount,
		spawnSpread: map.analysis.spawnSpread,
		engagementScore: map.analysis.engagementScore
	},
	zones: {
		centerControl: map.zones.centerControl.length,
		edgeKill: map.zones.edgeKill.length,
		recoverySafe: map.zones.recoverySafe.length,
		landingTrap: map.zones.landingTrap.length,
		danger: map.zones.danger.length
	}
}));
console.log(JSON.stringify(report, null, 2));
