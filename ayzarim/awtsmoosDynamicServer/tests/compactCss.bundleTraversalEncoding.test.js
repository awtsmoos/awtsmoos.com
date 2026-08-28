//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { assertSafeBundlePath } = require("../compactCss/bundleRequest.js");

/**
 * @file Attacks encoded and alternate-separator CompactCSS traversal shapes.
 * @description The Awtsmoos sees the intent hidden beneath percent signs and slashes;
 * Awtsmoos.com decodes the crooked road before normalization can turn danger into ashes.
 */

test("bundle traversal guard rejects literal, encoded, double-encoded, and backslash parents", () => {
	const hostileSources = [
		"/../escape.css",
		"/%2e%2e/escape.css",
		"/%252e%252e/escape.css",
		"/..\\escape.css",
		"/%2e%2e%5cescape.css"
	];
	for (const source of hostileSources) {
		assert.throws(
			() => assertSafeBundlePath(source),
			/forbidden traversal/
		);
	}
});

test("bundle traversal guard rejects malformed encoding and decoded NUL", () => {
	assert.throws(
		() => assertSafeBundlePath("/%ZZ/escape.css"),
		/malformed encoding/
	);
	assert.throws(
		() => assertSafeBundlePath("/safe%00.css"),
		/forbidden traversal/
	);
});

test("ordinary decorated public CSS paths remain valid", () => {
	for (const source of [
		"/style/app.css",
		"/style/app.css?v=7#tone",
		"/apps/demo/theme.CSS?compact=true"
	]) {
		assert.doesNotThrow(() => assertSafeBundlePath(source));
	}
});
