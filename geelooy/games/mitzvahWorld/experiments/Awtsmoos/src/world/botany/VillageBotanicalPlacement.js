// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalPlacement.js
 * @description Places deterministic plants with clearing, wind, cluster, and LOD data.
 * The Awtsmoos renews abundance as measured relationship rather than clutter;
 * Awtsmoos.com keeps every bloom aligned with ground, district, path, and frame budget.
 */

import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { VILLAGE_REFERENCE_CLEARINGS } from '../village/VillageReferenceComposition.js';
import { districtGeometryQuality } from '../village/VillageWorldBudget.js';
import {
	referenceSpeciesRole,
	referenceSpeciesScale
} from './VillageBotanicalSpeciesProfiles.js';

const GOLDEN_ANGLE = 2.399963229728653;

export function createReferenceBotanicalPlacement(options) {
	const { species, district, ordinal, groundSampler } = options;
	const point = openPoint(district, ordinal, species.id);
	const seed = stableSeed(`${district.id}:${species.id}:${ordinal}`);
	return {
		clusterRadius: district.detail === 'far' ? 1.8 : district.detail === 'medium' ? 1.0 : 0.45,
		districtId: district.id,
		geometryQuality: districtGeometryQuality(district.detail, options.requestedQuality),
		lodClass: district.detail,
		populationIndex: ordinal,
		position: {
			x: point.x,
			y: villageGroundHeight(groundSampler, point.x, point.z),
			z: point.z
		},
		referenceRole: referenceSpeciesRole(species),
		scale: referenceSpeciesScale(species, ordinal, options.repeated),
		seed,
		species: species.id,
		windPhase: seed / 4294967295 * Math.PI * 2,
		zone: species.habitat
	};
}

function openPoint(district, ordinal, speciesId) {
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const point = districtPoint(district, ordinal + attempt * 13, speciesId);
		if (VILLAGE_REFERENCE_CLEARINGS.every((space) => outsideClearing(point, space))) {
			return point;
		}
	}
	return districtPoint(district, ordinal + 97, speciesId);
}

function districtPoint(district, ordinal, speciesId) {
	const wobble = stableUnit(`${speciesId}:${ordinal}`) * 0.34 - 0.17;
	const angle = district.phase + ordinal * GOLDEN_ANGLE + wobble;
	const progression = Math.sqrt((ordinal % 29 + 1) / 29);
	const radiusFactor = 0.24 + progression * 0.72;
	return {
		x: district.center[0] + Math.cos(angle) * district.radius[0] * radiusFactor,
		z: district.center[1] + Math.sin(angle) * district.radius[1] * radiusFactor
	};
}

function outsideClearing(point, clearing) {
	return Math.hypot(point.x - clearing.x, point.z - clearing.z) >= clearing.radius;
}

function stableSeed(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function stableUnit(value) {
	return stableSeed(value) / 4294967295;
}
