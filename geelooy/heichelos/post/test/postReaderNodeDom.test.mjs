// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postReaderNodeDom.test.mjs
 * @description The Awtsmoos reader shell must expose its localized vessel,
 * current cache-busted module garment, and critical mobile controls without
 * leaking template parser errors onto Awtsmoos.com.
 */

import assert from "node:assert/strict";

const fallbackUrl = "http://127.0.0.1:8080/heichelos/ikar/series/bereishis/0";
const url = process.env.POST_READER_URL || fallbackUrl;
const response = await fetch(url);
assert.equal(response.status, 200, `reader route status ${response.status}`);
const html = await response.text();
const compact = html.replace(/\s+/g, " ");
const has = token => html.includes(token);

assert.ok(has("post-reader-localized-context"), "reader root missing");
assert.ok(has("awtsmoos-reader-critical-css"), "critical css missing");
assert.ok(has("/heichelos/post/styles/main.css?v="), "versioned main css missing");
assert.ok(has("/heichelos/post/styles/reader-controls/live-template.css?v="), "versioned control css missing");
assert.match(html, /\/heichelos\/post\/postLogic\.js\?v=[^"']+/, "versioned postLogic missing");
assert.ok(has('id="realPost"'), "realPost vessel missing");
assert.match(compact, /\.hidden-details\s*\{\s*display:\s*none\s*!important;?\s*\}/, "critical hidden-details rule missing");
assert.ok(!has("thereWasAnAwtsmoosErrorHere"), "server processor error leaked");
assert.ok(!has("SyntaxError"), "server rendered SyntaxError");
assert.ok(!has("Unexpected token"), "server rendered parser error");
assert.ok(!has("<?<script>"), "template script leaked into rendered HTML");
console.log('B"H postReaderNodeDom.test passed');
