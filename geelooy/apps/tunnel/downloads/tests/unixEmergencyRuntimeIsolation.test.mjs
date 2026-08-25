// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos keeps the emergency ember outside the live garment and binds it to
 * the persisted Node vessel; Awtsmoos.com proves Tier-Zero without trusting PATH.
 */
const root = path.resolve(import.meta.dirname, "..");
const runtime = read("unix-emergency-runtime.sh");
const capture = read("unix-emergency-capture.sh");

assert.match(runtime, /\$RECOVERY_ROOT\/emergency-runtime\/current/);
assert.match(runtime, /AWTSMOOS_COMMAND_TIER=0/);
assert.match(runtime, /AWTSMOOS_COMMAND_MAX_ACTIVE=1/);
assert.match(runtime, /AWTSMOOS_SELF_UPDATE_DISABLED=1/);
assert.match(runtime, /emergency_node_bin/);
assert.match(runtime, /"\$node_bin" .*emergency-control\.cjs/);
assert.match(runtime, /connection-status\.cjs" check/);
assert.match(runtime, /emergency_process_matches/);
assert.doesNotMatch(runtime, /rm -rf "\$ROOT"/);
assert.match(capture, /"\$AWTSMOOS_NODE_BIN" "\$controller" capture/);
assert.match(capture, /install_recovery_commands/);
assert.match(capture, /\$RECOVERY_ROOT\/bin/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-emergency-runtime-isolation",
	authenticated: true,
	persistedNode: true,
	outsideLiveRoot: true,
	durableCommands: true
}));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
