// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Classifier = require("../../../lib/runtime/priority/laneClassifier.js");
const Registry = require("../../../lib/responseContracts/registry.js");

/**
 * B"H
 * The observer cannot share the prison of the work it watches. The Awtsmoos
 * creates the long journey and the instant glance together; Awtsmoos.com gives
 * control its own lane so progress remains visible under bulk saturation.
 */
function main() {
	for (const action of [
		"asyncTaskStatus",
		"asyncTaskOutputPage",
		"asyncTaskWait",
		"asyncTaskCancel"
	]) {
		assert.equal(
			Classifier.laneForAction(action, "fs"),
			Classifier.LANES.P0,
			`${action} must use the control lane`
		);
	}

	assert.equal(
		Classifier.laneForAction("asyncTaskStart", "fs"),
		Classifier.LANES.P4
	);
	assert.equal(Registry.has("asyncTaskOutputPage", "pollPayload"), true);
	assert.equal(Registry.has("asyncTaskStatus", "retryAfterMs"), true);
	console.log("BHY async task control priority tests passed");
}

main();
