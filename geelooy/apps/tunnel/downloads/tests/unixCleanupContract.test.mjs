// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/** Undefined cleanup can never strand activation; failed live bytes are quarantined. */
const script = String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
AWTSMOOS_PROJECT_ROOT="$TMP/project"
mkdir -p "$ROOT" "$AWTSMOOS_PROJECT_ROOT"
printf 'runtime\n' > "$ROOT/main.js"
stop_existing_runtime(){ printf 'stopped\n' > "$TMP/stopped"; }
install_event(){ printf '%s %s\n' "$1" "$2" > "$TMP/event"; }
source geelooy/apps/tunnel/downloads/unix-cleanup.sh
type remove_active_install >/dev/null
remove_active_install
test ! -e "$ROOT"
FAILED="$(find "$TMP" -maxdepth 1 -type d -name 'live.failed-cleanup-*' | head -1)"
test -n "$FAILED"
test "$(cat "$FAILED/main.js")" = runtime
test "$(cat "$TMP/stopped")" = stopped
grep -q 'cleanup quarantined' "$TMP/event"
printf 'cleanup-contract-passed\n'
`;
const result = spawnSync("bash", ["-c", script], {
	cwd: process.cwd(),
	encoding: "utf8"
});
assert.equal(
	result.status,
	0,
	`STDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
);
assert.match(result.stdout, /cleanup-contract-passed/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-cleanup-contract",
	undefinedCleanupEliminated: true,
	failedRuntimeQuarantined: true
}));
