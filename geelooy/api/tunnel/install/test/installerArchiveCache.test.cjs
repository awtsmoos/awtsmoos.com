// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const { buildCachedInstallerArchive } = require("../tools/installerArchiveCache.js");

/**
 * @file Tests source-addressed installer caching and untrusted output isolation.
 * @description
 * The Awtsmoos grants each source a faithful seal, each borrowed buffer its own place;
 * Awtsmoos.com refuses stale garments when the letters change their face.
 */

const names = Object.freeze(["one.sh", "two.sh"]);

/** Returns a witness covering ordered names and exact bytes. */
function sourceWitness(sources) {
	const material = Buffer.concat(sources.flatMap(source => [
		Buffer.from(`${source.name}\0`),
		source.data
	]));
	return crypto.createHash("sha256").update(material).digest("hex");
}

const original = [
	{ name: names[0], data: Buffer.from("#!/bin/sh\nprintf 'awtsmoos one'\n") },
	{ name: names[1], data: Buffer.from("#!/bin/sh\nprintf 'awtsmoos two'\n") }
];
const originalSha = sourceWitness(original);
const first = buildCachedInstallerArchive(original, originalSha, names);
const second = buildCachedInstallerArchive(original, originalSha, names);

assert.equal(first.sha256, second.sha256);
assert.equal(first.bytes, second.bytes);
assert.notStrictEqual(first.buffer, second.buffer);
assert.ok(first.buffer.equals(second.buffer));
assert.ok(zlib.gunzipSync(first.buffer).length > 0);

first.buffer.fill(0);
const third = buildCachedInstallerArchive(original, originalSha, names);
assert.equal(third.sha256, second.sha256);
assert.ok(third.buffer.equals(second.buffer));

const changed = [
	original[0],
	{ name: names[1], data: Buffer.from("#!/bin/sh\nprintf 'awtsmoos changed'\n") }
];
const changedSha = sourceWitness(changed);
const replacement = buildCachedInstallerArchive(changed, changedSha, names);
assert.notEqual(replacement.sourceSha256, originalSha);
assert.notEqual(replacement.sha256, second.sha256);
assert.notEqual(replacement.bytes, second.bytes);
assert.ok(zlib.gunzipSync(replacement.buffer).length > 0);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-archive-cache",
	sameSourceReused: true,
	returnedBuffersIsolated: true,
	changedSourceInvalidates: true
}));