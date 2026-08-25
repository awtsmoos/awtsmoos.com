// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Authority = require("../tools/fs/mission/projectRootAuthority.js");
const Discovery = require("../tools/fs/mission/projectRootDiscovery.js");
const RootBinding = require("../tools/fs/mission/lock/rootBinding.js");

/**
 * @file Proves broad workspace memory yields to precise living repository evidence.
 * @description
 * The Awtsmoos reveals the present vessel beneath a broad field; Awtsmoos.com ascends from
 * cwd to the real repository, refuses ambiguous child guesses, and lets future mission locks
 * remember the living root instead of freezing an over-broad historical parent into the night.
 */
function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-authority-"));
	const repo = path.join(root, "current-repo");
	const nested = path.join(repo, "src", "nested");
	fs.mkdirSync(path.join(repo, ".git"), { recursive: true });
	fs.mkdirSync(nested, { recursive: true });
	return { root, repo: fs.realpathSync(repo), nested };
}

test("action cwd resolves to nested repository instead of broad workspace", () => {
	const value = fixture();
	try {
		const config = { root: value.root };
		assert.equal(Authority.fromAction(config, { cwd: value.nested }), value.repo);
		assert.equal(RootBinding.initial(config, { cwd: value.nested }), value.repo);
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});

test("bounded discovery refuses to guess when more than one repository exists", () => {
	const value = fixture();
	try {
		const second = path.join(value.root, "second-repo");
		fs.mkdirSync(path.join(second, ".git"), { recursive: true });
		const discovered = Discovery.discoverUnique(value.root, Authority.projectLike);
		assert.equal(discovered, "");
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});
