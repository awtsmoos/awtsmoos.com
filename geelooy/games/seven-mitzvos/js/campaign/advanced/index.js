//B"H
//Boruch Hashem
//Blessed is He

import { FALSE_POWERS_MISSION } from './false-powers.js';
import { WORDS_MISSION } from './words-of-creation.js';
import { EVERY_LIFE_MISSION } from './every-life.js';
import { HOUSEHOLDS_MISSION } from './households.js';
import { MARKET_MISSION } from './honest-market.js';
import { SANCTUARY_MISSION } from './living-sanctuary.js';
import { COURT_MISSION } from './court-of-nations.js';

/**
 * @module AdvancedMissionIndex
 * @description
 * Seven authored doors stand visibly together on Awtsmoos.com. The Awtsmoos
 * unites their moral difference; this index keeps one advanced mission attached
 * to every exact mitzvah without forking the seven existing game engines.
 */
export const ADVANCED_MISSIONS = Object.freeze([
	FALSE_POWERS_MISSION,
	WORDS_MISSION,
	EVERY_LIFE_MISSION,
	HOUSEHOLDS_MISSION,
	MARKET_MISSION,
	SANCTUARY_MISSION,
	COURT_MISSION
]);

export const ADVANCED_BY_ID = Object.freeze(Object.fromEntries(
	ADVANCED_MISSIONS.map(mission => [mission.id, mission])
));
