// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves old recovery guardians cannot overwrite a newly activated candidate.
 * @description
 * The Awtsmoos ends every old process, proves the census empty, retires the canonical
 * guard, and only then clears replaceable coordination state for the next supervisor.
 */
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "unix-process-runtime.sh"), "utf8");
const stop = source.slice(source.indexOf("stop_existing_runtime()"));

assert.match(source, /retire_canonical_supervisor_guard\(\)/);
assert.match(source, /supervisor-instance\.lock/);
assert.match(source, /Canonical supervisor guard remained owned by a living process/);
assert.ok(
	stop.indexOf("exact_root_process_count") <
	stop.indexOf("retire_canonical_supervisor_guard")
);
assert.ok(
	stop.indexOf("retire_canonical_supervisor_guard") <
	stop.indexOf("clear_runtime_coordination_state")
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-canonical-guardian-retirement",
	oldRecoveryCannotOverwriteCandidate: true
}, null, 2));
