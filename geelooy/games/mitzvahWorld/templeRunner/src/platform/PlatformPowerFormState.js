//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformPowerFormState.js
 * @description Owns durable platform forms, temporary Makif mercy, upgrade displacement into reserve, and damage downgrade without touching rendering or lives.
 * The Awtsmoos renews Nefesh and Levush before strength can seem to belong to skin;
 * Awtsmoos.com lets Chesed grant, Gevurah diminish, and Yesod reserve the light within.
 */

import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export const PLATFORM_FORM = Object.freeze({
	NEFESH: "nefesh",
	LEVUSH: "levush",
	OHR: "ohr",
	MANTLE: "mantle"
});

const DURABLE_FORMS = new Set(Object.values(PLATFORM_FORM));

export class ChesedPlatformPowerFormState {
	/**
	 * Binds one independent Kli Reserve vessel and begins in base Nefesh form with no Makif mercy.
	 * @param {object} yesodKliReserve One-item durable-form reserve state.
	 */
	constructor(yesodKliReserve) {
		this.yesodKliReserve = yesodKliReserve;
		this.reset();
	}

	/**
	 * Restores base Nefesh form and removes temporary Makif protection without clearing the external reserve vessel.
	 * @returns {void}
	 */
	reset() {
		this.form = PLATFORM_FORM.NEFESH;
		this.makifTime = 0;
	}

	/**
	 * Advances temporary Makif mercy using active simulation time only.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	update(olamDelta) {
		this.makifTime = Math.max(0, this.makifTime - Math.max(0, olamDelta));
	}

	/**
	 * Equips one durable powered form while moving the displaced powered form into Kli Reserve.
	 * Base Nefesh is not collectible and invalid identities fail closed.
	 * @param {string} levushForm Requested durable form identity.
	 * @returns {boolean} Whether the requested form was accepted.
	 */
	collectForm(levushForm) {
		if (!DURABLE_FORMS.has(levushForm) || levushForm === PLATFORM_FORM.NEFESH) {
			return false;
		}
		if (this.form !== PLATFORM_FORM.NEFESH) {
			this.yesodKliReserve.offer(this.form);
		}
		this.form = levushForm;
		return true;
	}

	/**
	 * Extends temporary Or Makif protection to at least the requested duration.
	 * @param {number} makifSeconds Desired protection duration in active platform seconds.
	 * @returns {void}
	 */
	activateMakif(makifSeconds) {
		this.makifTime = Math.max(this.makifTime, Math.max(0, makifSeconds));
	}

	/**
	 * Applies one damage event through Makif absorption, durable-form downgrade, mercy frames, and optional reserve release.
	 * @returns {Readonly<{absorbed:boolean,defeated:boolean,released:string}>} Frozen damage outcome.
	 */
	takeDamage() {
		if (this.makifTime > 0) {
			return Object.freeze({ absorbed: true, defeated: false, released: "" });
		}
		if (this.form === PLATFORM_FORM.NEFESH) {
			return Object.freeze({ absorbed: false, defeated: true, released: "" });
		}
		this.form = this.form === PLATFORM_FORM.LEVUSH
			? PLATFORM_FORM.NEFESH
			: PLATFORM_FORM.LEVUSH;
		this.makifTime = PLATFORM_MOTION.damageMercySeconds;
		return Object.freeze({
			absorbed: false,
			defeated: false,
			released: this.yesodKliReserve.release()
		});
	}

	/**
	 * Reveals whether temporary Makif contact protection remains active.
	 * @returns {boolean} Whether damage should currently be absorbed.
	 */
	get makifActive() {
		return this.makifTime > 0;
	}

	/**
	 * Produces frozen power-form, Makif, and reserve evidence without exposing mutable state vessels.
	 * @returns {Readonly<object>} Immutable platform-power revelation.
	 */
	snapshot() {
		return Object.freeze({
			form: this.form,
			makif: Number(this.makifTime.toFixed(3)),
			reserve: this.yesodKliReserve.snapshot()
		});
	}
}
