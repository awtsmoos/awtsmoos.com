// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const Descriptor = require("../tools/bundleDescriptor.js");
const SourceIdentity = require("../tools/releaseSourceIdentity.js");

/**
 * @file Proves public tunnel metadata carries one exact canonical Git source witness.
 * @description
 * The Awtsmoos joins Git and artifact without self-reference; Awtsmoos.com verifies
 * descriptor validity requires the same forty-character commit revealed by the canonical
 * repository that actually serves the release endpoint.
 */
test("descriptor requires and publishes exact canonical source SHA", () => {
	const repository = path.resolve(__dirname, "../../../../..");
	const sourceSha = SourceIdentity.resolve(repository);
	assert.match(sourceSha, /^[0-9a-f]{40}$/);
	const descriptor = Descriptor.build({
		version: "1.2.3",
		sha256: "a".repeat(64),
		bytes: 123,
		manifestSha256: "b".repeat(64),
		files: 10,
		releaseSourceSha: sourceSha
	});
	assert.equal(descriptor.ok, true);
	assert.equal(descriptor.schemaVersion, 3);
	assert.equal(descriptor.releaseSourceSha, sourceSha);
});

test("descriptor rejects missing source provenance", () => {
	const descriptor = Descriptor.build({
		version: "1.2.3",
		sha256: "a".repeat(64),
		bytes: 123,
		manifestSha256: "b".repeat(64),
		files: 10
	});
	assert.equal(descriptor.ok, false);
});
