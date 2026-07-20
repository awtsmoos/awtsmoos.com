// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/** Registration waits must reject predecessor and stale PID testimony. */
const helper = "geelooy/apps/tunnel/downloads/unix-supervisor-install.sh";
const delayed = run(String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
mkdir -p "$ROOT"
printf '111\n' > "$ROOT/agent.pid"
printf '0\n' > "$TMP/samples"
runtime_pid_matches() { [ "$1" = "222" ]; }
runtime_registered() { [ "$1" = "222" ]; }
runtime_health_summary() { :; }
install_event() { :; }
sleep() {
	count="$(( $(cat "$TMP/samples") + 1 ))"
	printf '%s\n' "$count" > "$TMP/samples"
	[ "$count" -ne 3 ] || printf '222\n' > "$ROOT/agent.pid"
}
source "$HELPER"
wait_for_runtime 2
test "$(cat "$ROOT/agent.pid")" = "222"
test "$(cat "$TMP/samples")" -ge 3
`);
assert.equal(delayed.status, 0, delayed.stderr);

const stale = run(String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
mkdir -p "$ROOT"
printf '999\n' > "$ROOT/agent.pid"
runtime_pid_matches() { return 1; }
runtime_registered() { return 0; }
runtime_health_summary() { printf stale; }
install_event() { :; }
sleep() { :; }
source "$HELPER"
if wait_for_runtime 1; then exit 9; fi
`);
assert.equal(stale.status, 0, stale.stderr);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-runtime-wait-isolation",
	delayedRegistration: true,
	stalePredecessorRegistrationRejected: true,
	stalePidRejected: true
}, null, 2));

function run(script) {
	return spawnSync("bash", ["-c", script], {
		cwd: process.cwd(),
		env: { ...process.env, HELPER: helper },
		encoding: "utf8"
	});
}
