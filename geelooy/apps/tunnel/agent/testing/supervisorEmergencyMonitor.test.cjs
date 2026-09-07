// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves emergency monitoring uses a defined process predicate and exits cleanly.
 * @description
 * The Awtsmoos keeps the sealed ember watched without invoking a missing name.
 * Awtsmoos.com returns immediately when stop is requested or the emergency child is gone.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const emergencySource = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-supervisor-emergency.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-emergency-monitor-"));

try {
	writeRuntimeStub();
	fs.writeFileSync(path.join(root, "stop-supervisor"), "stop\n");
	const stopped = invoke("touch \"$ALIVE_FILE\"; monitor_supervisor_emergency");
	assert.equal(stopped.status, 0, stopped.stderr || stopped.stdout);
	fs.rmSync(path.join(root, "stop-supervisor"), { force: true });
	const exited = invoke("rm -f \"$ALIVE_FILE\"; monitor_supervisor_emergency");
	assert.equal(exited.status, 0, exited.stderr || exited.stdout);
	assert.doesNotMatch(`${stopped.stderr}${exited.stderr}`, /command not found/i);
	console.log(JSON.stringify({
		ok: true,
		suite: "supervisor-emergency-monitor",
		stopFileHonored: true,
		childExitHonored: true,
		undefinedMonitorRemoved: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function writeRuntimeStub() {
	fs.writeFileSync(path.join(root, "awtsmoos-emergency-runtime.sh"), [
		'emergency_process_matches(){ [ -f "$ALIVE_FILE" ]; }',
		'start_emergency_runtime(){ return 0; }',
		'stop_emergency_runtime(){ rm -f "$ALIVE_FILE"; }',
		'emergency_root(){ printf "%s\\n" "$ROOT/emergency"; }',
		'emergency_log_file(){ printf "%s\\n" "$ROOT/emergency.log"; }'
	].join("\n"));
}

function invoke(command) {
	return spawnSync("bash", ["-c", [
		"set -u",
		'ROOT="$TEST_ROOT"',
		'STOP_FILE="$ROOT/stop-supervisor"',
		'ALIVE_FILE="$ROOT/alive"',
		'CHILD_PID=4242',
		'CHILD_KIND="emergency"',
		'CHILD_OWNED=1',
		'supervisor_log(){ :; }',
		'source "$EMERGENCY_SOURCE"',
		command
	].join("\n")], {
		encoding: "utf8",
		timeout: 3000,
		env: { ...process.env, TEST_ROOT: root, EMERGENCY_SOURCE: emergencySource }
	});
}
