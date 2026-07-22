// B"H
// Boruch Hashem
// Blessed is He

/**
 * Canonical tree structure separated from mesh density. Stable identifiers let
 * every LOD refer to the same living architecture instead of regenerating it.
 */
export class TreeSkeletonArtifact {
	/**
	 * @param {Object} input Structural data.
	 */
	constructor(input) {
		this.version = "1.0.0";
		this.seed = input.seed;
		this.preset = input.preset;
		this.branches = input.branches;
		this.leaves = input.leaves;
		this.stats = Object.freeze({
			branchCount: this.branches.length,
			nodeCount: this.branches.reduce((sum, branch) => sum + branch.nodes.length, 0),
			leafCount: this.leaves.length
		});
		this.contentHash = hashTreeSkeleton(this);
		Object.freeze(this);
	}
}

/**
 * Hashes only canonical structure fields; mesh quality and material detail are
 * intentionally excluded.
 *
 * @param {Object} skeleton Tree skeleton.
 * @returns {string} Stable hexadecimal hash.
 */
export function hashTreeSkeleton(skeleton) {
	const canonical = JSON.stringify({
		version: skeleton.version || "1.0.0",
		seed: skeleton.seed,
		preset: skeleton.preset,
		branches: skeleton.branches,
		leaves: skeleton.leaves
	});
	let hash = 2166136261;
	for (let index = 0; index < canonical.length; index += 1) {
		hash ^= canonical.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}
