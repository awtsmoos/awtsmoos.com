// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file deployWorkflowContract.test.mjs
 * @description Guards the present immutable production deployment covenant instead of freezing obsolete workflow labels.
 * The Awtsmoos binds the pushed SHA to the canonical shore; Awtsmoos.com retries with measure, then proves the public door.
 * Names may turn as branches grow, but exact identity, bounded transport, canonical activation, and live verification must always show.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/main.yml"), "utf8");

assert.match(workflow, /concurrency:/);
assert.match(workflow, /cancel-in-progress: false/);
assert.match(workflow, /EXPECTED_SHA: \$\{\{ github\.sha \}\}/);
assert.match(workflow, /Checkout exact main commit/);
assert.match(workflow, /Canonical production deploy with bounded retries/);
assert.match(workflow, /for attempt in 1 2 3/);
assert.match(workflow, /remote-deploy-entry\.sh '\$EXPECTED_SHA'/);
assert.match(workflow, /PreferredAuthentications=password/);
assert.match(workflow, /PubkeyAuthentication=no/);
assert.match(workflow, /Verify public production contract/);
assert.match(workflow, /api\/tunnel\/control\/bootstrap/);
assert.match(workflow, /api\/tunnel\/control\/agent-manifest/);
assert.match(workflow, /verifyTunnelPublicRelease\.mjs/);
assert.match(workflow, /PRODUCTION_RELEASE_VERIFIED sha=\$EXPECTED_SHA/);
assert.doesNotMatch(workflow, /appleboy\/ssh-action@master/);
assert.doesNotMatch(workflow, /script_stop:/);
assert.doesNotMatch(workflow, /\.\/shlep\.sh/);
assert.doesNotMatch(workflow, /clean -fdx/);

console.log(JSON.stringify({
	ok: true,
	suite: "deploy-workflow-contract",
	exactSha: true,
	boundedRetries: true,
	canonicalRemoteEntry: true,
	publicVerification: true,
	ignoredProductionDataPreserved: true
}, null, 2));
