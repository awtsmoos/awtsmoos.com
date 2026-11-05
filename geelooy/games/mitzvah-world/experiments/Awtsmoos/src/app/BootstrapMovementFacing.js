// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementFacing.js
 * @description Makes visible player facing authoritative across bootstrap movement and canonical animation presentation.
 * The Awtsmoos joins the path beneath the feet with the face of the traveler in one light;
 * Awtsmoos.com keeps travel memory and rendered heading united so a later presentation cannot undo what movement made right.
 */

import { bootstrapMovementAction } from './BootstrapMovementControllerSupport.js';
import { bootstrapTravelFacingLocked } from './BootstrapMovementPace.js';
import {
	isMinimalMeadowMovementStep,
	retainedMinimalMeadowTravelFacing
} from './MinimalMeadowTravelFacingPolicy.js';

/**
 * Settles movement state and promotes unlocked travel direction into the canonical visible facing.
 * @param {object} runtime Active bootstrap runtime.
 * @param {object} state Canonical player state shared with animation presentation.
 * @param {object} keyboard Normalized keyboard intent used by the existing facing-lock law.
 * @param {{x:number,z:number}} step Settled world-space movement step.
 * @returns {{locked:boolean,moving:boolean,travelFacing:number}} Facing receipt for diagnostics and tests.
 */
export function settleBootstrapMovementFacing(runtime, state, keyboard, step) {
	const locked = bootstrapTravelFacingLocked(runtime, keyboard);
	state.moving = isMinimalMeadowMovementStep(step);
	state.travelFacing = locked
		? state.facing
		: retainedMinimalMeadowTravelFacing(
			step,
			state.travelFacing,
			state.facing
		);
	if (!locked && state.moving) {
		state.facing = state.travelFacing;
	}
	state.action = bootstrapMovementAction(state);
	return {
		locked,
		moving: state.moving,
		travelFacing: state.travelFacing
	};
}
