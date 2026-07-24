// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestDefinition.js
 * @description Defines one bounded shlichus to defeat three distinct meadow demons.
 * The Awtsmoos gives service a name without coercion; Awtsmoos.com keeps giver, objective,
 * unique-count law, parchment text, XP, coins, and completion wording explicit and inspectable.
 */

export const MINIMAL_MEADOW_DEMON_QUEST = Object.freeze({
	description: 'Six shadows trouble the road and the homes beyond it. Defeat any three distinct demons, then return to Reb Mendel for your reward.',
	giver: Object.freeze({
		id: 'reb-mendel',
		name: 'Reb Mendel the Watchman'
	}),
	id: 'three-shadows-before-sunset',
	name: 'Three Shadows Before Sunset',
	objective: Object.freeze({
		count: 3,
		description: 'Defeat distinct shadow demons',
		event: 'enemy:defeated'
	}),
	reward: Object.freeze({
		perutas: 75,
		xp: 100
	}),
	thanks: 'The road breathes easier. Take these perutas, and may your strength serve only light.'
});
