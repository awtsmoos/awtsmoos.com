//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards the newer-local installer path that previously crashed on an unset version.
 * @description A sealed newer runtime must repair from local testimony, never older metadata.
 */
const downloads = path.resolve(__dirname, "../../downloads");
const core = fs.readFileSync(path.join(downloads, "unix-install-core.sh"), "utf8");
const policy = fs.readFileSync(path.join(downloads, "unix-version-policy.sh"), "utf8");

assert.match(policy, /INSTALLED_VERSION=""/);
assert.match(policy, /INSTALLED_VERSION="\$installed"/);
assert.match(policy, /export PUBLISHED_VERSION INSTALLED_VERSION/);
assert.match(core, /if version_policy_blocks_replacement; then\s+if repair_self_verified_installed_release; then/);
assert.doesNotMatch(core, /installed=\$INSTALLED_VERSION published=\$PUBLISHED_VERSION/);
assert.match(core, /installed=\$\{INSTALLED_VERSION:-unknown\}/);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-preserved-local-repair",
	unsetVersionCrashBlocked: true,
	newerLocalRepairSelected: true
}, null, 2));
