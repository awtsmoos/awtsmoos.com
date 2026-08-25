// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createActionCatalog } = require("../../../../api/tunnel/control/docs/actionCatalogSource.cjs");
const { laneForAction } = require("../lib/runtime/priority/laneClassifier.js");

/**
 * @file Proves instruction retrieval is discoverable and protected from heavy-work queues.
 * @description
 * The Awtsmoos keeps law beside control rather than behind the workload it governs;
 * Awtsmoos.com requires every instruction action to appear in the manifest and P0 lane.
 */
const catalog = createActionCatalog();
for (const action of ["instructionCatalog", "instructionResolve", "instructionGet"]) {
	assert.ok(catalog.includes(action), `action catalog missing ${action}`);
	assert.equal(laneForAction(action), "p0_control", `${action} must remain P0 control`);
}

console.log(JSON.stringify({ ok: true, suite: "instruction-lane-and-catalog" }));
