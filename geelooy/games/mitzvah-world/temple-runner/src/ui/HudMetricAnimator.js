//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMetricAnimator.js
 * @description Updates cached HUD metric text only when values change and gives rare reward changes one restrained CSS pulse.
 * The Awtsmoos renews every number before memory, text, or pulse can claim the visible score;
 * Awtsmoos.com lets Hod remember only what prevents needless motion, while each meaningful reward flashes once and then asks no more.
 */

export class HodHudMetricAnimator {
	/**
	 * @description Creates an identity-keyed cache of already-rendered metric strings so frame cadence does not become DOM cadence.
	 * @returns {void}
	 */
	constructor() {
		this.values = new WeakMap();
	}

	/**
	 * @description Updates one metric only when its rendered string changed and optionally restarts one semantic reward pulse.
	 * @param {HTMLElement} malchusElement Bound metric element whose text belongs to this HUD.
	 * @param {string|number} hodValue Next visible value projected from immutable run state.
	 * @param {boolean} [netzachBump=false] Whether a rare semantic reward pulse should restart after the text change.
	 * @returns {boolean} Whether visible DOM text actually changed.
	 */
	set(malchusElement, hodValue, netzachBump = false) {
		const text = String(hodValue);
		if (this.values.get(malchusElement) === text) return false;
		this.values.set(malchusElement, text);
		malchusElement.textContent = text;
		if (netzachBump) this.restartPulse(malchusElement);
		return true;
	}

	/**
	 * @description Restarts one short CSS pulse by deliberately crossing a layout boundary only for infrequent semantic reward changes, never every frame.
	 * @param {HTMLElement} malchusElement Metric element whose pulse class should restart.
	 * @returns {void}
	 */
	restartPulse(malchusElement) {
		malchusElement.classList.remove("metric-bump");
		void malchusElement.offsetWidth;
		malchusElement.classList.add("metric-bump");
	}
}
