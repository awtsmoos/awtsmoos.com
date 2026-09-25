// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { runBatchTransaction } = require("../writeBatchTransaction.js");

test("rollback preserves another writer's newer bytes", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-rollback-"));
	try {
		await fs.writeFile(path.join(root, "first.txt"), "old");
		await fs.writeFile(path.join(root, "second.txt"), "old");
		const result = await runBatchTransaction({ root }, [
			{ path: "first.txt", content: "batch" },
			{ path: "second.txt", content: "batch" }
		], async (item) => {
			if (item.path === "second.txt") {
				await fs.writeFile(path.join(root, "first.txt"), "newer writer");
				throw new Error("second_failed");
			}
			await fs.writeFile(item.absolutePath, item.content);
			return { ok: true };
		});
		assert.equal(result.ok, false);
		assert.equal(result.rolledBack, false);
		assert.deepEqual(result.rollbackErrors, [{ path: "first.txt", error: "rollback_conflict" }]);
		assert.equal(await fs.readFile(path.join(root, "first.txt"), "utf8"), "newer writer");
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});
