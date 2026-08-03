// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSpeciesProfiles.js
 * @description Chooses recognizable tree presets, age, crown, and wind character from meadow ecology.
 * The Awtsmoos lets birch, pine, ash, and oak answer distinct earth while remaining one forest;
 * Awtsmoos.com preserves canonical procedural presets, deterministic fallback, and traversal-safe scale.
 */

const GROUPS = Object.freeze({
	'dry-upland': Object.freeze(['Pine Small', 'Birch Small', 'Oak Small']),
	'flower-meadow': Object.freeze(['Oak Small', 'Ash Small', 'Birch Small']),
	'mixed-meadow': Object.freeze(['Ash Small', 'Oak Small', 'Pine Small', 'Birch Small']),
	'path-edge': Object.freeze(['Birch Small', 'Ash Small']),
	'wet-meadow': Object.freeze(['Ash Small', 'Birch Small', 'Oak Small'])
});

export function selectMinimalMeadowTreeProfile(ecology, availablePresets, unit = 0) {
	const available = new Set(availablePresets);
	const preferred = (GROUPS[ecology.zone] || GROUPS['mixed-meadow'])
		.filter(name => available.has(name));
	const fallback = [...available];
	const candidates = preferred.length ? preferred : fallback;
	if (!candidates.length) {
		throw new Error('NO_PROCEDURAL_TREE_PRESETS');
	}
	const index = Math.min(candidates.length - 1, Math.floor(clamp(unit) * candidates.length));
	const age = 0.72 + ecology.treeAffinity * 0.56;
	return Object.freeze({
		age,
		canopyDensity: 0.78 + ecology.fertility * 0.42,
		crownScale: 0.88 + ecology.fertility * 0.3,
		presetName: candidates[index],
		role: treeRole(ecology.zone),
		windSpeed: 0.36 + ecology.exposure * 0.42,
		windStrength: 0.0028 + ecology.exposure * 0.0042
	});
}

function treeRole(zone) {
	if (zone === 'wet-meadow') return 'riparian-canopy';
	if (zone === 'dry-upland') return 'windbreak';
	if (zone === 'path-edge') return 'wayfinding-tree';
	if (zone === 'flower-meadow') return 'meadow-anchor';
	return 'mixed-grove';
}

function clamp(value) {
	return Math.max(0, Math.min(0.999999, Number(value) || 0));
}
