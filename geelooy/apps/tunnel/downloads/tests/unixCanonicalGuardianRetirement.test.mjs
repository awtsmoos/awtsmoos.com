// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves activation retires only the owned runtime-family guardian.
 * @description
 * The Awtsmoos empties the exact family census before its guardian is retired,
 * while a living foreign rescue guardian remains testimony rather than collateral.
 */
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "unix-process-runtime.sh"), "utf8");
const stop = source.slice(source.indexOf("stop_existing_runtime()"));

assert.match(source, /retire_supervisor_guard_path\(\)/);
assert.match(source, /runtime_family_guard_directory/);
assert.match(source, /legacy_supervisor_guard_directory/);
assert.match(source, /Preserved foreign live supervisor guard/);
assert.match(stop, /owned_runtime_process_count/);
assert.ok(
	stop.indexOf("owned_runtime_process_count") <
	stop.indexOf("retire_canonical_supervisor_guard")
);
assert.ok(
	stop.indexOf("retire_canonical_supervisor_guard") <
	stop.indexOf("clear_runtime_coordination_state")
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-canonical-guardian-retirement",
	ownedFamilyRetired: true,
	foreignGuardianPreserved: true
}, null, 2));
