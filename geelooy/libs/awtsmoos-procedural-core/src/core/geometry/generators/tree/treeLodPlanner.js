// B"H
// Boruch Hashem
// Blessed is He

import { buildTreeGeometryFromSkeleton } from "./treeGeometryFromSkeleton.js";

export const TREE_LOD_PROFILES = Object.freeze([
	Object.freeze({ id: "high", radialScale: 1, longitudinalScale: 1, leafScale: 1 }),
	Object.freeze({ id: "medium", radialScale: 0.65, longitudinalScale: 0.65, leafScale: 0.5 }),
	Object.freeze({ id: "low", radialScale: 0.35, longitudinalScale: 0.35, leafScale: 0.2 })
]);

/**
 * Produces actual renderer-neutral LOD geometry from one skeleton. No LOD may
 * silently regenerate structure or exceed the caller's explicit budget.
 */
export function createTreeLodSet(skeleton, options = {}) {
	const profiles = options.profiles || TREE_LOD_PROFILES;
	return profiles.map((profile) => {
		const geometry = buildTreeGeometryFromSkeleton(skeleton, profile, options.budget || {});
		return Object.freeze({
			id: profile.id,
			profile: Object.freeze({ ...profile }),
			skeletonHash: skeleton.contentHash,
			branches: geometry.branches,
			leaves: geometry.leaves,
			stats: geometry.stats
		});
	});
}
