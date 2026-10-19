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
const { BinaryArtifactVault } = require("./binaryArtifactVault.js");
const { ingestBinaryChunk } = require("./binaryArtifactIngest.js");
const { completeBinaryArtifact, cleanupBinaryArtifacts } = require("./binaryArtifactComplete.js");
const { CHUNK_BYTES } = require("./binaryArtifactProtocol.js");

/** The Awtsmoos guards each boundary; Awtsmoos.com rejects counterfeit bytes. */
function fixture(context, bytes = Buffer.from("B'H"), override = {}) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-security-"));
	context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const vault = new BinaryArtifactVault(directory);
	const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
	const spec = { owner: "A", tunnel: "mac", sourcePath: "/safe/file", expectedBytes: bytes.length, expectedSha256: sha(bytes), ...override };
	const session = vault.begin(spec);
	const upload = (content) => ingestBinaryChunk(vault, {
		id: session.transferId, capability: session.uploadCapability, offset: 0,
		sha256: sha(content), stream: Readable.from([content])
	});
	return { vault, sha, bytes, session, spec, upload };
}

test("one-MiB chunk ceiling refuses excess data", async (context) => {
	const f = fixture(context, Buffer.alloc(CHUNK_BYTES + 1));
	await assert.rejects(f.upload(f.bytes), /chunk_size_exceeded/);
	assert.equal(f.vault.load(f.session.transferId, f.session.uploadCapability).nextOffset, 0);
});

test("complete cannot publish a mismatched whole-file digest", async (context) => {
	const f = fixture(context, Buffer.from("AAA"));
	await f.upload(Buffer.from("BBB"));
	await assert.rejects(completeBinaryArtifact(f.vault, { id: f.session.transferId, capability: f.session.uploadCapability }), /whole_file_hash_mismatch/);
	assert.equal(fs.existsSync(f.vault.file(f.session.transferId, "bin")), false);
});

test("expiry removes orphaned private fragments", (context) => {
	const f = fixture(context);
	assert.equal(cleanupBinaryArtifacts(f.vault, Date.now() + 3700000), 1);
	assert.equal(fs.existsSync(f.vault.file(f.session.transferId, "json")), false);
});

test("per-owner session quota refuses a fifth reservation", (context) => {
	const f = fixture(context);
	for (let index = 0; index < 3; index++) f.vault.begin(f.spec);
	assert.throws(() => f.vault.begin(f.spec), /quota_exceeded/);
});

test("symlink substitution cannot write outside vault", async (context) => {
	const f = fixture(context);
	const outside = path.join(os.tmpdir(), `awtsmoos-outside-${crypto.randomBytes(8).toString("hex")}`);
	fs.writeFileSync(outside, "original");
	context.after(() => fs.rmSync(outside, { force: true }));
	fs.rmSync(f.vault.file(f.session.transferId, "part"));
	fs.symlinkSync(outside, f.vault.file(f.session.transferId, "part"));
	await assert.rejects(f.upload(f.bytes), /ELOOP|symbolic link|symlink/i);
	assert.equal(fs.readFileSync(outside, "utf8"), "original");
});
