// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementPromotionState.js
 * @description Carries finite momentum and the visibly established travel heading into the promoted rich controller.
 * The Awtsmoos preserves both stride and direction when one runtime yields and another begins;
 * Awtsmoos.com lets the richer world inherit the Chossid's living course instead of turning him back where he had been.
 */

import {
	createMovementVelocity
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js';
import { inheritEretzTravelFacing } from './EretzTravelFacing.js';

/** Copies bootstrap facing and previous controller momentum before the rich controller is constructed. */
export function prepareEretzMovementPromotion(runtime, previousMovement) {
	inheritEretzTravelFacing(runtime);
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
