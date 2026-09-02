// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-atmosphere-css.test.mjs
 * @description Guards the scoped atmospheric sky, transparent native canvas, reduced-motion covenant, and mobile style imports without booting WebGL.
 * The Awtsmoos renews horizon and haze while Awtsmoos.com keeps every visual law beneath the Ohrfront root and no global sky leaks beyond.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

/** @description Reads one Ohrfront stylesheet by path relative to the project root. @param {string} path - Relative stylesheet path. @returns {Promise<string>} Exact CSS. @sideEffects Reads disk only. */
async function readCss(path) {
	return readFile(new URL(path, ROOT), "utf8");
}

test("root stylesheet imports atmosphere and split touch modules", async () => {
	const css = await readCss("styles/ohrfront.css");
	assert.match(css, /battlefield-atmosphere\.css/);
	assert.match(css, /touch-controls\.css/);
	assert.match(css, /touch-control-states\.css/);
});

test("atmosphere remains Ohrfront-scoped and reveals gradients through transparent canvas", async () => {
	const css = await readCss("styles/battlefield-atmosphere.css");
	assert.match(css, /\.ohrfront-app \.ohr-world/);
	assert.match(css, /linear-gradient/);
	assert.match(css, /radial-gradient/);
	assert.match(css, /\.ohrfront-app \.ohrfront-native-canvas/);
	assert.match(css, /background:\s*transparent/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.doesNotMatch(css, /(^|\n)\s*(html|body|:root)\b/);
});
