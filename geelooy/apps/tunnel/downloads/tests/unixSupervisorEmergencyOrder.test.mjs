// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/** Sealed current fallback must precede obsolete legacy recovery. */
const root = path.resolve(import.meta.dirname, "..");
const supervisor = fs.readFileSync(path.join(root, "unix-supervisor.sh"), "utf8");
const files = fs.readFileSync(path.join(root, "unix-supervisor-files.sh"), "utf8");
const emergency = supervisor.indexOf("start_supervisor_emergency");
const legacy = supervisor.indexOf("start_legacy_bridge");
assert.ok(emergency > 0, "emergency invocation missing");
assert.ok(legacy > emergency, "legacy fallback must follow sealed emergency runtime");
assert.match(supervisor, /source "\$ROOT\/awtsmoos-supervisor-emergency\.sh"/);
assert.match(files, /unix-emergency-runtime\.sh:awtsmoos-emergency-runtime\.sh/);
assert.match(files, /unix-supervisor-emergency\.sh:awtsmoos-supervisor-emergency\.sh/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-supervisor-emergency-order",
	sealedBeforeLegacy: true,
	packaged: true
}));
