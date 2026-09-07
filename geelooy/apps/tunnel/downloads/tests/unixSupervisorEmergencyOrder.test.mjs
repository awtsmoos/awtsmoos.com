// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves sealed emergency recovery precedes legacy fallback and uses a real monitor.
 * @description
 * The Awtsmoos keeps the verified ember before older garments. Awtsmoos.com watches
 * the exact emergency child directly, never invoking an undefined recovery symbol.
 */
const root = path.resolve(import.meta.dirname, "..");
const supervisor = read("unix-supervisor.sh");
const files = read("unix-supervisor-files.sh");
const emergencySource = read("unix-supervisor-emergency.sh");
const emergency = supervisor.indexOf("start_supervisor_emergency");
const legacy = supervisor.indexOf("start_legacy_bridge");

assert.ok(emergency > 0, "emergency invocation missing");
assert.ok(legacy > emergency, "legacy fallback must follow sealed emergency runtime");
assert.match(supervisor, /source "\$ROOT\/awtsmoos-supervisor-emergency\.sh"/);
assert.match(files, /unix-emergency-runtime\.sh:awtsmoos-emergency-runtime\.sh/);
assert.match(files, /unix-supervisor-emergency\.sh:awtsmoos-supervisor-emergency\.sh/);
assert.match(emergencySource, /emergency_process_matches "\$CHILD_PID"/);
assert.doesNotMatch(emergencySource, /monitor_emergency_runtime/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-supervisor-emergency-order",
	sealedBeforeLegacy: true,
	definedMonitor: true,
	packaged: true
}, null, 2));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
