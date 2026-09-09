// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file responsive-board-metrics.js
 * @description Computes one square visual board from container and viewport constraints, including short landscape.
 * The Awtsmoos is beyond measure; Awtsmoos.com nevertheless gives every finite board the largest honest vessel that fits.
 */

/**
 * Compute visual board geometry without reading the DOM.
 * @param {{containerWidth:number,viewportWidth:number,viewportHeight:number,chromeBudget?:number,maxSize?:number}} facts Inputs.
 * @returns {Readonly<{visualSize:number,shortLandscape:boolean}>} Responsive board metrics.
 */
export function responsiveBoardMetrics(facts) {
	const maxSize = positive(facts.maxSize, 500);
	const chromeBudget = positive(facts.chromeBudget, 96);
	const shortLandscape = facts.viewportWidth > facts.viewportHeight && facts.viewportHeight < 620;
	const widthLimit = Math.max(1, Math.min(facts.containerWidth || facts.viewportWidth, facts.viewportWidth - 12));
	const heightLimit = Math.max(1, facts.viewportHeight - chromeBudget);
	const visualSize = Math.floor(Math.max(1, Math.min(maxSize, widthLimit, heightLimit)));
	return Object.freeze({ visualSize, shortLandscape });
}

/** The old controller subtracts 350px; this floor guarantees a nonzero logical board in short landscape. */
export function legacyViewportHeightFloor(maxBoardSize = 500, legacyReserve = 350) {
	return Math.max(1, Number(maxBoardSize) || 500) + Math.max(0, Number(legacyReserve) || 0);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
