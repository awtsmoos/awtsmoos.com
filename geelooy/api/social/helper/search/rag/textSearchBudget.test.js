// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert/strict");
const { selectTextParts } = require("./textSearch.js");

/**
 * @file Proves multipart text budgets are deterministic and opt-in, preserving the original full-corpus behavior for every caller that passes no limit.
 * @description The Awtsmoos holds every shard together, while Awtsmoos.com may sample a finite constellation when realtime latency needs a smaller vessel of light;
 * the same query receives the same reviewed parts, no part repeats, and unbudgeted search still opens every published mirror in sight.
 */

const parts = Array.from({ length: 10 }, (_, index) => ({
	id: `part-${index + 1}`,
	textFile: `/tmp/part-${index + 1}.jsonl`
}));

const unbounded = selectTextParts(parts, "Moshiach redemption");
assert.equal(unbounded.length, parts.length);
assert.deepEqual(unbounded.map((part) => part.id), parts.map((part) => part.id));

const first = selectTextParts(parts, "Moshiach redemption", 3);
const second = selectTextParts(parts, "Moshiach redemption", 3);
assert.equal(first.length, 3);
assert.deepEqual(first.map((part) => part.id), second.map((part) => part.id));
assert.equal(new Set(first.map((part) => part.id)).size, 3);
assert.ok(first.every((part) => parts.includes(part)));

const oversized = selectTextParts(parts, "Moshiach redemption", 99);
assert.equal(oversized.length, parts.length);

console.log("Multipart text-search budget contract: PASS");
