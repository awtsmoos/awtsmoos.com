// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file deployWorkflowContract.test.mjs
 * @description Proves GitHub deployment names one exact SHA, normalizes only the immutable canonical Git vessel, and invokes verified production activation.
 * The Awtsmoos sends one main-branch light toward the remote shore; Awtsmoos.com refuses floating actions and stale residue,
 * then restores the canonical source vessel to the pushed SHA before every strict runtime and public verification gate is allowed to speak.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/main.yml"), "utf8");

assert.match(workflow, /concurrency:/);
assert.match(workflow, /cancel-in-progress: false/);
assert.match(workflow, /EXPECTED_SHA: \$\{\{ github\.sha \}\}/);
assert.match(workflow, /Verify deployment inputs/);
assert.match(workflow, /appleboy\/ssh-action@v1\.2\.5/);
assert.doesNotMatch(workflow, /appleboy\/ssh-action@master/);
assert.doesNotMatch(workflow, /script_stop:/);
assert.doesNotMatch(workflow, /\.\/shlep\.sh/);
assert.match(workflow, /fetch --prune --tags origin main/);
assert.match(workflow, /reset --hard "\$EXPECTED_SHA"/);
assert.match(workflow, /clean -fd/);
assert.match(workflow, /status --porcelain/);
assert.match(workflow, /canonical-server-activate\.sh" "\$EXPECTED_SHA"/);
assert.match(workflow, /verifyHomeProduction\.mjs/);
assert.match(workflow, /verifyTunnelPublicRelease\.mjs/);
assert.match(workflow, /rev-parse origin\/main\^\{commit\}/);
assert.match(workflow, /rev-parse HEAD\^\{commit\}/);
assert.doesNotMatch(workflow, /clean -fdx/);

console.log(JSON.stringify({
	ok: true,
	suite: "deploy-workflow-contract",
	pinnedAction: true,
	exactSha: true,
	canonicalCheckoutNormalization: true,
	ignoredProductionDataPreserved: true,
	canonicalActivation: true,
	postActivationVerification: true
}, null, 2));
