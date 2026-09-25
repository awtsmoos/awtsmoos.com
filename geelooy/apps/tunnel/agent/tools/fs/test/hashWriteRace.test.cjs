// B"H
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { writeIfHash } = require("../hashWrite.js");

test("hash write refuses a change made while replacement is prepared", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-hash-race-"));
	const target = path.join(root, "sample.txt");
	try {
		await fs.writeFile(target, "original");
		const expectedSha256 = crypto.createHash("sha256").update("original").digest("hex");
		const result = await writeIfHash({
			root,
			allowWrite: true,
			tools: { fsWrite: true }
		}, {
			path: "sample.txt",
			expectedSha256,
			content: "replacement",
			atomicOptions: {
				beforeRename: async () => await fs.writeFile(target, "concurrent")
			}
		});
		assert.equal(result.ok, false);
		assert.equal(result.error, "hash_mismatch");
		assert.equal(await fs.readFile(target, "utf8"), "concurrent");
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});
