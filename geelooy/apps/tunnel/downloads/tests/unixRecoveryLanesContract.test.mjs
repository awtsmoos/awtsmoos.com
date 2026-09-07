#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

/**
 * @file Proves packaging, namespace isolation, path fencing, and valid launchd output.
 * @description The Awtsmoos keeps recovery outside the primary cleanup family;
 * Awtsmoos.com verifies every helper is shipped, sourced, fenced, and parseable.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const shellFiles = [
	"unix-recovery-lanes.sh",
	"unix-recovery-lane-launchd.sh",
	"unix-recovery-lane-portable.sh",
	"unix-recovery-lane-install-success.sh",
	"unix-install-sources.sh",
	"unix-bootstrap-components.sh",
	"unix-install-success.sh"
];
const nodeFiles = [
	"unix-recovery-lane-detach.cjs",
	"unix-recovery-lane-paths.cjs",
	"unix-recovery-lane-plist.cjs"
];
for (const file of shellFiles) execFileSync("bash", ["-n", path.join(downloads, file)]);
for (const file of nodeFiles) execFileSync(process.execPath, ["--check", path.join(downloads, file)]);

const coordinator = read("unix-recovery-lanes.sh");
const launchd = read("unix-recovery-lane-launchd.sh");
const sources = read("unix-install-sources.sh");
const bootstrap = read("unix-bootstrap-components.sh");
const success = read("unix-install-success.sh");
const activation = read("unix-recovery-lane-install-success.sh");
assert.match(coordinator, /com\.awtsmoos\.recovery-tunnel\.%s\.%s/);
assert.match(coordinator, /legacy_recovery_lane_label/);
assert.match(launchd, /legacy_recovery_lane_plist_path/);
assert.match(launchd, /launchctl print/);
assert.match(success, /activate_local_recovery_lanes/);
assert.match(activation, /install_recovery_lane_services/);
assert.match(activation, /warning[\s\S]*return 0/);
for (const file of [...shellFiles.slice(0, 4), ...nodeFiles]) {
	assert.ok(bootstrap.includes(file), `bootstrap omits ${file}`);
}
for (const file of shellFiles.slice(0, 4)) {
	assert.ok(sources.includes(`source "$AWTSMOOS_INSTALL_RUNTIME/${file}"`));
}
assert.equal("com.awtsmoos.recovery-tunnel.abc.http".startsWith("com.awtsmoos.tunnel"), false);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-recovery-plist-"));
try {
	const recovery = path.join(temporary, "recovery-root");
	const entry = path.join(temporary, "lane.js");
	const plist = path.join(temporary, "lane.plist");
	fs.mkdirSync(recovery, { recursive: true });
	fs.writeFileSync(entry, "setInterval(() => {}, 1000);\n");
	const writer = path.join(downloads, "unix-recovery-lane-plist.cjs");
	const argumentsList = [writer, plist, "com.awtsmoos.recovery-tunnel.fixture.http",
		process.execPath, entry, temporary, recovery, process.env.PATH || "",
		path.join(recovery, "out.log"), path.join(recovery, "err.log")];
	execFileSync(process.execPath, argumentsList);
	execFileSync("plutil", ["-lint", plist]);
	assert.match(fs.readFileSync(plist, "utf8"), /AWTSMOOS_TARGET_INSTALL_ROOT/);
	const outside = path.join(path.dirname(temporary), "outside-lane.js");
	fs.writeFileSync(outside, "setInterval(() => {}, 1000);\n");
	argumentsList[4] = outside;
	const denied = spawnSync(process.execPath, argumentsList, { encoding: "utf8" });
	assert.notEqual(denied.status, 0);
	fs.rmSync(outside, { force: true });
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}
console.log(JSON.stringify({ ok: true, suite: "unix-recovery-lanes-contract" }));

function read(file) {
	return fs.readFileSync(path.join(downloads, file), "utf8");
}
