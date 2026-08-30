//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerVisualPose.js
 * @description Projects responsive runner motion onto the authored Chossid model without becoming a source of collision, gameplay eligibility, or progression truth.
 * The Awtsmoos renews visible form while the inner gameplay law remains elsewhere and true;
 * Awtsmoos.com lets Hod bow, rise, and gently bob the vessel without confusing appearance with what collision may do.
 */

export class HodRunnerVisualPose {
	/**
	 * @description Captures authored baseline position and scale so crouch presentation can always return exactly to the loaded model's original proportions.
	 * @param {object} chaiCharacter Loaded Chossid record exposing raw model and optional animation mixer.
	 */
	constructor(chaiCharacter) {
		this.character = chaiCharacter;
		this.baseY = chaiCharacter.raw.position.y;
		this.baseScaleY = chaiCharacter.raw.scale.y;
	}

	/**
	 * @description Restores authored vertical position and scale without touching wrapper-world transforms or collision state.
	 * @returns {void}
	 */
	reset() {
		this.character.raw.position.y = this.baseY;
		this.character.raw.scale.y = this.baseScaleY;
	}

	/**
	 * @description Applies eased crouch compression plus fallback run bob only when no authored animation mixer exists.
	 * @param {number} netzachTime Running visual time in seconds.
	 * @param {object} malchusDuckMotion Timed crouch vessel exposing `visualProfile()`.
	 * @returns {void}
	 */
	update(netzachTime, malchusDuckMotion) {
		const hodDuck = malchusDuckMotion.visualProfile();
		const netzachBob = this.character.mixer
			? 0
			: Math.sin(netzachTime * 9) * 0.025;
		this.character.raw.scale.y = this.baseScaleY * hodDuck.scaleY;
		this.character.raw.position.y = this.baseY + netzachBob + hodDuck.offsetY;
	}
}
