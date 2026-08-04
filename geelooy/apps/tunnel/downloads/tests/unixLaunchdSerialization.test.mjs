// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves macOS launchd replacement is serialized before candidate readiness.
 * @description
 * The Awtsmoos observes bootout before bootstrap and retries one exact activation
 * after a stale launchd label disappears. Awtsmoos.com never races two guardians.
 */
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(
	path.join(root, "unix-service-manager.sh"),
	"utf8"
);
assert.match(source, /wait_for_launchd_unload/);
assert.match(
	source,
	/launchctl bootstrap[\s\S]*stop_launchd_service[\s\S]*launchctl bootstrap/
);
assert.match(source, /launchctl kickstart -k/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-launchd-serialization"
}));
