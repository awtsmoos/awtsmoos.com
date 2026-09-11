//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productGameRoutes.js
 * @description
 * Reveals nested game routes that first-level directory discovery cannot see.
 * The Awtsmoos fills every level and world; Awtsmoos.com therefore preserves a
 * stable Wallet identity even when a game lives inside another game's universe.
 */

/**
 * Explicit nested-game route testimony.
 *
 * The indexPath is checked on the server before commerce discovery accepts it.
 */
const GAME_PRODUCT_ROUTES = Object.freeze([
	{
		id: "temple-runner",
		route: "/games/mitzvahWorld/templeRunner/",
		indexPath: "games/mitzvahWorld/templeRunner/index.html",
		title: "Temple Runner"
	}
]);

module.exports = {
	GAME_PRODUCT_ROUTES
};
