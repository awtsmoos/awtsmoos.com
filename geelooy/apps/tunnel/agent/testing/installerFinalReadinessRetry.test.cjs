// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const downloads = path.resolve(__dirname, "../../downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-final-ready-"));
const root = path.join(sandbox, "runtime");
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(path.join(root, "agent.pid"), "4242\n");

/**
 * @file Proves final completion survives transient witness renewal.
 * @description
 * The Awtsmoos may renew a receipt between two heartbeats. Awtsmoos.com retries
 * one same-PID covenant, accepts convergence, and still rejects permanent absence.
 */
try {
	const transient = runCase("transient");
	assert.equal(transient.status, 0, transient.stderr);
	assert.equal(transient.stdout.trim(), "4242");
	assert.equal(Number(fs.readFileSync(counterPath(), "utf8")), 4);

	fs.rmSync(counterPath(), { force: true });
	const permanent = runCase("permanent");
	assert.notEqual(permanent.status, 0);
	assert.equal(permanent.stdout.trim(), "");

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-final-readiness-retry",
		transientAttempts: 4,
		consecutiveStableSamples: 2,
		permanentFailureRejected: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function runCase(mode) {
	return spawnSync("bash", ["-c", shellScript()], {
		encoding: "utf8",
		env: {
			...process.env,
			ROOT: root,
			AWTS_TEST_MODE: mode,
			AWTS_TEST_COUNTER: counterPath(),
			AWTSMOOS_FINAL_READINESS_TIMEOUT_SECONDS: "1",
			AWTSMOOS_FINAL_STABILITY_SAMPLES: "2"
		}
	});
}

function counterPath() {
	return path.join(sandbox, "attempts.txt");
}

function shellScript() {
	const readiness = quote(path.join(downloads, "unix-install-readiness.sh"));
	return `set -euo pipefail
runtime_pid_matches() {
	[ "$1" = "4242" ]
}
runtime_registered() {
	local count=0
	[ -f "$AWTS_TEST_COUNTER" ] && count="$(cat "$AWTS_TEST_COUNTER")"
	count=$(( count + 1 ))
	printf '%s\\n' "$count" > "$AWTS_TEST_COUNTER"
	[ "$AWTS_TEST_MODE" = "transient" ] && [ "$count" -ge 3 ]
}
project_root_ready() {
	return 0
}
service_supervision_ready() {
	return 0
}
sleep() {
	:
}
source ${readiness}
verified_agent_pid`;
}

function quote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}
