// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const downloadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @file Proves the registration wait is adaptive, not a fixed cliff.
 * @description
 * The Awtsmoos never kills a registration that is actively progressing, and
 * never burns a full budget on a wedged agent. Awtsmoos.com extends the
 * startup deadline while the agent's server receipt keeps advancing, and
 * ends the wait soon after the receipt stops moving. A healthy Mac
 * registration took ~83s and degraded ones take minutes; a fixed 45s cliff
 * killed them mid-flight (Nov 6).
 */
const helper = "geelooy/apps/tunnel/downloads/unix-supervisor-install.sh";

function run(script) {
	return spawnSync("bash", ["-c", script], {
		cwd: process.cwd(),
		env: {
			...process.env,
			HELPER: helper,
			AWTSMOOS_INSTALL_RUNTIME: downloadsDir
		},
		encoding: "utf8"
	});
}

// A: the receipt keeps advancing -> the wait extends past the base timeout
// (1s = 4 samples) and only stops at the absolute cap (3s = 12 samples).
// Registration never becomes stable, so the wait runs to the cap.
const extendsWhileProgressing = run(String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
mkdir -p "$ROOT"
printf '111\n' > "$ROOT/agent.pid"
printf '0\n' > "$TMP/samples"
printf '1000\n' > "$TMP/stamp"
runtime_pid_matches() { return 0; }
runtime_registered() { return 1; }
runtime_health_summary() { :; }
install_event() { :; }
registration_receipt_stamp() { cat "$TMP/stamp"; }
sleep() {
	count="$(( $(cat "$TMP/samples") + 1 ))"
	printf '%s\n' "$count" > "$TMP/samples"
	# The receipt advances on every sample: the agent is actively registering.
	printf '%s\n' "$(( 1000 + count ))" > "$TMP/stamp"
}
source "$HELPER"
export AWTSMOOS_STARTUP_NO_PROGRESS_SECONDS=60
export AWTSMOOS_STARTUP_ABSOLUTE_CAP_SECONDS=3
if wait_for_runtime 1; then exit 9; fi
test "$(cat "$TMP/samples")" -eq 12
`);
assert.equal(extendsWhileProgressing.status, 0, extendsWhileProgressing.stderr);

// B: the receipt never moves -> the wait ends at the base timeout (1s = 4
// samples) and does NOT burn the absolute cap (10s = 40 samples).
const wedgedFailsFast = run(String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
mkdir -p "$ROOT"
printf '111\n' > "$ROOT/agent.pid"
printf '0\n' > "$TMP/samples"
runtime_pid_matches() { return 0; }
runtime_registered() { return 1; }
runtime_health_summary() { :; }
install_event() { :; }
registration_receipt_stamp() { printf '1000\n'; }
sleep() {
	count="$(( $(cat "$TMP/samples") + 1 ))"
	printf '%s\n' "$count" > "$TMP/samples"
}
source "$HELPER"
export AWTSMOOS_STARTUP_NO_PROGRESS_SECONDS=60
export AWTSMOOS_STARTUP_ABSOLUTE_CAP_SECONDS=10
if wait_for_runtime 1; then exit 9; fi
test "$(cat "$TMP/samples")" -eq 4
`);
assert.equal(wedgedFailsFast.status, 0, wedgedFailsFast.stderr);

// C: a registration that becomes stable still returns 0 promptly.
const stableReturnsPromptly = run(String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
mkdir -p "$ROOT"
printf '111\n' > "$ROOT/agent.pid"
printf '0\n' > "$TMP/samples"
runtime_pid_matches() { return 0; }
runtime_registered() { return 0; }
runtime_health_summary() { :; }
install_event() { :; }
registration_receipt_stamp() { printf '1000\n'; }
sleep() {
	count="$(( $(cat "$TMP/samples") + 1 ))"
	printf '%s\n' "$count" > "$TMP/samples"
}
source "$HELPER"
export AWTSMOOS_STABILITY_SAMPLES=2
export AWTSMOOS_STARTUP_NO_PROGRESS_SECONDS=60
export AWTSMOOS_STARTUP_ABSOLUTE_CAP_SECONDS=10
wait_for_runtime 5
test "$(cat "$TMP/samples")" -le 3
`);
assert.equal(stableReturnsPromptly.status, 0, stableReturnsPromptly.stderr);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-adaptive-registration-wait",
	extendsWhileProgressing: true,
	wedgedFailsFast: true,
	stableReturnsPromptly: true
}, null, 2));
