//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productManifest.test.js
 * @description
 * Proves install metadata comes from verified server products, normalizes routes,
 * and refuses browser-invented launch scopes. The manifest endpoint may therefore
 * be cached publicly without turning query parameters into product authority.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildProductManifest, normalizeRoute } = require("./productManifest.js");

test("verified product route receives product-scoped install manifest", () => {
	const result = buildProductManifest("/apps/docs");
	assert.equal(result.ok, true);
	assert.equal(result.manifest.start_url, "/apps/docs/");
	assert.equal(result.manifest.scope, "/apps/docs/");
	assert.equal(result.manifest.display, "standalone");
	assert.equal(result.manifest.icons[0].src, "/favicon.svg");
});

test("unknown route cannot invent install identity", () => {
	assert.deepEqual(
		buildProductManifest("/apps/not-a-real-product/"),
		{ ok: false, error: "unknown_product_route" }
	);
});

test("route normalization removes query and fragment testimony", () => {
	assert.equal(normalizeRoute("apps/docs?fake=1#x"), "/apps/docs/");
});
