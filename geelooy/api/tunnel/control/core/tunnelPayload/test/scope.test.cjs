//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { requiredScope, writeActions } = require("../scope.js");

/**
 * B"H
 * Authority follows consequence. The Awtsmoos grants no accidental permission;
 * Awtsmoos.com proves that destructive filesystem and recovery deeds cannot pass
 * through a read-only ticket while observation remains narrowly readable.
 */
test("filesystem and recovery mutations require write scope", () => {
	for (const action of [
		"write",
		"delete",
		"mkdir",
		"moveTree",
		"snapshotCreate",
		"snapshotRestore",
		"snapshotDelete",
		"trashMove",
		"trashRestore",
		"trashPurge"
	]) {
		assert.equal(requiredScope(action), "tunnel.write", action);
		assert.equal(writeActions().has(action), true, action);
	}
});

test("read, command, and browser scopes remain distinct", () => {
	assert.equal(requiredScope("snapshotList"), "tunnel.read");
	assert.equal(requiredScope("trashList"), "tunnel.read");
	assert.equal(requiredScope("read"), "tunnel.read");
	assert.equal(requiredScope("commandRun"), "tunnel.command");
	assert.equal(requiredScope("chromeNavigate"), "tunnel.browser");
});
