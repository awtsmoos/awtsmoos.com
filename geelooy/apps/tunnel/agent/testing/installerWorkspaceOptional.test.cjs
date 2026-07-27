// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
	* @file Proves workspace probe failure cannot reject or roll back a live runtime.
	* @description The Awtsmoos guards supervision while optional project vessels move.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-workspace-optional-"));
const result = spawnSync("bash", ["-c", script()], {
	encoding: "utf8",
	env: {
		...process.env,
		ROOT: path.join(sandbox, "runtime"),
		RECOVERY_ROOT: path.join(sandbox, "recovery"),
		DOWNLOADS: downloads,
		PROBE_MARKER: path.join(sandbox, "workspace-probe-called")
	}
});

try {
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.equal(fs.existsSync(path.join(sandbox, "workspace-probe-called")), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-workspace-optional",
		activationIgnoredWorkspaceFailure: true,
		rollbackIgnoredWorkspaceFailure: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function script() {
	return `set -Eeuo pipefail
mkdir -p "$ROOT"
printf '%s\n' "$$" > "$ROOT/agent.pid"
runtime_pid_matches(){ return 0; }
runtime_registered(){ return 0; }
service_supervision_ready(){ return 0; }
project_root_ready(){ touch "$PROBE_MARKER"; return 1; }
source "$DOWNLOADS/unix-install-readiness.sh"
final_readiness_sample "$$"
wait_for_runtime(){ return 0; }
wait_for_service_supervision(){ return 0; }
source "$DOWNLOADS/unix-activation-rollback.sh"
restored_runtime_ready 1`;
}
