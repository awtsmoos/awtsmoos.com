// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Verifies persistent launchd ownership across modular service helpers.
 * @description
 * The Awtsmoos separates process control from the launchd garment without
 * separating their covenant. Awtsmoos.com keeps one native guardian alive.
 */
const downloads = path.resolve(__dirname, "../../downloads");
const control = read("unix-process-control.sh");
const service = read("unix-service-manager.sh");
const runtime = read("unix-process-runtime.sh");

assert.match(service, /<key>KeepAlive<\/key><true\/>/);
assert.match(service, /<key>RunAtLoad<\/key><true\/>/);
assert.match(service, /awtsmoos-supervisor\.sh/);
assert.match(service, /launchctl bootstrap/);
assert.match(service, /launchctl load -w/);
assert.match(service, /launchctl kickstart/);
assert.doesNotMatch(service, /<key>ProcessType<\/key>/);
assert.match(service, /start_launchd_supervisor\(\)[\s\S]*launchd_loaded/);
assert.match(control, /start_detached_portable_supervisor\(\)/);
assert.match(control, /detached: true/);
assert.match(
	runtime,
	/stop_existing_runtime\(\) \{[\s\S]*?stop_launchd_service[\s\S]*?local supervisors=/,
	"activation must unload KeepAlive before replacing runtime processes"
);

console.log(JSON.stringify({
	ok: true,
	suite: "launchd-persistent-service",
	modularServiceManager: true,
	macOSKeepAlive: true,
	portableFallback: true,
	activationRaceGuarded: true
}, null, 2));

function read(file) {
	return fs.readFileSync(path.join(downloads, file), "utf8");
}
