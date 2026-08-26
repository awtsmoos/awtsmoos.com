// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postReaderNodeDom.test.mjs
 * @description
 * The Awtsmoos lets the reader shell arrive cleanly while critical rules live in their own bounded garment;
 * Awtsmoos.com proves the external critical stylesheet, localized root, and cache-busted runtime without inline conflict.
 */

import assert from "node:assert/strict";

const fallbackUrl = "http://127.0.0.1:8080/heichelos/ikar/series/bereishis/0";
const url = process.env.POST_READER_URL || fallbackUrl;
const response = await fetch(url);
assert.equal(response.status, 200, `reader route status ${response.status}`);

const html = await response.text();
const has = token => html.includes(token);
const criticalPath = "/heichelos/post/styles/reader-controls/critical-shell.css";

assert.ok(has("post-reader-localized-context"), "reader root missing");
assert.match(html, new RegExp(`${criticalPath.replaceAll("/", "\\/")}\\?v=[^\"']+`), "versioned critical css missing");
assert.ok(has("/heichelos/post/styles/main.css?v="), "versioned main css missing");
assert.ok(has("/heichelos/post/styles/reader-controls/live-template.css?v="), "versioned control css missing");
assert.match(html, /\/heichelos\/post\/postLogic\.js\?v=[^"']+/, "versioned postLogic missing");
assert.ok(has('id="realPost"'), "realPost vessel missing");

const criticalResponse = await fetch(new URL(criticalPath, url));
assert.equal(criticalResponse.status, 200, `critical css status ${criticalResponse.status}`);
const criticalCss = await criticalResponse.text();
assert.match(criticalCss, /\.hidden-details\s*\{[^}]*display:\s*none\s*!important/s, "critical hidden-details rule missing");
assert.match(criticalCss, /--reader-layer-floating-controls:\s*820/, "floating layer contract missing");
assert.match(criticalCss, /--reader-layer-settings:\s*840/, "settings layer contract missing");
assert.match(criticalCss, /transform:\s*none\s*!important/, "safe-edge rail transform contract missing");

for (const forbiddenLeak of [
	"thereWasAnAwtsmoosErrorHere",
	"SyntaxError",
	"Unexpected token",
	"<?<script>"
]) {
	assert.ok(!has(forbiddenLeak), `${forbiddenLeak} leaked into rendered HTML`);
}

console.log('B"H postReaderNodeDom.test passed');
