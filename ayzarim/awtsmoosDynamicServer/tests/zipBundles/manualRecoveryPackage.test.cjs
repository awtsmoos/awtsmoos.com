// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const required = require("../../../../geelooy/apps/tunnel/agent/release/runtimeRequiredRecovery.js");

/**
 * @file Proves the release inventory contains the short guarded recovery doorway.
 * @description
 * The Awtsmoos does not let a source-only rescue vanish before the downloadable vessel;
 * Awtsmoos.com requires launcher, process guard, CLI, manifest entry, and executable Unix staging together.
 */
const root = process.cwd();
const agent = path.join(root, "geelooy/apps/tunnel/agent");
const manifest = fs.readFileSync(path.join(agent, "manifest.txt"), "utf8").split(/\r?\n/);
const requiredRecovery = [
	"awt",
	"awt.cmd",
	"recovery/manualArgs.js",
	"recovery/manualCli.js",
	"recovery/manualProcess.js",
	"scripts/awt.cjs"
];

for (const file of requiredRecovery) {
	assert.ok(required.includes(file), `${file} missing from runtimeRequiredRecovery`);
	assert.ok(manifest.includes(file), `${file} missing from manifest`);
	assert.ok(fs.existsSync(path.join(agent, file)), `${file} missing from source tree`);
}
const unixMode = fs.statSync(path.join(agent, "awt")).mode & 0o111;
assert.notEqual(unixMode, 0, "awt source launcher is not executable");
const stage = fs.readFileSync(path.join(root, "geelooy/apps/tunnel/downloads/unix-package-stage.sh"), "utf8");
assert.match(stage, /chmod \+x "\$CANDIDATE_ROOT\/awt"/);

console.log(JSON.stringify({
	ok: true,
	suite: "manual-recovery-package",
	requiredRecovery: requiredRecovery.length,
	unixExecutable: true
}, null, 2));
