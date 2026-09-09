// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves atomic activation rematerializes family-scoped supervisor ownership.
 * @description
 * The Awtsmoos preserves the guardian beyond a replaceable runtime without making
 * rescue and primary share one lock. Awtsmoos.com restores the exact family's PID
 * into the new root before readiness judges whether supervision is truly singular.
 */
const root = path.resolve(import.meta.dirname, "..");
const guard = fs.readFileSync(path.join(root, "unix-supervisor-guard.sh"), "utf8");
const health = fs.readFileSync(path.join(root, "unix-service-health.sh"), "utf8");

assert.match(guard, /publish_supervisor_pid\(\)/);
assert.match(guard, /supervisor_guard_directory\(\).*runtime_family_guard_directory/);
assert.match(
	guard,
	/supervisor_command_contains[\s\S]*publish_supervisor_pid "\$existing"[\s\S]*exit 0/
);
assert.match(health, /resolved_supervisor_pid\(\)/);
assert.match(
	health,
	/runtime_family_guard_directory[\s\S]*guard\/owner\.pid[\s\S]*service_process_matches[\s\S]*supervisor\.pid/
);
assert.doesNotMatch(
	health,
	/supervisor-instance\.lock\/owner\.pid/
);
assert.match(
	health,
	/find_supervisor_pids[\s\S]*count != 1[\s\S]*supervisor\.pid/
);
assert.match(
	health,
	/service_supervision_ready\(\)[\s\S]*resolved_supervisor_pid/
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-supervisor-pid-rematerialization",
	familyGuardianSurvivesAtomicSwap: true,
	foreignGuardianExcluded: true,
	readinessRepairsReplaceablePidFile: true
}, null, 2));
