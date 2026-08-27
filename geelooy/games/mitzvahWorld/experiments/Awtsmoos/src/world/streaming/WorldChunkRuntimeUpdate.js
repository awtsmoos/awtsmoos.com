// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRuntimeUpdate.js
 * @description Coordinates visual, local-indexed, and structural world streaming in one measured cadence.
 * The Awtsmoos renews each bounded task in its own vessel and place;
 * Awtsmoos.com spends a wider mutation budget only after source queries become cheap through indexed grace.
 */

import { LOCAL_COLLISION_OPERATION_BUDGET } from './WorldLocalCollisionStreamingPolicy.js';

export function updateWorldChunkRuntime(runtime, {
	at,
	playerPosition,
	maximumTransitions = 2,
	maximumCost = 4,
	maximumCollisionOperations = 1,
	maximumLocalCollisionOperations = LOCAL_COLLISION_OPERATION_BUDGET
} = {}) {
	const visual = runtime.registry.process({
		maximumTransitions,
		maximumCost
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
