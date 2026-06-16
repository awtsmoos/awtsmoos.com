// B"H
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { secretDescriptor } from "../lib/safeSshPasswordStore.mjs";

const descriptor = secretDescriptor();
assert(descriptor.backend, "credential backend should be reported");
assert.notStrictEqual(readFileSync("scripts/bh.mjs", "utf8").includes("ssh root@awtsmoos.com"), true);
assert(readFileSync("scripts/bh.mjs", "utf8").includes("execAwtsmoosSsh"));
assert(readFileSync("scripts/lib/awtsmoosSshClient.mjs", "utf8").includes("ayzarim/ssh/Keter-Client.js"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.strictEqual(pkg.scripts.bh, "node scripts/ship.mjs && node scripts/bh.mjs");
assert.strictEqual(pkg.scripts["bh:ssh:set-password"], "node scripts/bh.mjs --set-password");
console.log(JSON.stringify({ ok: true, suite: "bh-ssh-safe-mode", backend: descriptor.backend }, null, 2));
