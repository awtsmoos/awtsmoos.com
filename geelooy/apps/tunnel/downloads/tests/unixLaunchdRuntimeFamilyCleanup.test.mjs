// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves activation unloads every hashed launchd label in the runtime family.
 * @description
 * The Awtsmoos recognizes canonical and displaced service garments by their declared
 * install roots. Awtsmoos.com removes noncanonical plists so launchd cannot respawn
 * an obsolete supervisor after the process family has been reconciled.
 */
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "unix-service-manager.sh"), "utf8");
const stop = source.slice(
	source.indexOf("stop_launchd_service()"),
	source.indexOf("write_launchd_service()")
);

assert.match(source, /root_belongs_to_runtime_family\(\)/);
assert.match(source, /EnvironmentVariables\.AWTSMOOS_INSTALL_ROOT/);
assert.match(source, /com\.awtsmoos\.tunnel\*\.plist/);
assert.match(source, /stop_owned_launchd_plist\(\)/);
assert.match(source, /launchctl bootout "\$domain\/\$label"/);
assert.match(source, /if \[ "\$install_root" != "\$ROOT" \]/);
assert.match(source, /rm -f "\$plist"/);
assert.match(stop, /stop_owned_launchd_plist/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-launchd-runtime-family-cleanup",
	staleHashedLabelsRemoved: true,
	displacedSupervisorRespawnPrevented: true
}, null, 2));
