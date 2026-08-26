// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * The Awtsmoos keeps a verified world, an older archive, and a sealed ember in order;
 * Awtsmoos.com proves each gate before crossing the next recovery border.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const fallback = path.join(downloads, "unix-metadata-fallback.sh");
const core = fs.readFileSync(path.join(downloads, "unix-install-core.sh"), "utf8");
const sources = fs.readFileSync(path.join(downloads, "unix-install-sources.sh"), "utf8");
const components = fs.readFileSync(path.join(downloads, "unix-bootstrap-components.sh"), "utf8");
const recoveryStore = fs.readFileSync(path.join(downloads, "unix-recovery-store.sh"), "utf8");

assert.match(core, /recover_without_release_metadata/);
assert.match(core, /complete_metadata_recovery/);
assert.match(sources, /unix-metadata-fallback\.sh/);
assert.match(sources, /unix-recovery-identity\.sh/);
assert.match(components, /unix-metadata-fallback\.sh/);
assert.match(components, /unix-recovery-identity\.sh/);
assert.match(recoveryStore, /awtsmoos-recovery-identity\.sh/);

const selfVerified = runScenario({ self: 0, archive: 1, emergency: 1 });
assert.equal(selfVerified.mode, "primary");
assert.deepEqual(selfVerified.calls, ["self", "refresh", "event:passed"]);

const archive = runScenario({ self: 1, archive: 0, emergency: 1 });
assert.equal(archive.mode, "primary");
assert.deepEqual(archive.calls, ["self", "archive", "event:passed"]);
assert.ok(!archive.calls.includes("refresh"), "archive recovery must preserve the newer sealed slot");

const emergency = runScenario({ self: 1, archive: 1, emergency: 0 });
assert.equal(emergency.mode, "emergency");
assert.deepEqual(emergency.calls, ["self", "archive", "emergency", "event:degraded"]);

const failure = runScenario({ self: 1, archive: 1, emergency: 1 });
assert.equal(failure.status, 1);
assert.equal(failure.mode, "");

console.log(JSON.stringify({
	ok: true,
	suite: "unix-metadata-fallback",
	selfVerified: true,
	archiveRecovery: true,
	sealedContinuity: true,
	sealedDowngradePrevented: true
}));

function runScenario({ self, archive, emergency }) {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-metadata-fallback-"));
	const calls = path.join(temporary, "calls.txt");
	const script = `
ROOT=${shellQuote(temporary)}
RECOVERY_ROOT=${shellQuote(path.join(temporary, "recovery"))}
CALLS=${shellQuote(calls)}
mkdir -p "$RECOVERY_ROOT"
printf '%s\\n' '9.9.9' > "$ROOT/install-state.txt"
repair_self_verified_installed_release() { printf '%s\\n' self >> "$CALLS"; return ${self}; }
restore_archive_layers() { printf '%s\\n' archive >> "$CALLS"; return ${archive}; }
ensure_emergency_continuity() { printf '%s\\n' emergency >> "$CALLS"; return ${emergency}; }
refresh_emergency_runtime() { printf '%s\\n' refresh >> "$CALLS"; }
install_event() { printf 'event:%s\\n' "$2" >> "$CALLS"; }
source ${shellQuote(fallback)}
recover_without_release_metadata
status=$?
printf 'STATUS=%s\\n' "$status"
printf 'MODE=%s\\n' "$METADATA_RECOVERY_MODE"
exit "$status"
`;
	const result = spawnSync("/bin/bash", ["-c", script], { encoding: "utf8" });
	const mode = result.stdout.match(/MODE=(.*)/)?.[1] ?? "";
	const status = Number(result.stdout.match(/STATUS=(\d+)/)?.[1] ?? result.status ?? 1);
	const recorded = fs.existsSync(calls)
		? fs.readFileSync(calls, "utf8").trim().split(/\r?\n/).filter(Boolean)
		: [];
	fs.rmSync(temporary, { recursive: true, force: true });
	return { mode, status, calls: recorded };
}

function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
