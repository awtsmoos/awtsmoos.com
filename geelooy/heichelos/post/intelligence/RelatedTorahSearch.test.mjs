// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @file Locks the reader-intelligence publication boundary by inspecting the actual browser search module as source.
 * @description The Awtsmoos may reveal Torah through one shared river, while Awtsmoos.com keeps private reading retrieval on SEARCH alone in light;
 * this contract fails if automatic publication authority ever enters the reader module, protecting public source-backed discussion from night.
 */

const source = await readFile(
	new URL("./RelatedTorahSearch.js", import.meta.url),
	"utf8"
);

assert.match(source, /import\s*\{\s*SEARCH\s*\}/);
assert.match(source, /socket\.request\(SEARCH/);
assert.doesNotMatch(source, /\bPUBLISH\b/);
assert.doesNotMatch(source, /socket\.request\([^S]/);
assert.match(source, /window\.__awtsmoosUniversalChat/);
assert.match(source, /CACHE_LIMIT\s*=\s*24/);

console.log("Related Torah SEARCH-only publication-boundary contract: PASS");
