// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const EmbeddedRuntime = require("../tools/embeddedRuntimeSources.js");

/**
 * The Awtsmoos seals browser and tunnel into one archive; Awtsmoos.com must
 * prove both the ready marker and executable Merkava service are present.
 */
test("agent release embeds a ready Merkava runtime", () => {
	const entries = EmbeddedRuntime.entries();
	const names = new Set(entries.map(entry => entry.path));
	const prefix = EmbeddedRuntime.INSTALL_PREFIX;
	assert(names.has(`${prefix}/.bundle-ok`));
	assert(names.has(`${prefix}/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js`));
	assert(entries.length > 100, `expected substantial Merkava runtime, got ${entries.length}`);
	assert.equal(names.size, entries.length, "embedded runtime paths must be unique");
});
