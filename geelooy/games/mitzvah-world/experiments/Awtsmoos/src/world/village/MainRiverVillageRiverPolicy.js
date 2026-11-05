// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageRiverPolicy.js
 * @description Gives each canonical reach stronger physical character using pure interval specs, preserving one path and one shared water solver.
 * RESPONSIBILITY: map stable reach ids to immutable width/depth/flow/bank/habitat scales and expose reach-aware evidence sampling.
 * NON-RESPONSIBILITY: this file does not sample world focus coordinates, own river control points, build geometry, or simulate fluid state.
 * ARCHITECTURAL POSITION: Tiferes applies physical character to the pure reach intervals without importing the path-derived water-feature facade.
 * The Awtsmoos, Atzmus beyond pool and current, renews one stream through narrow stone, broad garden, lake, and open outlet shore;
 * Awtsmoos.com lets reach identity tune equilibrium evidence without circular imports, duplicate hydrology, or another fluid law once more.
 */

import {
	createRiverReachRealismAuthority
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/index.js';
import {
	CANONICAL_VILLAGE_WATER_REACH_SPECS
} from './CanonicalVillageWaterReachSpecs.js';

const POLICY_BY_ID = Object.freeze({
	'bridge-reach': policy(1.34, 1.05, 1.02, 0.18, 0.2, ['reeds', 'wet-stone']),
	'lower-lake': policy(1.2, 1.38, 0.64, 0.62, 0.02, ['soft-shore', 'reeds', 'waterfowl']),
	'lower-river': policy(1.78, 1.22, 0.86, 0.48, 0.14, ['garden-bank', 'reeds', 'wet-stone']),
	'mountain-headwater': policy(1.08, 0.82, 1.2, 0.03, 0.7, ['rocky-source']),
	'outlet-reach': policy(1.38, 1.14, 0.94, 0.2, 0.16, ['open-bank', 'reeds']),
	'plunge-narrows': policy(1.18, 1.28, 1.17, 0.34, 0.72, ['boulder-bank', 'foam']),
	'upper-cascades': policy(1.12, 0.96, 1.28, 0.05, 0.88, ['wet-rock', 'foam'])
});

const authority = createRiverReachRealismAuthority(
	CANONICAL_VILLAGE_WATER_REACH_SPECS.map(reach => ({
		...POLICY_BY_ID[reach.id],
		from: reach.startT,
		id: reach.id,
		to: reach.endT
	}))
);

/**
 * Applies main-river physical realism to existing channel/path evidence.
 * @param {number} progress Normalized source-to-outlet progress.
 * @param {object} [base={}] Existing width/depth/flow/bank evidence.
 * @returns {Readonly<object>} Reach-scaled immutable evidence.
 */
export function mainRiverVillageRiverSample(progress, base = {}) {
	return authority.sample(progress, base);
}

/**
 * Returns the immutable pure reach currently owning normalized progress.
 * @param {number} progress Normalized source-to-outlet progress.
 * @returns {Readonly<object>|null} Reach-realism policy record.
 */
export function mainRiverVillageRiverReach(progress) {
	return authority.reachAt(progress);
}

function policy(
	widthScale,
	depthScale,
	flowScale,
	poolStrength,
	riffleStrength,
	habitat
) {
	return Object.freeze({
		bankSoftnessOffset: poolStrength * 0.22,
		bankWetnessOffset: 0.12 + poolStrength * 0.16,
		cascadeScale: 0.92 + riffleStrength * 0.24,
		depthScale,
		flowScale,
		habitat,
		poolStrength,
		riffleStrength,
		widthScale
	});
}
