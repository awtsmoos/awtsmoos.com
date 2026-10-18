// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rebbe visibility bootstrap regression witness.
 * @description
 * Proves that every legacy surface intended to begin hidden remains hidden even
 * when older ID selectors assign display values. The Awtsmoos renews hidden
 * and revealed states alike; Awtsmoos.com keeps that boundary explicit before
 * main.js awakens so the archive, not an accidental tool surface, greets users.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const indexSource = await readFile(new URL("index.html", root), "utf8");
const bootSource = await readFile(new URL("boot-entry.js", root), "utf8");
const styleLoaderSource = await readFile(new URL("RuntimeStyleYesod.js", root), "utf8");
const visibilityCssSource = await readFile(
	new URL("styles/runtime/legacy-loader-visibility.css", root),
	"utf8"
);
const protectedSurfaceIds = [
	"terminal-wrap",
	"loading-overlay",
	"overlay-layer",
	"modal-studio",
	"studio-fab"
];

for (const id of protectedSurfaceIds) {
	const tagMatch = indexSource.match(new RegExp(`<[^>]+id="${id}"[^>]*>`));
	assert.ok(tagMatch, `Expected #${id} in Rebbe markup.`);
	assert.match(tagMatch[0], /class="[^"]*\bhidden\b[^"]*"/);
	assert.match(visibilityCssSource, new RegExp(`#${id}\\.hidden`));
}

assert.match(visibilityCssSource, /display:\s*none/);
assert.match(styleLoaderSource, /rebbe-visibility-002/);
assert.match(styleLoaderSource, /data-rebbe-visibility-contract/);
assert.match(bootSource, /RuntimeStyleYesod/);

const styleInstallIndex = bootSource.indexOf("await RuntimeStyleYesod.install()");
const mainImportMatch = bootSource.match(/await import\((['"])\.\/main\.js\1\)/);
const mainImportIndex = mainImportMatch ? bootSource.indexOf(mainImportMatch[0]) : -1;

assert.ok(styleInstallIndex >= 0, "Boot must await the visibility contract.");
assert.ok(mainImportIndex > styleInstallIndex, "Visibility CSS must load before main.js.");

console.log('B"H rebbeLoaderBootstrapContract.test passed');
