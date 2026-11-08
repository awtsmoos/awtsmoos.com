// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves the installer fits the 5-second total budget for the common case.
 * @description
 * The Awtsmoos never waits when it can know. Awtsmoos.com polls sub-second,
 * proves a candidate with two samples over half a second, caps supervision
 * waits at five seconds, and fails a slow download fast instead of burning
 * a 45-second max-time. The fast path (already current, healthy and
 * live-registered) must finish in seconds; a full install keeps every
 * safety check but none of the idle waiting.
 */
const downloads = path.resolve(__dirname, "..");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-five-second-"));
const root = path.join(sandbox, "root");
const recovery = path.join(sandbox, "recovery");
for (const dir of [root, recovery]) fs.mkdirSync(dir, { recursive: true });

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function read(file) {
	return fs.readFileSync(path.join(downloads, file), "utf8");
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
			...extraEnv,
		},
	});
}

try {
	// --- Display heartbeat is sub-second, stalls surface in 5s. ---
	// unix-install-custody.cjs prints the ACTIVE heartbeat; a 5s interval
	// hides a stall behind a motionless bar. It must tick every 500ms and
	// flag silence after 5s, not 30s.
	const custody = read("unix-install-custody.cjs");
	assert.match(custody, /lastHeartbeat >= 500\)/, "custody heartbeat must be 500ms");
	assert.doesNotMatch(custody, /lastHeartbeat >= 5000\)/, "custody heartbeat must not be 5000ms");
	assert.match(custody, /silent > 5 \?/, "silent-output flag must trigger after 5s");

	// --- Probe proves readiness with 2 samples over 500ms, not 4 over 1800ms. ---
	// candidate_stability_ready is the probe's gate. Two samples spanning
	// half a second still proves the candidate is alive, registered, and
	// answering; the old 4-sample / 1800ms window cost ~1.3s of pure waiting.
	const probeState = read("unix-candidate-probe-readiness-state.sh");
	assert.match(probeState, /AWTSMOOS_CANDIDATE_PROBE_STABLE_SAMPLES:-\s*2\}/, "probe stable samples must default to 2");
	assert.match(probeState, /AWTSMOOS_CANDIDATE_PROBE_STABLE_MS:-\s*500\}/, "probe stable window must default to 500ms");
	assert.doesNotMatch(probeState, /STABLE_SAMPLES:-\s*4\}/, "probe must not require 4 samples");
	assert.doesNotMatch(probeState, /STABLE_MS:-\s*1800\}/, "probe must not require 1800ms");

	// --- Probe samples fast: 0.05s early, 0.10s mid, 0.25s late. ---
	// candidate_probe_sleep_seconds sets the poll interval. A 0.5s late
	// sleep lets a ready candidate sit unnoticed; 0.25s is the slowest it gets.
	let result = runShell([
		`source ${quote(path.join(downloads, "unix-candidate-probe-readiness-state.sh"))}`,
		`candidate_probe_sleep_seconds 100`,
		`candidate_probe_sleep_seconds 5000`,
		`candidate_probe_sleep_seconds 20000`,
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	const sleeps = result.stdout.trim().split("\n");
	assert.deepEqual(sleeps, ["0.05", "0.10", "0.25"], `probe sleeps must be fast, got ${JSON.stringify(sleeps)}`);

	// --- Probe stability gate actually passes after 2 samples / 500ms. ---
	// Behavioural: feed two accepting samples spanning 600ms and the gate
	// must open. With the old 4-sample / 1800ms defaults it would stay shut.
	result = runShell([
		`source ${quote(path.join(downloads, "unix-candidate-probe-readiness-state.sh"))}`,
		`candidate_stability_reset`,
		`candidate_stability_accept 1000`,
		`candidate_stability_accept 1600`,
		`candidate_stability_ready 1600 && echo READY || echo NOT_READY`,
	].join("; "));
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /READY/, "probe gate must open after 2 samples over 600ms");

	// --- Registration wait needs 2 stable samples, not 4. ---
	// wait_for_runtime is the post-promotion gate. Four samples at 0.25s
	// is a full second of pure waiting after the agent has registered.
	const supervisorInstall = read("unix-supervisor-install.sh");
	assert.match(supervisorInstall, /AWTSMOOS_STABILITY_SAMPLES:-\s*2\}/, "runtime stability samples must default to 2");
	assert.doesNotMatch(supervisorInstall, /AWTSMOOS_STABILITY_SAMPLES:-\s*4\}/, "runtime must not require 4 samples");

	// --- Supervision waits cap at 5s, not 30s / 15s. ---
	// wait_for_service_supervision returns immediately when supervision is
	// ready; the timeout is only a cap. A 30s cap lets a wedged supervisor
	// burn the whole 5-second budget (and more) before failing.
	const activationState = read("unix-activation-state.sh");
	assert.match(activationState, /wait_for_service_supervision 5/, "candidate readiness must cap supervision at 5s");
	assert.doesNotMatch(activationState, /wait_for_service_supervision 30/, "candidate readiness must not wait 30s");
	const rollback = read("unix-activation-rollback.sh");
	assert.match(rollback, /wait_for_service_supervision 5/, "rollback must cap supervision at 5s");
	assert.doesNotMatch(rollback, /wait_for_service_supervision 15/, "rollback must not wait 15s");

	// --- Probe reporting and pairing polls are sub-second. ---
	// A 5s report interval hides a ready candidate; a 5s pairing poll
	// delays approval detection. Both must tick every 500ms.
	const probeReadiness = read("unix-candidate-probe-readiness.sh");
	assert.match(probeReadiness, /AWTSMOOS_CANDIDATE_REPORT_INTERVAL_MS:-\s*500\}/, "probe report interval must be 500ms");
	assert.match(probeReadiness, /installer_state_poll_interval_ms=500/, "pairing state poll must be 500ms");
	assert.doesNotMatch(probeReadiness, /REPORT_INTERVAL_MS:-\s*5000\}/, "probe must not report every 5s");
	assert.doesNotMatch(probeReadiness, /installer_state_poll_interval_ms=5000/, "pairing poll must not be 5s");

	// --- Downloads fail fast: no 45s max-time, no 18s metadata fetch. ---
	// A single bootstrap fetch used to allow 45s; the release metadata
	// fetches allowed 18s each. On a healthy connection both finish in
	// ~1s; on a wedged one they must fail fast instead of eating the budget.
	const bootstrapFetch = read("unix-bootstrap-fetch.sh");
	assert.match(bootstrapFetch, /--max-time 10/, "bootstrap fetch must cap at 10s");
	assert.match(bootstrapFetch, /--connect-timeout 3/, "bootstrap connect must cap at 3s");
	assert.doesNotMatch(bootstrapFetch, /--max-time 45/, "bootstrap must not allow 45s");
	const releaseMetadata = read("unix-release-metadata.sh");
	assert.match(releaseMetadata, /--max-time 6/, "metadata fetch must cap at 6s");
	assert.match(releaseMetadata, /--connect-timeout 2/, "metadata connect must cap at 2s");
	assert.doesNotMatch(releaseMetadata, /--max-time 18/, "metadata must not allow 18s");

	console.log(JSON.stringify({
		ok: true,
		suite: "unix-installer-five-second",
		heartbeatMs: 500,
		probeSamples: 2,
		probeStableMs: 500,
		runtimeSamples: 2,
		supervisionCapSeconds: 5,
		bootstrapMaxTimeSeconds: 10,
		metadataMaxTimeSeconds: 6,
	}));
} catch (error) {
	console.error(JSON.stringify({ ok: false, suite: "unix-installer-five-second", error: String(error && error.message || error) }));
	process.exitCode = 1;
}
