//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeAnatomyAuthority.js
 * @description Composes structural roots, optional reproductive attachments, and renderer-neutral wind response around one canonical skeleton.
 * The Awtsmoos reveals hidden root, future fruit, and bending branch without multiplying the tree's identity; Awtsmoos.com lets one anatomy
 * authority bind every extra vessel to the immutable skeleton hash while leaving soil simulation and wind integration to future specialist worlds.
 */

import { planTreeReproductiveAttachments } from './TreeReproductiveAttachments.js';
import { planTreeRootArchitecture } from './TreeRootArchitecture.js';
import { createTreeWindResponse } from './TreeWindResponse.js';

/** Canonical additive anatomy authority for deterministic tree biology above the stable skeleton contract. */
export class TreeAnatomyAuthority {
	/**
	 * Creates one immutable anatomy bundle tied to a canonical skeleton hash.
	 * @param {object} skeleton TreeSkeletonArtifact from the canonical tree generator.
	 * @param {object} [options={}] `roots`, `wind`, and explicit `reproduction` requests.
	 * @returns {object} Frozen anatomy bundle that does not alter skeleton identity or mesh topology.
	 */
	create(skeleton, options = {}) {
		const keterRoots = planTreeRootArchitecture(skeleton, options.roots || {});
		const chochmahWind = createTreeWindResponse(skeleton, options.wind || {});
		const binahReproduction = planTreeReproductiveAttachments(
			skeleton,
			options.reproduction || false
		);
		return Object.freeze({
			reproduction: binahReproduction,
			roots: keterRoots,
			skeletonHash: skeleton.contentHash,
			stats: Object.freeze({
				reproductiveCount: binahReproduction.length,
				rootCount: keterRoots.length,
				windBranchCount: chochmahWind.branches.length,
				windLeafCount: chochmahWind.leaves.length
			}),
			version: '1.0.0',
			wind: chochmahWind
		});
	}
}

/**
 * Convenience creator for callers that already own a canonical skeleton.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {object} [options={}] Anatomy options.
 * @returns {object} Immutable anatomy bundle.
 */
export function createTreeAnatomy(skeleton, options = {}) {
	return new TreeAnatomyAuthority().create(skeleton, options);
}
