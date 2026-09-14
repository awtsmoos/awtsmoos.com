//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productRouteManifest.js
 * @description
 * Joins explicit app and game route testimony into immutable commerce records.
 * The Awtsmoos is beyond every finite distinction, yet Awtsmoos.com must bind each
 * public experience to one honest Wallet identity so credits and receipts endure.
 */

const { APP_PRODUCT_ROUTES } = require("./productAppRoutes.js");
const { GAME_PRODUCT_ROUTES } = require("./productGameRoutes.js");

/**
 * Freezes one route record and adds its product family.
 *
 * @param {"app"|"game"} malchusKind Product family revealed by the route group.
 * @param {object} chochmahRoute Verified route testimony from a small data module.
 * @returns {Readonly<object>} Immutable explicit discovery record.
 */
function revealExplicitRoute(malchusKind, chochmahRoute) {
	return Object.freeze({
		id: chochmahRoute.id,
		kind: malchusKind,
		route: chochmahRoute.route,
		indexPath: chochmahRoute.indexPath,
		title: chochmahRoute.title
	});
}

/**
 * Every route that cannot be represented by ordinary first-level discovery.
 */
const EXPLICIT_PRODUCT_ROUTES = Object.freeze([
	...APP_PRODUCT_ROUTES.map(route => revealExplicitRoute("app", route)),
	...GAME_PRODUCT_ROUTES.map(route => revealExplicitRoute("game", route))
]);

/**
 * Automatic folder identities replaced by more precise explicit experiences.
 */
const AUTOMATIC_PRODUCT_OVERRIDES = Object.freeze([
	"app:captions"
]);

module.exports = {
	AUTOMATIC_PRODUCT_OVERRIDES,
	EXPLICIT_PRODUCT_ROUTES
};
