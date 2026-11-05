// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalPlacement.js
 * @description Places deterministic plants through the canonical spatial-truth policy.
 * The Awtsmoos renews abundance as relationship rather than clutter; Awtsmoos.com binds
 * every bloom to clear ground, district purpose, ecology, access, and a fixed frame budget.
 */

import { districtGeometryQuality } from '../village/VillageWorldBudget.js';
import {
	referenceSpeciesRole,
	referenceSpeciesScale
} from './VillageBotanicalSpeciesProfiles.js';
import { resolveBotanicalSite } from './VillageBotanicalSitePolicy.js';

const GOLDEN_ANGLE = 2.399963229728653;

export function createReferenceBotanicalPlacement(options) {
	const { species, district, ordinal } = options;
	const clusterRadius = options.clusterRadius ?? radiusForDetail(district.detail);
	const site = resolveBotanicalSite({
		anchor: options.anchor ?? districtPoint(district, ordinal, species.id),
		district,
		groundSampler: options.groundSampler,
		occupiedPlacements: options.occupiedPlacements,
		ordinal,
		siteRadius: clusterRadius * 0.5
	});
	const seed = stableSeed(`${district.id}:${species.id}:${ordinal}`);
	return {
		clusterCount: options.clusterCount,
		clusterRadius,
		districtId: district.id,
		geometryQuality: options.geometryQuality
			?? districtGeometryQuality(district.detail, options.requestedQuality),
		lodClass: options.lodClass ?? district.detail,
		populationIndex: ordinal,
		position: site.position,
		referenceRole: referenceSpeciesRole(species),
		scale: referenceSpeciesScale(species, ordinal, options.repeated)
			* (options.scaleMultiplier ?? 1),
		seed,
		siteEvidence: site.evidence,
		species: species.id,
		windPhase: seed / 4294967295 * Math.PI * 2,
		zone: species.habitat
	};
}

function districtPoint(district, ordinal, speciesId) {
	const wobble = stableUnit(`${speciesId}:${ordinal}`) * 0.34 - 0.17;
	const angle = district.phase + ordinal * GOLDEN_ANGLE + wobble;
	const progression = Math.sqrt((ordinal % 29 + 1) / 29);
	const factor = 0.24 + progression * 0.72;
	return {
		x: district.center[0] + Math.cos(angle) * district.radius[0] * factor,
		z: district.center[1] + Math.sin(angle) * district.radius[1] * factor
	};
}

function radiusForDetail(detail) {
	if (detail === 'far') return 1.8;
	if (detail === 'medium') return 1;
	return 0.45;
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
