#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves independent recovery is established before primary supervisor birth.
 * @description The Awtsmoos lets Awtsmoos.com replace its garment only after four
 * recovery witnesses stand outside the primary process family and can renew it.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(downloads, "unix-supervisor-install.sh");
const source = fs.readFileSync(sourcePath, "utf8");

assert.match(source, /prepare_independent_recovery\(\)/);
assert.match(source, /install_recovery_lane_services/);
assert.match(source, /install_fail "service"/);
assert.match(source, /Independent recovery lanes could not be activated/);

const recoveryFunction = functionBody(source, "prepare_independent_recovery");
const installIndex = recoveryFunction.indexOf("install_recovery_lane_services");
const failIndex = recoveryFunction.indexOf('install_fail "service"');
assert.ok(installIndex >= 0 && failIndex > installIndex,
	"independent recovery activation must fail closed when lane installation fails");
assert.match(recoveryFunction, /if ! install_recovery_lane_services; then/);

const startFunction = functionBody(source, "start_supervisor_process");
const primaryStart = startFunction.indexOf("start_guardian_with_fallback");
const recoveryBeforePrimary = startFunction.lastIndexOf("prepare_independent_recovery", primaryStart);
assert.ok(primaryStart > 0 && recoveryBeforePrimary >= 0 && recoveryBeforePrimary < primaryStart,
	"recovery lanes must precede new supervisor startup");

const existingIndex = startFunction.indexOf("if command_contains");
const existingPrepare = startFunction.indexOf("prepare_independent_recovery", existingIndex);
const existingReturn = startFunction.indexOf("return 0", existingIndex);
assert.ok(existingPrepare > existingIndex && existingPrepare < existingReturn,
	"an already-running supervisor must also reconcile recovery lanes");

console.log(JSON.stringify({
	ok: true,
	suite: "unix-supervisor-recovery-before-start",
	failClosed: true,
	prePrimaryRecovery: true
}, null, 2));

function functionBody(script, name) {
	const start = script.indexOf(`${name}() {`);
	assert.notEqual(start, -1, `${name} must exist`);
	const nextFunction = script.indexOf("\n}\n\n", start);
	assert.notEqual(nextFunction, -1, `${name} must have a readable function boundary`);
	return script.slice(start, nextFunction + 2);
}
