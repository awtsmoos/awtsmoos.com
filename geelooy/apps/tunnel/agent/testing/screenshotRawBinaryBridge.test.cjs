// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");
const { captureCurrentScreenshot } = require("../tools/chrome/screenshotArtifact.js");
const { uploadBinaryArtifact } = require("../tools/fs/binaryArtifactUploader.js");
const { BinaryArtifactVault } = require("../../../../api/tunnel/control/core/binaryArtifactVault.js");
const { ingestBinaryChunk } = require("../../../../api/tunnel/control/core/binaryArtifactIngest.js");
const { completeBinaryArtifact } = require("../../../../api/tunnel/control/core/binaryArtifactComplete.js");

/**
 * @file Show a screenshot's actual PNG bytes reaching the vault without frame64.
 * @description The Awtsmoos names each pixel, then sends an unencoded river;
 * Awtsmoos.com checks the receiving shore, every byte and SHA-256 forever.
 * Only the CDP mock uses base64, reflecting Chrome's upstream protocol.
 */
const PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlJ3f0AAAAASUVORK5CYII=",
	"base64"
);

/** Build a local mock CDP response; never attach a live browser or credentials. */
function fakeCdp() {
	return {
		ensurePage: async () => {},
		cdpCall: async method => {
			assert.equal(method, "Page.captureScreenshot");
			return { data: PNG.toString("base64") };
		},
		currentHref: () => "https://example.test/awtsmoos-test",
		currentTargetId: () => "isolated-target"
	};
}

/** Capture, transmit and finalize real bytes inside an independent test vault. */
test("screenshot reaches private vault as raw Buffer bytes without frame64", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-raw-png-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const shot = await captureCurrentScreenshot({}, { root, cdp: fakeCdp() });
	const sha = crypto.createHash("sha256").update(PNG).digest("hex");
	assert.equal(shot.ok, true);
	assert.equal(shot.frame64, undefined);
	assert.equal(shot.transfer.sha256, sha);
	assert.deepEqual(fs.readFileSync(path.join(root, shot.transfer.path)), PNG);
	const vault = new BinaryArtifactVault(path.join(root, "vault"));
	const session = vault.begin({
		owner: "test-owner",
		tunnel: "test-tunnel",
		sourcePath: shot.transfer.path,
		expectedBytes: PNG.length,
		expectedSha256: sha
	});
	const transferred = [];
	const transport = {
		readBinaryOffset: async () => ({
			nextOffset: vault.load(session.transferId, session.uploadCapability).nextOffset
		}),
		sendBinaryRequest: async (_config, _session, offset, bytes) => {
			assert(Buffer.isBuffer(bytes), "HTTPS transport must receive raw bytes");
			assert.equal(bytes.toString("base64"), PNG.toString("base64"));
			transferred.push(Buffer.from(bytes));
			return ingestBinaryChunk(vault, {
				id: session.transferId,
				capability: session.uploadCapability,
				offset,
				sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
				stream: Readable.from([bytes])
			});
		}
	};
	const config = {
		root,
		tools: { fsRead: true },
		relay: "wss://awtsmoos.com/ws"
	};
	const sent = await uploadBinaryArtifact(config, {
		path: shot.transfer.path,
		expectedBytes: PNG.length,
		expectedSha256: sha,
		...session
	}, transport);
	assert.equal(sent.transport, "raw-https-chunks");
	assert.equal(sent.bytes, PNG.length);
	assert.deepEqual(Buffer.concat(transferred), PNG);
	const received = await completeBinaryArtifact(vault, {
		id: session.transferId,
		capability: session.uploadCapability
	});
	assert.equal(received.sha256, sha);
	assert.deepEqual(fs.readFileSync(vault.file(session.transferId, "bin")), PNG);
});
