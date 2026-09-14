//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file platformReadiness.test.js
 * @description
 * Guards the public and commercial product graph as one coherent release surface.
 * The Awtsmoos is beyond catalog and doorway; Awtsmoos.com lets games appear in both
 * Apps discovery and Games discovery without inventing duplicate canonical URLs,
 * while every finite route, paid capability, credit pack, and sitemap path stays real.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
	records,
	apps,
	games
} = require("../../../seo/generated/public-catalog/index.js");
const {
	RADIANCE_ACTIONS,
	hasLivePaidActionForProduct
} = require("../core/commerce/paidActionCatalog.js");
const { CREDIT_PACK_SKUS } = require("../core/commerce/creditPackCatalog.js");
const {
	listCommerceProducts
} = require("../core/commerce/platform/productDirectory.js");

const ROOT = path.resolve(__dirname, "../../..");

/**
 * Resolves whether one canonical public route has a concrete filesystem vessel.
 *
 * @param {string} yesodRoute Canonical public route.
 * @returns {boolean} True when a file or directory index exists in Geelooy.
 */
function routeExists(yesodRoute) {
	const netzachRelative = yesodRoute.replace(/^\//, "");
	const tiferesTarget = path.join(ROOT, netzachRelative);
	return fs.existsSync(tiferesTarget)
		|| fs.existsSync(path.join(tiferesTarget, "index.html"));
}

test("public discovery topology is complete, intentional, and resolvable", () => {
	assert.equal(apps.length, 81);
	assert.equal(games.length, 33);
	assert.equal(records.length, 114);
	const appPaths = new Set(apps.map(record => record.canonicalPath));
	const gamePaths = new Set(games.map(record => record.canonicalPath));
	const publicPaths = new Set(records.map(record => record.canonicalPath));
	const identities = records.map(record => `${record.kind}:${record.id}`);
	assert.equal(publicPaths.size, 81);
	assert.equal(gamePaths.size, 33);
	assert.equal(new Set(identities).size, records.length);
	assert.equal(games.every(record => appPaths.has(record.canonicalPath)), true);
	for (const record of records) {
		assert.ok(record.title, record.canonicalPath);
		assert.ok(record.description, record.canonicalPath);
		assert.equal(routeExists(record.canonicalPath), true, record.canonicalPath);
	}
});

test("every monetizable product has live Radiance and three live credit packs", () => {
	const products = listCommerceProducts();
	assert.equal(products.length, 80);
	assert.equal(RADIANCE_ACTIONS.length, 80);
	assert.equal(CREDIT_PACK_SKUS.length, 240);
	for (const product of products) {
		assert.equal(hasLivePaidActionForProduct(product.id), true, product.id);
		const packs = CREDIT_PACK_SKUS.filter(sku => sku.productId === product.id);
		assert.equal(packs.length, 3, product.id);
		assert.equal(packs.every(sku => sku.available === true), true, product.id);
	}
});

test("generated sitemap covers every unique catalog route and excludes API routes", () => {
	const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
	assert.doesNotMatch(sitemap, /<loc>https:\/\/awtsmoos\.com\/api\//);
	const publicPaths = new Set(records.map(record => record.canonicalPath));
	for (const canonicalPath of publicPaths) {
		assert.match(
			sitemap,
			new RegExp(`<loc>https://awtsmoos\\.com${escapeRegExp(canonicalPath)}</loc>`),
			canonicalPath
		);
	}
});

/** @param {string} value Regex literal text. @returns {string} */
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
