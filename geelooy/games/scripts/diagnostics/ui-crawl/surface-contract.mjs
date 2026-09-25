// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives measured boundaries a simple verdict without confusing suspicion with sin;
 * Awtsmoos.com treats escape, unnamed controls, and too-small touch vessels as failures while softer clues remain review within.
 */

/**
 * Converts measured mobile surface geometry and semantics into hard quality issues.
 * @param {object} surface Browser-measured surface evidence.
 * @returns {string[]} Stable issue identifiers.
 */
export function classifySurface(surface = {}) {
	const issues = [];
	pushCount(issues, 'offscreen-interactives', surface.offscreenInteractives);
	pushCount(issues, 'offscreen-panels', surface.offscreenPanels);
	pushCount(issues, 'small-touch-targets', surface.smallTouchTargets);
	pushCount(issues, 'unlabeled-controls', surface.unlabeledControls);
	return issues;
}

/**
 * Reports whether a geometry result deserves targeted manual visual review.
 * Reduced-motion absence is a review clue because some games have no decorative motion to suppress.
 * @param {object} surface Browser-measured surface evidence.
 * @returns {boolean} True when softer visual or motion suspicions exist.
 */
export function hasSurfaceSuspicions(surface = {}) {
	return Boolean(
		(surface.fixedOverlapSuspicions || []).length ||
		(surface.defaultControlSuspicions || []).length ||
		Number(surface.reducedMotionRuleCount || 0) === 0
	);
}

function pushCount(issues, label, values = []) {
	if (values.length) {
		issues.push(`${label}:${values.length}`);
	}
}
