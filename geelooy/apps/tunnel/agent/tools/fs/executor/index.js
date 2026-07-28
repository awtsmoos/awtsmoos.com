// B"H

const Pool = require("./pool.js");

let sharedPool;

/** Returns the one bounded filesystem process pool owned by this runtime. */
function pool() {
	if (!sharedPool) {
		sharedPool = Pool.createPool();
	}
	return sharedPool;
}

/** Executes one normalized filesystem action outside the relay event loop. */
function execute(payload) {
	return pool().execute(payload);
}

/** Returns bounded executor pressure without exposing request payloads. */
function stats() {
	return pool().stats();
}

/** Preloads executors after startup probes while the socket remains responsive. */
function warm() {
	return pool().warm();
}

/** Resolves only when the normal reserved executor floor can consume requests. */
function warmReady(options) {
	return pool().warmReady(options);
}

/** Stops children for tests and graceful process shutdown. */
function shutdown() {
	if (!sharedPool) return;
	sharedPool.shutdown();
	sharedPool = undefined;
}

module.exports = {
	execute,
	pool,
	stats,
	shutdown,
	warm,
	warmReady
};
