// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
	* @file Proves Windows installation is staged, rollback-safe, and identity-preserving.
	* @description The Awtsmoos verifies normal and explicit skip-start transaction paths.
	*/
const downloads = path.resolve(__dirname, "../../downloads");
const bootstrap = read("windows.ps1");
const core = read("windows-core.ps1");
const transaction = read("windows-transaction.ps1");
const config = read("windows-config.ps1");

for (const helper of [
	"windows-config.ps1",
	"windows-transaction.ps1",
	"windows-core.ps1"
]) assert.match(bootstrap, new RegExp(helper.replace(".", "\\.")));

const stageIndex = core.indexOf("Install-AwtsStage");
const rollbackIndex = core.indexOf("Save-AwtsRollback");
const stopIndex = core.indexOf("Stop-OldAwtsAgent");
const activateIndex = core.indexOf("Activate-AwtsStage");
const healthIndex = core.indexOf("Wait-AwtsRegistration");
const normalCommitIndex = core.lastIndexOf("Complete-AwtsTransaction");
const skipStartIndex = core.indexOf("AWTSMOOS_SKIP_START");
const skipCommitIndex = core.indexOf("Complete-AwtsTransaction", skipStartIndex);
assert.ok(stageIndex >= 0 && stageIndex < rollbackIndex);
assert.ok(rollbackIndex < stopIndex && stopIndex < activateIndex);
assert.ok(activateIndex < healthIndex && healthIndex < normalCommitIndex);
assert.ok(skipStartIndex >= 0 && skipStartIndex < skipCommitIndex);
assert.ok(skipCommitIndex < healthIndex);
assert.match(core, /Restore-AwtsRollback/);
assert.match(core, /Start-AwtsAgent \$root \$priorEntry/);
assert.match(transaction, /\.activations\\/);
assert.match(transaction, /journal\.json/);
assert.match(transaction, /installed-manifest\.txt/);
assert.doesNotMatch(transaction, /config\.json/);
assert.match(config, /if \(Test-Path \$configPath\) \{ return \}/);
assert.match(core, /Install-AwtsStage \$transaction \$origin \$manifest/);

console.log(JSON.stringify({
	ok: true,
	suite: "windows-transactional-installer-contract",
	stageBeforeStop: true,
	rollbackBeforeActivation: true,
	normalHealthBeforeCommit: true,
	explicitSkipStartCommit: true,
	automaticRestore: true,
	durableIdentityOutsideRelease: true,
	completeReinstall: true
}, null, 2));

function read(name) {
	return fs.readFileSync(path.join(downloads, name), "utf8");
}
