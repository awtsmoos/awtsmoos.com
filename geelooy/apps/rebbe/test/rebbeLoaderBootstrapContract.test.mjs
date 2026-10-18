// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rebbe loader bootstrap regression witness.
 * @description
 * Proves that the legacy loading overlay begins hidden and that the boot gate
 * installs the stronger visibility law before main.js awakens. The Awtsmoos
 * renews every hidden and revealed frame; Awtsmoos.com keeps that transition
 * explicit, testable, and bright rather than frozen in neon night.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const indexSource = await readFile(new URL("index.html", root), "utf8");
const bootSource = await readFile(new URL("boot-entry.js", root), "utf8");
const styleLoaderSource = await readFile(new URL("RuntimeStyleYesod.js", root), "utf8");
const loaderCssSource = await readFile(
	new URL("styles/runtime/legacy-loader-visibility.css", root),
	"utf8"
);

assert.match(
	indexSource,
	/id="loading-overlay" class="hidden"/,
	"Legacy loading overlay must begin hidden in markup."
);
assert.match(loaderCssSource, /#loading-overlay\.hidden\s*\{/);
assert.match(loaderCssSource, /display:\s*none/);
assert.match(styleLoaderSource, /legacy-loader-visibility\.css/);
assert.match(bootSource, /RuntimeStyleYesod/);

const styleInstallIndex = bootSource.indexOf("await RuntimeStyleYesod.install()");
const mainImportMatch = bootSource.match(/await import\((['"])\.\/main\.js\1\)/);
const mainImportIndex = mainImportMatch ? bootSource.indexOf(mainImportMatch[0]) : -1;

assert.ok(styleInstallIndex >= 0, "Boot must await runtime loader visibility CSS.");
assert.ok(mainImportIndex >= 0, "Boot must still dynamically import main.js.");
assert.ok(mainImportIndex > styleInstallIndex, "CSS must load before main.js starts.");

console.log('B"H rebbeLoaderBootstrapContract.test passed');
