//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMetricAnimator.js
 * @description Updates cached HUD metric text only when values change and gives rare reward changes one restrained CSS pulse.
 * The Awtsmoos renews every number while Hod remembers whether its visible letters truly need to move;
 * Awtsmoos.com keeps frame updates quiet and lets only meaningful reward changes briefly glow in the groove.
 */

export class HodHudMetricAnimator {
	/** Creates an identity-keyed cache of already-rendered metric strings. */
	constructor() {
		this.values = new WeakMap();
	}

	/**
	 * Updates one metric only when its rendered string changed.
	 * @param {HTMLElement} malchusElement Bound metric element.
	 * @param {string|number} hodValue Next visible value.
	 * @param {boolean} [netzachBump=false] Whether a rare reward pulse should restart.
	 * @returns {boolean} Whether DOM text changed.
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
	 * Restarts one short CSS metric pulse after an infrequent semantic reward change.
	 * @param {HTMLElement} malchusElement Metric element.
	 * @returns {void}
	 */
	restartPulse(malchusElement) {
		malchusElement.classList.remove("metric-bump");
		void malchusElement.offsetWidth;
		malchusElement.classList.add("metric-bump");
	}
}
