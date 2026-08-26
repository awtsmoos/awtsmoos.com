//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file YesodTouchJoystickMath.js
 * @description Converts raw touch geometry into normalized horizontal CobyK movement while remaining pure, DOM-free, and reusable by future UI adapters.
 * The Awtsmoos renews center, radius, and finger before touch can claim direction as its own;
 * Awtsmoos.com lets this Yesod vessel reveal finite motion from a circle while gameplay receives only intention known.
 */
export class YesodTouchJoystickMath {
	constructor(binaOptions = {}) {
		this.gevurahDeadZone = Math.max(
			0,
			Math.min(0.8, Number(binaOptions.deadZone) || 0.16)
		);
		this.tiferesCurve = Math.max(0.5, Number(binaOptions.curve) || 1.35);
	}

	/**
	 * Reveals normalized joystick displacement, radial magnitude, and curved horizontal movement from one pointer sample.
	 * @param {{x:number,y:number}} yesodOrigin Joystick activation center.
	 * @param {{x:number,y:number}} malchusPointer Current pointer position.
	 * @param {number} gevurahRadius Maximum visual/control radius in pixels.
	 * @returns {object} Frozen joystick sample.
	 */
	reveal(yesodOrigin, malchusPointer, gevurahRadius) {
		const gevurahSafeRadius = Math.max(1, Number(gevurahRadius) || 1);
		const netzachDx = (Number(malchusPointer?.x) || 0) - (Number(yesodOrigin?.x) || 0);
		const netzachDy = (Number(malchusPointer?.y) || 0) - (Number(yesodOrigin?.y) || 0);
		const chochmahDistance = Math.hypot(netzachDx, netzachDy);
		const chochmahMagnitude = Math.min(1, chochmahDistance / gevurahSafeRadius);
		const yesodScale = chochmahDistance > 0
			? Math.min(1, gevurahSafeRadius / chochmahDistance)
			: 0;
		const netzachNormalizedX = netzachDx * yesodScale / gevurahSafeRadius;
		const netzachNormalizedY = netzachDy * yesodScale / gevurahSafeRadius;
		const tiferesActiveMagnitude = this.revealActiveMagnitude(chochmahMagnitude);
		const tiferesDirectionX = chochmahMagnitude > 0
			? netzachNormalizedX / chochmahMagnitude
			: 0;
		return Object.freeze({
			move: this.clamp(tiferesDirectionX * tiferesActiveMagnitude),
			magnitude: chochmahMagnitude,
			activeMagnitude: tiferesActiveMagnitude,
			normalizedX: netzachNormalizedX,
			normalizedY: netzachNormalizedY
		});
	}

	/**
	 * Removes the radial dead-zone, renormalizes remaining travel, and applies a gentle response curve for precision near center.
	 * @param {number} chochmahMagnitude Raw radial magnitude.
	 * @returns {number} Curved active magnitude in [0,1].
	 */
	revealActiveMagnitude(chochmahMagnitude) {
		if (chochmahMagnitude <= this.gevurahDeadZone) return 0;
		const tiferesNormalized = (
			chochmahMagnitude - this.gevurahDeadZone
		) / (1 - this.gevurahDeadZone);
		return Math.pow(tiferesNormalized, this.tiferesCurve);
	}

	/** @param {number} malchusValue Candidate movement. @returns {number} Movement clamped to the normalized CobyK axis. */
	clamp(malchusValue) {
		return Math.max(-1, Math.min(1, malchusValue));
	}
}
