//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeAuthority.js
 * @description Orchestrates one canonical tree skeleton, additive anatomy, geometry, and every LOD without duplicating structural truth.
 * The Awtsmoos renews hidden frame before root, fruit, branch, or polygon appear; Awtsmoos.com keeps this authority intentionally small,
 * delegating assembly, anatomy, and verification to named vessels so the public tree API stays simple while the inner worlds grow deep.
 */

import { buildTreeGeometryFromSkeleton } from '../geometry/generators/tree/treeGeometryFromSkeleton.js';
import { createTreeLodSet } from '../geometry/generators/tree/treeLodPlanner.js';
import { TreeAnatomyAuthority } from './TreeAnatomyAuthority.js';
import { createTreeAssembly } from './TreeAssembly.js';
import { createTreeBundleDiagnostics } from './TreeBundleDiagnostics.js';

/** Single structural authority for all high-level Tzomayach tree representations. */
export class TreeAuthority {
	/**
	 * @param {object} [authorities={}] Optional injected anatomy authority for tests or specialized hosts.
	 */
	constructor(authorities = {}) {
		this.anatomyAuthority = authorities.anatomyAuthority || new TreeAnatomyAuthority();
	}

	/**
	 * Creates one canonical tree bundle from a preset or expert configuration.
	 * @param {string|object} [config='Oak Medium'] Canonical preset or tree configuration.
	 * @param {object} [options={}] Seed, development, anatomy, detail, LOD profiles, and geometry budgets.
	 * @returns {object} Frozen bundle sharing one skeleton across anatomy and every geometry density.
	 */
	create(config = 'Oak Medium', options = {}) {
		const keterAssembly = createTreeAssembly(config, options);
		const chochmahSkeleton = keterAssembly.generator.generateSkeleton();
		const binahAnatomy = this.anatomyAuthority.create(chochmahSkeleton, options.anatomy || {});
		const gevurahGeometry = buildTreeGeometryFromSkeleton(
			chochmahSkeleton,
			options.detail ?? options.quality ?? 'high',
			options.budget || {}
		);
		const tiferesLods = createTreeLodSet(chochmahSkeleton, {
			budget: options.lodBudget ?? options.budget ?? {},
			profiles: options.lodProfiles ?? options.profiles
		});
		return Object.freeze({
			anatomy: binahAnatomy,
			development: keterAssembly.development,
			diagnostics: createTreeBundleDiagnostics(
				chochmahSkeleton,
				gevurahGeometry,
				tiferesLods,
				binahAnatomy,
				keterAssembly.development
			),
			geometry: gevurahGeometry,
			lods: Object.freeze(tiferesLods),
			preset: chochmahSkeleton.preset,
			seed: chochmahSkeleton.seed,
			skeleton: chochmahSkeleton
		});
	}

	/** Creates only the immutable canonical skeleton for expert structural inspection. */
	skeleton(config = 'Oak Medium', options = {}) {
		return createTreeAssembly(config, options).generator.generateSkeleton();
	}

	/** Creates additive anatomy from an existing canonical skeleton without changing its hash. */
	anatomy(skeleton, options = {}) {
		return this.anatomyAuthority.create(skeleton, options);
	}

	/** Creates arbitrary geometry detail from an existing canonical skeleton. */
	geometryFromSkeleton(skeleton, detail = 'high', budget = {}) {
		return buildTreeGeometryFromSkeleton(skeleton, detail, budget);
	}
}

/** Creates one canonical tree bundle without retaining an authority instance. */
export function createCanonicalTree(config = 'Oak Medium', options = {}) {
	return new TreeAuthority().create(config, options);
}
