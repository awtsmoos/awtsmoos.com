// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeOutputReport.js
 * @description Assembles historical tree geometry plus optional metadata and additive biological manifestation into one stable public result.
 * The Awtsmoos renews branch, leaf, measure, hidden biology, and optional visible biology before one output object can appear;
 * Awtsmoos.com keeps Malchus backward-compatible while deeper garments remain explicit and freely ignorable.
 */

import {
	computeTreeBounds,
	createTreeBranchArrays,
	createTreeLeafArrays,
	estimateTreePackedBytes
} from "./treeOutputMetrics.js";
import { createTreeTrellisReport } from "./treeTrellisField.js";

/** Creates the backward-compatible public tree output with explicitly opt-in additive biology geometry. */
export function createTreeOutput(
	keterConfig,
	yesodBuilder,
	tiferesSystem,
	hodDetail,
	chochmahBiology = null,
	daasBiologyGeometry = null
) {
	const malchusBranches = {
		...createTreeBranchArrays(yesodBuilder),
		material: keterConfig.bark
	};
	const binahLeaves = {
		...createTreeLeafArrays(yesodBuilder),
		material: keterConfig.leaves
	};
	const gevurahStats = createTreeStatistics(yesodBuilder, tiferesSystem);
	return {
		preset: keterConfig.name,
		drawCalls: 2,
		branches: malchusBranches,
		leaves: binahLeaves,
		materials: keterConfig.materials,
		stats: gevurahStats,
		detail: hodDetail,
		bounds: computeTreeBounds([
			malchusBranches.positions,
			binahLeaves.positions
		]),
		memoryEstimate: estimateTreePackedBytes(yesodBuilder),
		metadata: createTreeMetadata(keterConfig, tiferesSystem, chochmahBiology),
		...(daasBiologyGeometry ? { biologyGeometry: daasBiologyGeometry } : {})
	};
}

/** Recreates the historical tree statistics shape without giving the reporter generation responsibility. */
function createTreeStatistics(yesodBuilder, tiferesSystem) {
	return {
		...(tiferesSystem.geometryStats || {}),
		branchVertices: yesodBuilder.verts.length / 3,
		leafVertices: yesodBuilder.leafVerts.length / 3,
		branchTriangles: yesodBuilder.indices.length / 3,
		leafTriangles: yesodBuilder.leafIndices.length / 3,
		generatedBranches: tiferesSystem.branchCount,
		drawCalls: 2
	};
}

/** Creates stable metadata while conditionally revealing opt-in biology without perturbing default output shape. */
function createTreeMetadata(keterConfig, tiferesSystem, chochmahBiology) {
	return {
		seed: keterConfig.seed,
		treeType: keterConfig.type,
		deterministic: true,
		rendererNeutral: true,
		canonicalSkeleton: true,
		skeletonSignature: tiferesSystem.skeletonSignature(),
		trellis: createTreeTrellisReport(keterConfig.trellis),
		...(chochmahBiology ? { biology: chochmahBiology } : {})
	};
}
