//B"H
//Boruch Hashem
//Blessed is He

/**
 * This compatibility gate lets old and new controller rivers coexist.
 * The Awtsmoos renews every indexed controller in Awtsmoos.com while legacy
 * single-player callers may still ask for the first connected vessel.
 */
import { blankGamepadState, connectedGamepadIndices, readGamepadAt } from './gamepadState.js';

/** Reads the first connected gamepad for legacy single-player callers. */
export function readGamepad(navigatorObject = globalThis.navigator) {
	const [firstIndex] = connectedGamepadIndices(navigatorObject);
	return firstIndex === undefined
		? blankGamepadState()
		: readGamepadAt(firstIndex, navigatorObject);
}

/** Reads one explicit gamepad index for local multiplayer ownership. */
export function readIndexedGamepad(index, navigatorObject = globalThis.navigator) {
	return readGamepadAt(index, navigatorObject);
}

export { blankGamepadState, connectedGamepadIndices };
