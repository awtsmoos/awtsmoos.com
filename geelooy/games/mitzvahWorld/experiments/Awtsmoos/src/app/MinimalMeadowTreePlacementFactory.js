// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreePlacementFactory.js
 * @description Builds one ecology-aware procedural tree specification from canonical presets.
 * The Awtsmoos lets age, crown, climate, species, and wind answer one rooted coordinate;
 * Awtsmoos.com preserves deterministic scale, material variation, playable radius, and terrain contact.
 */

import {
	sampleMinimalMeadowEcology
} from './MinimalMeadowEcologyField.js';
import {
	selectMinimalMeadowTreeProfile
} from './MinimalMeadowTreeSpeciesProfiles.js';
import {
	MINIMAL_MEADOW_POPULATION_SEED
} from './MinimalMeadowWorldPopulationConfig.js';
import {
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';

export function createMinimalMeadowTreeSpecification(input) {
	const ecology = sampleMinimalMeadowEcology(input.terrain, input.x, input.z);
	if (ecology.road > 0.18 || ecology.treeAffinity < 0.2) return null;
	const unit = seeded(input.key, 67);
	const profile = selectMinimalMeadowTreeProfile(ecology, input.presets, unit);
	const base = 0.74 + profile.age * 0.18 + seeded(input.key, 37) * 0.2;
	const breadth = profile.crownScale * (0.86 + seeded(input.key, 41) * 0.22);
	const scaleX = base * breadth;
	const scaleY = base * (0.88 + profile.age * 0.22 + seeded(input.key, 43) * 0.2);
	const scaleZ = base * profile.crownScale * (0.84 + seeded(input.key, 47) * 0.24);
	return {
		canopyDensity: profile.canopyDensity,
		climate: input.grove.climate,
		ecologyZone: ecology.zone,
		groveId: input.grove.id,
		materialVariant: (input.key + input.groveIndex) % 3,
		preset: profile.presetName,
		radius: Math.max(scaleX, scaleZ) * 3.8,
		role: profile.role,
		scaleX,
		scaleY,
		scaleZ,
		windPhase: seeded(input.key, 59) * Math.PI * 2,
		windSpeed: profile.windSpeed,
		windStrength: profile.windStrength,
		x: input.x,
		y: input.terrain.heightAt(input.x, input.z),
		yaw: seeded(input.key, 53) * Math.PI * 2,
		z: input.z
	};
}

function seeded(key, salt) {
	return minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, salt);
}
