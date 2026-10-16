//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mcp-public-"));
process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT = tmp;
const Auth = require("../core/auth.js");
const Device = require("../routes/deviceFileTransfer.js");
const Store = require("../core/artifactPublicationStore.js");
const Artifact = require("./artifactTools.js");
const { tools } = require("./toolCatalog.js");
const { dispatch } = require("./protocol.js");
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const identity = { ok: true, kind: "oauth", userId: "reviewer", accountId: "reviewer", scopes: ["tunnel.read", "tunnel.admin"] };
const guest = { ...identity, scopes: ["tunnel.read"] };

test("public publication declares conspicuous mutation, but never anonymous sharing", async () => {
	const publish = tools.find(tool => tool.name === "awtsmoos_artifact_publish");
	assert(publish);
	assert.equal(publish.annotations.openWorldHint, true);
	assert.equal(publish.annotations.destructiveHint, true);
	assert.equal(publish.inputSchema.required.includes("confirmPublicSharing"), true);
	assert.throws(() => Artifact.requirePublicConsent(guest, { confirmPublicSharing: true, path: "fixture.png", routeReference: "route" }), /tunnel_admin/);
	assert.throws(() => Artifact.requirePublicConsent(identity, { path: "fixture.png", routeReference: "route" }), /explicit_public/);
	await assert.rejects(Artifact.publish({}, identity, { path: "fixture.png", routeReference: "route", confirmPublicSharing: true, ttlSeconds: 7200 }), /artifact_ttl/);
});

test("MCP explicitly publishes verified bytes and revokes owner's URL", async () => {
	const realAuth = Auth.currentIdentity, realSend = Device.send;
	const bytes = Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,2,0,0,0]);
	const hash = crypto.createHash("sha256").update(bytes).digest("hex");
	const calls = [];
	Auth.currentIdentity = () => identity;
	Device.send = async (_ctx, _identity, route, action, permission, args) => {
		calls.push({route,action,permission});
		assert.equal(route, "reviewer-route");
		assert.equal(permission, "tunnel.read");
		if (action === "fileTransferSourceProof") return { totalBytes: bytes.length, sha256: hash };
		if (action === "fileTransferReadChunk") return { offset: args.offset, nextOffset: bytes.length, returnedBytes: bytes.length, sha256: hash, content64: bytes.toString("base64") };
		throw Error("unexpected_action");
	};
	const $i = { request: { method: "POST", headers: {} } };
	try {
		const payload = await dispatch($i, identity, { method: "tools/call", params: { name: "awtsmoos_artifact_publish", arguments: {
			routeReference: "reviewer-route", path: "public-review.png", ttlSeconds: 60, allowDownload: false, confirmPublicSharing: true
		}}});
		const receipt = payload.structuredContent;
		assert.equal(receipt.ok, true);
		assert.equal(receipt.mimeType, "image/png");
		assert.equal(receipt.publiclyAccessibleToLinkHolders, true);
		assert.equal(calls.length, 2);
		assert(Store.inspect(receipt.artifactId).buffer.equals(bytes));
		const other = await Artifact.revoke($i, guest, { artifactId: receipt.artifactId }).then(()=>null,e=>e);
		assert.match(other.message, /tunnel_admin/);
		const revoked = await dispatch($i, identity, { method: "tools/call", params: { name: "awtsmoos_artifact_revoke", arguments: { artifactId: receipt.artifactId } }});
		assert.equal(revoked.structuredContent.revoked, true);
		assert.equal(Store.inspect(receipt.artifactId), null);
	} finally {
		Auth.currentIdentity = realAuth;
		Device.send = realSend;
	}
});
