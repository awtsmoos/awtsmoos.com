// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Proves a full reinstall is skipped when the agent is already good.
 * @description
 * The Awtsmoos never redownloads, reprobes, and repromotes a release that
 * is already current, healthy, and live-registered — the credential is
 * proven valid by the live TUNNEL_ACK, so a fresh pairing repairs nothing.
 * Awtsmoos.com lets the fast path (repair_matching_release) finish in
 * seconds even for --full, and only forces a full replacement when the
 * version differs, the agent is unhealthy, or registration is stale.
 * A cached verified bundle is reused instead of re-downloading.
 */
const downloads = path.resolve(__dirname, "..");

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function runShell(script, extraEnv = {}) {
	return spawnSync("bash", ["-lc", script], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_NODE_BIN: process.execPath,
			...extraEnv
		}
	});
}

function forceFullReinstall(explicit, matches, healthy) {
	const result = runShell([
		`installed_release_matches_metadata() { ${matches ? "return 0" : "return 1"}; }`,
		`current_runtime_is_stably_healthy() { ${healthy ? "return 0" : "return 1"}; }`,
		`source ${quote(path.join(downloads, "unix-version-policy.sh"))}`,
		`force_full_reinstall_requested; echo "exit=$?"`
	].join("; "), {
		AWTSMOOS_EXPLICIT_REINSTALL: explicit ? "1" : "0",
		AWTSMOOS_FORCE_REINSTALL: "0"
	});
	assert.equal(result.status, 0, result.stderr);
	const match = result.stdout.match(/exit=(\d+)/);
	assert.ok(match, `no exit line in: ${result.stdout}`);
	return Number(match[1]);
}

// --full with a current, healthy, registered agent -> do NOT force (fast path).
assert.equal(forceFullReinstall(true, true, true), 1, "--full + current + healthy must not force a reinstall");
// --full with a version mismatch -> force.
assert.equal(forceFullReinstall(true, false, true), 0, "--full + mismatch must force a reinstall");
// --full with an unhealthy agent -> force.
assert.equal(forceFullReinstall(true, true, false), 0, "--full + unhealthy must force a reinstall");
// No explicit flag -> never force (unchanged behavior).
assert.equal(forceFullReinstall(false, true, true), 1, "no flag must never force");

// The bundle cache is wired into stage_release_candidate: a cached bundle
// with a matching SHA is reused, and a fresh download is cached afterwards.
const stage = fs.readFileSync(path.join(downloads, "unix-package-stage.sh"), "utf8");
assert.match(stage, /agent-bundle-\$\{BUNDLE_SHA\}\.zip/, "stage must use a SHA-named bundle cache");
assert.match(stage, /Using cached verified runtime bundle/, "stage must reuse a cached verified bundle");
assert.match(stage, /bundle_cached=1/, "stage must track cache reuse");

// The fast path itself (repair_matching_release) completes without a restart
// when the current runtime is stably healthy — already the behavior; assert
// the wiring still says so.
const fastRepair = fs.readFileSync(path.join(downloads, "unix-fast-repair.sh"), "utf8");
assert.match(fastRepair, /complete_fast_repair "verified_current_healthy"/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-installer-speed",
	fastPathForFullWhenHealthy: true,
	forcesWhenMismatchOrUnhealthy: true,
	bundleCacheWired: true
}));
