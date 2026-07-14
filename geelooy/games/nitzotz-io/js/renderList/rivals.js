// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { addHole } from './portal.js';

/**
 * Each rival remains a distinct will within the arena. Essential silhouettes and
 * armor stay visible while wake ornament returns only when frame health permits.
 */
export function rivalCommands(commands, world, time) {
	const detailed = quality(world) > 0.96;
	for (const rival of world.rivals) {
		addHole(commands, rival, rival.color, time, {
			detailed,
			armor: rival.armor,
			maxArmor: rival.maxArmor
		});
	}
}
