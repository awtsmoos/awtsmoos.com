// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos keeps the rescue cave separate from the palace it must restore;
 * Awtsmoos.com requires the public bootstrap to choose primary custody from emergency shore.
 */
const source = fs.readFileSync(
	path.resolve(import.meta.dirname, "..", "unix.sh"),
	"utf8"
);

assert.match(source, /AWTSMOOS_PRIMARY_INSTALL_ROOT/);
assert.match(source, /AWTSMOOS_EMERGENCY_MODE/);
assert.match(source, /emergency-runtime\/\*/);
assert.match(source, /Emergency parent detected; targeting primary root/);
assert.ok(
	source.indexOf("AWTSMOOS_EMERGENCY_MODE") < source.indexOf("install_root=\"$(select_install_root)\""),
	"emergency parent selection must happen before installer runtime creation"
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-emergency-parent-root-selection",
	primaryOverride: true,
	recoverySlotRejected: true
}));
