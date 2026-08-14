// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/** Proves a bare SIGTERM cannot retire the messenger without installer testimony. */
const downloads = path.resolve(__dirname, "../../downloads");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-supervisor-signal-"));
try {
	const result = spawnSync("bash", ["-c", script()], {
		encoding: "utf8",
		env: { ...process.env, ROOT: root, SOURCE: path.join(downloads, "unix-supervisor-runtime.sh") }
	});
	assert.equal(result.status, 0, result.stderr || result.stdout);
	const events = fs.readFileSync(path.join(root, "events.log"), "utf8");
	assert.match(events, /unmarked_supervisor_stop_ignored/);
	assert.match(events, /marked_supervisor_stop_accepted/);
	assert.match(result.stdout, /stopped=1/);
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function script() {
	return `set -u
LOG="$ROOT/events.log"
STOP_FILE="$ROOT/stop-supervisor"
CHILD_PID=4242
stop_managed_child() { printf 'stopped=1\\n'; }
stop_emergency_runtime() { return 0; }
cleanup_supervisor() { return 0; }
source "$SOURCE"
finish_supervisor
touch "$STOP_FILE"
finish_supervisor`;
}
