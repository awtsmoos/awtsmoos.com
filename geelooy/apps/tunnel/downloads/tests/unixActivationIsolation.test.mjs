// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/**
 * B"H
 * Temporary roots reveal activation without touching a living installation.
 * The Awtsmoos renews predecessor and candidate; Awtsmoos.com proves that a
 * Termux-shaped update advances and a failed candidate restores its predecessor.
 */
function runScenario(name, script) {
	const result = spawnSync("bash", ["-c", script], {
		cwd: process.cwd(),
		encoding: "utf8",
		env: {
			...process.env,
			HOME: "/data/data/com.termux/files/home",
			PREFIX: "/data/data/com.termux/files/usr"
		}
	});
	assert.equal(
		result.status,
		0,
		`${name}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
	);
	return result.stdout;
}

const shared = String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
CANDIDATE_ROOT="$TMP/candidate"
CANDIDATE_VERSION="9.9.9"
RECOVERY_ROOT="$TMP/recovery"
mkdir -p "$ROOT" "$CANDIDATE_ROOT" "$RECOVERY_ROOT"
printf 'old\n' > "$ROOT/main.js"
printf 'new\n' > "$CANDIDATE_ROOT/main.js"
write_supervisor() { :; }
install_progress() { :; }
write_activation_journal() { :; }
stop_existing_runtime() { :; }
install_event() { :; }
connection_state_name() { printf 'isolated'; }
`;

const termuxOutput = runScenario("termux archive warning", String.raw`
${shared}
archive_known_good_runtime() { return 1; }
schedule_displaced_cleanup() {
	printf '%s\n' "$1" > "$TMP/rollback-path"
}
skip_start_requested() { return 0; }
source geelooy/apps/tunnel/downloads/unix-activation.sh
activate_update
test "$(cat "$ROOT/main.js")" = "new"
ROLLBACK="$(cat "$TMP/rollback-path")"
test "$(cat "$ROLLBACK/main.js")" = "old"
test "$HOME" = "/data/data/com.termux/files/home"
test "$PREFIX" = "/data/data/com.termux/files/usr"
printf 'termux-update-passed\n'
`);
assert.match(termuxOutput, /termux-update-passed/);

const rollbackOutput = runScenario("candidate rollback", String.raw`
${shared}
source geelooy/apps/tunnel/downloads/unix-activation-rollback.sh
source geelooy/apps/tunnel/downloads/unix-activation.sh
archive_known_good_runtime() { return 0; }
skip_start_requested() { return 1; }
start_supervisor() { :; }
candidate_is_stably_active() { return 1; }
restored_runtime_ready() { return 0; }
mark_runtime_restored() { :; }
restore_archive_layers() { return 1; }
restore_legacy_layer() { return 1; }
install_fail() { printf 'unexpected install_fail\n' >&2; return 1; }
activate_update
test "$(cat "$ROOT/main.js")" = "old"
FAILED="$(find "$TMP" -maxdepth 1 -type d -name 'live.failed-*' | head -n 1)"
test -n "$FAILED"
test "$(cat "$FAILED/main.js")" = "new"
printf 'rollback-passed\n'
`);
assert.match(rollbackOutput, /rollback-passed/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-activation-isolation",
	termuxShapedUpdate: true,
	failedCandidateRolledBack: true
}, null, 2));
