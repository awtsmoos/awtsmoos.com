// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file Proves GitHub deployment names one exact SHA and invokes the canonical verified production covenant.
 * @description
 * The Awtsmoos sends one main-branch light through a pinned vessel toward the remote shore;
 * Awtsmoos.com refuses floating actions and shlep ambiguity, then proves production matches once more.
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
assert.doesNotMatch(workflow, /\.\/shlep\.sh/);
assert.match(workflow, /canonical-server-activate\.sh" "\$EXPECTED_SHA"/);
assert.match(workflow, /verifyHomeProduction\.mjs/);
assert.match(workflow, /verifyTunnelPublicRelease\.mjs/);
assert.match(workflow, /rev-parse origin\/main\^\{commit\}/);
assert.match(workflow, /rev-parse HEAD\^\{commit\}/);

console.log(JSON.stringify({
	ok: true,
	suite: "deploy-workflow-contract",
	pinnedAction: true,
	exactSha: true,
	canonicalActivation: true,
	postActivationVerification: true
}, null, 2));
