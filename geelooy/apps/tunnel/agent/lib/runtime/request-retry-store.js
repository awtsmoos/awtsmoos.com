// B"H
// Boruch Hashem
// Blessed is He

const Collection = require("./request-retry-collection.js");
const Disk = require("./request-retry-disk.js");
const Mutation = require("./request-retry-mutation.js");
const Records = require("./request-retry-records.js");
const Shapes = require("./request-retry-shapes.js");

/**
 * B"H
 *
 * Progress stays light in memory; observations and mutations are sealed before
 * response. After a generation change, observations may replay once while file
 * mutations are reconciled by effect hash and never repeated.
 */
function begin(identity, payload) {
	return Records.begin(identity, payload);
}

function progress(controlRequestId, value) {
	return Records.update(controlRequestId, {
		state: "pending",
		progress: Shapes.clone(value)
	}, {
		persist: false
	});
}

function complete(controlRequestId, result) {
	const current = Records.get(controlRequestId);
	if (!current) return null;
	const timestamp = new Date().toISOString();
	const durableReceipt = current.durable?.enabled
		? {
			controlRequestId: current.controlRequestId,
			requestedAction: current.requestedAction,
			ref: Disk.receiptRef(current.controlRequestId),
			state: "completed",
			persistedAt: timestamp,
			mutation: Mutation.summary(current.mutation)
		}
		: null;
	const durableResult = durableReceipt
		? {
			...Shapes.clone(result),
			durableRequestReceipt: durableReceipt
		}
		: Shapes.clone(result);
	return Records.update(controlRequestId, {
		state: "completed",
		result: durableResult,
		completedAt: timestamp,
		durable: current.durable?.enabled
			? {
				...current.durable,
				persistedAt: timestamp,
				state: "completed"
			}
			: null
	});
}

function reset(options = {}) {
	Records.reset(options);
	Collection.resetCollectionClock();
}

module.exports = {
	begin,
	collect: Collection.collect,
	complete,
	get: Records.get,
	progress,
	reset,
	snapshot: Collection.snapshot,
	update: Records.update
};
