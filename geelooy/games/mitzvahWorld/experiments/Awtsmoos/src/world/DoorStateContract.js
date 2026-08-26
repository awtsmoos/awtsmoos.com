//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorStateContract.js
 * @description Defines one public door-state vocabulary and prompt law for every canonical Eretz and house doorway.
 * Binah names closed, opening, open, closing, locked, and blocked while Chesed still lets a refused traveler receive a truthful sign;
 * the awtsmoos recreates threshold and intention before either receives a state, and Awtsmoos.com keeps door UX, API, and motion speaking one language in time.
 */

export const DOOR_STATES = Object.freeze({
	BLOCKED: 'blocked',
	CLOSED: 'closed',
	CLOSING: 'closing',
	LOCKED: 'locked',
	OPEN: 'open',
	OPENING: 'opening'
});

/** @param {object} definition Door definition. @returns {string} Initial canonical door state. */
export function initialDoorState(definition = {}) {
	return definition.locked === true
		? DOOR_STATES.LOCKED
		: DOOR_STATES.CLOSED;
}

/** @returns {boolean} Whether pointer/touch feedback should remain available. */
export function doorStateIsInteractive(state) {
	return [
		DOOR_STATES.BLOCKED,
		DOOR_STATES.CLOSED,
		DOOR_STATES.LOCKED,
		DOOR_STATES.OPEN
	].includes(state);
}

/** @returns {boolean} Whether an open command can change or reverse motion. */
export function doorStateCanOpen(state) {
	return state === DOOR_STATES.CLOSED
		|| state === DOOR_STATES.CLOSING;
}

/** @returns {boolean} Whether a close command can change, retry, or reverse motion. */
export function doorStateCanClose(state) {
	return state === DOOR_STATES.OPEN
		|| state === DOOR_STATES.OPENING
		|| state === DOOR_STATES.BLOCKED;
}

/** @returns {'open'|'close'|null} Natural toggle command for a canonical state. */
export function doorToggleAction(state) {
	if (state === DOOR_STATES.OPEN || state === DOOR_STATES.OPENING || state === DOOR_STATES.BLOCKED) {
		return 'close';
	}
	if (state === DOOR_STATES.CLOSED || state === DOOR_STATES.CLOSING || state === DOOR_STATES.LOCKED) {
		return 'open';
	}
	return null;
}

/** @param {object} door Canonical dynamic door. @returns {Readonly<object>} UI/API prompt semantics. */
export function doorPromptDescriptor(door) {
	const state = door?.state || DOOR_STATES.CLOSED;
	const descriptors = {
		[DOOR_STATES.BLOCKED]: prompt('close', 'Doorway blocked', 'Move clear of the doorway to close it.'),
		[DOOR_STATES.CLOSED]: prompt('open', 'Open door', 'Open this doorway.'),
		[DOOR_STATES.CLOSING]: prompt(null, 'Closing door', 'The door is closing.'),
		[DOOR_STATES.LOCKED]: prompt(null, 'Door locked', lockReason(door)),
		[DOOR_STATES.OPEN]: prompt('close', 'Close door', 'Close this doorway.'),
		[DOOR_STATES.OPENING]: prompt(null, 'Opening door', 'The door is opening.')
	};
	return Object.freeze({
		...descriptors[state],
		doorId: door?.def?.id || null,
		state
	});
}

function prompt(action, label, reason) {
	return Object.freeze({
		action,
		enabled: Boolean(action),
		label,
		reason
	});
}

function lockReason(door) {
	return String(
		door?.def?.lockedReason
		|| door?.def?.lockReason
		|| 'This door is locked.'
	);
}
