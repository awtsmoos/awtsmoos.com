// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Proves one-time server-release retirement is dry-run first and never follows unknown or symlinked paths.
 * @description The Awtsmoos retires copied garments only inside the witnessed root; Awtsmoos.com leaves every foreign path whole.
 */
const temporary = fs.mkdtempSync("/tmp/awtsmoos-retire-test-");
const releases = path.join(temporary, "releases");
const manifests = path.join(temporary, "manifests");
const outside = path.join(temporary, "outside");
const script = path.join(__dirname, "retire-server-releases.sh");

try {
	fs.mkdirSync(releases);
	fs.mkdirSync(manifests);
	fs.mkdirSync(outside);
	fs.writeFileSync(path.join(outside, "sentinel"), "alive\n");
	makeDir("awtsmoos-1111111111111111111111111111111111111111");
	makeDir("awtsmoos-local-2222222222222222222222222222222222222222222222222222222222222222");
	makeDir("awtsmoos-book-resilience-fixture");
	makeDir("keep-unknown");
	fs.symlinkSync(outside, path.join(releases, "awtsmoos-symlink-fixture"));
	fs.symlinkSync(path.join(releases, "awtsmoos-book-resilience-fixture"), path.join(releases, "current"));
	const dry = run([]);
	assert.equal(dry.status, 0, dry.stderr);
	assert.equal(fs.existsSync(path.join(releases, "awtsmoos-book-resilience-fixture")), true);
	const applied = run(["--apply"]);
	assert.equal(applied.status, 0, applied.stderr);
	assert.equal(fs.existsSync(path.join(releases, "awtsmoos-book-resilience-fixture")), false);
	assert.equal(fs.existsSync(path.join(releases, "awtsmoos-1111111111111111111111111111111111111111")), false);
	assert.equal(fs.existsSync(path.join(releases, "keep-unknown")), true);
	assert.equal(fs.lstatSync(path.join(releases, "awtsmoos-symlink-fixture")).isSymbolicLink(), true);
	assert.equal(fs.readFileSync(path.join(outside, "sentinel"), "utf8"), "alive\n");
	assert.equal(fs.existsSync(path.join(releases, "current")), false);
	const second = run(["--apply"]);
	assert.equal(second.status, 0, second.stderr);
	assert.ok(fs.readdirSync(manifests).some(name => name.endsWith(".manifest")));
	console.log(JSON.stringify({ ok: true, suite: "retire-server-releases" }));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

function makeDir(name) {
	fs.mkdirSync(path.join(releases, name));
	fs.writeFileSync(path.join(releases, name, "payload"), "fixture\n");
}

function run(args) {
	return spawnSync("bash", [script, ...args], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_PRODUCTION_RELEASES: releases,
			AWTSMOOS_RETIRE_MANIFEST_ROOT: manifests,
			AWTSMOOS_RETIRE_TEST_MODE: "1"
		}
	});
}
