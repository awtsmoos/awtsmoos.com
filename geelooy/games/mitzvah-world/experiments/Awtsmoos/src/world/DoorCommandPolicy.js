//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorCommandPolicy.js
 * @description Owns canonical open, lock, and unlock admission while safe closing and state-event publication remain in dedicated doorway vessels.
 * Gevurah rejects impossible motion, Chesed permits lawful reversal, and Hod records every answer without hiding the reason from sight;
 * the Awtsmoos recreates command and threshold before either can contend, while Awtsmoos.com keeps each doorway law small enough to reveal its end.
 */

import {
	publishDoorActionReceipt
} from './DoorActionReceipt.js';
import {
	DOOR_STATES,
	doorStateCanOpen
} from './DoorStateContract.js';
import {
	setDoorState
} from './DoorStateTransition.js';

/**
 * @description Requests opening or a legal reversal from closing while preserving locked-state refusal as an explicit immutable receipt.
 * @param {object} door Canonical dynamic door containing current state, immutable definition identity, and interaction context.
 * @param {string} source Human, API, automation, or runtime origin used for state events and diagnostics.
 * @returns {Readonly<object>} Canonical action receipt describing acceptance, reason, origin state, and resulting state.
 */
export function requestDoorOpen(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState === DOOR_STATES.LOCKED) {
		return commandReceipt(
			door,
			false,
			'open',
			fromState,
			'door-locked',
			source
		);
	}
	if (!doorStateCanOpen(fromState)) {
		return commandReceipt(
			door,
			false,
			'open',
			fromState,
			`door-cannot-open-from-${fromState}`,
			source
		);
	}
	setDoorState(door, DOOR_STATES.OPENING, source);
	return commandReceipt(
		door,
		true,
		'open',
		fromState,
		'opening-accepted',
		source
	);
}

/**
 * @description Locks only a fully settled closed doorway so visible pose, collider truth, and public lock state can never contradict one another.
 * @param {object} door Canonical dynamic door containing current state and immutable identity.
 * @param {string} source Origin of the lock request for audit evidence.
 * @returns {Readonly<object>} Canonical lock receipt describing acceptance or the exact rejection reason.
 */
export function requestDoorLock(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState === DOOR_STATES.LOCKED) {
		return commandReceipt(
			door,
			false,
			'lock',
			fromState,
			'door-already-locked',
			source
		);
	}
	if (fromState !== DOOR_STATES.CLOSED) {
		return commandReceipt(
			door,
			false,
			'lock',
			fromState,
			'door-must-be-closed-to-lock',
			source
		);
	}
	setDoorState(door, DOOR_STATES.LOCKED, source);
	return commandReceipt(
		door,
		true,
		'lock',
		fromState,
		'lock-accepted',
		source
	);
}

/**
 * @description Unlocks only a locked doorway into the ordinary closed state through the same observable transition and receipt seams used everywhere else.
 * @param {object} door Canonical dynamic door containing current state and immutable identity.
 * @param {string} source Origin of the unlock request for audit evidence.
 * @returns {Readonly<object>} Canonical unlock receipt describing acceptance or rejection.
 */
export function requestDoorUnlock(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState !== DOOR_STATES.LOCKED) {
		return commandReceipt(
			door,
			false,
			'unlock',
			fromState,
			'door-not-locked',
			source
		);
	}
	setDoorState(door, DOOR_STATES.CLOSED, source);
	return commandReceipt(
		door,
		true,
		'unlock',
		fromState,
		'unlock-accepted',
		source
	);
}

/**
 * @description Projects command-policy evidence into the single shared immutable action-receipt contract.
 * @param {object} door Canonical dynamic door receiving receipt storage and event publication.
 * @param {boolean} accepted Whether policy accepted the command.
 * @param {string} action Canonical action name such as open, lock, or unlock.
 * @param {string} fromState Canonical state observed before the request.
 * @param {string} reason Stable decision reason for UI, API, diagnostics, and logs.
 * @param {string} source Origin of the request.
 * @returns {Readonly<object>} Shared canonical action receipt.
 */
function commandReceipt(
	door,
	accepted,
	action,
	fromState,
	reason,
	source
) {
	return publishDoorActionReceipt(door, {
		accepted,
		action,
		fromState,
		reason,
		source
	});
}
