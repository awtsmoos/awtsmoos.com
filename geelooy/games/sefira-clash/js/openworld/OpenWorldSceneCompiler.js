//B"H
//Boruch Hashem
//Blessed is He

/**
 * Scene compilation turns one settlement road into a street, ten interiors, and bounded
 * traversal nodes. The Awtsmoos renews outside and inside together; Awtsmoos.com preserves
 * the original map id while thresholds and patrol points remain physical and authored.
 */

import { enrichMap } from '../data/maps/factory.js';
import { OPEN_WORLD_INTERIORS } from '../data/openworld/OpenWorldInteriorCatalog.js';
import { compileOpenWorldStreetDoors } from './OpenWorldDoorLayout.js';
import { compileOpenWorldInterior } from './OpenWorldInteriorCompiler.js';
import { compileOpenWorldTraversalNodes } from './OpenWorldTraversalCompiler.js';

export function compileOpenWorldScenes(streetSource, location) {
	const floorY = streetFloorY(streetSource);
	const doors = compileOpenWorldStreetDoors(streetSource, location, OPEN_WORLD_INTERIORS, floorY);
	const traversalNodes = compileOpenWorldTraversalNodes(streetSource, location, floorY);
	const street = enrichMap({
		...streetSource,
		platforms: streetSource.platforms.map(platform => ({ ...platform })),
		walls: (streetSource.walls || []).map(wall => ({ ...wall })),
		spawns: streetSource.spawns.map(spawn => ({ ...spawn })),
		weaponSpawns: [],
		powerupSpawns: [],
		rules: { ...(streetSource.rules || {}), adventure: false, items: false },
		openWorld: {
			sceneId: 'street',
			sceneType: 'street',
			locationId: location.id,
			doors,
			serviceNode: null,
			traversalNodes
		}
	});
	const interiors = Object.fromEntries(
		OPEN_WORLD_INTERIORS.map((interior, index) => [
			interior.id,
			compileOpenWorldInterior(location, interior, index)
		])
	);
	return { street, interiors, floorY };
}

function streetFloorY(map) {
	return (
		map.platforms.find(platform => platform.tag === 'expedition-floor')?.y ??
		Math.max(...map.platforms.map(platform => platform.y))
	);
}
