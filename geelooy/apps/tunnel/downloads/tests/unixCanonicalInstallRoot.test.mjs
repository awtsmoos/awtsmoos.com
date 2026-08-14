// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * @file Proves inherited runtime garments cannot become installer authority.
 * @description
 * The Awtsmoos returns candidate, rollback, failed, incomplete, installer, and
 * displaced roots to one canonical home while preserving deliberate custom roots.
 */
const downloadsRoot = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(downloadsRoot, "unix.sh"), "utf8");
const prefix = source.slice(0, source.indexOf('runtime_root="'));
const home = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-root-authority-"));
const canonical = path.join(home, ".awtsmoos-tunnel");
const transientNames = [
	".awtsmoos-tunnel.candidate-1",
	".awtsmoos-tunnel.activation-rollback-1",
	".awtsmoos-tunnel.failed-1",
	".awtsmoos-tunnel.incomplete-1",
	".awtsmoos-tunnel.installer-runtime-1",
	".awtsmoos-tunnel.recovery-displaced-1"
];
for (const name of transientNames) {
	assert.equal(resolve(path.join(home, name)), canonical, name);
}
const custom = path.join(home, "custom-tunnel-home");
assert.equal(resolve(custom), custom);
assert.equal(resolve(undefined), canonical);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-canonical-install-root",
	transientRootsRejected: transientNames.length,
	customRootPreserved: true
}, null, 2));

function resolve(requested) {
	const script = `${prefix}\nprintf '%s' "$install_root"\n`;
	const environment = { ...process.env, HOME: home };
	if (requested === undefined) delete environment.AWTSMOOS_INSTALL_ROOT;
	else environment.AWTSMOOS_INSTALL_ROOT = requested;
	const result = spawnSync("bash", ["-c", script], {
		env: environment,
		encoding: "utf8"
	});
	assert.equal(result.status, 0, result.stderr);
	return result.stdout;
}
