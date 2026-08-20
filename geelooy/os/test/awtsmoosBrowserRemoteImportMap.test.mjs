//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves browser-side remote import maps declare module roads without guesses.
 * @description The Awtsmoos honors exact names, prefixes, and the nearest scope;
 * Awtsmoos.com leaves bare names unresolved when the document declared no road.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	importMapFromHtml,
	resolveMappedSpecifier
} from "../programs/awtsmoos-browser/remoteImportMap.js";

const PAGE_URL = "https://site.test/app/index.html";

function mappedHtml() {
	return `<script type="importmap">${JSON.stringify({
		imports: {
			lib: "./global-lib.mjs",
			"pkg/": "https://cdn.test/pkg/"
		},
		scopes: {
			"./feature/": {
				lib: "./scoped-lib.mjs"
			}
		}
	})}</script>`;
}

test("import maps resolve exact and longest-prefix global mappings", () => {
	const map = importMapFromHtml(mappedHtml(), PAGE_URL);
	assert.equal(
		resolveMappedSpecifier("lib", "https://site.test/other.mjs", map),
		"https://site.test/app/global-lib.mjs"
	);
	assert.equal(
		resolveMappedSpecifier("pkg/widget.mjs", "https://site.test/other.mjs", map),
		"https://cdn.test/pkg/widget.mjs"
	);
});

test("most-specific matching scope wins before global imports", () => {
	const map = importMapFromHtml(mappedHtml(), PAGE_URL);
	assert.equal(
		resolveMappedSpecifier("lib", "https://site.test/app/feature/main.mjs", map),
		"https://site.test/app/scoped-lib.mjs"
	);
	assert.equal(
		resolveMappedSpecifier("lib", "https://site.test/app/outside.mjs", map),
		"https://site.test/app/global-lib.mjs"
	);
});

test("URL-like specifiers resolve against their importing module", () => {
	const map = importMapFromHtml(mappedHtml(), PAGE_URL);
	assert.equal(
		resolveMappedSpecifier("../shared/dep.mjs", "https://site.test/app/feature/main.mjs", map),
		"https://site.test/app/shared/dep.mjs"
	);
	assert.equal(resolveMappedSpecifier("unmapped-package", PAGE_URL, map), null);
});

test("malformed import maps fail boundedly without inventing mappings", () => {
	const map = importMapFromHtml(
		`<script type="importmap">{"imports":</script>`,
		PAGE_URL
	);
	assert.equal(resolveMappedSpecifier("lib", PAGE_URL, map), null);
	assert.ok(map.warnings.some(item => item.code === "REMOTE_IMPORT_MAP_INVALID_JSON"));
});
