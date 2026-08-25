// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos leaves repair keys outside the house they may rebuild;
 * Awtsmoos.com verifies every local command and installer module is durably fulfilled.
 */
const root = path.resolve(import.meta.dirname, "..");
const capture = read("unix-emergency-capture.sh");
const components = read("unix-bootstrap-components.sh");
const sources = read("unix-install-sources.sh");
const commands = [
	"awtsmoos-emergency-auto",
	"awtsmoos-emergency-sealed",
	"awtsmoos-emergency-supervisor",
	"awtsmoos-emergency-known-good",
	"awtsmoos-emergency-diagnose",
	"awtsmoos-emergency-repair"
];
const scripts = [
	"emergency-auto.sh",
	"emergency-sealed.sh",
	"emergency-supervisor.sh",
	"emergency-known-good.sh",
	"emergency-diagnose.sh",
	"emergency-repair.sh"
];

for (const command of commands) {
	assert.match(capture, new RegExp(command));
}
for (const script of scripts) {
	assert.match(components, new RegExp(script.replace(".", "\\.")));
}
assert.match(capture, /\$RECOVERY_ROOT\/bin/);
assert.match(sources, /unix-late-readiness\.sh/);
assert.match(sources, /unix-emergency-continuity\.sh/);
assert.match(sources, /unix-fast-repair-health\.sh/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-emergency-recovery-bin",
	durableCommands: commands.length,
	packagedScripts: scripts.length
}));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
