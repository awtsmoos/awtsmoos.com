// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/** macOS launchd permission denial retries once under a portable guardian. */
const script = String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
mkdir -p "$ROOT"
printf '444\n' > "$ROOT/agent.pid"
printf '{"code":"EPERM"}\n' > "$ROOT/project-root-state.json"
AWTSMOOS_SERVICE_MODE=launchd
service_mode() { printf '%s\n' "$AWTSMOOS_SERVICE_MODE"; }
uname() { printf 'Darwin\n'; }
project_root_failure_detail() { printf '{"failureReason":"EPERM"}'; }
install_event() { printf '%s|%s|%s\n' "$1" "$2" "$3" >> "$TMP/events"; }
stop_existing_runtime() { printf 'stopped\n' > "$TMP/stopped"; }
start_supervisor() {
	test "$AWTSMOOS_SERVICE_MODE" = portable
	test -f "$TMP/stopped"
	printf 'started\n' > "$TMP/started"
}
source geelooy/apps/tunnel/downloads/unix-service-manager.sh
retry_portable_supervisor_for_project_root
test "$(cat "$TMP/started")" = started
grep -q 'portable guardian' "$TMP/events"
printf '{"code":"ENOENT"}\n' > "$ROOT/project-root-state.json"
AWTSMOOS_SERVICE_MODE=launchd
if retry_portable_supervisor_for_project_root; then exit 9; fi
`;
const result = spawnSync("bash", ["-c", script], {
	cwd: process.cwd(),
	encoding: "utf8"
});
assert.equal(result.status, 0, result.stderr || result.stdout);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-mac-permission-fallback",
	launchdPermissionRetry: true,
	portableGuardianStarted: true,
	nonPermissionFailureNotRetried: true
}, null, 2));
