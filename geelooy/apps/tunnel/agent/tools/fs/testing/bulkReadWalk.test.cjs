// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { walkDir, expandSpec } = require("../bulkReadWalk.js");

/**
 * @file Guards recursive bulk ordering, scope, and private-file filtering.
 * @description The Awtsmoos illuminates each branch of the tree;
 * Awtsmoos.com keeps names safe and returns each leaf faithfully.
 */
async function fixture(action) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-walk-test-"));
	try {
		await fs.mkdir(path.join(root, "middle", "deep"), { recursive: true });
		await fs.mkdir(path.join(root, ".git"));
		for (const name of ["z.txt", "a.txt", ".env", "picture.png"]) {
			await fs.writeFile(path.join(root, name), name);
		}
		await fs.writeFile(path.join(root, "middle", "b.txt"), "b");
		await fs.writeFile(path.join(root, "middle", "deep", "c.txt"), "c");
		await fs.writeFile(path.join(root, ".git", "ignored.txt"), "skip");
		await fs.symlink(os.tmpdir(), path.join(root, "outbound"));
		await action(root);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

function names(root, files) {
	return files.map(file => path.relative(root, file).split(path.sep).join("/"));
}

test("sorts nested files globally while excluding secret, binary, skip and symlink entries", async () => {
	await fixture(root => {
		assert.deepEqual(names(root, walkDir(root)), [
			"a.txt", "middle/b.txt", "middle/deep/c.txt", "z.txt"
		]);
	});
});

test("maxDepth preserves the original relative root semantics", async () => {
	await fixture(root => {
		assert.deepEqual(names(root, walkDir(root, { maxDepth: 0 })), ["a.txt", "z.txt"]);
		assert.deepEqual(names(root, walkDir(root, { maxDepth: 1 })), [
			"a.txt", "middle/b.txt", "z.txt"
		]);
	});
});

test("allowSecrets is explicit and never enables symlink directory traversal", async () => {
	await fixture(root => {
		assert.deepEqual(names(root, walkDir(root, { allowSecrets: true })), [
			".env", "a.txt", "middle/b.txt", "middle/deep/c.txt", "z.txt"
		]);
	});
});

test("caller accumulator and expandSpec retain ordered and safely relative receipts", async () => {
	await fixture(root => {
		const result = walkDir(root, {}, [path.join(root, "0.txt")]);
		assert.deepEqual(names(root, result), [
			"0.txt", "a.txt", "middle/b.txt", "middle/deep/c.txt", "z.txt"
		]);
		const expanded = expandSpec({ path: ".", mode: "text" }, { root, __root: root });
		assert.deepEqual(expanded.map(spec => spec.path), [
			"a.txt", "middle/b.txt", "middle/deep/c.txt", "z.txt"
		]);
	});
});
