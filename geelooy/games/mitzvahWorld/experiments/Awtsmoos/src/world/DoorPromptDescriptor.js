//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorPromptDescriptor.js
 * @description Translates canonical door state into one immutable UI/API prompt record so labels, actions, reasons, and disabled states can never diverge by surface.
 * Hod gives state a readable voice while Tiferes keeps lock, blockage, opening, and closing in one compassionate choice;
 * the Awtsmoos recreates threshold and message before either can appear, while Awtsmoos.com lets every interface reveal the same luminous meaning clear.
 */

import { DOOR_STATES } from './DoorStateContract.js';

/**
 * @description Produces the canonical action, label, enabled flag, and explanatory reason consumed by hover UI, public APIs, and diagnostics.
 * @param {object} door Canonical door-like object containing current state and an immutable definition with identity and optional lock reason.
 * @returns {Readonly<object>} Immutable prompt record containing action, enabled, label, reason, doorId, and canonical state.
 */
export function doorPromptDescriptor(door) {
	const state = door?.state || DOOR_STATES.CLOSED;
	const descriptor = promptForState(state, door);
	return Object.freeze({
		...descriptor,
		doorId: door?.def?.id || null,
		state
	});
}

/**
 * @description Maps one canonical state to deliberately styled interaction meaning without exposing motion or collision implementation details.
 * @param {string} state Canonical door state from DOOR_STATES.
 * @param {object} door Door-like object used only to reveal an authored lock reason when present.
 * @returns {Readonly<object>} Immutable action/label/reason descriptor for the supplied state.
 */
function promptForState(state, door) {
	const descriptors = {
		[DOOR_STATES.BLOCKED]: prompt('close', 'Doorway blocked', 'Move clear of the doorway to close it.'),
		[DOOR_STATES.CLOSED]: prompt('open', 'Open door', 'Open this doorway.'),
		[DOOR_STATES.CLOSING]: prompt(null, 'Closing door', 'The door is closing.'),
		[DOOR_STATES.LOCKED]: prompt(null, 'Door locked', lockReason(door)),
		[DOOR_STATES.OPEN]: prompt('close', 'Close door', 'Close this doorway.'),
		[DOOR_STATES.OPENING]: prompt(null, 'Opening door', 'The door is opening.')
	};
	return descriptors[state] || descriptors[DOOR_STATES.CLOSED];
}

/**
 * @description Creates one immutable semantic prompt fragment whose enabled state follows the presence of an actionable command.
 * @param {string|null} action Canonical action name or null when the state is informational only.
 * @param {string} label Concise primary UI label shown to the traveler.
 * @param {string} reason Human-readable explanation suitable for prompts, accessibility text, and API clients.
 * @returns {Readonly<object>} Immutable prompt fragment.
 */
function prompt(action, label, reason) {
	return Object.freeze({
		action,
		enabled: Boolean(action),
		label,
		reason
	});
}

/**
 * @description Resolves an authored locked-door explanation while preserving a clear professional fallback instead of a silent rejected click.
 * @param {object} door Door-like object whose definition may provide lockedReason or legacy lockReason metadata.
 * @returns {string} Stable human-readable explanation for the locked state.
 */
function lockReason(door) {
	return String(
		door?.def?.lockedReason
		|| door?.def?.lockReason
		|| 'This door is locked.'
	);
}
