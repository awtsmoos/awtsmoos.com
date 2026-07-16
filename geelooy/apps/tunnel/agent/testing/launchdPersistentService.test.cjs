// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const downloads = path.resolve(__dirname, "../../downloads");
const control = fs.readFileSync(path.join(downloads, "unix-process-control.sh"), "utf8");
const runtime = fs.readFileSync(path.join(downloads, "unix-process-runtime.sh"), "utf8");

assert.match(control, /<key>KeepAlive<\/key><true\/>/);
assert.match(control, /<key>RunAtLoad<\/key><true\/>/);
assert.match(control, /awtsmoos-supervisor\.sh/);
assert.match(control, /launchctl bootstrap/);
assert.match(control, /launchctl load -w/);
assert.match(control, /launchctl kickstart/);
assert.doesNotMatch(control, /<key>ProcessType<\/key>/);
assert.match(control, /if start_launchd_supervisor; then[\s\S]*return 0/);
assert.match(control, /nohup "\$ROOT\/awtsmoos-supervisor\.sh"/);
assert.match(
	runtime,
	/stop_existing_runtime\(\) \{[\s\S]*?stop_launchd_service[\s\S]*?local supervisors=/,
	"activation must unload KeepAlive before stopping or replacing runtime processes"
);

console.log(JSON.stringify({
	ok: true,
	suite: "launchd-persistent-service",
	macOSKeepAlive: true,
	portableFallback: true,
	activationRaceGuarded: true
}, null, 2));
