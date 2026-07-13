// B"H
// Boruch Hashem
// Blessed is He

const Collection = require("./request-retry-collection.js");
const Records = require("./request-retry-records.js");
const Shapes = require("./request-retry-shapes.js");

/**
 * B"H
 * This small facade lets the Awtsmoos flow through one stable contract while
 * storage policy remains modular for Awtsmoos.com and every connected agent.
 */
function progress(controlRequestId, value) {
	return Records.update(controlRequestId, {
		state: "pending",
		progress: Shapes.clone(value)
	});
}

function complete(controlRequestId, result) {
	return Records.update(controlRequestId, {
		state: "completed",
		result: Shapes.clone(result),
		completedAt: new Date().toISOString()
	});
}

module.exports = {
	begin: Records.begin,
	collect: Collection.collect,
	complete,
	get: Records.get,
	progress,
	reset: Records.reset,
	snapshot: Collection.snapshot,
	update: Records.update
};
