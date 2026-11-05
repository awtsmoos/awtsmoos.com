//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorMotionIntegrator.js
 * @description Advances one canonical doorway frame by composing the auto-close clock, pure motion arithmetic, state transition seam, and presentation pose refresh.
 * Netzach carries the hinge through time while Tiferes keeps motion and visible form aligned; the Awtsmoos recreates delta and doorway before either can move,
 * and Awtsmoos.com lets this integrator remain a narrow conductor because every deeper law already sings from its own groove.
 */

import {
	advanceDoorAutoCloseClock
} from './DoorAutoCloseClock.js';
import {
	clampedDoorProgress,
	doorMotionDirection,
	positiveDoorNumber
} from './DoorMotionMath.js';
import {
	DOOR_STATES
} from './DoorStateContract.js';
import {
	setDoorState
} from './DoorStateTransition.js';

const DEFAULT_SPEED = 2.15;

/**
 * @description Advances automatic closing and reversible door progress for one frame, settling state at exact endpoints and refreshing pose only after movement.
 * @param {object} door Canonical dynamic door containing state, progress, definition, timing debt, interaction context, and setPose presentation API.
 * @param {number} deltaTime Elapsed frame duration in seconds; negative or invalid values are treated as zero.
 * @returns {boolean} True when door progress changed and presentation pose was refreshed during this frame.
 */
export function updateDoorMotion(door, deltaTime) {
	const elapsed = Math.max(0, Number(deltaTime) || 0);
	advanceDoorAutoCloseClock(door, elapsed);
	const direction = doorMotionDirection(door.state);
	if (direction === 0) {
		return false;
	}
	const previousProgress = door.t;
	const speed = positiveDoorNumber(
		door.def.openSpeed,
		DEFAULT_SPEED
	);
	door.t = clampedDoorProgress(
		previousProgress + direction * elapsed * speed
	);
	settleDoorEndpoint(door);
	if (door.t === previousProgress) {
		return false;
	}
	door.setPose();
	return true;
}

/**
 * @description Seals exact open or closed endpoints into canonical state while initializing the next authored auto-close countdown only after fully opening.
 * @param {object} door Canonical dynamic door containing progress, state, definition, timing debt, and interaction context.
 * @returns {boolean} True when an endpoint caused or attempted a canonical settled-state transition.
 */
function settleDoorEndpoint(door) {
	if (door.t >= 1) {
		door.t = 1;
		setDoorState(
			door,
			DOOR_STATES.OPEN,
			'motion-complete'
		);
		door.autoCloseRemaining = positiveDoorNumber(
			door.def.autoCloseSeconds,
			0
		);
		return true;
	}
	if (door.t <= 0) {
		door.t = 0;
		setDoorState(
			door,
			DOOR_STATES.CLOSED,
			'motion-complete'
		);
		return true;
	}
	return false;
}
