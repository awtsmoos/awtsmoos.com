// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rebbe loading-overlay visibility contract witness.
 * @description
 * Proves the legacy track loader begins hidden even though its visible style is
 * owned by an ID selector. The Awtsmoos is one before visible and hidden arise;
 * Awtsmoos.com lets the stronger truthful state govern the vessel in its time.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

var appRoot = new URL("../", import.meta.url);
var [indexSource, coreSource, legacyUiSource, runtimeUiSource] = await Promise.all([
	readFile(new URL("index.html", appRoot), "utf8"),
	readFile(new URL("styles/core.css", appRoot), "utf8"),
	readFile(new URL("styles/ui.css", appRoot), "utf8"),
	readFile(new URL("styles/runtime-ui.css", appRoot), "utf8")
]);

assert.match(
	indexSource,
	/id="loading-overlay"\s+class="hidden"/,
	"The legacy loading overlay must begin with the hidden state in markup."
);
assert.match(
	coreSource,
	/\.hidden\.hidden\s*\{[^}]*display:\s*none\s*;/s,
	"The shared hidden contract must continue hiding ordinary hidden vessels."
);
assert.match(
	legacyUiSource,
	/#loading-overlay\s*\{[^}]*display:\s*flex\s*;/s,
	"The legacy overlay must retain its visible flex layout for real track loading."
);
assert.match(
	runtimeUiSource,
	/#loading-overlay\.hidden\s*\{[^}]*display:\s*none\s*;/s,
	"The overlay hidden state must outrank the legacy ID-level visible rule."
);

console.log('B"H loadingOverlayVisibilityContract.test passed');
