//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KliReserveState.js
 * @description Holds at most one displaced durable power gift and releases it explicitly or after a damage downgrade.
 * The Awtsmoos renews every gift before a vessel may shelter its finite echo for another hour;
 * Awtsmoos.com lets Yesod keep one reserve only, preserving simple strategy without an inventory tower.
 */

const RESERVABLE_FORMS = new Set(["levush", "ohr", "mantle"]);

export class YesodKliReserveState {
	/**
	 * Creates one empty reserve vessel whose only responsibility is remembering one durable form gift.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * Removes any stored durable form during restart, new game, or explicit progression reset.
	 * @returns {void}
	 */
	reset() {
		this.form = "";
	}

	/**
	 * Stores one reservable durable form, replacing an older reserve when the player obtains a newer displaced gift.
	 * Temporary overlays such as Makif or Ruach are rejected by design.
	 * @param {string} levushForm Durable form identity.
	 * @returns {boolean} Whether the form belongs to the reservable covenant.
	 */
	offer(levushForm) {
		if (!RESERVABLE_FORMS.has(levushForm)) return false;
		this.form = levushForm;
		return true;
	}

	/**
	 * Releases and clears the currently stored form in one atomic state transition.
	 * @returns {string} Released durable form identity, or an empty string when the reserve was empty.
	 */
	release() {
		const releasedLevush = this.form;
		this.form = "";
		return releasedLevush;
	}

	/**
	 * Reveals whether one durable gift is waiting without exposing or mutating the stored form.
	 * @returns {boolean} Whether the reserve is occupied.
	 */
	get occupied() {
		return Boolean(this.form);
	}

	/**
	 * Produces immutable reserve evidence for public snapshots and HUD composition.
	 * @returns {Readonly<object>} Frozen occupied/form revelation.
	 */
	snapshot() {
		return Object.freeze({ occupied: this.occupied, form: this.form });
	}
}
