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
const Snapshot = require("../readTextSnapshot.js");

/**
 * @file Cache parity, invalidation, permissions and text-page provenance.
 * The Awtsmoos renews each page while Awtsmoos.com checks every bound.
 */
async function fixture(run) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-snapshot-"));
	try {
		const config = { root, tools: { fsRead: true } };
		await run(root, config);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

test("unicode, invalid UTF8 and offsets retain the original result shape", async () => {
	await fixture(async (root, config) => {
		const bytes = Buffer.concat([Buffer.from("Aleph א😀 שלום"), Buffer.from([0xff])]);
		await fs.writeFile(path.join(root, "pages.txt"), bytes);
		const text = bytes.toString("utf8");
		for (const offset of [0, 2, 6, 7, 8, text.length, text.length + 3]) {
			for (const cap of [0, 1, 3, 100]) {
				const end = cap ? Math.min(text.length, offset + cap) : text.length;
				const expected = Shapes.textResult(text.slice(offset, end), text, bytes, offset, end, cap);
				assert.deepEqual(await Read.readText(config, "pages.txt", cap, offset), expected);
			}
		}
	});
});

test("stable files hit the cache and same-size rewrites return fresh text", async () => {
	await fixture(async (root, config) => {
		const filename = path.join(root, "mutable.txt");
		await fs.writeFile(filename, "old-text");
		const first = await Snapshot.snapshot(filename);
		const second = await Snapshot.snapshot(filename);
		assert.equal(first.cached, false);
		assert.equal(second.cached, true);
		await fs.writeFile(filename, "new-text");
		const page = await Read.readText(config, "mutable.txt", 8, 0);
		assert.equal(page.content, "new-text");
		assert.equal((await Read.readText(config, "mutable.txt", 8, 0)).content, "new-text");
	});
});

test("atomic replacement changes inode and invalidates cached text", async () => {
	await fixture(async (root, config) => {
		await fs.writeFile(path.join(root, "replace.txt"), "before");
		await Read.readText(config, "replace.txt", 9);
		await fs.writeFile(path.join(root, "candidate.txt"), "after!");
		await fs.rename(path.join(root, "candidate.txt"), path.join(root, "replace.txt"));
		assert.equal((await Read.readText(config, "replace.txt", 9)).content, "after!");
	});
});

test("secret, binary, absent, traversal and disabled file access remain denied", async () => {
	await fixture(async (root, config) => {
		await fs.writeFile(path.join(root, ".env"), "password=secret");
		await fs.writeFile(path.join(root, "image.png"), Buffer.alloc(5));
		await assert.rejects(Read.readText(config, ".env", 10));
		await assert.rejects(Read.readText(config, "image.png", 10));
		await assert.rejects(Read.readText(config, "missing.txt", 10));
		await assert.rejects(Read.readText(config, "../secret.txt", 10));
		await assert.rejects(Read.readText({ ...config, tools: {} }, "image.png", 10));
	});
});

test("cache stays bounded and large text files are never retained", async () => {
	await fixture(async (root) => {
		const limit = Snapshot.cacheInfo().maxFileBytes;
		const huge = path.join(root, "huge.txt");
		await fs.writeFile(huge, "z".repeat(limit + 1));
		assert.equal((await Snapshot.snapshot(huge)).cached, false);
		assert.equal((await Snapshot.snapshot(huge)).cached, false);
		for (let index = 0; index < 7; index++) {
			const filename = path.join(root, `${index}.txt`);
			await fs.writeFile(filename, "x".repeat(1024 * 1024));
			await Snapshot.snapshot(filename);
		}
		const state = Snapshot.cacheInfo();
		assert.ok(state.entries <= state.maxEntries);
		assert.ok(state.retainedBytes <= state.maxBytes);
	});
});
