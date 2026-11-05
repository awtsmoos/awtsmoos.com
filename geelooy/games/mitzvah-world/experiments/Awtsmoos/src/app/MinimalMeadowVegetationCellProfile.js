// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationCellProfile.js
 * @description Converts ecology and quality into deterministic grass and mixed-flower communities.
 * The Awtsmoos lets density, hue, species, and clump count answer one earth;
 * Awtsmoos.com preserves wet fertility, dry restraint, road clearance, and explicit maximums.
 */

import { sampleMinimalMeadowEcology } from './MinimalMeadowEcologyField.js';
import {
	selectMinimalMeadowFlowerCommunity,
	selectMinimalMeadowFlowerSpecies
} from './MinimalMeadowFlowerSpecies.js';
import { minimalMeadowSeededUnit } from './MinimalMeadowWorldPopulationMath.js';

const GRASS_COLORS = Object.freeze({
	'dry-upland': '#849746',
	'flower-meadow': '#4e9b3e',
	'mixed-meadow': '#568f3c',
	'path-edge': '#718746',
	'wet-meadow': '#3d874a'
});

export function createMinimalMeadowVegetationCellProfile(terrain, x, z, key, options = {}) {
	const ecology = sampleMinimalMeadowEcology(terrain, x, z, options);
	if (ecology.road > 0.34 || ecology.slope > 0.86) return null;
	const selectionUnit = unit(key, 97);
	const species = selectMinimalMeadowFlowerSpecies(ecology, selectionUnit);
	const speciesCommunity = selectMinimalMeadowFlowerCommunity(ecology, selectionUnit);
	const richness = ecology.grassDensity * 0.62 + ecology.flowerDensity * 0.72;
	const budget = options.budget || {};
	const maximum = Math.max(6, budget.maximumClumps || (options.mobile ? 9 : 14));
	const minimum = Math.max(4, Math.round(maximum * 0.46));
	const clumps = Math.min(
		maximum,
		Math.max(minimum, Math.round(minimum + richness * (maximum - minimum) + unit(key, 89) * 2))
	);
	return Object.freeze({
		clumps,
		color: species.color,
		ecology,
		fertility: ecology.fertility,
		flowerDensity: ecology.flowerDensity,
		grassColor: GRASS_COLORS[ecology.zone] || GRASS_COLORS['mixed-meadow'],
		grassDensity: ecology.grassDensity,
		moisture: ecology.moisture,
		seed: key * 101 + 178,
		species,
		speciesCommunity,
		zone: ecology.zone
	});
}

function unit(key, salt) {
	return minimalMeadowSeededUnit(178, key, salt);
}
