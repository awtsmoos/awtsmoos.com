// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreePlacementFactory.js
 * @description Builds one ecology-aware tree with named-grove species, silhouette, shared material, and rooted wind.
 * The Awtsmoos lets oak, ash, birch, and pine answer the names entrusted to their groves;
 * Awtsmoos.com keeps climate, age, density, motion, and first-play weight within one deterministic covenant.
 */

import {
	sampleMinimalMeadowEcology
} from './MinimalMeadowEcologyField.js';
import {
	selectMinimalMeadowTreeProfile
} from './MinimalMeadowTreeSpeciesProfiles.js';
import {
	minimalMeadowTreeSilhouette
} from './MinimalMeadowTreeSilhouette.js';
import {
	MINIMAL_MEADOW_POPULATION_SEED
} from './MinimalMeadowWorldPopulationConfig.js';
import {
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';

const GROVE_SPECIES = Object.freeze([
	['pine', 'Pine Small'],
	['birch', 'Birch Small'],
	['ash', 'Ash Small'],
	['oak', 'Oak Small']
]);

export function createMinimalMeadowTreeSpecification(input) {
	const ecology = sampleMinimalMeadowEcology(input.terrain, input.x, input.z);
	if (ecology.road > 0.18 || ecology.treeAffinity < 0.2) return null;
	const selectedProfile = selectMinimalMeadowTreeProfile(
		ecology,
		input.presets,
		seeded(input.key, 67)
	);
	const presetName = namedGrovePreset(input.grove?.id, input.presets)
		|| selectedProfile.presetName;
	const base = 0.74 + selectedProfile.age * 0.18 + seeded(input.key, 37) * 0.2;
	const breadth = selectedProfile.crownScale * (0.86 + seeded(input.key, 41) * 0.22);
	const scaleX = base * breadth;
	const scaleY = base * (0.88 + selectedProfile.age * 0.22 + seeded(input.key, 43) * 0.2);
	const scaleZ = base * selectedProfile.crownScale * (0.84 + seeded(input.key, 47) * 0.24);
	const silhouette = minimalMeadowTreeSilhouette(
		presetName,
		selectedProfile.silhouetteVariation
	);
	return {
		canopyDensity: selectedProfile.canopyDensity,
		climate: input.grove.climate,
		ecologyZone: ecology.zone,
		groveId: input.grove.id,
		materialVariant: Math.floor(selectedProfile.materialVariation * 6) % 6,
		preset: presetName,
		radius: Math.max(scaleX, scaleZ) * 4.1,
		role: selectedProfile.role,
		scaleX,
		scaleY,
		scaleZ,
		silhouette,
		windPhase: seeded(input.key, 59) * Math.PI * 2,
		windSpeed: selectedProfile.windSpeed,
		windStrength: selectedProfile.windStrength,
		x: input.x,
		y: input.terrain.heightAt(input.x, input.z),
		yaw: seeded(input.key, 53) * Math.PI * 2,
		z: input.z
	};
}

function namedGrovePreset(groveId, availablePresets) {
	const id = String(groveId || '').toLowerCase();
	const available = new Set(availablePresets);
	const match = GROVE_SPECIES.find(([token, preset]) => id.includes(token) && available.has(preset));
	return match?.[1] || null;
}

function seeded(key, salt) {
	return minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, salt);
}
