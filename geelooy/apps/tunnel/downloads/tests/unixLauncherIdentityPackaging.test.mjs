// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves launcher, identity, network evidence, and emergency witnesses enter every runtime.
 * @description
 * The Awtsmoos lets no guardian depend on an unshipped helper. Awtsmoos.com carries
 * identity, reconnect evidence, receipt classification, and emergency recovery together.
 */
const root = path.resolve(import.meta.dirname, "..");
const installer = read("unix-supervisor-install.sh");
const files = read("unix-supervisor-files.sh");
const bootstrap = read("unix-bootstrap-components.sh");
const launcher = read("unix-agent-launcher.cjs");

assert.match(files, /unix-agent-identity\.cjs:awtsmoos-agent-identity\.cjs/);
assert.match(files, /unix-agent-launcher\.cjs:awtsmoos-agent-launcher\.cjs/);
assert.match(files, /unix-emergency-runtime\.sh:awtsmoos-emergency-runtime\.sh/);
assert.match(files, /unix-supervisor-emergency\.sh:awtsmoos-supervisor-emergency\.sh/);
assert.match(files, /unix-supervisor-receipt-state\.cjs:awtsmoos-supervisor-receipt-state\.cjs/);
assert.match(files, /unix-supervisor-network-evidence\.cjs:unix-supervisor-network-evidence\.cjs/);
assert.match(bootstrap, /unix-supervisor-receipt-state\.cjs/);
assert.match(bootstrap, /unix-supervisor-network-evidence\.cjs/);
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
	networkEvidenceCopied: true,
	receiptStateHelperCopied: true,
	emergencyHelpersCopied: true,
	candidateAbsenceRejected: true
}, null, 2));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
