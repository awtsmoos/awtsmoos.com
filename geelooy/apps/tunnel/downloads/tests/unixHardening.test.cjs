// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves the installer hardening layers fail fast and name the cause.
 * @description
 * The Awtsmoos never hides a broken bundle, a missing rollback, a stale
 * progress label, or a stale registration receipt. Awtsmoos.com names the
 * expected vs actual SHA on a manifest mismatch, refuses to displace the
 * live runtime without a recovery version, prints a new progress message
 * even when the percent does not move, and requires a FRESH live
 * registration receipt after promotion.
 */
const downloads = path.resolve(__dirname, "..");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-hardening-"));
const root = path.join(sandbox, "root");
const recovery = path.join(sandbox, "recovery");
for (const dir of [root, recovery]) fs.mkdirSync(dir, { recursive: true });

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function runShell(script, extraEnv = {}) {
	return spawnSync("bash", ["-lc", script], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_NODE_BIN: process.execPath,
			AWTSMOOS_INSTALL_RUNTIME: downloads,
			AWTSMOOS_INSTALL_PROGRESS_FILE: path.join(sandbox, "progress.state"),
			ROOT: root,
			RECOVERY_ROOT: recovery,
			...extraEnv
		}
	});
}

try {
	// --- Layer 1: manifest SHA mismatch names expected vs actual. ---
	// assert_manifest_sha_matches lives in unix-release-metadata.sh; it only
	// needs install_event, which we stub so the test stays hermetic.
	// The named SHAs go to both the event detail ($4) and stderr.
	let result = runShell([
		`install_event() { printf 'EVENT %s %s %s %s\\n' "$1" "$2" "$3" "$4"; }`,
		`source ${quote(path.join(downloads, "unix-release-metadata.sh"))}`,
		`assert_manifest_sha_matches ${quote("a".repeat(64))} ${quote("b".repeat(64))} ${quote("/tmp/manifest.txt")}; echo "exit=$?"`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout + result.stderr, /expected=aaa/);
	assert.match(result.stdout + result.stderr, /actual=bbb/);
	assert.match(result.stdout, /exit=1/);

	result = runShell([
		`install_event() { :; }`,
		`source ${quote(path.join(downloads, "unix-release-metadata.sh"))}`,
		`assert_manifest_sha_matches ${quote("a".repeat(64))} ${quote("a".repeat(64))} ${quote("/tmp/manifest.txt")}; echo "exit=$?"`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /exit=0/);

	// --- Layer 3: rollback path required. ---
	// require_rollback_path lives in unix-recovery-store.sh; it needs
	// install_event and RECOVERY_ROOT.
	result = runShell([
		`install_event() { :; }`,
		`source ${quote(path.join(downloads, "unix-recovery-store.sh"))}`,
		`require_rollback_path; echo "exit=$?"`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /exit=1/, "zero recovery versions must fail");

	fs.mkdirSync(path.join(recovery, "versions", "20260101T000000Z-1.0.716"), { recursive: true });
	result = runShell([
		`install_event() { :; }`,
		`source ${quote(path.join(downloads, "unix-recovery-store.sh"))}`,
		`require_rollback_path; echo "exit=$?"; recovery_version_count`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /exit=0/, "one recovery version must pass");
	assert.match(result.stdout, /1/);

	// --- Layer 4: progress prints a new message at the same percent. ---
	// install_progress lives in unix-install-progress.sh. In non-TTY mode
	// it prints one line per percent/step/message change.
	const progressScript = [
		`source ${quote(path.join(downloads, "unix-install-progress.sh"))}`,
		`INSTALL_STEP_N=1; INSTALL_STEP_TOTAL=3`,
		`install_progress 22 "Checking published tunnel release"`,
		`install_progress 22 "Published metadata unavailable — recovering locally"`,
		`install_progress 22 "Published metadata unavailable — recovering locally"`
	].join("; ");
	result = runShell(progressScript);
	assert.equal(result.status, 0, result.stderr);
	const lines = result.stderr.split("\n").filter((line) => line.includes("[ 22%]"));
	assert.equal(lines.length, 2, `expected 2 distinct 22% lines, got: ${JSON.stringify(lines)}`);
	assert.match(lines[0], /Checking published tunnel release/);
	assert.match(lines[1], /recovering locally/);

	// --- Layer 6: fresh registration required after promotion. ---
	// require_fresh_registration + registration_receipt_stamp +
	// installed_agent_registration_state live in unix-connection-health.sh.
	// Stub the agent-side pieces so the receipt logic is exercised alone.
	const healthScript = (receipt, setup = "") => [
		`source ${quote(path.join(downloads, "unix-connection-health.sh"))}`,
		setup,
		receipt,
		`require_fresh_registration 120; echo "fresh_exit=$?"`,
		`installed_agent_registration_state; echo "state_done"`
	].join("; ");

	// Fresh receipt (30s ago), matching tunnel, pid alive -> fresh passes.
	const freshAt = new Date(Date.now() - 30000).toISOString();
	result = runShell(healthScript(
		`printf '%s' '${JSON.stringify({ state: "registered", tunnelId: "tun_test", tunnelName: "awt-test", lastServerMessageAt: freshAt })}' > "$ROOT/connection-state.json"`,
		[
			`printf '1234\\n' > "$ROOT/agent.pid"`,
			`printf '{"tunnelName":"awt-test"}' > "$ROOT/config.json"`,
			`runtime_pid_matches() { return 0; }`,
			`runtime_registered() { return 0; }`
		].join("; ")
	));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /fresh_exit=0/, `fresh receipt must pass: ${result.stdout} ${result.stderr}`);

	// Stale receipt (10 minutes ago) -> fresh fails.
	const staleAt = new Date(Date.now() - 600000).toISOString();
	result = runShell(healthScript(
		`printf '%s' '${JSON.stringify({ state: "registered", tunnelId: "tun_test", tunnelName: "awt-test", lastServerMessageAt: staleAt })}' > "$ROOT/connection-state.json"`,
		[
			`printf '1234\\n' > "$ROOT/agent.pid"`,
			`printf '{"tunnelName":"awt-test"}' > "$ROOT/config.json"`,
			`runtime_pid_matches() { return 0; }`,
			`runtime_registered() { return 0; }`
		].join("; ")
	));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /fresh_exit=1/, `stale receipt must fail: ${result.stdout}`);

	// registration_receipt_stamp returns the receipt timestamp.
	result = runShell([
		`source ${quote(path.join(downloads, "unix-connection-health.sh"))}`,
		`printf '%s' '${JSON.stringify({ state: "registered", lastServerMessageAt: freshAt })}' > "$ROOT/connection-state.json"`,
		`registration_receipt_stamp; echo`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /^\d{13}$/m, `stamp must be epoch ms: ${result.stdout}`);

	// installed_agent_registration_state: pid alive + registered.
	result = runShell([
		`source ${quote(path.join(downloads, "unix-connection-health.sh"))}`,
		`printf '1234\\n' > "$ROOT/agent.pid"`,
		`runtime_pid_matches() { return 0; }`,
		`runtime_registered() { return 0; }`,
		`installed_agent_registration_state`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /running_registered/);

	// installed_agent_registration_state: pid alive but not registered.
	result = runShell([
		`source ${quote(path.join(downloads, "unix-connection-health.sh"))}`,
		`printf '1234\\n' > "$ROOT/agent.pid"`,
		`runtime_pid_matches() { return 0; }`,
		`runtime_registered() { return 1; }`,
		`installed_agent_registration_state`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /running_unregistered/);

	// installed_agent_registration_state: no pid.
	result = runShell([
		`source ${quote(path.join(downloads, "unix-connection-health.sh"))}`,
		`rm -f "$ROOT/agent.pid"`,
		`installed_agent_registration_state`
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /not_running/);

	console.log(JSON.stringify({
		ok: true,
		suite: "unix-hardening",
		manifestShaNamesExpectedVsActual: true,
		rollbackPathRequired: true,
		progressMessageVisibleAtSamePercent: true,
		freshRegistrationRequired: true,
		registrationStateSelfCheck: true
	}));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
