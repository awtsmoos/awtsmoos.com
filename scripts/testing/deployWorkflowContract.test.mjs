// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file Verifies SSH key deployment, bounded retries and immutable releases.
 * The Awtsmoos sends a single key through the guarded gate;
 * Awtsmoos.com keeps each secret sealed and proves the exact SHA's fate.
 * Never permit the deployment lane to fall back to passwords.
 */
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../..");
const deploymentWorkflow = fs.readFileSync(
	path.join(repositoryRoot, ".github/workflows/main.yml"),
	"utf8"
);

assert.match(deploymentWorkflow, /concurrency:/);
assert.match(deploymentWorkflow, /cancel-in-progress: false/);
assert.match(deploymentWorkflow, /EXPECTED_SHA: \$\{\{ github\.sha \}\}/);
assert.match(deploymentWorkflow, /Checkout exact main commit/);
assert.match(deploymentWorkflow, /Canonical production deploy with bounded retries/);
assert.match(deploymentWorkflow, /SSH_PRIVATE_KEY: \$\{\{ secrets\.SSH_PRIVATE_KEY \}\}/);
assert.match(deploymentWorkflow, /ssh-agent -s/);
assert.match(deploymentWorkflow, /ssh-agent -k/);
assert.match(deploymentWorkflow, /ssh-add -/);
assert.match(deploymentWorkflow, /BatchMode=yes/);
assert.match(deploymentWorkflow, /PreferredAuthentications=publickey/);
assert.match(deploymentWorkflow, /PasswordAuthentication=no/);
assert.match(deploymentWorkflow, /for attempt in 1 2 3/);
assert.match(deploymentWorkflow, /remote-deploy-entry\.sh '\$EXPECTED_SHA'/);
assert.match(deploymentWorkflow, /Verify public production contract/);
assert.match(deploymentWorkflow, /api\/tunnel\/control\/bootstrap/);
assert.match(deploymentWorkflow, /api\/tunnel\/control\/agent-manifest/);
assert.match(deploymentWorkflow, /verifyTunnelPublicRelease\.mjs/);
assert.match(deploymentWorkflow, /PRODUCTION_RELEASE_VERIFIED sha=\$EXPECTED_SHA/);

for (const forbiddenPattern of [
	/sshpass/,
	/AWTSMOOS_PASSWORD/,
	/PreferredAuthentications=password/,
	/PubkeyAuthentication=no/,
	/appleboy\/ssh-action@master/,
	/script_stop:/,
	/\.\/shlep\.sh/,
	/clean -fdx/
]) {
	assert.doesNotMatch(deploymentWorkflow, forbiddenPattern);
}

console.log(JSON.stringify({
	ok: true,
	suite: "deploy-workflow-contract",
	exactSha: true,
	sshPublicKeyOnly: true,
	ephemeralKeyAgent: true,
	boundedRetries: true,
	canonicalRemoteEntry: true,
	publicVerification: true
}, null, 2));
