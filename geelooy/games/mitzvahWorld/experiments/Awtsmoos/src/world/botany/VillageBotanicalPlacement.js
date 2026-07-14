// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalPlacement.js
 * @description Places one deterministic plant in a reference district while
 * guarding bridges, paths, and gathering spaces. The Awtsmoos reveals abundance
 * as measured relationship, not random clutter.
 */
import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { VILLAGE_REFERENCE_CLEARINGS } from '../village/VillageReferenceComposition.js';
import { referenceSpeciesRole, referenceSpeciesScale } from './VillageBotanicalSpeciesProfiles.js';

const GOLDEN_ANGLE = 2.399963229728653;

/** Builds a renderer-ready placement from species and district intent. */
export function createReferenceBotanicalPlacement(options) {
	const { species, district, ordinal, groundSampler } = options;
	const point = openPoint(district, ordinal, species.id);
	return {
		species: species.id,
		seed: stableSeed(`${district.id}:${species.id}:${ordinal}`),
		scale: referenceSpeciesScale(species, ordinal, options.repeated),
		position: {
			x: point.x,
			y: villageGroundHeight(groundSampler, point.x, point.z),
			z: point.z
		},
		zone: species.habitat,
		districtId: district.id,
		populationIndex: ordinal,
		referenceRole: referenceSpeciesRole(species),
		geometryQuality: options.geometryQuality
	};
}

function openPoint(district, ordinal, speciesId) {
	for (let attempt = 0; attempt < 6; attempt += 1) {
		const point = districtPoint(district, ordinal + attempt * 11, speciesId);
		if (VILLAGE_REFERENCE_CLEARINGS.every((space) => outsideClearing(point, space))) {
			return point;
		}
	}
	return districtPoint(district, ordinal + 71, speciesId);
}

function districtPoint(district, ordinal, speciesId) {
	const wobble = stableUnit(`${speciesId}:${ordinal}`) * 0.34 - 0.17;
	const angle = district.phase + ordinal * GOLDEN_ANGLE + wobble;
	const progression = Math.sqrt((ordinal % 19 + 1) / 19);
	const radiusFactor = district.pattern === 'border'
		? 0.72 + progression * 0.25
		: district.pattern === 'shoreline'
			? 0.96 + progression * 0.08
			: 0.28 + progression * 0.68;
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
