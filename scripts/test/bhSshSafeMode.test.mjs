// B"H
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { secretDescriptor } from "../lib/safeSshPasswordStore.mjs";

const descriptor = secretDescriptor();
const releaseSource = readFileSync("scripts/bhRelease.mjs", "utf8");
const sshSource = readFileSync("scripts/bh.mjs", "utf8");
const packageData = JSON.parse(readFileSync("package.json", "utf8"));

assert(descriptor.backend, "credential backend should be reported");
assert(!sshSource.includes("ssh root@awtsmoos.com"));
assert(sshSource.includes("execAwtsmoosSsh"));
assert(releaseSource.includes('"scripts/verifyHomeSource.mjs"'));
assert(releaseSource.includes('["add", "."]'));
assert(releaseSource.includes('["commit", "-m", commitMessage]'));
assert(releaseSource.includes('["push", "--force", "origin", `HEAD:${branch}`]'));
assert(releaseSource.includes('"cd ~ && ./BH.sh"'));
assert(releaseSource.includes('"scripts/verifyHomeProduction.mjs"'));
assert.strictEqual(packageData.scripts.bh, "node scripts/bhRelease.mjs");
assert.strictEqual(packageData.scripts["ship:bh"], "node scripts/bhRelease.mjs");
assert.strictEqual(packageData.scripts["verify:home-source"], "node scripts/verifyHomeSource.mjs");
assert.strictEqual(packageData.scripts["verify:home-production"], "node scripts/verifyHomeProduction.mjs");

console.log(JSON.stringify({ ok: true, suite: "bh-ssh-safe-mode", backend: descriptor.backend }, null, 2));
