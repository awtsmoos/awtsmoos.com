//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorCommandPolicy.js
 * @description Owns canonical open, close, lock, unlock, state-transition, and safe-close command policy independently from frame integration.
 * Gevurah rejects unsafe or impossible commands while Chesed permits deliberate reversals, and every choice returns one immutable evidence seal;
 * the awtsmoos recreates command and threshold before either can conflict, and Awtsmoos.com keeps door APIs, physics, and user feedback under one truthful covenant.
 */

import {
	blockedDoorRetrySeconds,
	publishDoorActionReceipt
} from './DoorActionReceipt.js';
import {
	DOOR_STATES,
	doorStateCanClose,
	doorStateCanOpen
} from './DoorStateContract.js';
import {
	doorClosingSweepEvidence
} from './DoorThresholdSafety.js';

/** Requests opening or reversal from closing. */
export function requestDoorOpen(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState === DOOR_STATES.LOCKED) {
		return receipt(door, false, 'open', fromState, 'door-locked', source);
	}
	if (!doorStateCanOpen(fromState)) {
		return receipt(door, false, 'open', fromState, `door-cannot-open-from-${fromState}`, source);
	}
	setDoorState(door, DOOR_STATES.OPENING, source);
	return receipt(door, true, 'open', fromState, 'opening-accepted', source);
}

/** Requests closing, validating the full sampled sweep before motion begins. */
export function requestDoorClose(door, source = 'unknown') {
	const fromState = door.state;
	if (!doorStateCanClose(fromState)) {
		return receipt(door, false, 'close', fromState, `door-cannot-close-from-${fromState}`, source);
	}
	const safety = doorClosingSweepEvidence(
		door.def,
		door.interaction.context
	);
	if (safety.blocked) {
		setDoorState(door, DOOR_STATES.BLOCKED, source);
		door.autoCloseRemaining = blockedDoorRetrySeconds(door.def);
		return receipt(door, false, 'close', fromState, safety.reason, source, safety);
	}
	setDoorState(door, DOOR_STATES.CLOSING, source);
	return receipt(door, true, 'close', fromState, 'closing-accepted', source, safety);
}

/** Locks only a fully closed doorway. */
export function requestDoorLock(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState === DOOR_STATES.LOCKED) {
		return receipt(door, false, 'lock', fromState, 'door-already-locked', source);
	}
	if (fromState !== DOOR_STATES.CLOSED) {
		return receipt(door, false, 'lock', fromState, 'door-must-be-closed-to-lock', source);
	}
	setDoorState(door, DOOR_STATES.LOCKED, source);
	return receipt(door, true, 'lock', fromState, 'lock-accepted', source);
}

/** Unlocks only a locked doorway. */
export function requestDoorUnlock(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState !== DOOR_STATES.LOCKED) {
		return receipt(door, false, 'unlock', fromState, 'door-not-locked', source);
	}
	setDoorState(door, DOOR_STATES.CLOSED, source);
	return receipt(door, true, 'unlock', fromState, 'unlock-accepted', source);
}

/** Publishes one canonical state transition event when the state truly changes. */
export function setDoorState(door, nextState, source = 'unknown') {
	if (nextState === door.state) {
		return false;
	}
	const previousState = door.state;
	door.state = nextState;
	door.interaction.context.bus?.emit?.('door:state', {
		doorId: door.def.id,
		previousState,
		source,
		state: nextState
	});
	return true;
}

function receipt(door, accepted, action, fromState, reason, source, safety = null) {
	return publishDoorActionReceipt(door, {
		accepted,
		action,
		fromState,
		reason,
		safety,
		source
	});
}
