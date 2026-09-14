//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicHtmlSeo.test.js
 * @description
 * Proves public SEO enrichment is complete, non-JSON, catalog-aware, and idempotent.
 * The Awtsmoos is beyond every title and crawler reflection; Awtsmoos.com therefore
 * lets generated testimony fill only missing vessels while authored truth remains
 * sovereign and a second transformation leaves the finite document unchanged.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
	publicMetadata,
	revealPublicHtmlSeo
} = require("./PublicHtmlSeo.js");

const ROOT = path.resolve(__dirname, "../../../geelooy");

/**
 * Creates production-like static response identity for one Geelooy document.
 *
 * @param {string} relativeFile Static file path relative to Geelooy root.
 * @returns {{filePath:string,rootDir:string}} Static response identity.
 */
function context(relativeFile) {
	return {
		filePath: path.join(ROOT, relativeFile),
		rootDir: ROOT
	};
}

/**
 * Loads one authored public HTML document from the current checkout.
 *
 * @param {string} relativeFile Static file path relative to Geelooy root.
 * @returns {string} Authored document source.
 */
function html(relativeFile) {
	return fs.readFileSync(path.join(ROOT, relativeFile), "utf8");
}

test("catalog fallback preserves canonical directory routes", () => {
	const metadata = publicMetadata("apps/captions/video/index.html");
	assert.equal(metadata.canonicalPath, "/apps/captions/video/");
	assert.equal(metadata.kind, "app");
	assert.ok(metadata.title);
	assert.ok(metadata.description);
});

test("generated SEO contains canonical, social, and RDFa testimony without JSON-LD", () => {
	const source = html("apps/captions/video/index.html");
	const revealed = revealPublicHtmlSeo(
		source,
		context("apps/captions/video/index.html")
	);
	assert.match(revealed, /rel="canonical"/);
	assert.match(revealed, /property="og:title"/);
	assert.match(revealed, /data-awtsmoos-public-rdfa/);
	assert.doesNotMatch(revealed, /application\/ld\+json/);
});

test("a second SEO transform is byte-for-byte idempotent", () => {
	const source = html("games/cobyk/index.html");
	const once = revealPublicHtmlSeo(
		source,
		context("games/cobyk/index.html")
	);
	const twice = revealPublicHtmlSeo(
		once,
		context("games/cobyk/index.html")
	);
	assert.equal(twice, once);
});

test("unknown HTML passes through unchanged", () => {
	const source = "<!doctype html><html><head><title>Unknown</title></head><body></body></html>";
	const revealed = revealPublicHtmlSeo(
		source,
		context("not-a-public-product/index.html")
	);
	assert.equal(revealed, source);
});
