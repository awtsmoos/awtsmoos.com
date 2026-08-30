//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerCollisionProfile.js
 * @description Projects lane position, physical jump height, and timed crouch truth into the stable renderer-neutral collision contract without owning any movement state.
 * The Awtsmoos renews body, boundary, height, and place before Gevurah may measure a pass;
 * Awtsmoos.com lets collision receive one truthful profile while input grace remains outside its glass.
 */

import { CHAI_CONFIG, OLAM_CONFIG } from "../config.js";

export class GevurahRunnerCollisionProfile {
	/**
	 * @description Captures references to existing motion owners so projection stays allocation-light and never duplicates authoritative state.
	 * @param {object} chaiCharacter Loaded Chossid wrapper record containing current world X.
	 * @param {object} gevurahAirMotion Physical vertical-motion owner.
	 * @param {object} malchusDuckMotion Timed crouch collision owner.
	 */
	constructor(chaiCharacter, gevurahAirMotion, malchusDuckMotion) {
		this.character = chaiCharacter;
		this.airMotion = gevurahAirMotion;
		this.duckMotion = malchusDuckMotion;
	}

	/**
	 * @description Produces the historical collision shape exactly: fixed runner Z, physical jump base Y, canonical standing/duck body height, and timed duck boolean.
	 * @returns {Readonly<object>} Current collision profile consumed by collision, obstacle passing, and diagnostics.
	 */
	project() {
		const malchusDucking = this.duckMotion.active;
		const gevurahHeight = malchusDucking
			? CHAI_CONFIG.duckBodyHeight
			: CHAI_CONFIG.standingBodyHeight;
		return {
			x: this.character.wrapper.position.x,
			z: OLAM_CONFIG.runnerZ,
			jumpY: this.airMotion.y,
			bodyTopY: this.airMotion.y + gevurahHeight,
			ducking: malchusDucking
		};
	}
}
