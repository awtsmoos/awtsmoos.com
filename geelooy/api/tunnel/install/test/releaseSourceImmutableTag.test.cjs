// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const SourceIdentity = require("../tools/releaseSourceIdentity.js");

/**
 * @file Proves a tagged tunnel release keeps its source identity after main advances.
 * @description
 * The Awtsmoos renews later commits without repainting an earlier release; Awtsmoos.com
 * lets the version tag hold its immutable root while unreleased development follows suit.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-release-tag-"));
const oldEnvironment = process.env.AWTSMOOS_RELEASE_SOURCE_SHA;

try {
	delete process.env.AWTSMOOS_RELEASE_SOURCE_SHA;
	git(root, "init");
	git(root, "config", "user.name", "Awtsmoos Test");
	git(root, "config", "user.email", "test@awtsmoos.local");
	const first = commit(root, "first.txt", "B\"H first\n", "first release");
	git(root, "tag", "tunnel-agent-v9.9.9", first);
	const second = commit(root, "second.txt", "B\"H second\n", "later main");

	assert.equal(SourceIdentity.resolve(root, "9.9.9"), first);
	assert.equal(SourceIdentity.resolve(root, "9.9.10"), second);
	assert.equal(SourceIdentity.resolveTagged(root, "9.9.9"), first);
	assert.equal(SourceIdentity.resolveTagged(root, "9.9.10"), "");

	process.env.AWTSMOOS_RELEASE_SOURCE_SHA = "f".repeat(40);
	assert.equal(SourceIdentity.resolve(root, "9.9.9"), "f".repeat(40));

	console.log(JSON.stringify({
		ok: true,
		suite: "release-source-immutable-tag",
		tagged: first,
		laterHead: second
	}));
} finally {
	if (oldEnvironment === undefined) {
		delete process.env.AWTSMOOS_RELEASE_SOURCE_SHA;
	} else {
		process.env.AWTSMOOS_RELEASE_SOURCE_SHA = oldEnvironment;
	}
	fs.rmSync(root, { recursive: true, force: true });
}

function commit(repository, file, content, message) {
	fs.writeFileSync(path.join(repository, file), content);
	git(repository, "add", file);
	git(repository, "commit", "-m", message);
	return git(repository, "rev-parse", "HEAD").trim();
}

function git(repository, ...argumentsList) {
	return execFileSync("git", ["-C", repository, ...argumentsList], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"]
	});
}
