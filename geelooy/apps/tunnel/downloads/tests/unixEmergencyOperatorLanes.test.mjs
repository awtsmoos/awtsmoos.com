// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos opens several narrow doors rather than one fragile gate;
 * Awtsmoos.com keeps each operator lane PATH-safe, registered, and correctly late.
 */
const root = path.resolve(import.meta.dirname, "..");
const auto = read("emergency-auto.sh");
const sealed = read("emergency-sealed.sh");
const supervisor = read("emergency-supervisor.sh");
const known = read("emergency-known-good.sh");
const diagnose = read("emergency-diagnose.sh");
const repair = read("emergency-repair.sh");

for (const script of [auto, sealed, supervisor, known, diagnose]) {
	assert.match(script, /state\/node-bin\.path/);
}
assert.match(auto, /Receipt\.matches/);
assert.match(auto, /maxAgeMs: 30000/);
assert.match(sealed, /connection-status\.cjs" check/);
assert.match(supervisor, /AWTSMOOS_SERVICE_MODE=portable/);
assert.match(supervisor, /connection-status\.cjs" check/);
assert.ok(repair.indexOf("emergency-unix") < repair.indexOf("/api/tunnel/install/unix"));
assert.match(repair, /\| AWTSMOOS_RESTART=1 bash/);
assert.doesNotMatch(repair, /AWTSMOOS_RESTART=1 curl/);
assert.doesNotMatch(supervisor, /\bseq\b/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-emergency-operator-lanes",
	pathIndependent: true,
	ackRequired: true,
	portablePrimary: true,
	continuityFirstRepair: true
}));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
