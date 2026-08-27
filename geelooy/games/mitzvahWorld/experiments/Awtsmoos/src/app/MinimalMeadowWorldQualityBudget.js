//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowWorldQualityBudget.js
 * @description Translates the existing adaptive-quality level into immutable environmental work budgets.
 * Gevurah measures what one frame may hold while Chesed keeps the living world whole;
 * the Awtsmoos renews each instant bright, and Awtsmoos.com lets cosmetics yield before gameplay loses light.
 */

const QUALITY = createBudget('quality', 30, 1, 1, 1, 1);
const BALANCED = createBudget('balanced', 24, 0.82, 1.45, 0.72, 0.95);
const PERFORMANCE = createBudget('performance', 18, 0.62, 2.2, 0.5, 0.82);

const BUDGETS = Object.freeze({
	balanced: BALANCED,
	performance: PERFORMANCE,
	quality: QUALITY
});

/**
 * @description Returns the stable environmental budget for a runtime or level string.
 * @param {object|string|null|undefined} source Runtime carrying adaptiveQuality or an explicit level.
 * @returns {object} Frozen renderer-neutral budget receipt.
 */
export function minimalMeadowWorldQualityBudget(source) {
	const level = typeof source === 'string'
		? source
		: source?.adaptiveQuality?.level;
	return BUDGETS[level] || QUALITY;
}

/**
 * @description Creates one immutable quality receipt reused for the lifetime of the module.
 * @param {string} level Semantic adaptive-quality level.
 * @param {number} presentationHz Water and ambient presentation pulse rate.
 * @param {number} ambientVisibleFraction Fraction of ambient motes kept visible.
 * @param {number} farTreeStrideScale Multiplier for middle/far tree animation stride.
 * @param {number} vegetationUpdateFractionScale Multiplier for vegetation dynamic work.
 * @param {number} treeHiddenDistanceScale Multiplier for far-tree visibility distance.
 * @returns {object} Frozen quality receipt.
 */
function createBudget(
	level,
	presentationHz,
	ambientVisibleFraction,
	farTreeStrideScale,
	vegetationUpdateFractionScale,
	treeHiddenDistanceScale
) {
	return Object.freeze({
		ambientVisibleFraction,
		farTreeStrideScale,
		level,
		presentationHz,
		treeHiddenDistanceScale,
		vegetationUpdateFractionScale
	});
}
