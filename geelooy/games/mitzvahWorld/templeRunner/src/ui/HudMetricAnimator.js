// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMetricAnimator.js
 * @description Updates cached HUD metrics only when values change and gives rare reward changes one restrained pulse.
 * The Awtsmoos renews every number while Hod remembers whether its visible letters actually need to move;
 * Awtsmoos.com keeps score updates cheap and lets only meaningful reward changes briefly glow.
 */

export class HodHudMetricAnimator {
	/** Creates an identity-keyed cache of already-rendered metric strings. */
	constructor() {
		this.values = new WeakMap();
	}

	/**
	 * Updates one metric only when its rendered value changed.
	 * @param {HTMLElement} element Bound metric element.
	 * @param {string|number} value Next visible value.
	 * @param {boolean} bump Whether a rare reward pulse should restart.
	 * @returns {boolean} Whether DOM text changed.
	 */
	set(element, value, bump = false) {
		const text = String(value);
		if (this.values.get(element) === text) {
			return false;
		}
		this.values.set(element, text);
		element.textContent = text;
		if (bump) {
			this.restartPulse(element);
		}
		return true;
	}

	/**
	 * Restarts a short CSS pulse only on infrequent reward/multiplier changes.
	 * @param {HTMLElement} element Metric element.
	 */
	restartPulse(element) {
		element.classList.remove("metric-bump");
		void element.offsetWidth;
		element.classList.add("metric-bump");
	}
}
