// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/** Proves restore replaces candidate identity and keeps its guard off live ROOT. */
(() => {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-restore-id-"));
	const liveRoot = path.join(temporaryRoot, "live");
	const recoveryRoot = path.join(temporaryRoot, "recovery");
	fs.mkdirSync(path.join(recoveryRoot, "bin"), { recursive: true });
	fs.mkdirSync(path.join(recoveryRoot, "logs"), { recursive: true });
	fs.writeFileSync(path.join(recoveryRoot, "archive-offset"), "2\n");
	fs.writeFileSync(path.join(recoveryRoot, "last-restore.json"), JSON.stringify({
		version: "1.0.354",
		candidate: "/archive/1.0.354"
	}));
	const rescue = path.join(recoveryRoot, "bin", "awtsmoos-recovery-rescue.sh");
	fs.writeFileSync(rescue, `#!/usr/bin/env bash\nmkdir -p "$1"\nprintf '1.0.354\\n' > "$1/install-state.txt"\n`);
	fs.chmodSync(rescue, 0o755);
	const result = spawnSync("bash", ["-c", script()], {
		encoding: "utf8",
		env: {
			...process.env,
			DOWNLOADS: downloads,
			TEST_LIVE_ROOT: liveRoot,
			TEST_RECOVERY_ROOT: recoveryRoot,
			AWTSMOOS_RUNTIME_VERSION: "1.0.356",
			AWTSMOOS_ACTIVATION_ID: "failed-candidate"
		}
	});
	try {
		assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
		const output = JSON.parse(result.stdout);
		assert.equal(output.version, "1.0.354");
		assert.match(output.activationId, /^recovery-.+-1\.0\.354$/);
		assert.equal(output.offset, "3");
		assert.equal(output.guard, path.join(recoveryRoot, "state", "supervisor-instance.lock"));
		assert.equal(output.guard.startsWith(liveRoot), false);
		console.log(JSON.stringify({ ok: true, suite: "supervisor-restore-identity", ...output }, null, 2));
	} finally {
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
})();

function script() {
	return `set -u
ROOT="$TEST_LIVE_ROOT"
RECOVERY_ROOT="$TEST_RECOVERY_ROOT"
RECOVERY_LOG="$RECOVERY_ROOT/logs/recovery.log"
LOG="$RECOVERY_ROOT/logs/supervisor.log"
supervisor_log(){ :; }
source "$DOWNLOADS/unix-supervisor-recovery.sh"
source "$DOWNLOADS/unix-supervisor-guard.sh"
perform_external_restore
node -e 'console.log(JSON.stringify({version:process.env.AWTSMOOS_RUNTIME_VERSION,activationId:process.env.AWTSMOOS_ACTIVATION_ID,offset:process.argv[1],guard:process.argv[2]}))' "$(current_archive_offset)" "$(supervisor_guard_directory)"`;
}
