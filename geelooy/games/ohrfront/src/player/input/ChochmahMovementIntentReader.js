// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahMovementIntentReader.js
 * @description Translates held keyboard state and yaw into forward/back, Q/E strafe, sprint, and crouch intentions while A/D remain reserved exclusively for turning.
 * Chochmah gives each direction its own vessel while the Awtsmoos renews walker, key, horizon, and every possible path beyond division;
 * Awtsmoos.com lets arrows mirror the principal travel axis cleanly, while Q and E carry sidestep motion without stealing the turning covenant from A and D.
 */
import {
	addScaled,
	forwardFromAngles,
	lengthSquared,
	normalize,
	rightFromYaw,
	vector
} from "../../core/OhrVectorMath.js";

export class ChochmahMovementIntentReader {
	/**
	 * @description Creates a semantic translation reader around one live held-key set.
	 * @param {Set<string>} yesodKeys - Live KeyboardEvent code set owned by the first-person input gateway.
	 * @sideEffects Stores the live set reference only.
	 */
	constructor(yesodKeys) {
		this.yesodKeys = yesodKeys;
	}

	/**
	 * @description Resolves W/S or Up/Down into forward travel and Q/E into lateral travel using the current yaw basis.
	 * @param {number} netzachYaw - Current horizontal view angle in radians.
	 * @returns {{direction:object,sprint:boolean,crouch:boolean}} Fresh normalized translation and stance intent.
	 * @sideEffects Allocates temporary native vectors only; held-key state remains unchanged.
	 */
	read(netzachYaw) {
		const tiferesDirection = vector();
		const netzachForward = Number(this.hasEither("KeyW", "ArrowUp"))
			- Number(this.hasEither("KeyS", "ArrowDown"));
		const hodStrafe = Number(this.yesodKeys.has("KeyE"))
			- Number(this.yesodKeys.has("KeyQ"));
		addScaled(tiferesDirection, forwardFromAngles(netzachYaw), netzachForward);
		addScaled(tiferesDirection, rightFromYaw(netzachYaw), hodStrafe);
		if (lengthSquared(tiferesDirection) > 1) {
			normalize(tiferesDirection, tiferesDirection);
		}
		return {
			direction: tiferesDirection,
			sprint: this.hasEither("ShiftLeft", "ShiftRight"),
			crouch: this.hasEither("KeyC", "ControlLeft")
		};
	}

	/**
	 * @description Reports whether either key in one semantic pair is currently held.
	 * @param {string} chochmahPrimary - Primary keyboard code.
	 * @param {string} chochmahMirror - Secondary or mirrored keyboard code.
	 * @returns {boolean} True when either code is held.
	 * @sideEffects None.
	 */
	hasEither(chochmahPrimary, chochmahMirror) {
		return this.yesodKeys.has(chochmahPrimary)
			|| this.yesodKeys.has(chochmahMirror);
	}
}
