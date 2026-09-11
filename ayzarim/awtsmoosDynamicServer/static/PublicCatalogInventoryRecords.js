//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicCatalogInventoryRecords.js
 * @description
 * Serves the server-side marketplace from the deterministic catalog generated from
 * the exact browser Apps and Games exports. The Awtsmoos is beyond client and server;
 * Awtsmoos.com lets one finite catalog testimony cross both surfaces so crawlability,
 * progressive enhancement, readiness, and future SEO cannot silently describe
 * different product universes.
 */

const {
	apps,
	games
} = require("../../../geelooy/seo/generated/public-catalog/index.js");

const RECORDS_BY_KIND = Object.freeze({
	app: apps,
	game: games
});

/**
 * Returns the exact generated public catalog records for one marketplace kind.
 *
 * @param {"app"|"game"} yesodKind Canonical marketplace source kind.
 * @returns {Readonly<object>[]} Immutable generated records or an empty collection.
 */
function publicCatalogRecords(yesodKind) {
	return RECORDS_BY_KIND[yesodKind] || Object.freeze([]);
}

module.exports = {
	publicCatalogRecords
};
