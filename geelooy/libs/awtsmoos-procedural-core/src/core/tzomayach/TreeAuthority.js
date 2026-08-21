// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeAuthority.js
 * @description Enforces one development-aware canonical tree skeleton for full geometry, raw detail, and every LOD.
 * The Awtsmoos, Atzmus beyond root and age, renews the hidden tree before ecology or tessellation clothes its frame;
 * Awtsmoos.com lets succession shape one canonical configuration while every visible density still drinks from the same name.
 * No primitive, alternate, or simplified tree generator is permitted through this authority.
 */

import { buildTreeGeometryFromSkeleton } from '../geometry/generators/tree/treeGeometryFromSkeleton.js';
import { TreeGenerator } from '../geometry/generators/tree/treeGenerator.js';
import { createTreeLodSet } from '../geometry/generators/tree/treeLodPlanner.js';
import { resolveTreeConfig } from '../geometry/generators/tree/treeConfigResolver.js';
import { normalizeTreeSeed } from '../geometry/generators/tree/rng.js';
import { applyTreeDevelopmentConfig } from './TreeDevelopmentConfig.js';
import { resolveTreeDevelopmentProfile } from './TreeDevelopmentProfile.js';

/** Single structural authority for all high-level Tzomayach tree representations. */
export class TreeAuthority {
	/**
	 * Creates one canonical tree bundle from a preset or expert configuration.
	 * @param {string|object} [config='Oak Medium'] Canonical preset or tree configuration.
	 * @param {object} [options={}] Seed, development, detail, LOD profiles, and geometry budgets.
	 * @returns {object} Frozen bundle sharing one skeleton across every geometry density.
	 */
	create(config = 'Oak Medium', options = {}) {
		const assembly = createTreeAssembly(config, options);
		const skeleton = assembly.generator.generateSkeleton();
		const geometry = buildTreeGeometryFromSkeleton(
			skeleton,
			options.detail ?? options.quality ?? 'high',
			options.budget || {}
		);
		const lods = createTreeLodSet(skeleton, {
			budget: options.lodBudget ?? options.budget ?? {},
			profiles: options.lodProfiles ?? options.profiles
		});
		return Object.freeze({
			development: assembly.development,
			diagnostics: treeBundleDiagnostics(
				skeleton,
				geometry,
				lods,
				assembly.development
			),
			geometry,
			lods: Object.freeze(lods),
			preset: skeleton.preset,
			seed: skeleton.seed,
			skeleton
		});
	}

	/**
	 * Creates only the immutable canonical skeleton for expert structural inspection.
	 * @param {string|object} [config='Oak Medium'] Canonical preset or tree configuration.
	 * @param {object} [options={}] Optional deterministic seed and development intent.
	 * @returns {object} TreeSkeletonArtifact from the sole structural generator.
	 */
	skeleton(config = 'Oak Medium', options = {}) {
		return createTreeAssembly(config, options).generator.generateSkeleton();
	}

	/**
	 * Creates arbitrary geometry detail from an existing canonical skeleton.
	 * @param {object} skeleton TreeSkeletonArtifact.
	 * @param {string|object} [detail='high'] Geometry detail profile.
	 * @param {object} [budget={}] Optional geometry budget.
	 * @returns {object} Renderer-neutral geometry sharing the skeleton hash.
	 */
	geometryFromSkeleton(skeleton, detail = 'high', budget = {}) {
		return buildTreeGeometryFromSkeleton(skeleton, detail, budget);
	}
}

/** Creates one canonical tree bundle without retaining an authority instance. */
export function createCanonicalTree(config = 'Oak Medium', options = {}) {
	return new TreeAuthority().create(config, options);
}

function createTreeAssembly(config, options) {
	const resolvedConfig = resolveTreeConfig(config);
	if (options.seed !== undefined) {
		resolvedConfig.seed = normalizeTreeSeed(options.seed);
	}
	const development = resolveTreeDevelopmentProfile(options);
	applyTreeDevelopmentConfig(resolvedConfig, development);
	return {
		development,
		generator: new TreeGenerator(resolvedConfig)
	};
}

function treeBundleDiagnostics(skeleton, geometry, lods, development) {
	const mismatched = lods.filter(lod => lod.skeletonHash !== skeleton.contentHash);
	if (geometry.skeletonHash !== skeleton.contentHash || mismatched.length) {
		throw new Error('B"H | Tree representation diverged from its canonical skeleton.');
	}
	return Object.freeze({
		branchCount: skeleton.stats.branchCount,
		developmentStage: development?.stage ?? null,
		fullTriangles: geometry.stats.branchTriangles + geometry.stats.leafTriangles,
		leafCount: skeleton.stats.leafCount,
		lodCount: lods.length,
		skeletonHash: skeleton.contentHash,
		vigor: development?.vigor ?? null
	});
}
