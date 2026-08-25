// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos keeps a bridge while guardians change; Awtsmoos.com requires real
 * process birth, late-edge mercy, and Tier-Zero continuity before failure may return.
 */
const root = path.resolve(import.meta.dirname, "..");
const gate = read("unix-supervisor-start-gate.sh");
const late = read("unix-late-readiness.sh");
const fast = read("unix-fast-repair.sh");
const continuity = read("unix-emergency-continuity.sh");
const runtime = read("unix-supervisor-runtime.sh");
const emergency = read("unix-supervisor-emergency.sh");

assert.match(gate, /start_launchd_supervisor/);
assert.match(gate, /wait_for_supervisor_birth/);
assert.match(gate, /start_detached_portable_supervisor/);
assert.ok(gate.indexOf("stop_launchd_service") < gate.indexOf("start_detached_portable_supervisor"));
assert.match(late, /late_candidate_process_evidence/);
assert.match(late, /AWTSMOOS_LATE_START_GRACE_SECONDS:-20/);
assert.match(fast, /fast_repair_supervisor_start_failed/);
assert.match(fast, /fast_repair_readiness_failed/);
assert.match(fast, /candidate_late_readiness_grace/);
assert.match(fast, /ensure_emergency_continuity/);
assert.match(continuity, /state\/node-bin\.path/);
assert.match(continuity, /connection-status\.cjs" check/);
assert.match(runtime, /retire_emergency_after_primary_registration/);
assert.doesNotMatch(runtime, /start_new_agent\(\)[\s\S]*stop_emergency_runtime/);
assert.match(emergency, /supervisor_receipt_matches/);
assert.match(emergency, /stop_emergency_runtime/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-emergency-continuity-contract",
	guardianBirthProof: true,
	lateGrace: true,
	failureContinuity: true,
	registeredRetirement: true
}));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
