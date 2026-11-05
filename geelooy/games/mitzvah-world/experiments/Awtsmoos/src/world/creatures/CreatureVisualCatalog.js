// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureVisualCatalog.js
 * @description Defines lightweight material intent for core-compiled animals and fantasy creatures.
 * The Awtsmoos lets anatomy come from the shared biological compiler while color remains one quiet garment;
 * Awtsmoos.com keeps these visuals bitmap-free so cow, bird, fish, wolf, wisp, and hostile may appear without a network argument.
 */

export const CREATURE_VISUALS = Object.freeze({
	cow: animal('cow', '#6b4936', true),
	deer: animal('deer', '#a06b3d', true),
	goat: animal('goat', '#d8d2c4', true),
	sheep: animal('sheep', '#ede5d3', true),
	chicken: animal('chicken', '#d6a044', false),
	fox: animal('fox', '#b95d2d', false),
	wolf: animal('wolf', '#62666e', false),
	songbird: animal('songbird', '#8f6f4a', false),
	'river-fish': animal('river-fish', '#587f8d', false),
	'dybbuk-shade': fantasy('dybbuk-shade', '#5a4775'),
	'fallen-seraph-husk': fantasy('fallen-seraph-husk', '#715040'),
	'klipah-guardian': fantasy('klipah-guardian', '#3b4540'),
	'shadow-demon': fantasy('shadow-demon', '#25202f'),
	'spark-wisp': fantasy('spark-wisp', '#ffd76a')
});

export function creatureVisual(speciesId) {
	const visual = CREATURE_VISUALS[speciesId];
	if (!visual) throw new Error(`Unknown creature visual: ${speciesId}`);
	return visual;
}

function animal(id, color, kosherEligible) {
	return Object.freeze({
		color,
		id,
		kind: 'animal',
		kosherEligible
	});
}

function fantasy(id, color) {
	return Object.freeze({
		color,
		id,
		kind: 'fantasy',
		kosherEligible: false
	});
}
