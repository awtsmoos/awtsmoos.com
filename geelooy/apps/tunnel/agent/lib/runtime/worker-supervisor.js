// B"H
const { createRegistry } = require('./worker-registry.js');
const { createProcessSupervisor } = require('./worker-processes.js');

/**
 * B"H — The supervisor is a doorway: one bounded action registry and one named
 * helper-process owner, both released through explicit public methods.
 */
function createSupervisor(options = {}) {
	const registry = getGlobalRegistry(options);
	const processes = createProcessSupervisor(options);

	function status() {
		return { ...registry.snapshot(), supervisors: processes.snapshot() };
	}

	return {
		define: processes.define,
		start: processes.start,
		stop: processes.stop,
		stopAll: processes.stopAll,
		status,
		registerWorker: registry.registerWorker,
		updateWorker: registry.updateWorker,
		finishWorker: registry.finishWorker,
		cancelWorker: registry.cancelWorker,
		snapshot: registry.snapshot
	};
}

function getGlobalRegistry(options = {}) {
	if (!global.__AWTSMOOS_WORKER_REGISTRY__) {
		global.__AWTSMOOS_WORKER_REGISTRY__ = createRegistry(options);
	}
	return global.__AWTSMOOS_WORKER_REGISTRY__;
}

module.exports = { createRegistry, createSupervisor, getGlobalRegistry };
