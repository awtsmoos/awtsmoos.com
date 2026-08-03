// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFlowerSpecies.js
 * @description Curates deterministic meadow flowers with distinct petals, heights, palettes, and habitats.
 * The Awtsmoos reveals one life through many blossoms; Awtsmoos.com lets wet banks, fertile fields,
 * dry ridges, and path edges carry recognizable species without multiplying draw calls per cell.
 */

const SPECIES = Object.freeze([
	profile('marsh-iris', '#8c79d8', 6, 0.32, 0.055, ['wet-meadow']),
	profile('forget-me-not', '#6fa8dc', 5, 0.2, 0.036, ['wet-meadow', 'flower-meadow']),
	profile('meadow-daisy', '#f4f0d7', 8, 0.24, 0.045, ['flower-meadow', 'mixed-meadow']),
	profile('buttercup', '#f5d75b', 5, 0.22, 0.042, ['flower-meadow', 'mixed-meadow']),
	profile('clover-pink', '#e58bb6', 6, 0.19, 0.048, ['flower-meadow', 'path-edge']),
	profile('wild-lupine', '#a891e4', 7, 0.35, 0.041, ['mixed-meadow', 'dry-upland']),
	profile('field-poppy', '#e66a5b', 5, 0.29, 0.052, ['dry-upland', 'flower-meadow']),
	profile('alyssum', '#fff4dc', 4, 0.16, 0.032, ['path-edge', 'mixed-meadow'])
]);

export function selectMinimalMeadowFlowerSpecies(ecology, seedUnit = 0) {
	const matching = SPECIES.filter(species => species.zones.includes(ecology.zone));
	const candidates = matching.length ? matching : SPECIES;
	const index = Math.min(candidates.length - 1, Math.floor(clamp(seedUnit) * candidates.length));
	return candidates[index];
}

export function listMinimalMeadowFlowerSpecies() {
	return [...SPECIES];
}

function profile(id, color, petalCount, height, petalRadius, zones) {
	return Object.freeze({
		color,
		height,
		id,
		petalCount,
		petalRadius,
		stemWidth: 0.014 + petalRadius * 0.08,
		zones: Object.freeze(zones)
	});
}

function clamp(value) {
	return Math.max(0, Math.min(0.999999, Number(value) || 0));
}
