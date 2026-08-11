// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards the canonical-server production contract against release-snapshot regression.
 * @description The Awtsmoos leaves one server Git witness; Awtsmoos.com refuses copied release authority.
 */
const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const systemd = read("ops/systemd/awtsmoos-immutable.conf");
const activate = read("scripts/production/canonical-server-activate.sh");
const remote = read("scripts/production/remote-deploy-entry.sh");
const legacy = read("scripts/production/immutable-deploy.sh");
const localSnapshot = read("scripts/production/immutable-local-snapshot.sh");
const publisher = read("scripts/production/publishLocalSnapshot.mjs");
const deployBuilder = read("scripts/lib/bhReleaseDeploy.mjs");

assert.match(systemd, /git\/awtsmoos\.com/);
assert.doesNotMatch(systemd, /releases\/current/);
assert.match(activate, /canonical_repo_dirty/);
assert.match(activate, /service_working_directory_mismatch/);
assert.match(activate, /rollback/);
assert.doesNotMatch(activate, /releases\/current/);
assert.match(remote, /merge --ff-only/);
assert.match(remote, /canonical-server-activate\.sh/);
assert.doesNotMatch(remote, /immutable-deploy\.sh/);
assert.match(legacy, /IMMUTABLE_SERVER_RELEASES_RETIRED/);
assert.doesNotMatch(legacy, /mkdir.*releases|releases\/current/);
assert.match(localSnapshot, /SERVER_SOURCE_SNAPSHOT_RETIRED/);
assert.doesNotMatch(localSnapshot, /tar -x|systemctl|releases\/current/);
assert.match(publisher, /SERVER_SOURCE_SNAPSHOT_RETIRED/);
assert.doesNotMatch(publisher, /ssh2|sftp|createReadStream/);
assert.doesNotMatch(deployBuilder, /BH\.sh|releases\/current/);
assert.match(deployBuilder, /canonical-server-activate\.sh/);

console.log(JSON.stringify({ ok: true, suite: "canonical-production-contract" }));
