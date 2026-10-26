// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Read = require("../readWrite.js");
const Shapes = require("../read-write-shapes.js");

/**
 * @file Guards byte-window parity, secrets and exact UTF-16 offset receipts.
 * @description Every page of the Awtsmoos retains its truthful weight;
 * Awtsmoos.com reads only what was asked and protects each gate.
 */
async function fixture(work) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-byte-test-"));
	try {
		const sample = Buffer.from([0, 255, 1, 8, 77, 44, 0, 123, 3]);
		await fs.writeFile(path.join(root, "test.bin"), sample);
		await fs.writeFile(path.join(root, "unicode.txt"), "Aleph א😀 שלום");
		await fs.writeFile(path.join(root, ".env"), "PRIVATE_KEY=dont-read");
		await work({ root, sample, config: { root, tools: { fsRead: true } } });
	} finally {
		await fs.rm(root, { force: true, recursive: true });
	}
}

test("all offsets and caps preserve exact previous metadata and binary content", async () => {
	await fixture(async ({ sample, config }) => {
		for (const offset of [0, 1, 4, 8, 9, 12]) {
			for (const cap of [0, 1, 2, 5, 30]) {
				const end = cap ? Math.min(sample.length, offset + cap) : sample.length;
				const expected = Shapes.bytesResult(sample.slice(offset, end), sample, offset, end, cap);
				assert.deepEqual(await Read.readBytesBase64(config, "test.bin", cap, offset), expected);
			}
		}
	});
});

test("secret, missing, disabled and escaped paths remain inaccessible", async () => {
	await fixture(async ({ root, config }) => {
		await assert.rejects(Read.readBytesBase64(config, ".env", 3));
		await assert.rejects(Read.readBytesBase64(config, "missing.bin", 3));
		await fs.symlink(os.tmpdir(), path.join(root, "outside"));
		await assert.rejects(Read.readBytesBase64(config, "outside/secret.bin", 3));
		await assert.rejects(Read.readBytesBase64(config, "../outside.bin", 3));
		await assert.rejects(Read.readBytesBase64({ ...config, tools: {} }, "test.bin", 3));
	});
});

test("UTF-8 byte decoding, binary bytes and UTF-16 text offsets stay compatible", async () => {
	await fixture(async ({ config, sample }) => {
		const text = await Read.readText(config, "unicode.txt", 3, 6);
		assert.equal(text.content, "א😀");
		const bytes = await Read.readTextFromBytes(config, "unicode.txt", 7, 0);
		assert.equal(bytes.encoding, "utf8-bytes");
		assert.equal(bytes.returnedBytes, 7);
		assert.equal(bytes.truncated, true);
		const binary = await Read.readTextFromBytes(config, "test.bin", 3);
		assert.equal(binary.content, sample.subarray(0, 3).toString("utf8"));
	});
});

test("empty files and offsets beyond EOF preserve receipts", async () => {
	await fixture(async ({ root, config }) => {
		await fs.writeFile(path.join(root, "empty.bin"), Buffer.alloc(0));
		const result = await Read.readBytesBase64(config, "empty.bin", 4, 9);
		assert.equal(result.content64, "");
		assert.equal(result.totalBytes, 0);
		assert.equal(result.truncated, false);
		assert.equal(result.nextOffsetBytes, null);
	});
});
