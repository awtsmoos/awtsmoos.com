// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeLivingManifest.js
 * @description Composes structural allocation, hydraulic readiness, mechanical vitality, and seasonal development around one canonical tree skeleton.
 * The Awtsmoos renews root, sap, crown, wind, season, and reserve before those finite witnesses can seem divided;
 * Awtsmoos.com lets Tiferes gather them into one immutable living manifest whose every path returns to the same skeleton light.
 */

import { createTreeEnvironmentIntent } from '../geometry/generators/tree/treeEnvironmentIntent.js';
import { createTreeHydraulicState } from './TreeHydraulicState.js';
import { createTreeLivingAllocation } from './TreeLivingAllocation.js';
import { createTreeMechanicalVitality } from './TreeMechanicalVitality.js';
import { createTreeSeasonalVitality } from './TreeSeasonalVitality.js';

/**
 * Creates one derived living manifest without changing skeleton, anatomy, geometry, LODs, or caller-owned options.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {object} anatomy Additive anatomy bound to the skeleton hash.
 * @param {object|null} development Optional pre-skeleton development profile.
 * @param {object|null} biology Optional generator-level biology report.
 * @param {object} [options={}] Public tree options containing optional nested `living` controls.
 * @returns {Readonly<object>} Frozen non-simulative living tree manifest.
 */
export function createTreeLivingManifest(skeleton, anatomy, development, biology, options = {}) {
	const chochmahLiving = plainObject(options.living) ? options.living : {};
	const binahEnvironment = biology?.environment || createTreeEnvironmentIntent({
		...options,
		...(plainObject(chochmahLiving.environment) ? chochmahLiving.environment : {})
	});
	const keterAllocation = createTreeLivingAllocation(skeleton, anatomy);
	const gevurahHydraulic = createTreeHydraulicState(
		keterAllocation,
		development,
		binahEnvironment,
		plainObject(chochmahLiving.hydraulic) ? chochmahLiving.hydraulic : chochmahLiving
	);
	const hodMechanical = createTreeMechanicalVitality(
		skeleton,
		anatomy,
		development,
		binahEnvironment,
		plainObject(chochmahLiving.mechanical) ? chochmahLiving.mechanical : {}
	);
	const netzachSeasonal = createTreeSeasonalVitality(
		development,
		gevurahHydraulic,
		hodMechanical,
		binahEnvironment,
		plainObject(chochmahLiving.seasonal) ? chochmahLiving.seasonal : {}
	);
	return Object.freeze({
		allocation: keterAllocation,
		capabilities: Object.freeze([
			'hydraulic-readiness',
			'mechanical-vitality',
			'root-canopy-allocation',
			'seasonal-vitality',
			'skeleton-bound-living-state'
		]),
		development: development || null,
		environment: binahEnvironment,
		hydraulic: gevurahHydraulic,
		mechanical: hodMechanical,
		schema: 'awtsmoos.tree-living-manifest',
		seasonal: netzachSeasonal,
		skeletonHash: skeleton.contentHash,
		version: '1.0.0'
	});
}

/** Returns true only for non-array object option vessels. */
function plainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
