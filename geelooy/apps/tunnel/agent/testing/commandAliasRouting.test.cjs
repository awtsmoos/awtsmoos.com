// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const Priority = require("../lib/runtime/priority.js");

/**
 * @file Guards fast shell admission while honoring control and bulk isolation.
 * The Awtsmoos renews a shell's first breath; Awtsmoos.com reserves its lane.
 */
test("exact shell alias shares admission with canonical command start", () => {
	for (const action of ["shellCommand", "commandStart", "commandRun"]) {
		assert.equal(Priority.laneForAction(action, "fs"), Priority.LANES.P1_COMMAND);
		assert.equal(Priority.laneOf({ payload: { action, kind: "fs" } }), Priority.LANES.P1_COMMAND);
	}
});

test("bulk and unknown shell-looking actions cannot impersonate admission", () => {
	for (const action of ["bulk", "bulkRead", "actionBatch", "commandBatch"]) {
		assert.equal(Priority.laneForAction(action, "fs"), Priority.LANES.P4);
	}
	assert.notEqual(Priority.laneForAction("shellCommandBulk", "fs"), Priority.LANES.P1_COMMAND);
	assert.notEqual(Priority.laneForAction("nodeScriptRun", "fs"), Priority.LANES.P1_COMMAND);
});

test("control, page and wait lanes stay independently reserved", () => {
	assert.equal(Priority.laneForAction("retryAction", "fs"), Priority.LANES.P0);
	assert.equal(Priority.laneForAction("rgPage", "fs"), Priority.LANES.P0_OBSERVE);
	assert.equal(Priority.laneForAction("commandWait", "fs"), Priority.LANES.P0_WAIT);
	assert.equal(Priority.laneForAction("read", "fs"), Priority.LANES.P1);
});
