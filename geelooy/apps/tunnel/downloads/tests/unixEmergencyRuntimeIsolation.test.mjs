// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/** Emergency runtime stays under recovery and outside live-root cleanup patterns. */
const root = path.resolve(import.meta.dirname, "..");
const runtime = fs.readFileSync(path.join(root, "unix-emergency-runtime.sh"), "utf8");
const capture = fs.readFileSync(path.join(root, "unix-emergency-capture.sh"), "utf8");
assert.match(runtime, /\$RECOVERY_ROOT\/emergency-runtime\/current/);
assert.match(runtime, /AWTSMOOS_COMMAND_TIER=0/);
assert.match(runtime, /AWTSMOOS_COMMAND_MAX_ACTIVE=1/);
assert.match(runtime, /AWTSMOOS_DISABLE_SELF_UPDATE=1/);
assert.match(runtime, /connection-status\.cjs" check/);
assert.match(runtime, /emergency_process_matches/);
assert.doesNotMatch(runtime, /rm -rf "\$ROOT"/);
assert.match(capture, /local controller="\$ROOT\/scripts\/emergency-control\.cjs"/);
assert.match(capture, /node "\$controller" capture "\$ROOT" "\$RECOVERY_ROOT"/);
assert.match(capture, /install_event "emergency-runtime" "warning"/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-emergency-runtime-isolation",
	authenticated: true,
	oneWorker: true,
	outsideLiveRoot: true
}));
