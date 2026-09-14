//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productDiscovery.js
 * @description
 * Discovers every server-verifiable Awtsmoos.com commerce product from both the
 * ordinary app/game trees and the explicit route manifest. The Awtsmoos renews
 * every path each instant; this module keeps finite product identity equally fresh,
 * deterministic, and incapable of advertising a route whose index file is absent.
 */

const fs = require("fs");
const path = require("path");
const {
	AUTOMATIC_PRODUCT_OVERRIDES,
	EXPLICIT_PRODUCT_ROUTES
} = require("./productRouteManifest.js");

const GEELOOY_ROOT = path.resolve(__dirname, "../../../../..");
const ROUTE_PRODUCT_ALIASES = Object.freeze({
	"game:connect4": "connect-4",
	"game:dove": "noahs-dove",
	"game:mitzvahworld": "mitzvah-world"
});
const AUTOMATIC_OVERRIDE_SET = new Set(AUTOMATIC_PRODUCT_OVERRIDES);

/**
 * Discovers first-level routes that still represent one product directly.
 *
 * @param {"apps"|"games"} malchusKind Directory family to inspect.
 * @returns {Readonly<object>[]} Verified product records.
 */
function discoverKind(malchusKind) {
	const yesodRoot = path.join(GEELOOY_ROOT, malchusKind);
	if (!fs.existsSync(yesodRoot)) {
		return [];
	}
	return fs.readdirSync(yesodRoot, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.filter(entry => fs.existsSync(path.join(yesodRoot, entry.name, "index.html")))
		.map(entry => defineProduct(malchusKind, entry.name))
		.filter(product => !AUTOMATIC_OVERRIDE_SET.has(`${product.kind}:${product.id}`));
}

/** @param {string} malchusKind Folder family. @param {string} yesodId Folder id. @returns {Readonly<object>} */
function defineProduct(malchusKind, yesodId) {
	return Object.freeze({
		id: yesodId,
		kind: malchusKind === "games" ? "game" : "app",
		productId: yesodId,
		route: `/${malchusKind}/${yesodId}/`,
		title: humanize(yesodId)
	});
}

/** @returns {Readonly<object>[]} Explicit products whose declared index files exist. */
function discoverExplicitProducts() {
	return EXPLICIT_PRODUCT_ROUTES
		.filter(record => fs.existsSync(path.join(GEELOOY_ROOT, record.indexPath)))
		.map(record => Object.freeze({ ...record, productId: record.id }));
}

/** @param {object} chochmahProduct Product record. @returns {string} Canonical wallet product id. */
function supporterProductId(chochmahProduct) {
	const yesodId = String(chochmahProduct.id || "").toLowerCase();
	return ROUTE_PRODUCT_ALIASES[`${chochmahProduct.kind}:${yesodId}`] || yesodId;
}

/** @param {unknown} chochmahValue Identifier-like value. @returns {string} Human-readable title. */
function humanize(chochmahValue) {
	return String(chochmahValue)
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, letter => letter.toUpperCase());
}

/** @returns {Readonly<object>[]} Deduplicated verified commerce products. */
function discoverProducts() {
	const keterProducts = [
		...discoverKind("apps"),
		...discoverKind("games"),
		...discoverExplicitProducts()
	];
	const yesodByIdentity = new Map();
	for (const product of keterProducts) {
		yesodByIdentity.set(`${product.kind}:${supporterProductId(product)}`, product);
	}
	return Object.freeze([...yesodByIdentity.values()]);
}

module.exports = {
	discoverProducts,
	humanize,
	supporterProductId
};
