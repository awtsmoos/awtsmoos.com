// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves installer health modules retain their shared process helper covenant.
 * @description
 * The Awtsmoos lets process census grow without severing older readiness callers.
 * Awtsmoos.com keeps command_contains visible wherever supervisor and socket health
 * inspect one living PID, so activation cannot fail from an undefined shell word.
 */
const root = path.resolve(import.meta.dirname, "..");
const census = fs.readFileSync(path.join(root, "unix-process-census.sh"), "utf8");
const connection = fs.readFileSync(path.join(root, "unix-connection-health.sh"), "utf8");
const supervisor = fs.readFileSync(path.join(root, "unix-supervisor-install.sh"), "utf8");

assert.match(census, /command_contains\(\)/);
assert.match(census, /is_alive "\$1"[\s\S]*process_command "\$1"[\s\S]*grep -Fq "\$2"/);
assert.match(connection, /command_contains/);
assert.match(supervisor, /command_contains/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-process-compatibility-helpers",
	commandContainsRestored: true
}, null, 2));
