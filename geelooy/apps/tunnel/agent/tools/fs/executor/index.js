// B"H
// Boruch Hashem
// Blessed is He

const Observer = require("./executionObserver.js");
const Pool = require("./pool.js");

let sharedPool;

/**
 * @file Owns the shared filesystem pool and forwards parent-only lane testimony.
 * @description
 * The Awtsmoos keeps callbacks in the parent while Awtsmoos.com carries only
 * non-secret lane/request metadata into scheduling, so downstream fairness knows the true class.
 *
 * Item 34: the execute() promise carries jobId and a cancel(reason) handle so
 * the control layer can abandon queued or running work; cancelForRequest
 * abandons every job carrying one control request id (the observer metadata
 * should include requestId for that seam to find them).
 */
function pool() {
	if (!sharedPool) sharedPool = Pool.createPool();
	return sharedPool;
}

function execute(payload, executionObserver = null) {
	Observer.bind(payload, executionObserver);
	const metadata = Observer.metadata(payload);
	Observer.mark(payload, "executor_queued", {
		consumerStarted: false,
		lane: metadata.lane || "p1_fs_light",
		queued: true
	});
	const inner = pool().execute(payload, metadata);
	const chained = Promise.resolve(inner).finally(() => Observer.release(payload));
	// Preserve the item-34 cancellation seam across the finally() boundary.
	if (inner && typeof inner === "object") {
		chained.jobId = inner.jobId;
		chained.cancel = inner.cancel;
	}
	return chained;
}

function cancel(jobId, reason) {
	return pool().cancel(jobId, reason);
}

function cancelForRequest(requestId, reason) {
	return pool().cancelForRequest(requestId, reason);
}

function stats() {
	return pool().stats();
}

function warm() {
	return pool().warm();
}

function warmReady(options) {
	return pool().warmReady(options);
}

function shutdown() {
	if (!sharedPool) return;
	sharedPool.shutdown();
	sharedPool = undefined;
}

module.exports = {
	cancel,
	cancelForRequest,
	execute,
	pool,
	shutdown,
	stats,
	warm,
	warmReady
};
