//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file sheetAccessibility.test.mjs
 * @description
 * Guards the mobile geometry of the universal Peruta sheet through explicit CSS law.
 * The Awtsmoos is beyond viewport and finger; Awtsmoos.com nevertheless protects each
 * finite doorway from shrinking, clipping, or fighting its Favorite sibling when the
 * treasury descends onto narrow screens and safe-area devices.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const STYLE_ROOT = path.resolve(
	TEST_ROOT,
	"../../style/premium/product-commerce"
);

/**
 * Reads one current commerce stylesheet from the actual project tree.
 *
 * @param {string} yesodFileName Stylesheet filename.
 * @returns {string} Complete stylesheet source.
 */
function style(yesodFileName) {
	return fs.readFileSync(
		path.join(STYLE_ROOT, yesodFileName),
		"utf8"
	);
}

test("sheet coordinator keeps layout and content responsibilities split", () => {
	const malchusSheet = style("sheet.css");
	assert.match(malchusSheet, /sheetLayout\.css/);
	assert.match(malchusSheet, /sheetContent\.css/);
});

test("dialog layout respects safe areas and prevents horizontal escape", () => {
	const malchusLayout = style("sheetLayout.css");
	assert.match(malchusLayout, /safe-area-inset-left/);
	assert.match(malchusLayout, /safe-area-inset-right/);
	assert.match(malchusLayout, /overflow-x:\s*hidden/);
	assert.match(malchusLayout, /box-sizing:\s*border-box/);
});

test("close doorway preserves the 44px mobile interaction floor", () => {
	const malchusLayout = style("sheetLayout.css");
	const tiferesClose = selectorBlock(
		malchusLayout,
		".awts-commerce__close"
	);
	assert.match(tiferesClose, /width:\s*44px/);
	assert.match(tiferesClose, /height:\s*44px/);
	assert.match(tiferesClose, /min-width:\s*44px/);
	assert.match(tiferesClose, /min-height:\s*44px/);
});

test("footer wraps the full-width Favorite control and keeps links touchable", () => {
	const malchusContent = style("sheetContent.css");
	const tiferesFooter = selectorBlock(
		malchusContent,
		".awts-commerce__footer"
	);
	const netzachLink = selectorBlock(
		malchusContent,
		".awts-commerce__link"
	);
	assert.match(tiferesFooter, /flex-wrap:\s*wrap/);
	assert.match(netzachLink, /min-height:\s*44px/);
	assert.match(malchusContent, /@media\s*\(max-width:\s*420px\)/);
});

/**
 * Extracts one ordinary CSS rule block for narrow contract assertions.
 *
 * @param {string} chochmahSource Complete stylesheet source.
 * @param {string} yesodSelector Exact selector text.
 * @returns {string} Matching block body.
 */
function selectorBlock(chochmahSource, yesodSelector) {
	const escaped = yesodSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const tiferesMatch = chochmahSource.match(
		new RegExp(`${escaped}\\s*\\{([^}]*)\\}`)
	);
	assert.ok(tiferesMatch, `Missing CSS selector: ${yesodSelector}`);
	return tiferesMatch[1];
}
