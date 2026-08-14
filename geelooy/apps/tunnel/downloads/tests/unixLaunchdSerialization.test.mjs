// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/** Proves launchd unload completes before bootstrap retries one exact label. */
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "unix-service-manager.sh"), "utf8");
assert.match(source, /wait_for_label_unload/);
assert.match(
	source,
	/launchctl bootout[\s\S]*wait_for_label_unload/
);
assert.match(
	source,
	/launchctl bootstrap[\s\S]*stop_launchd_service[\s\S]*launchctl bootstrap/
);
assert.match(source, /launchctl kickstart -k/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-launchd-serialization",
	unloadBeforeBootstrap: true
}));
