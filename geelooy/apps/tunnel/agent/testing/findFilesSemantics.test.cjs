// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { findFiles, searchPath } = require("../tools/fs/findFiles.js");

/**
 * @file Proves findFiles separates the immutable workspace-root authority from the search start.
 * @description
 * The Awtsmoos never lets a search re-root its vessel. Awtsmoos.com proves searchPath is the
 * canonical search start, legacy root/searchRoot/directory/path/p aliases still scope the walk,
 * and the response names workspaceRoot as the authority no payload field can move.
 */

function makeTree() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-findroot-"));
	fs.mkdirSync(path.join(root, "sub", "deep"), { recursive: true });
	fs.writeFileSync(path.join(root, "top.txt"), "top");
	fs.writeFileSync(path.join(root, "sub", "mid.txt"), "mid");
	fs.writeFileSync(path.join(root, "sub", "deep", "leaf.txt"), "leaf");
	return root;
}

test("searchPath is the canonical search start", async () => {
	const root = makeTree();
	try {
		const result = await findFiles({ root }, { action: "findFiles", searchPath: "sub", query: "leaf" });
		assert.equal(result.ok, true);
		assert.equal(result.searchPath, "sub");
		assert.deepEqual(result.results.map(item => item.name), ["leaf.txt"]);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("legacy root alias still scopes the walk but is not the authority", async () => {
	const root = makeTree();
	try {
		const result = await findFiles({ root }, { action: "findFiles", root: "sub", query: "mid" });
		assert.equal(result.ok, true);
		assert.deepEqual(result.results.map(item => item.name), ["mid.txt"]);
		assert.equal(result.workspaceRoot, root);
		assert.equal(result.launchRoot, root);
		assert.match(result.rootSemantics, /workspaceRoot.*immutable/i);
		assert.match(result.rootSemantics, /never.*change/i);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("searchPath wins over legacy aliases with a documented precedence", () => {
	assert.equal(searchPath({ searchPath: "a", path: "b", root: "c" }), "a");
	assert.equal(searchPath({ path: "b", root: "c" }), "b");
	assert.equal(searchPath({ root: "c" }), "c");
	assert.equal(searchPath({}), ".");
});

test("a search cannot escape the workspace root authority", async () => {
	const root = makeTree();
	try {
		await assert.rejects(
			findFiles({ root }, { action: "findFiles", searchPath: "..", query: "outside-proof" }),
			error => {
				assert.equal(error.code, "path_outside_project_root");
				return true;
			}
		);
		const inside = await findFiles({ root }, { action: "findFiles", searchPath: "sub", query: "mid" });
		assert.equal(inside.workspaceRoot, root);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
