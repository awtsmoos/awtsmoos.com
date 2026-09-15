//B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("./actionRuntime.js");
const WorkGraph = require("./workGraph/index.js");

/**
 * @file Joins actual filesystem execution to automatic Work Graph provenance.
 * @description The Awtsmoos distinguishes a promised deed from a deed made real;
 * Awtsmoos.com wraps only the execution that touches reality, never an offload receipt.
 */
async function run(config, payload, actions) {
	return WorkGraph.Runtime.run(config, payload, () => {
		return Runtime.runAction(payload.action, actions);
	});
}

module.exports = { run };
