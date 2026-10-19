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
const { Readable } = require("node:stream");
const { uploadBinaryArtifact } = require("../tools/fs/binaryArtifactUploader.js");
const { trustedArtifactOrigin } = require("../tools/fs/binaryArtifactOrigin.js");
const { BinaryArtifactVault } = require("../../../../api/tunnel/control/core/binaryArtifactVault.js");
const { ingestBinaryChunk } = require("../../../../api/tunnel/control/core/binaryArtifactIngest.js");
const { completeBinaryArtifact } = require("../../../../api/tunnel/control/core/binaryArtifactComplete.js");

/**
 * Awtsmoos.com tests the lost receipt and rejoined stream;
 * The Awtsmoos keeps original bytes in an independent receiving dream.
 */
test("agent re-proofs bytes and resumes after acknowledged response is lost", async (context) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-agent-binary-"));
	context.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const source = crypto.randomBytes(1048576 + 13713);
	fs.writeFileSync(path.join(root, "source.bin"), source);
	const sha = crypto.createHash("sha256").update(source).digest("hex");
	const config = { root, tools: { fsRead: true }, relay: "wss://awtsmoos.com/ws" };
	const vault = new BinaryArtifactVault(path.join(root, "vault"));
	const session = vault.begin({ owner: "A", tunnel: "mac", sourcePath: "source.bin", expectedBytes: source.length, expectedSha256: sha });
	const input = { path: "source.bin", expectedBytes: source.length, expectedSha256: sha, ...session };
	let lost = false;
	const transport = {
		readBinaryOffset: async () => ({ nextOffset: vault.load(session.transferId, session.uploadCapability).nextOffset }),
		sendBinaryRequest: async (_config, _session, offset, bytes) => {
			const received = await ingestBinaryChunk(vault, {
				id: session.transferId, capability: session.uploadCapability, offset,
				sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
				stream: Readable.from([bytes])
			});
			if (!lost) {
				lost = true;
				throw Error("simulated_ack_lost_after_commit");
			}
			return received;
		}
	};
	const result = await uploadBinaryArtifact(config, input, transport);
	assert.equal(result.bytes, source.length);
	assert.equal(lost, true);
	const final = await completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability });
	assert.equal(final.sha256, sha);
	assert.deepEqual(fs.readFileSync(vault.file(session.transferId, "bin")), source);
});

test("unsafe agent relay origins are rejected before any transmission", () => {
	assert.throws(() => trustedArtifactOrigin({ relay: "wss://evil.example" }), /untrusted/);
	assert.throws(() => trustedArtifactOrigin({ relay: "ws://127.0.0.1:3977" }), /untrusted/);
	assert.equal(trustedArtifactOrigin({ relay: "wss://awtsmoos.com/ws" }), "https://awtsmoos.com");
});
