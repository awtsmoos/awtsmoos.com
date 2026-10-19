//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Device = require("../deviceFileTransfer.js");
const Routes = require("../artifactBinarySession.js");
const { manifestBody } = require("../agentManifest.js");

/** The Awtsmoos tests the authenticated gate before any file begins its flight. */
function context(accountId, input = {}) {
	return {
		request: {
			method: "POST", headers: {},
			user: accountId ? { info: { userId: accountId, accountId } } : undefined
		},
		paramKinds: { POST: input },
		response: { statusCode: 200, headersSent: false, setHeader() {} }
	};
}

/** A real device proof must precede issuing even a private bearer. */
test("authenticated owner gets a proof-bound raw binary session", async (t) => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-session-"));
	process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT = directory;
	t.after(() => {
		delete process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT;
		fs.rmSync(directory, { recursive: true, force: true });
	});
	const original = Device.send;
	let calls = 0;
	Device.send = async (_ctx, who, route, action, scope, payload) => {
		calls++;
		assert.equal(who.accountId, "ownerA");
		assert.equal(route, "MacA");
		assert.equal(action, "fileTransferSourceProof");
		assert.equal(scope, "tunnel.read");
		assert.equal(payload.path, "capture.png");
		return { totalBytes: 1234, sha256: "a".repeat(64) };
	};
	t.after(() => { Device.send = original; });
	const response = context("ownerA", { routeReference: "MacA", sourcePath: "capture.png" });
	const body = JSON.parse(await Routes.artifactBinaryStart(response));
	assert.equal(response.response.statusCode, 201);
	assert.equal(body.ok, true);
	assert.equal(body.expectedBytes, 1234);
	assert.match(body.transferId, /^[a-f0-9]{32}$/);
	assert.match(body.uploadCapability, /^[a-f0-9]{64}$/);
	assert.equal(calls, 1);
	const otherOwner = context("ownerB", { transferId: body.transferId, uploadCapability: body.uploadCapability });
	const denied = JSON.parse(await Routes.artifactBinaryStatus(otherOwner));
	assert.equal(denied.ok, false);
	assert.equal(otherOwner.response.statusCode, 403);
});

test("unauthenticated source requests cannot reach the device", async () => {
	const reply = JSON.parse(await Routes.artifactBinaryStart(context("", { sourcePath: "secret", routeReference: "any" })));
	assert.equal(reply.error, "not_authenticated");
});

test("action manifest discloses raw transfer without changing existing operations", () => {
	const manifest = manifestBody();
	assert(manifest.largeFileTransfer.preferred.operations.includes("fileTransferReadChunk"));
	assert(manifest.largeFileTransfer.preferred.operations.includes("fileTransferUploadBinary"));
	assert.equal(manifest.largeFileTransfer.rawBinary.scope, "tunnel.admin");
});
