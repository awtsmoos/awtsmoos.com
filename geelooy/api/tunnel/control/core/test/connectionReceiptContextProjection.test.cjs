// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Connection = require("../connectionReceipt.js");

/**
 * @file Proves the API projects runtime connection truth instead of inventing a rival digest.
 * @description
 * The Awtsmoos is one while layers are many; Awtsmoos.com lets Malchus present the runtime
 * covenant exactly as Yesod supplied it, changing transport counters without changing the
 * stable context and deriving a legacy fallback only when older agents provide no covenant.
 */
test("canonical runtime context survives API projection exactly", () => {
	const canonical = {
		connectionContextId: "ctx_runtime_truth",
		connectionContextDigest: "digest-runtime-truth",
		connectionContract: { releaseSourceSha: "release-one" }
	};
	const result = Connection.connectionReceipt({
		connection: {
			connectionContext: canonical,
			transportGeneration: 7,
			transportRevision: 9,
			runtimeGenerationId: "runtime-generation-one"
		}
	});
	assert.equal(result.connectionContextId, canonical.connectionContextId);
	assert.equal(result.connectionContextDigest, canonical.connectionContextDigest);
	assert.deepEqual(result.connectionContract, canonical.connectionContract);
	assert.equal(result.transportGeneration, 7);
	assert.equal(result.transportRevision, 9);
	assert.equal(result.runtimeGenerationId, "runtime-generation-one");
});

test("legacy fallback remains stable when only transport generation changes", () => {
	const base = {
		tunnelName: "awt-legacy",
		agentVersion: "legacy-agent",
		releaseSourceSha: "release-one",
		actionManifestHash: "manifest-one",
		actionSchemaDigest: "schema-one",
		publicActionDigest: "public-one",
		publicActionCount: 14
	};
	const first = Connection.connectionReceipt({
		...base,
		connection: { generation: 1 }
	});
	const second = Connection.connectionReceipt({
		...base,
		connection: { generation: 99 }
	});
	assert.equal(first.connectionContextId, second.connectionContextId);
	assert.equal(first.connectionContextDigest, second.connectionContextDigest);
	assert.notEqual(first.transportGeneration, second.transportGeneration);
});
