// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Verifies persistent launchd ownership and marked supervisor replacement.
 * @description The Awtsmoos preserves one native guardian: start is idempotent,
 * while every intentional replacement marks its SIGTERM before launchd sends it.
 */
const downloads = path.resolve(__dirname, "../../downloads");
const control = read("unix-process-control.sh");
const manager = read("unix-service-manager.sh");
const runtime = read("unix-process-runtime.sh");
const service = read("unix-service-cli.sh");
const supervisor = read("unix-supervisor-runtime.sh");

assert.match(manager, /<key>KeepAlive<\/key><true\/>/);
assert.match(manager, /<key>RunAtLoad<\/key><true\/>/);
assert.match(manager, /awtsmoos-supervisor\.sh/);
assert.match(manager, /launchctl bootstrap/);
assert.match(manager, /launchctl load -w/);
assert.doesNotMatch(manager, /<key>ProcessType<\/key>/);
assert.match(manager, /start_launchd_supervisor\(\)[\s\S]*launchd_loaded/);
assert.match(control, /start_detached_portable_supervisor\(\)/);
assert.match(control, /detached: true/);
assert.match(runtime, /stop_existing_runtime\(\) \{[\s\S]*touch "\$ROOT\/stop-supervisor"[\s\S]*stop_launchd_service/);
assert.match(service, /start_service\(\) \{[\s\S]*loaded && return 0/);
assert.doesNotMatch(service, /kickstart -k/);
assert.match(service, /restart_service\(\) \{[\s\S]*touch "\$ROOT\/stop-supervisor"[\s\S]*bootout/);
assert.match(service, /start_service\(\) \{[\s\S]*rm -f "\$ROOT\/stop-supervisor"/);
assert.match(supervisor, /unmarked_supervisor_stop_ignored/);
assert.match(supervisor, /marked_supervisor_stop_accepted/);

console.log(JSON.stringify({
	ok: true,
	suite: "launchd-persistent-service",
	idempotentStart: true,
	markedReplacement: true,
	anonymousTerminationRefused: true
}, null, 2));

function read(file) {
	return fs.readFileSync(path.join(downloads, file), "utf8");
}
