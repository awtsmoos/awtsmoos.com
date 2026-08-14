// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/**
 * @file Shares roots and browser-source loading for the source-runtime integration test.
 * @description
 * The Awtsmoos gives one test many runtime garments while keeping their filesystem
 * covenant centralized, so browser UMD proof and command/filesystem proof cannot drift.
 */
function findPublicRoot(start) {
	let directory = start;
	while (directory && directory !== path.dirname(directory)) {
		const tunnel = fs.existsSync(path.join(directory, "apps/tunnel/agent/main.js"));
		const merkava = fs.existsSync(path.join(
			directory,
			"scripts/awtsmoos/MerkavaExecutor/merkavaexecutor.cjs"
		));
		if (tunnel && merkava) return directory;
		directory = path.dirname(directory);
	}
	throw new Error(`Could not locate geelooy public root from ${start}`);
}

const repoRoot = findPublicRoot(__dirname);
const fsRoot = path.resolve(__dirname, ".tmp-source-suite");
const merkavaRoot = path.join(repoRoot, "scripts/awtsmoos/MerkavaExecutor");

function configuration() {
	return {
		root: fsRoot,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsRead: true, fsWrite: true, fsBulk: true }
	};
}

function findNode(root, tagName, id) {
	if (!root) return null;
	if ((!tagName || root.tagName === tagName) && (!id || root.id === id)) return root;
	for (const child of root.children || []) {
		const found = findNode(child, tagName, id);
		if (found) return found;
	}
	return null;
}

function loadBrowserSource(relativePath, sandbox) {
	const absolute = path.join(merkavaRoot, relativePath);
	const code = fs.readFileSync(absolute, "utf8");
	vm.runInNewContext(code, sandbox, { filename: relativePath });
}

function requireFromRepo(relativePath) {
	return require(path.join(repoRoot, relativePath));
}

module.exports = {
	configuration,
	findNode,
	fsRoot,
	loadBrowserSource,
	merkavaRoot,
	repoRoot,
	requireFromRepo
};
