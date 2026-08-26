//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeOutputReport.js
 * @description Assembles the stable public tree result from canonical geometry, measured diagnostics, skeleton identity, and optional derived biology.
 * The Awtsmoos renews branch, leaf, measure, and hidden biological possibility before one output object can appear;
 * Awtsmoos.com lets Malchus manifest that report while generation, ecology, and rendering remain separate vessels of the same light.
 */
import {
	computeTreeBounds,
	createTreeBranchArrays,
	createTreeLeafArrays,
	estimateTreePackedBytes
} from './treeOutputMetrics.js';
import { createTreeTrellisReport } from './treeTrellisField.js';

/**
 * Creates the backward-compatible public tree output, adding biology metadata only when explicitly requested.
 * @param {object} keterConfig Resolved canonical tree configuration.
 * @param {object} yesodBuilder Completed geometry builder containing branch and leaf buffers.
 * @param {object} tiferesSystem Completed canonical growth system with stable skeleton and statistics.
 * @param {string} hodDetail Effective detail profile.
 * @param {object|null} [chochmahBiology=null] Optional derived biology report.
 * @returns {object} Renderer-neutral tree data preserving historical output fields.
 */
export function createTreeOutput(
	keterConfig,
	yesodBuilder,
	tiferesSystem,
	hodDetail,
	chochmahBiology = null
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
		metadata: createTreeMetadata(keterConfig, tiferesSystem, chochmahBiology)
	};
}

/**
 * Recreates the historical tree statistics shape without giving the reporter generation responsibility.
 * @param {object} yesodBuilder Completed geometry builder.
 * @param {object} tiferesSystem Completed growth system.
 * @returns {object} Stable statistics object.
 */
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

/**
 * Creates immutable-facing metadata while conditionally revealing opt-in biology without perturbing default output shape.
 * @param {object} keterConfig Resolved tree configuration.
 * @param {object} tiferesSystem Completed growth system.
 * @param {object|null} chochmahBiology Optional derived biology report.
 * @returns {object} Stable metadata contract.
 */
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
