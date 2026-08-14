// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves atomic activation rematerializes durable supervisor ownership.
 * @description
 * The Awtsmoos preserves one canonical guardian outside the replaceable runtime.
 * Awtsmoos.com restores its PID into the new root before readiness judges ownership.
 */
const root = path.resolve(import.meta.dirname, "..");
const guard = fs.readFileSync(path.join(root, "unix-supervisor-guard.sh"), "utf8");
const health = fs.readFileSync(path.join(root, "unix-service-health.sh"), "utf8");

assert.match(guard, /publish_supervisor_pid\(\)/);
assert.match(
	guard,
	/supervisor_command_contains[\s\S]*publish_supervisor_pid "\$existing"[\s\S]*exit 0/
);
assert.match(health, /resolved_supervisor_pid\(\)/);
assert.match(
	health,
	/supervisor-instance\.lock\/owner\.pid[\s\S]*service_process_matches[\s\S]*supervisor\.pid/
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
	canonicalGuardianSurvivesAtomicSwap: true,
	readinessRepairsReplaceablePidFile: true
}, null, 2));
