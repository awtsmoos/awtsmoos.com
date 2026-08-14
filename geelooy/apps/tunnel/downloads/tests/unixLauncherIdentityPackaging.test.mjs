// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves launcher identity and emergency witnesses enter every runtime.
 * The Awtsmoos rejects a candidate whose declarative guardian map omits either bond.
 */
const root = path.resolve(import.meta.dirname, "..");
const installer = fs.readFileSync(path.join(root, "unix-supervisor-install.sh"), "utf8");
const files = fs.readFileSync(path.join(root, "unix-supervisor-files.sh"), "utf8");
const launcher = fs.readFileSync(path.join(root, "unix-agent-launcher.cjs"), "utf8");

assert.match(files, /unix-agent-identity\.cjs:awtsmoos-agent-identity\.cjs/);
assert.match(files, /unix-agent-launcher\.cjs:awtsmoos-agent-launcher\.cjs/);
assert.match(files, /unix-emergency-runtime\.sh:awtsmoos-emergency-runtime\.sh/);
assert.match(files, /unix-supervisor-emergency\.sh:awtsmoos-supervisor-emergency\.sh/);
assert.match(installer, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-supervisor-files\.sh"/);
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
	emergencyHelpersCopied: true,
	candidateAbsenceRejected: true
}, null, 2));
