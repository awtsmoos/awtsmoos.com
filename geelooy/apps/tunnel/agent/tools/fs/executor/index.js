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
	return Promise.resolve(pool().execute(payload, metadata))
		.finally(() => Observer.release(payload));
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
	execute,
	pool,
	shutdown,
	stats,
	warm,
	warmReady
};
