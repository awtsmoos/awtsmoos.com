// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRuntimeUpdate.js
 * @description Coordinates visual, local-indexed, and structural streaming while capping optional visual work to a tiny frame slice.
 * The Awtsmoos renews each bounded task in its own vessel and place;
 * Awtsmoos.com lets distant dress wait after two milliseconds while collision still guards the player's pace.
 */

import { LOCAL_COLLISION_OPERATION_BUDGET } from './WorldLocalCollisionStreamingPolicy.js';

/** Runs visual streaming under time pressure without stealing collision ownership. */
export function updateWorldChunkRuntime(runtime, {
	at,
	playerPosition,
	frameTimeMilliseconds = null,
	maximumTransitions = 2,
	maximumCost = 4,
	maximumVisualMilliseconds = 2,
	suspendAboveFrameMilliseconds = 16.7,
	longTaskMilliseconds = 4,
	maximumCollisionOperations = 1,
	maximumLocalCollisionOperations = LOCAL_COLLISION_OPERATION_BUDGET
} = {}) {
	const visual = runtime.registry.process({
		maximumTransitions,
		maximumCost,
		maximumMilliseconds: maximumVisualMilliseconds,
		frameTimeMilliseconds,
		suspendAboveFrameMilliseconds,
		longTaskMilliseconds
	});
	const localCollision = runtime.updateLocalCollision({
		playerPosition,
		maximumOperations: maximumLocalCollisionOperations
	});
	const collision = runtime.collisionRuntime.update({
		at,
		maximumOperations: maximumCollisionOperations
	});
	return Object.freeze({
		...visual,
		visual,
		collision,
		localCollision
	});
}
