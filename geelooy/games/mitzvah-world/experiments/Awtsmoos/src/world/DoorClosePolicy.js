//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorClosePolicy.js
 * @description Owns collision-safe close admission and blocked-retry semantics so generic command policy never carries sweep geometry or safety timing.
 * Gevurah protects the traveler before the panel may return, while Chesed leaves a retry path when the threshold clears in turn;
 * the Awtsmoos recreates body, sweep, and doorway each instant, and Awtsmoos.com keeps safety evidence explicit before motion may burn.
 */

import {
	blockedDoorRetrySeconds,
	publishDoorActionReceipt
} from './DoorActionReceipt.js';
import {
	DOOR_STATES,
	doorStateCanClose
} from './DoorStateContract.js';
import { setDoorState } from './DoorStateTransition.js';
import {
	doorClosingSweepEvidence
} from './DoorThresholdSafety.js';

/**
 * @description Requests closing, validates the complete sampled doorway sweep, records blockage explicitly, and begins motion only when physical passage is safe.
 * @param {object} door Canonical dynamic door containing definition, current state, interaction context, and auto-close timing state.
 * @param {string} source Human, API, automation, or runtime origin used for state events and immutable action receipts.
 * @returns {Readonly<object>} Canonical close receipt including safety evidence and the resulting state.
 */
export function requestDoorClose(door, source = 'unknown') {
	const fromState = door.state;
	if (!doorStateCanClose(fromState)) {
		return closeReceipt(
			door,
			false,
			fromState,
			`door-cannot-close-from-${fromState}`,
			source
		);
	}
	const safety = doorClosingSweepEvidence(
		door.def,
		door.interaction.context
	);
	if (safety.blocked) {
		setDoorState(door, DOOR_STATES.BLOCKED, source);
		door.autoCloseRemaining = blockedDoorRetrySeconds(door.def);
		return closeReceipt(
			door,
			false,
			fromState,
			safety.reason,
			source,
			safety
		);
	}
	setDoorState(door, DOOR_STATES.CLOSING, source);
	return closeReceipt(
		door,
		true,
		fromState,
		'closing-accepted',
		source,
		safety
	);
}

/**
 * @description Normalizes close-specific evidence into the shared immutable action-receipt format without duplicating publication rules.
 * @param {object} door Canonical dynamic door receiving the action receipt.
 * @param {boolean} accepted Whether safety/state law accepted the close command.
 * @param {string} fromState Canonical state observed before the request.
 * @param {string} reason Stable machine-readable or human-readable decision reason.
 * @param {string} source Origin of the request for diagnostics.
 * @param {object|null} safety Optional sampled sweep evidence.
 * @returns {Readonly<object>} Shared canonical action receipt.
 */
function closeReceipt(
	door,
	accepted,
	fromState,
	reason,
	source,
	safety = null
) {
	return publishDoorActionReceipt(door, {
		accepted,
		action: 'close',
		fromState,
		reason,
		safety,
		source
	});
}
