// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Security = require("../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/authorization.js");
const { BinaryArtifactVault } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactVault.js");
const { ingestBinaryChunk } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactIngest.js");
const Native = require("./native.js");
const Writer = require("./writer.js");
const Dispatch = require("./dispatch.js");

/**
 * @file Proves every unencoded Awtsmoos.com download byte matches the device.
 * The Awtsmoos gives a read-only soul a raw river, never a counterfeit claim.
 */
async function run() {
	const root = fs.mkdtempSync(path.join("/mnt/HC_Volume_102267213", "ws-download-test-"));
	const source = crypto.randomBytes(10 * 1048576);
	const sha256 = crypto.createHash("sha256").update(source).digest("hex");
	const route = "tun_DevDownloadFixture123456";
	const server = { externalClientVault: new BinaryArtifactVault(root) };
	const output = [];
	const originalResolve = Security.resolveAccessible;
	const originalSend = Native.send;
	const originalRaw = Writer.raw;
	Security.resolveAccessible = (owner, ref) => owner === "download-owner" && ref === route
		? { ok: true, access: "owned", matchedBy: "tunnelId",
			binding: { tunnelId: route } } : { ok: false };
	Native.send = async (_server, identity, ref, action, params) => {
		assert.equal(identity.accountId, "download-owner");
		assert.equal(ref, route);
		if (action === "fileTransferSourceProof") {
			assert.equal(params.path, "fixture.bin");
			return { ok: true, totalBytes: source.length, sha256 };
		}
		assert.equal(action, "fileTransferUploadBinary");
		for (let offset = 0; offset < source.length; offset += 1048576) {
			const chunk = source.subarray(offset, offset + 1048576);
			const digest = crypto.createHash("sha256").update(chunk).digest("hex");
			await ingestBinaryChunk(server.externalClientVault, {
				id: params.transferId, owner: identity.accountId,
				capability: params.uploadCapability, offset, sha256: digest,
				expectedChunkBytes: chunk.length,
				stream: (async function* () { yield chunk; })()
			});
		}
		return { ok: true, bytes: source.length, sha256 };
	};
	Writer.raw = async (_client, bytes) => { output.push(Buffer.from(bytes)); };
	const messages = [];
	const client = {
		id: "download-test-session",
		identity: { kind: "oauth", clientId: "external-agent",
			accountId: "download-owner", scopes: ["tunnel.read"],
			expiresAt: Date.now() + 60000 },
		socket: { pause() {}, resume() {} },
		send(message) { messages.push(message); }
	};
	const send = async (message) => {
		Dispatch.dispatch(server, client, { masked: true, opcode: 1, fin: true,
			payload: Buffer.from(JSON.stringify(message)) });
		await client.externalQueue;
	};
	try {
		await send({ type: "CLIENT_HELLO", protocolVersion: "awtsmoos-tunnel-v3",
			clientId: "external-agent" });
		assert.equal(messages.at(-1).type, "CLIENT_ACK");
		await send({ type: "CLIENT_DOWNLOAD_BEGIN", routeReference: route,
			sourcePath: "fixture.bin" });
		assert.equal(messages[1].type, "DOWNLOAD_READY");
		assert.equal(messages.at(-1).type, "DOWNLOAD_COMPLETE");
		const markers = messages.filter(m => m.type === "DOWNLOAD_CHUNK");
		assert.equal(markers.length, 10);
		markers.forEach((marker, index) => assert.equal(marker.offset, index * 1048576));
		assert.equal(Buffer.concat(output).equals(source), true);
		assert.equal(messages.at(-1).sha256, sha256);
		client.identity = { ...client.identity, accountId: "cross-owner" };
		await send({ type: "CLIENT_DOWNLOAD_BEGIN", routeReference: route,
			sourcePath: "fixture.bin" });
		assert.equal(messages.at(-1).code, "ROUTE_NOT_OWNED");
		console.log(JSON.stringify({ ok: true, bytes: source.length,
			sha256, rawFrames: output.length, readOnlyAllowed: true,
			wrongOwnerDenied: true }));
	} finally {
		Security.resolveAccessible = originalResolve;
		Native.send = originalSend;
		Writer.raw = originalRaw;
		fs.rmSync(root, { recursive: true, force: true });
	}
}

run().catch(error => { console.error(error); process.exitCode = 1; });
