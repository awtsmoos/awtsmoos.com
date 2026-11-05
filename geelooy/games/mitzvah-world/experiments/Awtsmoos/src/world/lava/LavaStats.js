//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaStats.js
 * @description Creates the stable diagnostics contract exposed by LavaLevel without mixing reporting into simulation updates.
 * Diagnostics remain plain native JavaScript data and contain no renderer ownership.
 */

import { LAVA_START } from './LavaCourseDefinitions.js';
import { lavaTextureUrl } from './LavaMaterialDefinitions.js';

/**
 * Creates one immutable-style snapshot of the current lava challenge state.
 * @param {object} level Active LavaLevel-like state owner.
 * @returns {object} Public diagnostics snapshot preserving the historical keys.
 */
export function createLavaStats(level) {
	return {
		active: level.active,
		coins: level.collected,
		collected: level.collected,
		total: level.coins.length,
		failures: level.failures,
		start: LAVA_START,
		platformColliders: level.colliders.length,
		loadedWorld: level.group.visible,
		notice: level.notice,
		platformTexture: lavaTextureUrl(level.assets.redBrickImage),
		coinTexture: lavaTextureUrl(level.assets.goldImage),
		easierCourse: true,
		extendedCourse: true
	};
}
