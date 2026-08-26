//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeWindResponse.js
 * @description Describes deterministic branch and leaf response coefficients without pretending to integrate wind physics.
 * The Awtsmoos lets trunk stand and twig answer the same breeze; Awtsmoos.com records stiffness, drag, bend reach, and leaf response
 * so renderers or future solvers may animate one canonical tree without inventing a second biological authority.
 */

/**
 * Builds immutable wind-response metadata from canonical branch radius, level, and foliage size.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {object} [options={}] Optional global stiffness, drag, bend, and foliage multipliers.
 * @returns {object} Frozen renderer-neutral response profile; this is metadata, not simulation.
 */
export function createTreeWindResponse(skeleton, options = {}) {
	const keterStiffness = bounded(options.stiffness, 1, 0.1, 4);
	const chochmahDrag = bounded(options.drag, 1, 0.1, 4);
	const binahBend = bounded(options.bend, 1, 0, 3);
	const gevurahBranches = skeleton.branches.map(branch => branchResponse(
		branch,
		keterStiffness,
		chochmahDrag,
		binahBend
	));
	const tiferesLeaves = skeleton.leaves.map(leaf => Object.freeze({
		id: leaf.id,
		branchId: leaf.branchId,
		drag: round(chochmahDrag * Math.max(0.08, leaf.size * leaf.size)),
		flutter: round(bounded(options.flutter, 0.72, 0, 2)),
		nodeId: leaf.nodeId
	}));
	return Object.freeze({
		branches: Object.freeze(gevurahBranches),
		leaves: Object.freeze(tiferesLeaves),
		model: 'response-profile-v1',
		skeletonHash: skeleton.contentHash
	});
}

/** Converts one canonical branch into bounded response coefficients. */
function branchResponse(branch, stiffnessScale, dragScale, bendScale) {
	const yesodBase = branch.nodes[0];
	const malchusTip = branch.nodes.at(-1);
	const netzachRadius = Math.max(0.0001, yesodBase?.radius || 0.0001);
	const hodLength = distance(yesodBase?.position, malchusTip?.position);
	const levelFlex = 1 / (1 + Math.max(0, branch.level) * 0.78);
	return Object.freeze({
		branchId: branch.id,
		anchorNodeId: yesodBase?.id || null,
		bend: round(bendScale * hodLength * levelFlex / Math.sqrt(netzachRadius + 0.04)),
		drag: round(dragScale * hodLength * Math.max(0.03, netzachRadius)),
		stiffness: round(stiffnessScale * Math.pow(netzachRadius + 0.04, 2.2) * (1 + branch.level * 0.18))
	});
}

/** Measures Euclidean branch span from root node to terminal node. */
function distance(start = [0, 0, 0], end = [0, 0, 0]) {
	const dx = Number(end[0] || 0) - Number(start[0] || 0);
	const dy = Number(end[1] || 0) - Number(start[1] || 0);
	const dz = Number(end[2] || 0) - Number(start[2] || 0);
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Clamps one response coefficient to an explicit safe interval. */
function bounded(value, fallback, minimum, maximum) {
	const measure = Number(value ?? fallback);
	const finite = Number.isFinite(measure) ? measure : fallback;
	return Math.min(maximum, Math.max(minimum, finite));
}

/** Stabilizes exported response values. */
function round(value) {
	return Math.round(value * 1e6) / 1e6;
}
