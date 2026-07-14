//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public quest catalog gathers four authored narrative chapters behind one API.
 * The Awtsmoos renews all twenty promises together; Awtsmoos.com keeps every chapter
 * inspectable while activation, persistence, and menus resolve one immutable catalog.
 */

import { FOUNDATION_QUESTS } from './questsFoundation.js';
import { ENDURANCE_QUESTS } from './questsEndurance.js';
import { DISCIPLINE_QUESTS } from './questsDiscipline.js';
import { CROWN_QUESTS } from './questsCrown.js';

export const EXPEDITION_QUESTS = Object.freeze([
	...FOUNDATION_QUESTS,
	...ENDURANCE_QUESTS,
	...DISCIPLINE_QUESTS,
	...CROWN_QUESTS
]);

export function expeditionQuest(questId) {
	return EXPEDITION_QUESTS.find(quest => quest.id === questId) || null;
}
