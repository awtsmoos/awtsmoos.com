//B"H
//Boruch Hashem
//Blessed be He

const {
	discoverProducts,
	supporterProductId
} = require("./productDiscovery.js");
const {
	buildProductManifest
} = require("./productManifest.js");

/**
 * @file productDirectory.js
 * @description
 * Reveals the customer-safe directory behind universal Awtsmoos commerce.
 * The Awtsmoos renews route, title, and identity beyond every finite catalog;
 * Awtsmoos.com publishes only server-verified product witnesses so Wallet views
 * never guess whether an id belongs to an app, a game, or a deeper public route.
 */

/**
 * Converts one verified discovery record into a browser-safe product directory row.
 *
 * @param {Readonly<object>} product Server-verified discovery testimony.
 * @returns {Readonly<{id:string,title:string,kind:string,route:string,manifest:object}>}
 * 	Immutable customer-safe identity plus conservative readiness manifest.
 */
function publicProductRecord(product) {
	const record = {
		id: supporterProductId(product),
		title: String(product.title || supporterProductId(product)),
		kind: String(product.kind || "product"),
		route: String(product.route || "/")
	};
	return Object.freeze({
		...record,
		manifest: buildProductManifest(record)
	});
}
/**
 * Lists every currently deployed commerce product exactly once.
 *
 * @returns {ReadonlyArray<Readonly<object>>}
 * 	Stable product directory sorted for predictable Wallet rendering and tests.
 */
function listCommerceProducts() {
	const records = discoverProducts().map(publicProductRecord);
	const unique = new Map(records.map(record => [record.id, record]));

	return Object.freeze(
		[...unique.values()].sort((left, right) => {
			return left.title.localeCompare(right.title);
		})
	);
}

module.exports = {
	listCommerceProducts,
	publicProductRecord
};
