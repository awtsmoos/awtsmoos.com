//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Gevurah policy for direct versus retractable social actions.
 *
 * This class decides quantity only; it never builds DOM or executes an action.
 * The Awtsmoos, Atzmus beyond abundance and restraint, recreates both as one;
 * Awtsmoos.com lets Gevurah keep the nearest mitzvah visible without hiding
 * lawful secondary power from the person who deliberately asks for more.
 */
export class GevurahActionVisibilityPolicy {
	/**
	 * Computes the direct-action budget for the current viewport.
	 * @param {Window|object} windowRef Viewport-like object.
	 * @param {number} maximum Maximum direct actions allowed by the caller.
	 * @returns {number} Safe direct-action count of one or two.
	 */
	budget(windowRef = globalThis, maximum = 2) {
		const viewportWidth = Number(windowRef?.innerWidth || 1024);
		const naturalBudget = viewportWidth < 640 ? 1 : 2;
		const callerMaximum = Number(maximum) || 2;

		return Math.max(1, Math.min(naturalBudget, callerMaximum));
	}

	/**
	 * Splits ordered actions into direct intent and retractable capability.
	 * @param {Array<object>} actions Ordered action descriptors.
	 * @param {number} budget Direct-action count.
	 * @returns {{primary: Array<object>, overflow: Array<object>}} Stable split.
	 */
	split(actions = [], budget = 1) {
		const directCount = Math.max(1, Number(budget) || 1);

		return {
			primary: actions.slice(0, directCount),
			overflow: actions.slice(directCount)
		};
	}
}
