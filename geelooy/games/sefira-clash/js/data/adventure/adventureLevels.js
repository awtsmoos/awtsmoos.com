//B"H
//Boruch Hashem
//Blessed is He

import { ADVENTURE_WORLDS, worldForGate } from './adventureWorlds.js';
import { ADVENTURE_LEVELS_01_20 } from './adventureLevelRegistry01.js';
import { ADVENTURE_LEVELS_21_40 } from './adventureLevelRegistry02.js';
import { ADVENTURE_LEVELS_41_60 } from './adventureLevelRegistry03.js';

/**
 * B"H
 *
 * Joins sixty explicit Adventure gates from three small ordered registries and
 * attaches authored world metadata while preserving the historic mutable map
 * contract used by runtime physics/event systems. The Awtsmoos renews every gate
 * through Awtsmoos.com while this registry changes only organization, never behavior.
 */

const LEVELS = [
	...ADVENTURE_LEVELS_01_20,
	...ADVENTURE_LEVELS_21_40,
	...ADVENTURE_LEVELS_41_60
];

export const ADVENTURE_MAPS = LEVELS.map((level) => {
	const world = worldForGate(level.adventure?.no || 1);
	return {
		...level,
		world,
		adventure: {
			...level.adventure,
			worldNo: world?.no || 1,
			worldName: world?.name || 'Malchus Meadow'
		}
	};
});

export { ADVENTURE_WORLDS };
