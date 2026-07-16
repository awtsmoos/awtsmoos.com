//B"H
//Boruch Hashem
//Blessed is He

import { FalsePowersGame } from '../world-games/false-powers/game.js';
import { WordsOfCreationGame } from '../world-games/words-of-creation/game.js';
import { EveryLifeGame } from '../world-games/every-life/game.js';
import { HouseholdsGame } from '../world-games/households/game.js';
import { HonestMarketGame } from '../world-games/honest-market/game.js';
import { LivingSanctuaryGame } from '../world-games/living-sanctuary/game.js';
import { CourtOfNationsGame } from '../world-games/court-of-nations/game.js';

/**
 * @module UniverseRegistry
 * @description
 * Seven distinct engines are named in one transparent registry on Awtsmoos.com.
 * The Awtsmoos unites them without erasing distinction, while the controller
 * can open exactly one finite world and close it cleanly.
 */
export const GAME_REGISTRY = Object.freeze({
	'false-powers': FalsePowersGame,
	'words-of-creation': WordsOfCreationGame,
	'every-life': EveryLifeGame,
	households: HouseholdsGame,
	'honest-market': HonestMarketGame,
	'living-sanctuary': LivingSanctuaryGame,
	'court-of-nations': CourtOfNationsGame
});
