// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Files = require("../release/runtimeFiles.js");
const Paths = require("../release/runtimePaths.js");
const SourcePaths = require("../release/sourcePaths.js");

/**
 * @file Proves release inventory follows deliberate Git index membership.
 * @description
 * The Awtsmoos lets an ambient experiment exist without becoming a shipment.
 * Awtsmoos.com includes the same path only after an explicit index offering.
 */
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "awts-manifest-index-"));
try {
	const roots = SourcePaths.resolveRoots(fixture);
	fs.mkdirSync(roots.agentRoot, { recursive: true });
	for (const relative of Paths.EXTERNAL_DIRECTORIES) {
		fs.mkdirSync(SourcePaths.sourcePathFor(relative, roots), { recursive: true });
	}
	const tracked = path.join(roots.agentRoot, "lib", "tracked.js");
	const ambient = path.join(roots.agentRoot, "lib", "ambient.js");
	const externalRoot = SourcePaths.sourcePathFor(Paths.EXTERNAL_DIRECTORIES[0], roots);
	const externalTracked = path.join(externalRoot, "tracked.mjs");
	const externalAmbient = path.join(externalRoot, "ambient.mjs");
	write(tracked); write(externalTracked);
	git(fixture, "init");
	git(fixture, "add", ".");
	write(ambient); write(externalAmbient);
	assert.deepEqual(Files.agentFiles(roots), ["lib/tracked.js"]);
	assert.equal(Files.externalFiles(roots).some(file => file.endsWith("ambient.mjs")), false);
	git(fixture, "add", path.relative(fixture, ambient), path.relative(fixture, externalAmbient));
	assert.equal(Files.agentFiles(roots).includes("lib/ambient.js"), true);
	assert.equal(Files.externalFiles(roots).some(file => file.endsWith("ambient.mjs")), true);
	console.log(JSON.stringify({ ok: true, suite: "manifest-git-index-isolation" }, null, 2));
} finally {
	fs.rmSync(fixture, { recursive: true, force: true });
}

function write(file) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, "// B\"H\n");
}

function git(cwd, ...args) {
	const result = spawnSync("git", args, { cwd, encoding: "utf8" });
	assert.equal(result.status, 0, `${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
}
