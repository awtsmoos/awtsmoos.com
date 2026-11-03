// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const Security = require("../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/authorization.js");
const { BinaryArtifactVault } = require("../../../../../geelooy/api/tunnel/control/core/binaryArtifactVault.js");
const Native = require("./native.js");
const Dispatch = require("./dispatch.js");

/**
 * @file Ten random MiB cross a disconnected Awtsmoos.com client session.
 * The Awtsmoos keeps only durable raw byte receipts across new lives.
 */
function client(scopes = ["tunnel.read", "tunnel.write"]) {
	const messages = [];
	return { id: crypto.randomUUID(),
		identity: { kind: "oauth", clientId: "external-agent", accountId: "testowner",
			scopes, expiresAt: Date.now() + 100000 },
		socket: { pause() {}, resume() {} }, messages,
		send(message) { messages.push(message); } };
}

function textFrame(input) {
	return { masked: true, opcode: 1, fin: true,
		payload: Buffer.from(JSON.stringify(input)) };
}

/** Run one frame and await its ordered filesystem custody receipt. */
async function issue(server, peer, frame) {
	Dispatch.dispatch(server, peer, frame);
	await peer.externalQueue;
}

async function run() {
	const parent = process.env.AWTSMOOS_TEST_DATA_ROOT || os.tmpdir();
	const root = fs.mkdtempSync(path.join(parent, "awtsmoos-external-raw-"));
	const oldResolve = Security.resolveAccessible;
	const oldSend = Native.send;
	const route = "tun_TestExternalAgent123456";
	const source = crypto.randomBytes(10 * 1048576);
	const sha256 = crypto.createHash("sha256").update(source).digest("hex");
	const server = { externalClientVault: new BinaryArtifactVault(root) };
	Security.resolveAccessible = (owner, reference) => owner === "testowner" &&
		reference === route ? { ok: true, access: "owned", matchedBy: "tunnelId",
			binding: { tunnelId: route } } : { ok: false };
	Native.send = async (_server, identity, reference, operation, params) => {
		assert.equal(identity.accountId, "testowner");
		assert.equal(reference, route);
		assert.equal(operation, "fileTransferDownloadBinary");
		assert.deepEqual(fs.readFileSync(server.externalClientVault.file(params.transferId, "bin")), source);
		return { ok: true, performed: true, bytes: source.length, sha256 };
	};
	try {
		const first = client();
		const hello = { type: "CLIENT_HELLO", clientId: "external-agent",
			protocolVersion: "awtsmoos-tunnel-v3" };
		await issue(server, first, textFrame(hello));
		assert.equal(first.messages.at(-1).type, "CLIENT_ACK");
		const begin = { type: "CLIENT_UPLOAD_BEGIN", routeReference: route,
			destPath: "smoke/raw-10m.bin", totalBytes: source.length,
			sha256, chunkBytes: 1048576 };
		await issue(server, first, textFrame(begin));
		const transferId = first.messages.at(-1).transferId;
		assert.equal(first.messages.at(-1).nextOffset, 0);
		for (let index = 0; index < 4; index++) {
			await issue(server, first, { masked: true, opcode: 2, fin: true,
				payload: source.subarray(index * 1048576, (index + 1) * 1048576) });
		}
		const second = client();
		await issue(server, second, textFrame(hello));
		await issue(server, second, textFrame({ ...begin, transferId }));
		assert.equal(second.messages.at(-1).nextOffset, 4 * 1048576);
		for (let index = 4; index < 10; index++) {
			await issue(server, second, { masked: true, opcode: 2, fin: true,
				payload: source.subarray(index * 1048576, (index + 1) * 1048576) });
		}
		await issue(server, second, textFrame({ type: "CLIENT_UPLOAD_COMMIT", transferId }));
		assert.equal(second.messages.at(-1).type, "UPLOAD_COMMITTED");
		assert.equal(second.messages.at(-1).sha256, sha256);
		assert.equal(second.messages.some(m => m.type === "UPLOAD_ACK"), true);
		const readOnly = client(["tunnel.read"]);
		await issue(server, readOnly, textFrame(hello));
		await issue(server, readOnly, textFrame(begin));
		assert.equal(readOnly.messages.at(-1).code, "SCOPE_DENIED");
		console.log(JSON.stringify({ ok: true, bytes: source.length, sha256,
			resumeOffset: 4194304, rawBinary: true, noAdmin: true }));
	} finally {
		Native.send = oldSend;
		Security.resolveAccessible = oldResolve;
		fs.rmSync(root, { recursive: true, force: true });
	}
}

run().catch(error => { console.error(error); process.exitCode = 1; });
