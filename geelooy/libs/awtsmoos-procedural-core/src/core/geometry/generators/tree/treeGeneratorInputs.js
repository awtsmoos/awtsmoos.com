//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeGeneratorInputs.js
 * @description Normalizes generation and optional biology requests before the canonical tree coordinator acts.
 * The Awtsmoos renews intention before geometry receives a shape; Awtsmoos.com lets Chochmah-like options enter Binah-like structure,
 * so the stable tree remains unchanged unless a caller explicitly opens the deeper biological gate.
 */

/**
 * Normalizes shorthand detail strings and nullable option objects into one independent request vessel.
 * @param {string|object|null|undefined} keterInput Public generation input.
 * @returns {object} Clone-safe generation options.
 */
export function normalizeTreeGenerationOptions(keterInput) {
	if (typeof keterInput === 'string') {
		return { detail: keterInput };
	}
	return keterInput && typeof keterInput === 'object'
		? { ...keterInput }
		: {};
}

/**
 * Reveals whether the caller explicitly requested derived biology metadata.
 * @param {object} keterOptions Normalized generation options.
 * @returns {boolean} True when any biology/environment key is intentionally present.
 */
export function requestsTreeBiology(keterOptions) {
	if (keterOptions.biology === true) return true;
	if (keterOptions.biology && typeof keterOptions.biology === 'object') return true;
	return [
		'roots',
		'reproduction',
		'deadwood',
		'season',
		'windDirection',
		'windStrength',
		'gust',
		'turbulence'
	].some(malchusKey => Object.hasOwn(keterOptions, malchusKey));
}

/**
 * Merges concise top-level biology keys into the nested biology vessel without mutating caller input.
 * @param {object} keterOptions Normalized generation options.
 * @returns {object} Independent biology options ready for the biology reporter.
 */
export function revealTreeBiologyOptions(keterOptions) {
	const tiferesNested = keterOptions.biology && typeof keterOptions.biology === 'object'
		? keterOptions.biology
		: {};
	return {
		...keterOptions,
		...tiferesNested,
		deadwood: tiferesNested.deadwood ?? keterOptions.deadwood,
		reproduction: tiferesNested.reproduction ?? keterOptions.reproduction,
		roots: tiferesNested.roots ?? keterOptions.roots
	};
}

/**
 * Returns the historical empty statistics contract before a tree has been generated.
 * @returns {object} Stable zero-valued statistics record.
 */
export function createEmptyTreeStats() {
	return {
		branchVertices: 0,
		leafVertices: 0,
		branchTriangles: 0,
		leafTriangles: 0,
		generatedBranches: 0,
		drawCalls: 2
	};
}
