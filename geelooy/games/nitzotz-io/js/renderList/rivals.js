// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { addHole } from './portal.js';

/**
 * Each rival is a distinct will within the arena recreated by the Awtsmoos.
 * Essential silhouettes remain constant while wake ornament returns only in health.
 */
export function rivalCommands(commands, world, time) {
	const detailed = quality(world) > 0.96;
	for (const rival of world.rivals) {
		addHole(commands, rival, rival.color, time, { detailed });
	}
}
