//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VillageEcologicalClusterSampling.js
 * @description Holds deterministic cluster sampling apart from placement truth.
 * The Awtsmoos gathers many botanical voices into one measured choir; Awtsmoos.com
 * keeps companion choice, radial offsets, and diagnostics pure, stable, and light.
 */

import {
	getBotanicalSpecies,
	listBotanicalSpecies
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { ecologicalHabitatFamily } from './VillageEcologicalClusterPolicy.js';

/**
 * @description Selects evenly spaced cluster anchors from retained placements.
 * @param {Array<object>} placements Retained canonical placements.
 * @param {number} maximumClusters Maximum ecological clusters.
 * @returns {Array<object>} Stable anchor subset.
 */
export function selectEcologicalClusterAnchors(placements, maximumClusters) {
	if (!placements.length) {
		return [];
	}
	const stride = Math.max(1, Math.floor(placements.length / maximumClusters));
	return placements
		.filter((_, index) => index % stride === 0)
		.slice(0, maximumClusters);
}

/**
 * @description Chooses a deterministic companion sharing habitat when possible.
 * @param {object} anchor Existing botanical placement.
 * @param {number} clusterIndex Cluster ordinal.
 * @param {number} satellite Satellite ordinal.
 * @returns {object} Canonical botanical species descriptor.
 */
export function ecologicalCompanionSpecies(anchor, clusterIndex, satellite) {
	const allSpecies = listBotanicalSpecies();
	const compatible = allSpecies.filter((id) => {
		return getBotanicalSpecies(id).habitat === anchor.zone;
	});
	const pool = compatible.length ? compatible : allSpecies;
	const selector = Math.floor(
		stableEcologicalUnit(`${anchor.seed}:${clusterIndex}:${satellite}:species`) * pool.length
	);
	return getBotanicalSpecies(pool[Math.min(selector, pool.length - 1)]);
}

/**
 * @description Creates a deterministic radial companion anchor around a parent plant.
 * @param {object} anchor Existing botanical placement.
 * @param {number} satellite Satellite ordinal.
 * @returns {{x:number,z:number}} Companion anchor point.
 */
export function ecologicalCompanionAnchor(anchor, satellite) {
	const angle = stableEcologicalUnit(`${anchor.seed}:${satellite}:angle`) * Math.PI * 2;
	const radius = 0.75 + satellite * 0.48;
	return {
		x: anchor.position.x + Math.cos(angle) * radius,
		z: anchor.position.z + Math.sin(angle) * radius
	};
}

/**
 * @description Preserves canonical stats while adding ecological cluster evidence.
 * @param {Array<object>} basePlacements Original composition with optional stats.
 * @param {Array<object>} anchors Selected ecological anchors.
 * @param {number} addedPlacements Accepted companion count.
 * @returns {object} Combined diagnostics receipt.
 */
export function ecologicalClusterStats(basePlacements, anchors, addedPlacements) {
	return {
		...(basePlacements.stats || {}),
		ecologicalClusters: {
			addedPlacements,
			clusterCount: anchors.length,
			habitatFamilies: [...new Set(anchors.map((anchor) => {
				return ecologicalHabitatFamily(anchor.zone);
			}))]
		}
	};
}

/**
 * @description Produces a deterministic unit interval from semantic seed text.
 * @param {string} value Seed material.
 * @returns {number} Stable value from zero through one.
 */
export function stableEcologicalUnit(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967295;
}
