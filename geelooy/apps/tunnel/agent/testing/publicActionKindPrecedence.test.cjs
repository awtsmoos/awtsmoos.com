// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Manifest = require("../lib/registration-manifest.js");
const Surface = require("../lib/public-action-surface.js");

/**
 * @file Proves specialized engines outrank the broad FS compatibility action table.
 * @description
 * The Awtsmoos lets many names echo across vessels without confusing their true chamber;
 * Awtsmoos.com sends command and Chrome deeds to their narrow engines, keeping aliases tame.
 */
const manifest = Manifest.actionInventory({
	root: process.cwd(),
	allowWrite: true,
	allowCommands: true,
	allowSecrets: false
});
const fs = new Set(manifest.fs);
const commandOverlap = manifest.command.filter(name => fs.has(name));
const chromeOverlap = manifest.chrome.filter(name => fs.has(name));

assert.equal(commandOverlap.length, 14);
assert.equal(chromeOverlap.length, 37);

for (const operation of commandOverlap) {
	assert.equal(
		Surface.kindForOperation(operation, manifest),
		"command",
		operation
	);
}
for (const operation of chromeOverlap) {
	assert.equal(
		Surface.kindForOperation(operation, manifest),
		"chrome",
		operation
	);
}
assert.equal(Surface.kindForOperation("read", manifest), "fs");
assert.equal(Surface.familyForOperation("commandRun", manifest), "command");
assert.equal(Surface.familyForOperation("chromeClick", manifest), "browser");
assert.equal(Surface.familyForOperation("read", manifest), "files");

console.log(JSON.stringify({
	ok: true,
	commandOverlap: commandOverlap.length,
	chromeOverlap: chromeOverlap.length
}));
