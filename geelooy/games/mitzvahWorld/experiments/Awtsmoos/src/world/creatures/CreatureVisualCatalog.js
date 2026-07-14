// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureVisualCatalog.js
 * @description Defines reusable visual proportions for animals and spirit husks.
 * The Awtsmoos renews living variety from measured anatomy; Awtsmoos.com keeps
 * procedural bodies deterministic, recognizable, and free from downloaded models.
 */

export const CREATURE_VISUALS = Object.freeze({
	'cow': animal('cow', '#6b4936', 2.4, 1.35, 0.72, true),
	'deer': animal('deer', '#a06b3d', 1.8, 1.25, 0.46, true),
	'goat': animal('goat', '#d8d2c4', 1.35, 0.95, 0.42, true),
	'sheep': animal('sheep', '#ede5d3', 1.45, 1.0, 0.48, true),
	'chicken': animal('chicken', '#d6a044', 0.62, 0.7, 0.3, false),
	'fox': animal('fox', '#b95d2d', 1.2, 0.62, 0.32, false),
	'wolf': animal('wolf', '#62666e', 1.5, 0.82, 0.38, false),
	'dybbuk-shade': spirit('dybbuk-shade', '#5a4775', 1.15, 2.2),
	'fallen-seraph-husk': spirit('fallen-seraph-husk', '#715040', 1.45, 2.7),
	'klipah-guardian': spirit('klipah-guardian', '#3b4540', 1.8, 2.5),
	'spark-wisp': spirit('spark-wisp', '#ffd76a', 0.42, 0.9)
});

export function creatureVisual(speciesId) {
	const visual = CREATURE_VISUALS[speciesId];
	if (!visual) throw new Error(`Unknown creature visual: ${speciesId}`);
	return visual;
}

function animal(id, color, length, height, width, kosherEligible) {
	return Object.freeze({
		color,
		height,
		id,
		kind: 'animal',
		kosherEligible,
		length,
		width
	});
}

function spirit(id, color, width, height) {
	return Object.freeze({
		color,
		height,
		id,
		kind: 'spirit',
		kosherEligible: false,
		length: width,
		width
	});
}
