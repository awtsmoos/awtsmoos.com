//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { Readable } = require("node:stream");
const { BinaryArtifactVault } = require("./binaryArtifactVault.js");
const { ingestBinaryChunk } = require("./binaryArtifactIngest.js");
const { completeBinaryArtifact, cleanupBinaryArtifacts } = require("./binaryArtifactComplete.js");
const { acquireExclusiveLock } = require("./binaryArtifactExclusive.js");

/** A crash cannot conceal the Awtsmoos from a verified, resumed binary artifact. */
function fixture(t, bytes = crypto.randomBytes(17000)) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-restart-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const vault = new BinaryArtifactVault(root);
	const sha = crypto.createHash("sha256").update(bytes).digest("hex");
	const session = vault.begin({ owner: "owner", tunnel: "mac", sourcePath: "test.bin", expectedBytes: bytes.length, expectedSha256: sha });
	const upload = () => ingestBinaryChunk(vault, {
		id: session.transferId, capability: session.uploadCapability,
		offset: 0, sha256: sha, stream: Readable.from([bytes])
	});
	return { vault, bytes, sha, session, upload };
}

test("atomic rename before metadata save recovers on retry", async (t) => {
	const f = fixture(t);
	await f.upload();
	fs.renameSync(f.vault.file(f.session.transferId, "part"), f.vault.file(f.session.transferId, "bin"));
	const result = await completeBinaryArtifact(f.vault, {
		id: f.session.transferId, capability: f.session.uploadCapability, owner: "owner"
	});
	assert.equal(result.sha256, f.sha);
	assert.equal(result.state, "complete");
	assert.deepEqual(fs.readFileSync(f.vault.file(f.session.transferId, "bin")), f.bytes);
});

test("active lock prevents concurrent mutation", (t) => {
	const f = fixture(t);
	const location = f.vault.file(f.session.transferId, "lock");
	const release = acquireExclusiveLock(location);
	assert.throws(() => acquireExclusiveLock(location), /artifact_transfer_busy/);
	release();
	const again = acquireExclusiveLock(location);
	again();
});

test("dead worker lock is reclaimed and expired bytes are cleaned", (t) => {
	const f = fixture(t);
	const location = f.vault.file(f.session.transferId, "lock");
	fs.writeFileSync(location, JSON.stringify({ pid: 999999999, host: os.hostname(), at: 1 }));
	const old = new Date(Date.now() - 100000);
	fs.utimesSync(location, old, old);
	assert.equal(cleanupBinaryArtifacts(f.vault, Date.now() + 3700000), 1);
	assert.equal(fs.existsSync(f.vault.file(f.session.transferId, "part")), false);
	assert.equal(fs.existsSync(location), false);
});
