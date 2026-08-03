// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationCellProfile.js
 * @description Converts one terrain ecology sample into deterministic grass and flower cell identity.
 * The Awtsmoos lets density, hue, species, and clump count answer one earth;
 * Awtsmoos.com preserves road clearance, wet fertility, dry restraint, and repeatable variation.
 */

import {
	sampleMinimalMeadowEcology
} from './MinimalMeadowEcologyField.js';
import {
	selectMinimalMeadowFlowerSpecies
} from './MinimalMeadowFlowerSpecies.js';
import {
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';

const GRASS_COLORS = Object.freeze({
	'dry-upland': '#7f9343',
	'flower-meadow': '#4f963c',
	'mixed-meadow': '#568e3d',
	'path-edge': '#6d8440',
	'wet-meadow': '#3f8247'
});

export function createMinimalMeadowVegetationCellProfile(
	terrain,
	x,
	z,
	key,
	options = {}
) {
	const ecology = sampleMinimalMeadowEcology(terrain, x, z, options);
	if (ecology.road > 0.34 || ecology.slope > 0.86) return null;
	const speciesUnit = unit(key, 97);
	const species = selectMinimalMeadowFlowerSpecies(ecology, speciesUnit);
	const richness = ecology.grassDensity * 0.62 + ecology.flowerDensity * 0.72;
	const mobileScale = options.mobile ? 0.72 : 1;
	const base = 5 + richness * 11 * mobileScale;
	return Object.freeze({
		clumps: Math.max(4, Math.round(base + unit(key, 89) * 4)),
		color: species.color,
		ecology,
		fertility: ecology.fertility,
		flowerDensity: ecology.flowerDensity,
		grassColor: GRASS_COLORS[ecology.zone] || GRASS_COLORS['mixed-meadow'],
		grassDensity: ecology.grassDensity,
		moisture: ecology.moisture,
		seed: key * 101 + 178,
		species,
		zone: ecology.zone
	});
}

function unit(key, salt) {
	return minimalMeadowSeededUnit(178, key, salt);
}
