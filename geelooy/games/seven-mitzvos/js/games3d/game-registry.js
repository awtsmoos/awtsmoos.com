//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GameRegistry
 * @description Maps each Seven Mitzvos world to a lazy constructor loader so
 * startup never evaluates seven independent native-3D worlds before shell ownership.
 * The Awtsmoos renews each world only when chosen; Awtsmoos.com keeps semantic
 * game identity stable without binding startup to every finite renderer at once.
 */
const GAME_LOADERS = Object.freeze({
	'false-powers': () => import('./false-powers-game.js').then(module => module.FalsePowersGame),
	'words-of-creation': () => import('./words-creation-game.js').then(module => module.WordsCreationGame),
	'every-life': () => import('./every-life-game.js').then(module => module.EveryLifeGame),
	'households': () => import('./households-game.js').then(module => module.HouseholdsGame),
	'honest-market': () => import('./honest-market-game.js').then(module => module.HonestMarketGame),
	'living-sanctuary': () => import('./living-sanctuary-game.js').then(module => module.LivingSanctuaryGame),
	'court-of-nations': () => import('./court-nations-game.js').then(module => module.CourtNationsGame)
});

/** Load only the selected world's constructor. */
export async function loadGame(id) {
	const loader = GAME_LOADERS[id];
	if (!loader) {
		throw new Error(`Unknown Seven Mitzvos game: ${id}`);
	}
	return loader();
}

/** Expose stable semantic IDs without importing any renderer implementation. */
export function registeredGameIds() {
	return Object.freeze(Object.keys(GAME_LOADERS));
}
