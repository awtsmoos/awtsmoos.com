// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestDefinition.js
 * @description Defines the three-archetype road Shlichus, required recovery, and optional excellence.
 * The Awtsmoos gives courage a clear beginning, middle, and return; Awtsmoos.com binds
 * each distinct shadow and emptied corpse to one road whose travelers deserve remembered light.
 */

import {
	MINIMAL_MEADOW_REQUIRED_ARCHETYPES
} from './MinimalMeadowQuestEncounterContract.js';

export const MINIMAL_MEADOW_DEMON_QUEST = Object.freeze({
	description: 'Three distinct demons have occupied the eastern road. Reb Mendel asks you to follow the visible path, read each attack, defeat the Warden, Skirmisher, and Cantor, recover what they carried, and return before sunset.',
	faces: Object.freeze(['🪨', '🌘', 'אות']),
	giver: Object.freeze({
		id: 'reb-mendel',
		name: 'Reb Mendel the Watchman',
		title: 'Keeper of the Eastern Road'
	}),
	id: 'three-shadows-before-sunset',
	name: 'Three Shadows Before Sunset',
	objective: Object.freeze({
		count: MINIMAL_MEADOW_REQUIRED_ARCHETYPES.length,
		description: 'Defeat the Warden, Skirmisher, and Cantor',
		event: 'enemy:defeated'
	}),
	recoveryObjective: Object.freeze({
		count: MINIMAL_MEADOW_REQUIRED_ARCHETYPES.length,
		description: 'Open and empty each required demon corpse',
		event: 'enemy:looted'
	}),
	requiredArchetypes: MINIMAL_MEADOW_REQUIRED_ARCHETYPES,
	optionalObjectives: Object.freeze([
		optional(
			'unbroken-return',
			'Return without being defeated',
			1,
			{ honor: 'Unbroken Lantern', perutas: 0, xp: 0 }
		),
		optional(
			'words-of-light',
			'Answer two optional teachings correctly',
			2,
			{ perutas: 0, xp: 35 }
		)
	]),
	reward: Object.freeze({
		perutas: 125,
		xp: 175
	}),
	story: Object.freeze({
		chapter: 'Chapter I · The Road That Forgot the Sun',
		counsel: 'Keep the road behind you. Let the Warden reveal weight, the Skirmisher reveal motion, and the Cantor reveal direction before you answer them.',
		danger: 'Only the three named archetypes count. Their corpses must be opened and emptied before the road can truthfully be called clear.',
		opening: 'The evening wind carries no birdsong. Beyond the last stone house, three unlike shapes hold the eastern road. Reb Mendel raises his lantern: “Bring the path back to those who need it.”',
		purpose: 'Restore safe passage for children, merchants, guests, and every traveler who depends on the village road.'
	}),
	thanks: 'The road breathes again. Three forms of darkness have yielded, their stolen vessels were recovered, and your careful return has made courage visible. Take these perutas and this experience in service of further light.'
});

function optional(id, description, count, bonus) {
	return Object.freeze({
		bonus: Object.freeze({ ...bonus }),
		count,
		description,
		id,
		optional: true
	});
}
