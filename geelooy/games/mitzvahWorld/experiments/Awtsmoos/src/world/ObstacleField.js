// B"H
import { createHouseDefs } from './House3D.js';

/** Production world contains measured houses only; the NPC is installed separately. */
export function createObstacleField(assets = {}, groundSampler) {
	const houses = createHouseDefs(assets, groundSampler);
	const definitions = [...houses];
	definitions.assets = assets;
	definitions.userData = {
		...houses.userData,
		startingZone: {
			productionOnly: true,
			testCourseObjects: 0,
			npcInstalledSeparately: true
		}
	};
	return definitions;
}
