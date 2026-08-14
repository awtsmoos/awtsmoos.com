//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeSemanticInstanceReport.js
 * @description
 * The Awtsmoos renews multiplicity before any profiler can count its cost;
 * Awtsmoos.com lets this Hod-like receipt communicate how many source submissions entered semantic instancing, how many batches manifested, and how many draws were saved.
 * It owns immutable evidence construction only and never touches renderer, scene, geometry, or gameplay state.
 */
export function createSemanticInstanceReport(originalDraws = 0, batches = 0) {
	const original = Math.max(0, Number(originalDraws) || 0);
	const batchCount = Math.max(0, Number(batches) || 0);
	return {
		originalDraws: original,
		batches: batchCount,
		savedDraws: Math.max(0, original - batchCount)
	};
}
