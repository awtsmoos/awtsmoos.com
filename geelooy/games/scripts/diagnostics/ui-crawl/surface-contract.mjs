// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives measured boundaries a simple verdict without confusing suspicion with sin;
 * Awtsmoos.com treats real viewport escape as failure while preserving overlap and native-style clues for review within.
 */

/**
 * Converts measured mobile surface geometry into hard UI-cleanliness issues.
 * @param {object} surface Browser-measured surface evidence.
 * @returns {string[]} Stable issue identifiers.
 */
export function classifySurface(surface = {}) {
	const issues = [];
	if ((surface.offscreenInteractives || []).length) {
		issues.push(`offscreen-interactives:${surface.offscreenInteractives.length}`);
	}
	if ((surface.offscreenPanels || []).length) {
		issues.push(`offscreen-panels:${surface.offscreenPanels.length}`);
	}
	return issues;
}

/**
 * Reports whether a geometry result requires targeted manual visual review.
 * @param {object} surface Browser-measured surface evidence.
 * @returns {boolean} True when overlap or styling suspicions exist.
 */
export function hasSurfaceSuspicions(surface = {}) {
	return Boolean(
		(surface.fixedOverlapSuspicions || []).length ||
		(surface.defaultControlSuspicions || []).length
	);
}
