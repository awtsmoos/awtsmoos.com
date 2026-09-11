//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file HtmlProductMetadata.test.js
 * @description
 * Proves static HTML receives install metadata only when the same server product
 * directory can actually answer the resulting manifest request.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const {
	revealProductMetadata
} = require("./HtmlProductMetadata.js");

const rootDir = path.resolve(__dirname, "../../../geelooy");
const HTML = "<!doctype html><html><head><title>Test</title></head><body></body></html>";

/**
 * Reveals metadata for one public-root index file.
 * @param {string} relativePath Path beneath geelooy.
 * @returns {string} Revealed HTML.
 */
function reveal(relativePath) {
	return revealProductMetadata(HTML, {
		rootDir,
		filePath: path.join(rootDir, relativePath)
	});
}

test("catalog shell does not receive a manifest that would 404", () => {
	const html = reveal("apps/index.html");
	assert.doesNotMatch(html, /rel="manifest"/);
});

test("profile shell does not receive an unregistered install manifest", () => {
	const html = reveal("profile/index.html");
	assert.doesNotMatch(html, /rel="manifest"/);
});


test("Geelooy OS receives its explicit core install manifest", () => {
	const html = reveal("os/index.html");
	assert.match(html, /manifest\?route=%2Fos%2F/);
});

test("verified nested commerce product retains install metadata", () => {
	const html = reveal("apps/docs/index.html");
	assert.match(html, /manifest\?route=%2Fapps%2Fdocs%2F/);
});
