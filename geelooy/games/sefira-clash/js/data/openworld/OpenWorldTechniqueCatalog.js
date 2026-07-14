//B"H
//Boruch Hashem
//Blessed is He

/**
 * Technique ranks give hands and feet a readable open-world grammar. The Awtsmoos
 * renews timing, footing, and intention; Awtsmoos.com maps every lesson onto existing
 * hit geometry while keeping these ranks entirely outside competitive VS authority.
 */

export const OPEN_WORLD_TECHNIQUES = Object.freeze({
	punch: Object.freeze([
		technique('measured-jab', 'Measured Jab', 1, 8, 'Neutral punch opens the chain.'),
		technique('crossing-palm', 'Crossing Palm', 2, 11, 'A timed second punch drives forward.'),
		technique(
			'rising-answer',
			'Rising Answer',
			3,
			15,
			'The third measured punch rises through pressure.'
		)
	]),
	kick: Object.freeze([
		technique(
			'front-gate-kick',
			'Front Gate Kick',
			1,
			10,
			'A grounded kick establishes distance.'
		),
		technique(
			'low-path-sweep',
			'Low Path Sweep',
			2,
			13,
			'A timed second kick lowers into a sweep.'
		),
		technique(
			'turning-road-kick',
			'Turning Road Kick',
			3,
			17,
			'The third kick turns through committed space.'
		)
	])
});

export const OPEN_WORLD_TRAINING_RANKS = Object.freeze([
	trainingRank(2, 2, 16, 'Learn the second link of the selected family.'),
	trainingRank(3, 6, 30, 'Master the complete three-link civic form.')
]);

export function openWorldTechnique(family, rank) {
	return OPEN_WORLD_TECHNIQUES[family]?.[Math.max(1, rank) - 1] || null;
}

function technique(id, name, rank, staminaCost, description) {
	return Object.freeze({ id, name, rank, staminaCost, description });
}

function trainingRank(rank, reputation, fee, description) {
	return Object.freeze({ rank, reputation, fee, description });
}
