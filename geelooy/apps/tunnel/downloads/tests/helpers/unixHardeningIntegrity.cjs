// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Test SHA, rollback, and progress with real Awtsmoos shell modules.
 * @description Awtsmoos.com protects the incumbent flame;
 * first birth needs no older garment bearing the same name.
 */

/** Demand that mismatched SHA testimony names both observed and expected bytes. */
function verifyManifest(harness) {
	const { downloads, quote, runShell } = harness;
	for (const [actual, expected, exitCode] of [
		["a".repeat(64), "b".repeat(64), 1],
		["a".repeat(64), "a".repeat(64), 0]
	]) {
		const result = runShell([
			"install_event() { printf 'EVENT %s %s %s %s\\n' \"$1\" \"$2\" \"$3\" \"$4\"; }",
			`source ${quote(path.join(downloads, "unix-release-metadata.sh"))}`,
			`assert_manifest_sha_matches ${quote(actual)} ${quote(expected)} ${quote("/tmp/manifest.txt")}; echo "exit=$?"`
		].join("; "));
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, new RegExp(`exit=${exitCode}`));
		if (exitCode === 1) {
			assert.match(result.stdout + result.stderr, /expected=aaa/);
			assert.match(result.stdout + result.stderr, /actual=bbb/);
		}
	}
}

/**
 * Permit a truly empty first root, but never displace an incumbent without
 * a real recovery version. Neither case creates a fake rollback archive.
 */
function verifyRollback(harness) {
	const { downloads, quote, runShell, root, recovery } = harness;
	const script = [
		"install_event() { :; }",
		`source ${quote(path.join(downloads, "unix-recovery-store.sh"))}`,
		`require_rollback_path; echo "exit=$?"`
	].join("; ");
	let result = runShell(script);
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /exit=0/, "fresh root must be allowed");
	fs.writeFileSync(path.join(root, "main.js"), "// B\"H incumbent runtime\n");
	result = runShell(script);
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /exit=1/, "incumbent without rollback must fail");
	fs.mkdirSync(path.join(recovery, "versions", "20260101T000000Z-1.0.716"), { recursive: true });
	result = runShell(`${script}; recovery_version_count`);
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /exit=0/, "an available recovery version must pass");
	assert.match(result.stdout, /\b1\b/);
}

/** Distinct status messages must remain visible even at equal percentages. */
function verifyProgress(harness) {
	const { downloads, quote, runShell } = harness;
	const result = runShell([
		`source ${quote(path.join(downloads, "unix-install-progress.sh"))}`,
		"INSTALL_STEP_N=1; INSTALL_STEP_TOTAL=3",
		`install_progress 22 "Checking published tunnel release"`,
		`install_progress 22 "Published metadata unavailable — recovering locally"`,
		`install_progress 22 "Published metadata unavailable — recovering locally"`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	const lines = result.stderr.split("\n").filter(line => line.includes("[ 22%]"));
	assert.equal(lines.length, 2, JSON.stringify(lines));
	assert.match(lines[0], /Checking published tunnel release/);
	assert.match(lines[1], /recovering locally/);
}

module.exports = { verifyManifest, verifyRollback, verifyProgress };
