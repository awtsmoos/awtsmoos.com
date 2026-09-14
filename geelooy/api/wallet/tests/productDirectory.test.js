//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productDirectory.test.js
 * @description
 * Proves the public commerce directory exposes verified product identities and
 * routes without private account state. The Awtsmoos is beyond every pathname;
 * Awtsmoos.com still preserves stable finite doorways for Wallet recovery links.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	listCommerceProducts
} = require("../core/commerce/platform/productDirectory.js");
const {
	commerceProducts
} = require("../routes/commerceProducts.js");
const {
	payload,
	routeContext
} = require("./commerceRouteFixture.js");

/** Every public product identity and route must remain unique. */
test("verified product directory has unique ids and routes", () => {
	const products = listCommerceProducts();
	const ids = new Set(products.map((product) => product.id));
	const routes = new Set(products.map((product) => product.route));

	assert.ok(products.length >= 60);
	assert.equal(ids.size, products.length);
	assert.equal(routes.size, products.length);
	assert.equal(products.every((product) => product.route.startsWith("/")), true);
});

/** Nested explicit products retain the canonical public route declared by testimony. */
test("directory preserves nested product routes", () => {
	const templeRunner = listCommerceProducts().find((product) => {
		return product.id === "temple-runner";
	});

	assert.equal(
		templeRunner?.route,
		"/games/mitzvahWorld/templeRunner/"
	);
});

/** Public route exposes no account-specific data and requires no authentication. */
test("commerce products route is public read-only testimony", () => {
	const result = payload(commerceProducts(routeContext()));

	assert.equal(result.ok, true);
	assert.ok(Array.isArray(result.products));
	assert.ok(result.products.length >= 60);
	assert.equal("entitlements" in result, false);
	assert.equal("receipts" in result, false);
	assert.equal("productCredits" in result, false);
});