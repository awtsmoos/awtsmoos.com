// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFlowerSpecies.js
 * @description Names habitat-aware blossoms and deterministic mixed-species communities.
 * The Awtsmoos lets every color carry a different botanical gesture;
 * Awtsmoos.com keeps species choice ecological, bounded, companion-rich, and baked together.
 */

const SPECIES = Object.freeze([
	species('meadow-daisy', '#fff7df', 8, 0.052, 0.3, ['flower-meadow', 'mixed-meadow'], 2, '#e7b73f', '#4f8f39', 0.78, 0.08),
	species('cornflower', '#4779d8', 7, 0.05, 0.38, ['dry-upland', 'mixed-meadow'], 2, '#32427f', '#527a3a', 0.64, 0.16),
	species('buttercup', '#ffd84a', 6, 0.043, 0.24, ['wet-meadow', 'flower-meadow'], 1, '#b78018', '#448a40', 0.72, 0.06),
	species('clover-bloom', '#e79bcf', 8, 0.038, 0.2, ['wet-meadow', 'path-edge'], 2, '#8b476f', '#3d8240', 0.84, 0.12),
	species('wild-lupine', '#8768d8', 7, 0.046, 0.46, ['dry-upland', 'flower-meadow'], 3, '#473b7b', '#486f39', 0.7, 0.22),
	species('chamomile', '#fffdf0', 8, 0.04, 0.28, ['path-edge', 'mixed-meadow'], 1, '#d3a22d', '#57843d', 0.76, 0.1),
	species('marsh-star', '#d8f0ff', 7, 0.052, 0.34, ['wet-meadow'], 2, '#6f94a8', '#397d4a', 0.86, 0.05),
	species('golden-yarrow', '#e7c95b', 8, 0.035, 0.42, ['dry-upland', 'path-edge'], 2, '#8c7934', '#657a37', 0.62, 0.28)
]);

export function selectMinimalMeadowFlowerSpecies(ecology, unit = 0) {
	const candidates = candidatesFor(ecology);
	return candidates[speciesIndex(candidates, unit)];
}

export function selectMinimalMeadowFlowerCommunity(ecology, unit = 0) {
	const candidates = candidatesFor(ecology);
	const firstIndex = speciesIndex(candidates, unit);
	const count = ecology.flowerDensity > 0.62 ? 3 : 2;
	return Object.freeze(Array.from({ length: Math.min(count, candidates.length) }, (_, offset) => {
		return candidates[(firstIndex + offset * 2 + 1) % candidates.length];
	}));
}

export function listMinimalMeadowFlowerSpecies() {
	return SPECIES;
}

function candidatesFor(ecology) {
	const preferred = SPECIES.filter(record => record.zones.includes(ecology.zone));
	return preferred.length ? preferred : SPECIES;
}

function speciesIndex(candidates, unit) {
	return Math.min(candidates.length - 1, Math.floor(clamp(unit) * candidates.length));
}

function species(id, color, petalCount, petalRadius, height, zones, petalLayers, centerColor, leafColor, leafChance, seedHeadChance) {
	return Object.freeze({
		centerColor, color, height, id, leafChance, leafColor, petalCount, petalLayers,
		petalRadius, seedHeadChance, stemWidth: 0.012 + petalRadius * 0.08,
		zones: Object.freeze(zones)
	});
}

function clamp(value) {
	return Math.max(0, Math.min(0.999999, Number(value) || 0));
}
