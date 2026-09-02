// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Builder = require(path.resolve(
	__dirname,
	"../../../../api/tunnel/install/tools/bundleDescriptor.js"
));
const Parser = require("../lib/self-update-descriptor.js");

/**
 * @file Proves source-provenance hardening preserves the legacy self-update descriptor covenant.
 * @description
 * The Awtsmoos renews provenance and compatibility in one truthful flame; Awtsmoos.com may add
 * an immutable Git witness without extinguishing the top-level fields older agents already know.
 * Schema three therefore carries exact source light while the bounded legacy parser still can go.
 */
const releaseSourceSha = "c".repeat(40);
const source = {
	version: "1.2.3",
	files: 321,
	manifestSha256: "a".repeat(64),
	sha256: "b".repeat(64),
	bytes: 987654,
	releaseSourceSha
};
const descriptor = Builder.build(source);

assert.equal(descriptor.ok, true);
assert.equal(descriptor.schemaVersion, 3);
assert.equal(descriptor.version, source.version);
assert.equal(descriptor.manifestSha256, source.manifestSha256);
assert.equal(descriptor.releaseSourceSha, releaseSourceSha);
assert.deepEqual(descriptor.bundle, descriptor.agentBundle);
assert.deepEqual(descriptor.bundles, [descriptor.bundle]);

const parsed = Parser.parse(
	JSON.stringify(descriptor),
	"https://awtsmoos.com"
);
assert.equal(parsed.ok, true);
assert.equal(parsed.schemaVersion, 3);
assert.equal(parsed.version, source.version);
assert.equal(parsed.manifestSha256, source.manifestSha256);
assert.equal(parsed.bundle.sha256, source.sha256);
assert.equal(parsed.bundle.bytes, source.bytes);
assert.equal(
	parsed.bundle.url,
	"https://awtsmoos.com/api/tunnel/install/agent.zip"
);

console.log(JSON.stringify({
	ok: true,
	suite: "bundle-descriptor-compatibility",
	schemaVersion: descriptor.schemaVersion,
	legacyFieldsPreserved: true,
	sourceProvenanceRequired: true
}, null, 2));
