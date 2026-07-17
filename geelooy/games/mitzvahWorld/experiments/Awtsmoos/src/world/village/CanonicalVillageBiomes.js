// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageBiomes.js
 * @description Declares ecological regions shaped by elevation, moisture, slope, and settlement.
 * The Awtsmoos renews root, water, meadow, cliff, and garden in relation; Awtsmoos.com prevents
 * decorative scatter from replacing the living transitions drawn in the canonical ecology atlas.
 */

export const CANONICAL_VILLAGE_BIOMES = Object.freeze([
	biome('dense-north-forest', 'dense-forest', 2, -105, 122, 72, 0.72),
	biome('west-old-growth', 'dense-forest', -135, -22, 68, 120, 0.82),
	biome('east-rock-forest', 'rocky-woodland', 135, -20, 72, 122, 0.58),
	biome('arrival-meadow', 'flower-meadow', 0, 82, 36, 30, 0.28),
	biome('market-clearing', 'village-ground', -26, 12, 31, 23, 0.18),
	biome('shul-garden', 'terrace-garden', -34, -24, 27, 21, 0.42),
	biome('river-corridor', 'wet-riverbank', 17, 35, 24, 105, 0.95),
	biome('waterfall-cliffs', 'wet-rock', 51, -44, 31, 28, 1),
	biome('farm-terraces', 'cultivated', 43, 42, 34, 28, 0.34),
	biome('south-bank-clearings', 'open-woodland', 70, 78, 70, 62, 0.38)
]);

export function canonicalBiomeAt(x, z) {
	let strongest = null;
	let strongestWeight = 0;
	for (const definition of CANONICAL_VILLAGE_BIOMES) {
		const dx = (x - definition.x) / definition.radiusX;
		const dz = (z - definition.z) / definition.radiusZ;
		const weight = Math.max(0, 1 - Math.hypot(dx, dz)) * definition.moisture;
		if (weight <= strongestWeight) continue;
		strongest = definition;
		strongestWeight = weight;
	}
	return Object.freeze({
		id: strongest?.id || 'alpine-background',
		moisture: strongestWeight,
		type: strongest?.type || 'alpine-rock-and-forest'
	});
}

function biome(id, type, x, z, radiusX, radiusZ, moisture) {
	return Object.freeze({ id, moisture, radiusX, radiusZ, type, x, z });
}
