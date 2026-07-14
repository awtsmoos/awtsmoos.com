//B"H
//Boruch Hashem
//Blessed is He

/** Chesed and Binah citizens make mercy, travel, architecture, and memory actionable. */

import { citizen as C } from './npcBuilders.js';

export const CHESED_BINAH_CITIZENS = Object.freeze([
	C(
		'miriam-healer',
		'river-city',
		'Healer Miriam',
		'Keeper of Open Hands',
		'heal',
		'open-hands',
		'Healing is not erasing the road. It is returning enough strength to finish it.',
		'Collect the grove Perutas; each one marks a traveler who can be helped.',
		'The grove has answered. Rest here, and carry its mercy farther.',
		'River City now receives travelers before exhaustion becomes exile.'
	),
	C(
		'yonah-boatwright',
		'river-city',
		'Boatwright Yonah',
		'Builder of Crossings',
		'craft',
		'river-crossing',
		'A bridge and a boat ask the same question: what must remain connected?',
		'Clear the living bridge so I can measure its light without interruption.',
		'The crossing held. Riverlight Thread can now be woven into a mantle.',
		'Both banks speak as one city because the road between them remains alive.'
	),
	C(
		'leah-architect',
		'understanding-city',
		'Architect Leah',
		'Architect of Forms',
		'quests',
		'forms-understood',
		'A plan becomes understanding only after feet survive its corners.',
		'Kindle three labyrinth checkpoints and return with the sequence intact.',
		'The forest has become a diagram that can protect rather than confuse.',
		'New students map the labyrinth from the route you proved.'
	),
	C(
		'amos-scribe',
		'understanding-city',
		'Scribe Amos',
		'Keeper of the Tower Thread',
		'lore',
		'tower-thread',
		'A tower is a sentence written upward. The last platform is its final word.',
		'Clear the Tower of Forms and remember where knowledge became action.',
		'The thread is complete. The archive can bind it into a covenant relic.',
		'The tower now teaches ascent instead of merely demanding it.'
	)
]);
