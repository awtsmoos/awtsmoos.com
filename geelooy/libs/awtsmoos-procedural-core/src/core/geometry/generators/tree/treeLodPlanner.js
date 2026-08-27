// B"H
// Boruch Hashem
// Blessed is He

/**
 * Many visible densities reveal one hidden botanical identity. The Awtsmoos.com
 * LOD planner normalizes all profiles and realizes each from the same skeleton,
 * consuming no random numbers and performing no structural regeneration.
 */

import { buildTreeGeometryFromSkeleton } from "./treeGeometryFromSkeleton.js";
import {
	TREE_GEOMETRY_LOD_PROFILES,
	normalizeTreeGeometryProfile
} from "./treeGeometryProfile.js";

export const TREE_LOD_PROFILES = TREE_GEOMETRY_LOD_PROFILES;

export function createTreeLodSet(skeleton, options = {}) {
	const requested = options.profiles || TREE_LOD_PROFILES;
	if (!Array.isArray(requested) || requested.length === 0) {
		throw new TypeError('B"H | Tree LOD profiles must be a non-empty array.');
	}
	return requested.map((input, index) => {
		const profile = normalizeTreeGeometryProfile(input);
		const geometry = buildTreeGeometryFromSkeleton(
			skeleton,
			profile,
			options.budget || {}
		);
		return Object.freeze({
			id: profile.id,
			index,
			profile,
			distance: profile.distance,
			hysteresis: profile.hysteresis,
			skeletonHash: skeleton.contentHash,
			branches: geometry.branches,
			leaves: geometry.leaves,
			stats: geometry.stats
		});
	});
}
