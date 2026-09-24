// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const SchemaView = require("../tools/fs/actionSchemaIntrospection.js");

/**
 * @file Proves actionSchemaTrace exposes usable param contracts, not just names.
 * @description
 * The Awtsmoos does not let a Shliach discover required carriers from rejection text.
 * Awtsmoos.com proves mkdirp names its required path carriers, findFiles separates the
 * immutable workspace-root authority from the search start, and every family testifies
 * mutation, request-key, retry, execution-vessel, and authority semantics.
 */

test("mkdirp exposes required path carriers instead of a bare missing_path", () => {
	const contract = SchemaView.describe("fs", "mkdirp");
	assert.equal(contract.found, true);
	assert.ok(contract.requiredOneOf.includes("paths"));
	assert.ok(contract.requiredOneOf.includes("path"));
	assert.ok(contract.requiredOneOf.includes("p"));
	assert.ok(contract.canonicalInputFields.includes("paths"));
	assert.ok(contract.canonicalInputFields.includes("files"));
	assert.deepEqual(
		contract.legacyAliases.path.sort(),
		["directory", "files", "p", "path", "paths"]
	);
	assert.equal(contract.mutation.possible, true);
	assert.equal(contract.requestKey.supported, true);
	assert.match(contract.retrySemantics, /idempotent_with_request_key/);
	assert.equal(contract.example.action, "mkdirp");
	assert.ok(contract.example.path);
});

test("findFiles separates workspace-root authority from the search start", () => {
	const contract = SchemaView.describe("fs", "findFiles");
	assert.equal(contract.found, true);
	assert.ok(contract.canonicalInputFields.includes("searchPath"));
	assert.ok(contract.canonicalInputFields.includes("workspaceRoot"));
	assert.match(contract.deprecatedFields.root, /prefer searchPath/i);
	assert.match(contract.deprecatedFields.root, /authority/i);
	assert.equal(contract.example.searchPath, "geelooy/apps/tunnel/agent");
	assert.match(contract.authority, /workspace root/i);
	assert.equal(contract.mutation.possible, false);
});

test("read family testifies read-only semantics and worker-side execution", () => {
	const contract = SchemaView.describe("fs", "read");
	assert.equal(contract.family, "read");
	assert.equal(contract.mutation.possible, false);
	assert.match(contract.retrySemantics, /safe_to_retry/);
	assert.equal(contract.execution.side, "worker-side");
	assert.equal(contract.requestKey.required, false);
});

test("missionRoomMessage exposes message carriers, kind aliases, and deprecations", () => {
	const contract = SchemaView.describe("fs", "missionRoomMessage");
	assert.equal(contract.family, "message");
	assert.ok(contract.legacyAliases.body.includes("message"));
	assert.ok(contract.legacyAliases.kind.includes("eventKind"));
	assert.match(contract.deprecatedFields.query, /use message/i);
	assert.equal(contract.mutation.possible, true);
	assert.equal(contract.example.kind, "completion");
});

test("unknown action keeps an honest permissive contract", () => {
	const contract = SchemaView.describe("fs", "noSuchActionAtAll");
	assert.equal(contract.found, true);
	assert.equal(contract.family, "unknown");
	assert.equal(contract.mutation.possible, null);
	assert.match(contract.retrySemantics, /never silently resend/);
	assert.deepEqual(contract.canonicalInputFields, ["p", "path", "query", "content", "params", "command", "timeoutMs", "maxChars", "totalMaxChars"]);
});
