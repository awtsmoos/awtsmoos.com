// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/** Rollback restores and verifies the predecessor without rewriting its guardian. */
const script = String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
ROLLBACK="$TMP/rollback"
FAILED="$TMP/failed"
RECOVERY_ROOT="$TMP/recovery"
mkdir -p "$ROOT" "$ROLLBACK" "$RECOVERY_ROOT"
printf 'candidate\n' > "$ROOT/main.js"
printf 'predecessor\n' > "$ROLLBACK/main.js"
printf 'preserved-supervisor\n' > "$ROLLBACK/awtsmoos-supervisor.sh"
printf '1.0.1\n' > "$ROLLBACK/install-state.txt"
stop_existing_runtime() { :; }
start_supervisor() { printf 'candidate writer called\n' >&2; return 91; }
start_restored_supervisor() {
	test "$(cat "$ROOT/main.js")" = predecessor
	test "$(cat "$ROOT/awtsmoos-supervisor.sh")" = preserved-supervisor
	printf '4321\n' > "$ROOT/agent.pid"
	printf 'started\n' > "$TMP/restarted"
}
wait_for_runtime() { test -f "$TMP/restarted"; }
ensure_rollback_project_root_receipt() { [ "$1" = "4321" ]; }
wait_for_service_supervision() { printf 'verified\n' > "$TMP/verified"; }
source geelooy/apps/tunnel/downloads/unix-activation-rollback.sh
restore_exact_predecessor "$ROLLBACK" "$FAILED"
test "$(cat "$ROOT/main.js")" = predecessor
test "$(cat "$FAILED/main.js")" = candidate
test "$(cat "$TMP/verified")" = verified
`;
const result = spawnSync("bash", ["-c", script], {
	cwd: process.cwd(),
	encoding: "utf8"
});
assert.equal(result.status, 0, result.stderr || result.stdout);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-rollback-restart-isolation",
	predecessorRestarted: true,
	predecessorVerified: true,
	preservedSupervisorUsed: true
}, null, 2));
