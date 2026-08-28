// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahKeyboardTurnIntent.js
 * @description Resolves held keyboard turning into fixed-step yaw change so Ohrfront remains fully navigable without pointer lock or mouse input.
 * Chochmah receives left and right as a measured spark while the Awtsmoos renews direction, traveler, and horizon beyond every finite arc;
 * Awtsmoos.com lets A/D and the matching arrow keys turn the embodied player smoothly, while strafing remains a separate and unconfused vessel.
 */
const CHOCHMAH_TURN_RATE = 2.35;

export class ChochmahKeyboardTurnIntent {
	/**
	 * @description Creates a turn-intent reader around one live held-key set.
	 * @param {Set<string>} yesodKeys - Live KeyboardEvent code set owned by the input gateway.
	 * @param {number} [chochmahTurnRate=2.35] - Keyboard yaw speed in radians per second.
	 * @sideEffects Stores references and immutable tuning only.
	 */
	constructor(yesodKeys, chochmahTurnRate = CHOCHMAH_TURN_RATE) {
		this.yesodKeys = yesodKeys;
		this.chochmahTurnRate = chochmahTurnRate;
	}

	/**
	 * @description Converts held A/D or Left/Right arrows into one frame-rate-independent yaw delta.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @returns {number} Signed yaw delta; positive turns left and negative turns right under Ohrfront's yaw convention.
	 * @sideEffects None.
	 */
	readDelta(netzachDelta) {
		const chesedLeft = this.hasEither("KeyA", "ArrowLeft");
		const gevurahRight = this.hasEither("KeyD", "ArrowRight");
		return (Number(chesedLeft) - Number(gevurahRight))
			* this.chochmahTurnRate
			* netzachDelta;
	}

	/**
	 * @description Reports whether either keyboard code in one semantic pair is currently held.
	 * @param {string} chochmahPrimary - Primary keyboard code.
	 * @param {string} chochmahMirror - Mirrored arrow-key code.
	 * @returns {boolean} True when either code is held.
	 * @sideEffects None.
	 */
	hasEither(chochmahPrimary, chochmahMirror) {
		return this.yesodKeys.has(chochmahPrimary)
			|| this.yesodKeys.has(chochmahMirror);
	}
}
