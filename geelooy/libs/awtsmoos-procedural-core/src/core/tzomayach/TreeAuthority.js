// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeAuthority.js
 * @description Orchestrates one canonical tree skeleton, anatomy, geometry, LODs, optional biology, and additive living synthesis without duplicating structural truth.
 * The Awtsmoos renews hidden frame before root, sap, fruit, wind, season, or polygon appear;
 * Awtsmoos.com keeps this authority as Tiferes, joining specialist vessels while one canonical skeleton remains the enduring witness everywhere.
 */

import { buildTreeGeometryFromSkeleton } from '../geometry/generators/tree/treeGeometryFromSkeleton.js';
import { createTreeBiologyReport } from '../geometry/generators/tree/treeBiologyReport.js';
import {
	requestsTreeBiology,
	revealTreeBiologyOptions
} from '../geometry/generators/tree/treeGeneratorInputs.js';
import { createTreeLodSet } from '../geometry/generators/tree/treeLodPlanner.js';
import { TreeAnatomyAuthority } from './TreeAnatomyAuthority.js';
import { createTreeAssembly } from './TreeAssembly.js';
import { createTreeBundleDiagnostics } from './TreeBundleDiagnostics.js';
import { createTreeLivingManifest } from './TreeLivingManifest.js';

/** Single structural authority for all high-level Tzomayach tree representations. */
export class TreeAuthority {
	/**
	 * Creates the tree authority around an optional injected anatomy specialist.
	 * @param {object} [keterAuthorities={}] Optional specialist overrides for testing or advanced hosts.
	 */
	constructor(keterAuthorities = {}) {
		this.anatomyAuthority = keterAuthorities.anatomyAuthority || new TreeAnatomyAuthority();
	}

	/**
	 * Creates one canonical tree bundle whose anatomy, geometry, LODs, biology, and living state all testify to one skeleton.
	 * @param {string|object} [keterConfig='Oak Medium'] Canonical preset or expert tree configuration.
	 * @param {object} [tiferesOptions={}] Seed, anatomy, development, detail, LOD, biology, and living settings.
	 * @returns {Readonly<object>} Frozen one-skeleton tree bundle with additive living synthesis.
	 */
	create(keterConfig = 'Oak Medium', tiferesOptions = {}) {
		const malchusAssembly = createTreeAssembly(keterConfig, tiferesOptions);
		const yesodSkeleton = malchusAssembly.generator.generateSkeleton();
		const binahAnatomy = this.anatomyAuthority.create(
			yesodSkeleton,
			tiferesOptions.anatomy || {}
		);
		const gevurahGeometry = buildTreeGeometryFromSkeleton(
			yesodSkeleton,
			tiferesOptions.detail ?? tiferesOptions.quality ?? 'high',
			tiferesOptions.budget || {}
		);
		const hodLods = createTreeLodSet(yesodSkeleton, {
			budget: tiferesOptions.lodBudget ?? tiferesOptions.budget ?? {},
			profiles: tiferesOptions.lodProfiles ?? tiferesOptions.profiles
		});
		const chochmahBiology = requestsTreeBiology(tiferesOptions)
			? createTreeBiologyReport(yesodSkeleton, revealTreeBiologyOptions(tiferesOptions))
			: null;
		const tiferesLiving = createTreeLivingManifest(
			yesodSkeleton,
			binahAnatomy,
			malchusAssembly.development,
			chochmahBiology,
			tiferesOptions
		);
		return Object.freeze({
			anatomy: binahAnatomy,
			...(chochmahBiology ? { biology: chochmahBiology } : {}),
			development: malchusAssembly.development,
			diagnostics: createTreeBundleDiagnostics(
				yesodSkeleton,
				gevurahGeometry,
				hodLods,
				binahAnatomy,
				malchusAssembly.development,
				tiferesLiving
			),
			geometry: gevurahGeometry,
			living: tiferesLiving,
			lods: Object.freeze(hodLods),
			preset: yesodSkeleton.preset,
			seed: yesodSkeleton.seed,
			skeleton: yesodSkeleton
		});
	}

	/** Creates only the immutable canonical skeleton for expert structural inspection. */
	skeleton(keterConfig = 'Oak Medium', tiferesOptions = {}) {
		return createTreeAssembly(keterConfig, tiferesOptions).generator.generateSkeleton();
	}

	/** Creates additive anatomy from an existing canonical skeleton without changing its hash. */
	anatomy(yesodSkeleton, tiferesOptions = {}) {
		return this.anatomyAuthority.create(yesodSkeleton, tiferesOptions);
	}

	/** Creates derived root/reproductive/deadwood/environment metadata from an existing canonical skeleton. */
	biology(yesodSkeleton, tiferesOptions = {}) {
		return createTreeBiologyReport(yesodSkeleton, tiferesOptions);
	}

	/** Creates arbitrary geometry detail from an existing canonical skeleton. */
	geometryFromSkeleton(yesodSkeleton, hodDetail = 'high', gevurahBudget = {}) {
		return buildTreeGeometryFromSkeleton(yesodSkeleton, hodDetail, gevurahBudget);
	}
}

/** Creates one canonical tree bundle without retaining an authority instance. */
export function createCanonicalTree(keterConfig = 'Oak Medium', tiferesOptions = {}) {
	return new TreeAuthority().create(keterConfig, tiferesOptions);
}
