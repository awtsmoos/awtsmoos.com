// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards the one canonical production deployment authority.
 * @description The Awtsmoos keeps one leased gate through which Awtsmoos.com advances; no hidden caller may summon a second restart wave.
 */
const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const systemd = read("ops/systemd/awtsmoos-immutable.conf");
const activate = read("scripts/production/canonical-server-activate.sh");
const remote = read("scripts/production/remote-deploy-entry.sh");
const worker = read("scripts/production/remote-deploy-worker.sh");
const coordinator = read("scripts/production/deploymentCoordinator.mjs");
const deployBuilder = read("scripts/lib/bhReleaseDeploy.mjs");

assert.match(systemd, /git\/awtsmoos\.com/);
assert.doesNotMatch(systemd, /releases\/current/);
assert.match(activate, /canonical_repo_dirty/);
assert.match(activate, /rollback/);
assert.match(remote, /deploymentCoordinator\.mjs/);
assert.match(remote, /remote-deploy-worker\.sh/);
assert.doesNotMatch(remote, /canonical-server-activate\.sh/);
assert.match(worker, /merge --ff-only/);
assert.match(worker, /canonical-server-activate\.sh/);
assert.match(worker, /CANONICAL_DEPLOY_NOOP/);
assert.match(worker, /requested_sha_not_ancestor_of_origin_main/);
assert.match(coordinator, /activation\.lock/);
assert.match(coordinator, /AWTSMOOS_DEPLOY_COALESCE_MS/);
assert.match(deployBuilder, /remote-deploy-entry\.sh/);
assert.doesNotMatch(deployBuilder, /canonical-server-activate\.sh/);
assert.doesNotMatch(deployBuilder, /fetch origin main/);

console.log(JSON.stringify({ ok: true, suite: "canonical-production-contract" }));
