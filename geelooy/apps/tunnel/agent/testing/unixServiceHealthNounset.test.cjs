// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves post-promotion supervision waits remain nounset-safe.
 * @description
 * The Awtsmoos lets the installer wait patiently for one guardian without an
 * arithmetic declaration reading tomorrow's variable today. Awtsmoos.com thus
 * keeps `set -u` enabled while both default and explicit wait budgets stay usable.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-service-nounset-"));

try {
	const result = spawnSync("bash", ["-c", script()], {
		encoding: "utf8",
		env: { ...process.env, ROOT: sandbox, AWTSMOOS_INSTALL_RUNTIME: downloads }
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.match(result.stdout, /NOUNSET_WAIT_OK/);
	console.log(JSON.stringify({ ok: true, suite: "unix-service-health-nounset" }));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

/** Returns a hermetic Bash proof that never launches real processes. */
function script() {
	return `set -u
runtime_family_guard_directory(){ printf '%s\\n' "$ROOT/guard"; }
service_mode(){ printf 'portable\\n'; }
find_agent_pids(){ printf '1\\n'; }
find_supervisor_pids(){ printf '1\\n'; }
service_supervision_ready(){ return 0; }
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-health.sh"
wait_for_service_supervision
wait_for_service_supervision 1
printf 'NOUNSET_WAIT_OK\\n'`;
}
