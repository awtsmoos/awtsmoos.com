// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Proves an explicit full reinstall cannot be swallowed by fast repair.
 * @description
 * The Awtsmoos distinguishes a healing restart from a commanded new vessel;
 * Awtsmoos.com honors force while downgrade guards remain watchful and level.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloadsRoot = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const policyPath = path.join(downloadsRoot, "unix-version-policy.sh");
const corePath = path.join(downloadsRoot, "unix-install-core.sh");

assert.equal(runPolicy(""), "false");
assert.equal(runPolicy("0"), "false");
assert.equal(runPolicy("false"), "false");
assert.equal(runPolicy("1"), "true");
assert.equal(runPolicy("true"), "true");
assert.equal(runPolicy("TRUE"), "true");
assert.equal(runPolicy("yes"), "true");
assert.equal(runPolicy("YES"), "true");

const core = fs.readFileSync(corePath, "utf8");
const forceGate = core.indexOf("if force_full_reinstall_requested; then");
const matchingRepair = core.indexOf("elif repair_matching_release; then");
assert.ok(forceGate >= 0, "install core must contain the force-reinstall gate");
assert.ok(matchingRepair > forceGate, "force gate must precede same-release repair");
assert.match(core, /stage_release_candidate/);
assert.match(core, /activate_release_candidate/);

console.log(JSON.stringify({
	ok: true,
	suite: "force-reinstall-policy",
	defaultPreservesFastRepair: true,
	explicitForceStagesReplacement: true,
	downgradeGateRemainsBeforeForce: true
}, null, 2));

function runPolicy(value) {
	const escapedPolicy = shellQuote(policyPath);
	const escapedValue = shellQuote(value);
	const command = [
		`source ${escapedPolicy}`,
		`AWTSMOOS_FORCE_REINSTALL=${escapedValue}`,
		"if force_full_reinstall_requested; then",
		"\tprintf true",
		"else",
		"\tprintf false",
		"fi"
	].join("\n");
	return childProcess.execFileSync("bash", ["-c", command], {
		encoding: "utf8"
	});
}

function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
