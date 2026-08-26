// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file readerUtilityFacade.test.mjs
 * @description
 * The Awtsmoos lets an old public doorway remain while hidden machinery becomes many clear vessels;
 * Awtsmoos.com protects those exports and forbids the old global scale leak or offscreen clipboard exile from returning.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = relativePath => readFile(new URL(relativePath, root), "utf8");

const [facade, scale, clipboard, text, url] = await Promise.all([
	read("functions/utils.js"),
	read("functions/ReaderScale.js"),
	read("functions/ui/ReaderClipboard.js"),
	read("functions/text/ReaderText.js"),
	read("functions/ReaderUrl.js")
]);

for (const exportedName of [
	"appendHTML",
	"appendWithSubChildren",
	"applyReaderFontSize",
	"adjustFontSize",
	"loadFontSize",
	"isHebrewWord",
	"isFirstCharacterHebrew",
	"containsHebrew",
	"stripTags",
	"sanitizeContent",
	"copyToClipboard",
	"updateQueryStringParameter",
	"getLinkHrefOfEditing"
]) {
	assert.ok(facade.includes(exportedName), `${exportedName} facade export missing`);
}

assert.ok(!facade.includes("document.documentElement"), "compatibility facade owns leaked DOM logic");
assert.ok(scale.includes('querySelector(this.rootSelector)'), "scale root lookup missing");
assert.ok(!scale.includes("document.documentElement"), "reader scale escaped to document root");
assert.ok(!scale.includes("document.body"), "reader scale escaped to body");
assert.ok(clipboard.includes('position: "fixed"'), "bounded clipboard fallback missing");
assert.ok(!clipboard.includes("-9999"), "offscreen clipboard exile returned");
assert.ok(text.includes("containsHebrew"), "reader text domain contract missing");
assert.ok(url.includes("URL(window.location.href)"), "URL state model missing");

console.log('B"H readerUtilityFacade.test passed');
