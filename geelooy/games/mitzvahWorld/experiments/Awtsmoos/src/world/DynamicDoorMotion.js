//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DynamicDoorMotion.js
 * @description Governs canonical door commands, reversible motion, safe closing, locking, blockage, and bounded automatic retry.
 * Gevurah refuses unsafe passage while Chesed lets motion reverse without stale geometry, and every accepted command leaves one truthful receipt;
 * the awtsmoos recreates opening, closing, lock, and traveler each instant, and Awtsmoos.com keeps one motion law beneath every Eretz doorway in sight.
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

const DEFAULT_SPEED = 2.15;

/** Requests opening or a closing-motion reversal and returns immutable action evidence. */
export function requestDoorOpen(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState === DOOR_STATES.LOCKED) {
		return receipt(door, false, 'open', fromState, 'door-locked', source);
	}
	if (!doorStateCanOpen(fromState)) {
		return receipt(door, false, 'open', fromState, `door-already-${fromState}`, source);
	}
	setDoorState(door, DOOR_STATES.OPENING, source);
	return receipt(door, true, 'open', fromState, 'opening-accepted', source);
}

/** Requests closing, validates the complete swing sweep, and records blockage explicitly. */
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

/** Locks only a fully closed doorway, keeping open/in-motion state physically coherent. */
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

/** Unlocks a locked doorway into the ordinary closed state. */
export function requestDoorUnlock(door, source = 'unknown') {
	const fromState = door.state;
	if (fromState !== DOOR_STATES.LOCKED) {
		return receipt(door, false, 'unlock', fromState, 'door-not-locked', source);
	}
	setDoorState(door, DOOR_STATES.CLOSED, source);
	return receipt(door, true, 'unlock', fromState, 'unlock-accepted', source);
}

/** Advances auto-close retry and eased progress without creating new presentation objects. */
export function updateDoorMotion(door, deltaTime) {
	const elapsed = Math.max(0, Number(deltaTime) || 0);
	updateAutoClose(door, elapsed);
	const direction = motionDirection(door.state);
	if (direction === 0) {
		return;
	}
	const previousProgress = door.t;
	const speed = finitePositive(door.def.openSpeed, DEFAULT_SPEED);
	door.t = clamp01(previousProgress + direction * elapsed * speed);
	settleDoorMotion(door);
	if (door.t !== previousProgress) {
		door.setPose();
	}
}

/** Changes canonical state and publishes one state transition event. */
export function setDoorState(door, nextState, source) {
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

function updateAutoClose(door, elapsed) {
	if (![DOOR_STATES.OPEN, DOOR_STATES.BLOCKED].includes(door.state) || door.autoCloseRemaining <= 0) {
		return;
	}
	door.autoCloseRemaining = Math.max(0, door.autoCloseRemaining - elapsed);
	if (door.autoCloseRemaining === 0) {
		requestDoorClose(door, 'auto-close');
	}
}

function settleDoorMotion(door) {
	if (door.t >= 1) {
		door.t = 1;
		setDoorState(door, DOOR_STATES.OPEN, 'motion-complete');
		door.autoCloseRemaining = finitePositive(door.def.autoCloseSeconds, 0);
		return;
	}
	if (door.t <= 0) {
		door.t = 0;
		setDoorState(door, DOOR_STATES.CLOSED, 'motion-complete');
	}
}

function motionDirection(state) {
	if (state === DOOR_STATES.OPENING) {
		return 1;
	}
	if (state === DOOR_STATES.CLOSING) {
		return -1;
	}
	return 0;
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

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
