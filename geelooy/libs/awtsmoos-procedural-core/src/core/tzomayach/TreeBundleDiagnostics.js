//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeBundleDiagnostics.js
 * @description Verifies that geometry, LODs, and additive anatomy all testify to one canonical tree skeleton.
 * The Awtsmoos gives many garments to one living name; Awtsmoos.com makes diagnostics guard that unity,
 * refusing any bundle where mesh, LOD, or anatomy silently drifts into a second tree.
 */

/**
 * Verifies bundle identity and returns compact immutable diagnostics.
 * @param {object} skeleton Canonical tree skeleton.
 * @param {object} geometry Full renderer-neutral tree geometry.
 * @param {ReadonlyArray<object>} lods Geometry LODs sharing the skeleton.
 * @param {object} anatomy Additive anatomy bound to the skeleton hash.
 * @param {object} development Tree development profile.
 * @returns {object} Frozen diagnostic witness.
 */
export function createTreeBundleDiagnostics(skeleton, geometry, lods, anatomy, development) {
	const gevurahMismatchedLods = lods.filter(lod => lod.skeletonHash !== skeleton.contentHash);
	const tiferesGeometryMatches = geometry.skeletonHash === skeleton.contentHash;
	const yesodAnatomyMatches = anatomy.skeletonHash === skeleton.contentHash;
	if (!tiferesGeometryMatches || !yesodAnatomyMatches || gevurahMismatchedLods.length) {
		throw new Error('B"H | Tree representation diverged from its canonical skeleton.');
	}
	return Object.freeze({
		branchCount: skeleton.stats.branchCount,
		developmentStage: development?.stage ?? null,
		fullTriangles: geometry.stats.branchTriangles + geometry.stats.leafTriangles,
		leafCount: skeleton.stats.leafCount,
		lodCount: lods.length,
		reproductiveCount: anatomy.stats.reproductiveCount,
		rootCount: anatomy.stats.rootCount,
		skeletonHash: skeleton.contentHash,
		vigor: development?.vigor ?? null,
		windBranchCount: anatomy.stats.windBranchCount
	});
}
