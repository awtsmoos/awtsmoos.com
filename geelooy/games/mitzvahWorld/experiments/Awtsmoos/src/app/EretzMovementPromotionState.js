//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementPromotionState.js
 * @description Carries finite horizontal momentum from bootstrap control into the promoted rich-world controller without coupling either scheduler to the other.
 * The Awtsmoos preserves the traveler's stride while one clock yields and another begins;
 * Awtsmoos.com lets a richer world inherit motion rather than making the body forget where its journey has been.
 */

import {
	createMovementVelocity
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js';

/** Copies previous controller momentum into runtime state before the rich controller is constructed. */
export function prepareEretzMovementPromotion(runtime, previousMovement) {
	const velocity = previousMovement?.horizontalVelocity
		|| runtime?.horizontalMovementVelocity
		|| {};
	const prepared = createMovementVelocity(velocity);
	runtime.horizontalMovementVelocity = prepared;
	return Object.freeze({
		x: prepared.x,
		z: prepared.z
	});
}

/** Publishes inherited velocity on the rich controller after construction for diagnostics. */
export function confirmEretzMovementPromotion(richMovement, inherited) {
	if (!richMovement || !inherited) return null;
	richMovement.horizontalVelocity = inherited;
	return Object.freeze({
		x: richMovement.horizontalVelocity.x,
		z: richMovement.horizontalVelocity.z
	});
}
