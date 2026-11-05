//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorStateContract.js
 * @description Defines the canonical door-state vocabulary and pure transition eligibility law without carrying UI wording, collision safety, or event publication.
 * Binah names every threshold state while Gevurah decides which directions remain lawful; the Awtsmoos recreates state and possibility before either can divide,
 * and Awtsmoos.com keeps this vocabulary pure enough that physics, API, UI, and diagnostics may all drink from the same tide.
 */

export const DOOR_STATES = Object.freeze({
	BLOCKED: 'blocked',
	CLOSED: 'closed',
	CLOSING: 'closing',
	LOCKED: 'locked',
	OPEN: 'open',
	OPENING: 'opening'
});

/**
 * @description Chooses the first canonical state from immutable definition metadata so lock truth exists before any interaction surface is installed.
 * @param {object} definition Door definition containing optional locked and initialProgress metadata.
 * @returns {string} Canonical initial door state from DOOR_STATES.
 */
export function initialDoorState(definition = {}) {
	return definition.locked === true
		? DOOR_STATES.LOCKED
		: DOOR_STATES.CLOSED;
}

/**
 * @description Reveals whether a doorway should remain pointer/touch explainable, including locked and blocked states that must communicate refusal deliberately.
 * @param {string} state Canonical state to evaluate.
 * @returns {boolean} True when UI interaction feedback should remain available.
 */
export function doorStateIsInteractive(state) {
	return [
		DOOR_STATES.BLOCKED,
		DOOR_STATES.CLOSED,
		DOOR_STATES.LOCKED,
		DOOR_STATES.OPEN
	].includes(state);
}

/**
 * @description Determines whether an open command may begin opening or reverse an in-progress close without bypassing the separate locked-state policy.
 * @param {string} state Canonical state to evaluate.
 * @returns {boolean} True when an open command may change motion state.
 */
export function doorStateCanOpen(state) {
	return state === DOOR_STATES.CLOSED
		|| state === DOOR_STATES.CLOSING;
}

/**
 * @description Determines whether a close command may begin closing, retry a blocked close, or reverse an in-progress opening motion.
 * @param {string} state Canonical state to evaluate.
 * @returns {boolean} True when a close command may enter safety evaluation or change motion state.
 */
export function doorStateCanClose(state) {
	return state === DOOR_STATES.OPEN
		|| state === DOOR_STATES.OPENING
		|| state === DOOR_STATES.BLOCKED;
}

/**
 * @description Resolves the natural command behind a user-facing toggle while preserving explicit open/close APIs for deterministic automation.
 * @param {string} state Canonical state whose natural toggle direction should be chosen.
 * @returns {'open'|'close'|null} Natural command, or null when no canonical direction exists.
 */
export function doorToggleAction(state) {
	if ([
		DOOR_STATES.OPEN,
		DOOR_STATES.OPENING,
		DOOR_STATES.BLOCKED
	].includes(state)) {
		return 'close';
	}
	if ([
		DOOR_STATES.CLOSED,
		DOOR_STATES.CLOSING,
		DOOR_STATES.LOCKED
	].includes(state)) {
		return 'open';
	}
	return null;
}
