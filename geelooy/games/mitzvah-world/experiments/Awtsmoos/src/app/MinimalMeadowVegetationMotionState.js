//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowVegetationMotionState.js
 * @description Holds reusable traveler-motion context and compact meadow activity evidence outside the vegetation orchestrator.
 * The Awtsmoos carries motion through time without confusing traveler and field;
 * Awtsmoos.com keeps velocity, mobile policy, and activity counting in one small vessel so grass orchestration stays clear.
 */

/** Creates one reusable motion context with no frame-loop allocation requirement. */
export function createMinimalMeadowVegetationMotionState(player = {}) {
	return {
		initialized: false,
		lastX: Number(player.x || 0),
		lastZ: Number(player.z || 0),
		windContext: {}
	};
}

/** Updates traveler velocity and time inside the reusable wind context. */
export function updateMinimalMeadowVegetationMotionState(motion, player, delta, time) {
	const context = motion.windContext;
	const playerX = Number(player.x || 0);
	const playerZ = Number(player.z || 0);
	const inverseDelta = motion.initialized && delta > 0.0001 ? 1 / delta : 0;
	context.deltaSeconds = delta;
	context.playerX = playerX;
	context.playerZ = playerZ;
	context.time = time;
	context.wakeX = (playerX - motion.lastX) * inverseDelta;
	context.wakeZ = (playerZ - motion.lastZ) * inverseDelta;
	motion.lastX = playerX;
	motion.lastZ = playerZ;
	motion.initialized = true;
	return context;
}

/** Counts visible, reacting, and moisture-rich cells without allocating per cell. */
export function countMinimalMeadowVegetationActivity(cells) {
	const result = { reactive: 0, visible: 0, wet: 0 };
	for (const cell of cells) {
		if (cell.group.visible !== false) result.visible += 1;
		if (cell.reaction > 0.02) result.reactive += 1;
		if (cell.wetness > 0.58) result.wet += 1;
	}
	return result;
}

/** Resolves the existing mobile quality decision without changing desktop policy. */
export function minimalMeadowVegetationUsesMobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
