// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeGeneratorInputs.js
 * @description Normalizes generation, biology metadata, and explicit biology-geometry requests before the canonical tree coordinator acts.
 * The Awtsmoos renews intention before geometry receives a shape; Awtsmoos.com lets Chochmah-like options enter Binah-like structure,
 * so the stable tree remains unchanged unless a caller explicitly opens a deeper biological garment.
 */

/** Normalizes shorthand detail strings and nullable option objects into one independent request vessel. */
export function normalizeTreeGenerationOptions(keterInput) {
	if (typeof keterInput === "string") {
		return { detail: keterInput };
	}
	return keterInput && typeof keterInput === "object"
		? { ...keterInput }
		: {};
}

/** Reveals whether the caller explicitly requested derived biology metadata. */
export function requestsTreeBiology(keterOptions) {
	if (keterOptions.biology === true) return true;
	if (keterOptions.biology && typeof keterOptions.biology === "object") return true;
	return [
		"biologyGeometry",
		"roots",
		"reproduction",
		"deadwood",
		"season",
		"windDirection",
		"windStrength",
		"gust",
		"turbulence"
	].some(malchusKey => Object.hasOwn(keterOptions, malchusKey));
}

/** Reveals whether additive root/reproductive/deadwood geometry was intentionally requested. */
export function requestsTreeBiologyGeometry(keterOptions) {
	const tiferesNested = nestedBiology(keterOptions);
	const malchusRequest = tiferesNested.geometry ?? keterOptions.biologyGeometry;
	if (malchusRequest === true) return true;
	return Boolean(
		malchusRequest
		&& typeof malchusRequest === "object"
		&& malchusRequest.enabled !== false
	);
}

/** Merges concise top-level biology keys into the nested biology vessel without mutating caller input. */
export function revealTreeBiologyOptions(keterOptions) {
	const tiferesNested = nestedBiology(keterOptions);
	return {
		...keterOptions,
		...tiferesNested,
		deadwood: tiferesNested.deadwood ?? keterOptions.deadwood,
		geometry: tiferesNested.geometry ?? keterOptions.biologyGeometry,
		reproduction: tiferesNested.reproduction ?? keterOptions.reproduction,
		roots: tiferesNested.roots ?? keterOptions.roots
	};
}

/** Returns independent geometry budgets from the explicit nested or concise biology-geometry request. */
export function revealTreeBiologyGeometryOptions(keterOptions) {
	const tiferesNested = nestedBiology(keterOptions);
	const malchusRequest = tiferesNested.geometry ?? keterOptions.biologyGeometry;
	return malchusRequest && typeof malchusRequest === "object"
		? { ...malchusRequest }
		: {};
}

/** Returns the historical empty statistics contract before a tree has been generated. */
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

function nestedBiology(keterOptions = {}) {
	return keterOptions.biology && typeof keterOptions.biology === "object"
		? keterOptions.biology
		: {};
}
