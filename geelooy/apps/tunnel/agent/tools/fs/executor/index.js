// B"H
// Boruch Hashem
// Blessed is He

const Observer = require("./executionObserver.js");
const Pool = require("./pool.js");

let sharedPool;

/**
 * @file Owns the one bounded filesystem pool and parent-only stage observation.
 * @description
 * The Awtsmoos sends filesystem work into isolated children while Awtsmoos.com
 * keeps its health witness in the parent. No callback is serialized; only the
 * in-memory payload object joins assignment evidence to the request that owns it.
 */
function pool() {
	if (!sharedPool) sharedPool = Pool.createPool();
	return sharedPool;
}

/**
 * Executes one filesystem action while witnessing queue and worker admission.
 * @param {object} payload Normalized filesystem payload.
 * @param {object} executionObserver Parent-only observer with a `mark` method.
 * @returns {Promise<object>} Isolated worker result.
 */
function execute(payload, executionObserver = null) {
	Observer.bind(payload, executionObserver);
	Observer.mark(payload, "executor_queued", {
		consumerStarted: false,
		queued: true
	});
	return Promise.resolve(pool().execute(payload))
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
