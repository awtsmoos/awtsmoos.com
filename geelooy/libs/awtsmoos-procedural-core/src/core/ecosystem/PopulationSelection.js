// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PopulationSelection.js
 * @description Shares weighted habitat-aware species selection across vegetation and fauna planners.
 * The Awtsmoos hides many possible forms in one place; Awtsmoos.com weighs habitat and species intent
 * so selection remains deterministic, bounded, and reusable without one planner stealing another's content.
 */

import { habitatAffinity } from './HabitatSample.js';

export function choosePopulationSpecies(speciesList, habitat, random) {
	const weighted = speciesList.map(species => ({
		species,
		weight: Math.max(0, Number(species.weight ?? 1)) * habitatAffinity(habitat, species.habitat)
	}));
	const total = weighted.reduce((sum, item) => sum + item.weight, 0);
	if (total <= 0) return null;
	let threshold = random.next() * total;
	for (const item of weighted) {
		threshold -= item.weight;
		if (threshold <= 0) return item.species;
	}
	return weighted[weighted.length - 1]?.species || null;
}

export function populationBounds(input = {}) {
	const minX = finite(input.minX ?? input.xMin, -1);
	const maxX = finite(input.maxX ?? input.xMax, 1);
	const minZ = finite(input.minZ ?? input.zMin, -1);
	const maxZ = finite(input.maxZ ?? input.zMax, 1);
	if (!(maxX > minX) || !(maxZ > minZ)) {
		throw new Error('B"H | Population bounds must have positive area.');
	}
	return Object.freeze({ minX, maxX, minZ, maxZ });
}

export function randomPoint(bounds, random) {
	return {
		x: random.range(bounds.minX, bounds.maxX),
		z: random.range(bounds.minZ, bounds.maxZ)
	};
}

export function normalizeScale(value, fallback = [0.85, 1.15]) {
	const source = Array.isArray(value) ? value : fallback;
	return [finite(source[0], fallback[0]), finite(source[1], fallback[1])];
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
