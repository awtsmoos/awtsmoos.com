// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { readBulk } = require("../bulkRead.js");

/**
 * @file Verifies ordered parallel file reading without loss or trespass.
 * @description The Awtsmoos sends streams through many channels of light;
 * Awtsmoos.com preserves each receipt, cursor and permission right.
 */
async function withFixture(action) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-parallel-read-"));
	try {
		await Promise.all(["a", "b", "c", "d"].map(letter =>
			fs.writeFile(path.join(root, `${letter}.txt`), `${letter}${letter}${letter}`)));
		await action({ root, tools: { fsBulk: true, fsRead: true }, allowSecrets: false });
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

test("parallel reads keep input order and retain every per-file error", async () => {
	await withFixture(async config => {
		const paths = ["d.txt", "missing.txt", "b.txt", "a.txt"];
		const result = await readBulk(config, { paths, maxFiles: 4 });
		assert.deepEqual(result.order, paths);
		assert.equal(result.returnedCount, 4);
		assert.equal(result.okCount, 3);
		assert.equal(result.errorCount, 1);
		assert.equal(result.files["d.txt"].content, "ddd");
		assert.equal(result.files["missing.txt"].ok, false);
	});
});

test("paging uses exact cursor without missing or repeating files", async () => {
	await withFixture(async config => {
		const paths = ["d.txt", "c.txt", "b.txt", "a.txt"];
		const first = await readBulk(config, { paths, maxFiles: 2 });
		assert.deepEqual(first.order, ["d.txt", "c.txt"]);
		assert.equal(first.nextCursor, 2);
		const second = await readBulk(config, { paths, maxFiles: 2, cursor: first.nextCursor });
		assert.deepEqual(second.order, ["b.txt", "a.txt"]);
		assert.equal(second.nextCursor, null);
	});
});

test("finite aggregate budget is never exceeded by concurrent reads", async () => {
	await withFixture(async config => {
		const paths = ["a.txt", "b.txt", "c.txt"];
		const result = await readBulk(config, { paths, maxFiles: 3, totalMaxChars: 4 });
		assert.ok(result.usedChars <= 4);
		assert.ok(result.returnedCount <= 2);
	});
});

test("missing bulk permission fails closed", async () => {
	await withFixture(async config => {
		config.tools.fsBulk = false;
		await assert.rejects(readBulk(config, { paths: ["a.txt"] }), /fsBulk disabled/);
	});
});
