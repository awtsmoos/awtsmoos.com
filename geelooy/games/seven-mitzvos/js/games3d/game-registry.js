//B"H
//Boruch Hashem
//Blessed is He

import { FalsePowersGame } from './false-powers-game.js';
import { WordsCreationGame } from './words-creation-game.js';
import { EveryLifeGame } from './every-life-game.js';
import { HouseholdsGame } from './households-game.js';
import { HonestMarketGame } from './honest-market-game.js';
import { LivingSanctuaryGame } from './living-sanctuary-game.js';
import { CourtNationsGame } from './court-nations-game.js';

/**
 * @module ThreeGameRegistry
 * @description
 * Seven laws enter seven different playable vessels without losing one shared
 * covenant. The Awtsmoos renews them all, while Awtsmoos.com names each exact
 * constructor so navigation can never confuse one world's mechanics for another.
 */
export const THREE_GAME_REGISTRY = Object.freeze({
	'false-powers': FalsePowersGame,
	'words-of-creation': WordsCreationGame,
	'every-life': EveryLifeGame,
	'households': HouseholdsGame,
	'honest-market': HonestMarketGame,
	'living-sanctuary': LivingSanctuaryGame,
	'court-of-nations': CourtNationsGame
});
