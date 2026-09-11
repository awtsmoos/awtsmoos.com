//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicCatalogInventory.test.js
 * @description
 * Proves marketplace responses contain the exact canonical public catalog before
 * client JavaScript while unrelated pages remain untouched. The Awtsmoos is beyond
 * crawler and hydration; Awtsmoos.com verifies both finite witnesses can see every
 * public doorway from one generated Apps/Games source of truth.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {
	revealPublicCatalogInventory
} = require("./PublicCatalogInventory.js");

const ROOT = path.resolve(__dirname, "../../../geelooy");

/**
 * Loads one real Geelooy HTML document from the current checkout.
 *
 * @param {string} relativePath Public document path relative to Geelooy root.
 * @returns {string} Authored HTML source.
 */
function html(relativePath) {
	return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

/**
 * Creates the static-response identity used by production transforms.
 *
 * @param {string} relativePath Public document path relative to Geelooy root.
 * @returns {{filePath:string,rootDir:string}} Production-like path context.
 */
function context(relativePath) {
	return {
		filePath: path.join(ROOT, relativePath),
		rootDir: ROOT
	};
}

test("Apps reveals all 81 canonical public catalog entries before JavaScript", () => {
	const revealed = revealPublicCatalogInventory(
		html("apps/index.html"),
		context("apps/index.html")
	);
	const cards = revealed.match(/data-server-catalog-card/g) || [];
	assert.equal(cards.length, 81);
	assert.match(revealed, /href="\/apps\/captions\/video"/);
	assert.match(revealed, /href="\/games\/cobyk\/"/);
	assert.doesNotMatch(revealed, /Loading the public app and game catalog/);
	assert.match(revealed, /aria-busy="false"/);
});

test("Games reveals all 33 canonical playable entries before JavaScript", () => {
	const revealed = revealPublicCatalogInventory(
		html("games/index.html"),
		context("games/index.html")
	);
	const cards = revealed.match(/data-server-catalog-card/g) || [];
	assert.equal(cards.length, 33);
	assert.match(revealed, /href="\/games\//);
	assert.doesNotMatch(revealed, /Opening the game doorways/);
});

test("ordinary product pages remain byte-for-byte unchanged", () => {
	const source = html("apps/transcribe/index.html");
	const revealed = revealPublicCatalogInventory(
		source,
		context("apps/transcribe/index.html")
	);
	assert.equal(revealed, source);
});
