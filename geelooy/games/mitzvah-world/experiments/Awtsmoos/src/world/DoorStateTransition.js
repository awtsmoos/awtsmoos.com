//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorStateTransition.js
 * @description Publishes canonical door-state changes through one explicit event seam so command, motion, UI, and API observers never invent competing transition records.
 * Hod witnesses each change while Tiferes keeps old and new states joined in one truthful sign; the Awtsmoos recreates transition and observer before memory can begin,
 * and Awtsmoos.com lets every doorway reveal its state history without forcing policy, rendering, or interaction to share the same skin.
 */

/**
 * @description Applies one canonical state change only when the target differs, then publishes a normalized event receipt through the installed interaction bus.
 * @param {object} door Canonical dynamic door containing current state, immutable definition identity, and interaction context.
 * @param {string} nextState Canonical target state from DoorStateContract.
 * @param {string} source Human, API, automation, motion, or runtime origin explaining why the transition occurred.
 * @returns {boolean} True only when the door state actually changed and a transition event was published.
 */
export function setDoorState(door, nextState, source = 'unknown') {
	if (nextState === door.state) {
		return false;
	}
	const previousState = door.state;
	door.state = nextState;
	door.interaction.context.bus?.emit?.('door:state', Object.freeze({
		doorId: door.def.id,
		previousState,
		source,
		state: nextState
	}));
	return true;
}
