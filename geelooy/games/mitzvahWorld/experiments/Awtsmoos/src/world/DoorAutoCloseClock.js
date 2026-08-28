//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorAutoCloseClock.js
 * @description Owns bounded automatic-close countdown and blocked retry timing without carrying pose integration, collision geometry, or command admission logic.
 * Netzach measures the passing interval while Gevurah refuses negative debt; the Awtsmoos recreates time and threshold before either can claim duration,
 * and Awtsmoos.com lets one small clock awaken the safe-close policy only when its appointed moment returns with intention.
 */

import {
	requestDoorClose
} from './DoorClosePolicy.js';
import {
	DOOR_STATES
} from './DoorStateContract.js';

/**
 * @description Advances automatic-close or blocked-retry debt for one frame and reissues the canonical safe-close command only when the countdown reaches zero.
 * @param {object} door Canonical dynamic door containing state, autoCloseRemaining, definition, and interaction context.
 * @param {number} elapsed Non-negative elapsed frame duration in seconds.
 * @returns {boolean} True when the countdown triggered a close attempt during this update.
 */
export function advanceDoorAutoCloseClock(door, elapsed) {
	if (!doorUsesAutoCloseClock(door)) {
		return false;
	}
	if (door.autoCloseRemaining <= 0) {
		return false;
	}
	door.autoCloseRemaining = Math.max(
		0,
		door.autoCloseRemaining - Math.max(0, Number(elapsed) || 0)
	);
	if (door.autoCloseRemaining > 0) {
		return false;
	}
	requestDoorClose(door, 'auto-close');
	return true;
}

/**
 * @description Determines whether the current canonical state participates in delayed closing or safe blocked-retry timing.
 * @param {object} door Canonical door-like object exposing its current state.
 * @returns {boolean} True for fully open or blocked states whose countdown may lawfully advance.
 */
function doorUsesAutoCloseClock(door) {
	return door.state === DOOR_STATES.OPEN
		|| door.state === DOOR_STATES.BLOCKED;
}
