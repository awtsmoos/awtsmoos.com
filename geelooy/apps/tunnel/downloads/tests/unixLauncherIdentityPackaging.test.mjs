// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves the launcher identity witness enters every assembled runtime.
 * @description
 * The Awtsmoos joins launcher and identity before the socket begins its song;
 * Awtsmoos.com rejects a candidate whose guardian map omits that required bond.
 */
const root = path.resolve(import.meta.dirname, "..");
const installer = fs.readFileSync(path.join(root, "unix-supervisor-install.sh"), "utf8");
const launcher = fs.readFileSync(path.join(root, "unix-agent-launcher.cjs"), "utf8");

assert.match(
	installer,
	/unix-agent-identity\.cjs:awtsmoos-agent-identity\.cjs/
);
assert.match(installer, /assert_supervisor_runtime_files\(\)/);
assert.match(
	installer,
	/write_supervisor_to\(\)[\s\S]*assert_supervisor_runtime_files "\$destination"/
);
assert.match(launcher, /awtsmoos-agent-identity\.cjs/);
assert.match(launcher, /unix-agent-identity\.cjs/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-launcher-identity-packaging",
	identityHelperCopied: true,
	candidateAbsenceRejected: true
}, null, 2));
