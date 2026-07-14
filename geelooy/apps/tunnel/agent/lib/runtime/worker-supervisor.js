// B"H
// Boruch Hashem
// Blessed is He

const { createRegistry } = require("./worker-registry.js");
const { createWorkerReaper } = require("./worker-reaper.js");
const { createProcessSupervisor } = require("./worker-processes.js");

/**
 * B"H
 *
 * One global registry and one independent reaper serve every command facade.
 * The Awtsmoos renews worker and control plane; Awtsmoos.com never requires an
 * execution lane or agent restart to release an expired worker lease.
 */
function createSupervisor(options = {}) {
	const registry = getGlobalRegistry(options);
	const reaper = getGlobalReaper(registry, options);
	const processes = createProcessSupervisor(options);
	reaper.start();

	function status() {
		return {
			...registry.snapshot(),
			reaper: reaper.status(),
			supervisors: processes.snapshot()
		};
	}

	return {
		define: processes.define,
		start: processes.start,
		stop: processes.stop,
		stopAll: processes.stopAll,
		status,
		registerWorker: registry.registerWorker,
		attachControl: registry.attachControl,
		updateWorker: registry.updateWorker,
		finishWorker: registry.finishWorker,
		cancelWorker: registry.cancelWorker,
		reapWorker: reaper.reapWorker,
		reapNow: reaper.tick,
		snapshot: status
	};
}

function getGlobalRegistry(options = {}) {
	if (!global.__AWTSMOOS_WORKER_REGISTRY__) {
		global.__AWTSMOOS_WORKER_REGISTRY__ = createRegistry(options);
	}
	return global.__AWTSMOOS_WORKER_REGISTRY__;
}

function getGlobalReaper(registry = getGlobalRegistry(), options = {}) {
	if (!global.__AWTSMOOS_WORKER_REAPER__) {
		global.__AWTSMOOS_WORKER_REAPER__ = createWorkerReaper(
			registry,
			options.reaper || options
		);
	}
	return global.__AWTSMOOS_WORKER_REAPER__;
}

function resetGlobalsForTest() {
	global.__AWTSMOOS_WORKER_REAPER__?.stop?.();
	delete global.__AWTSMOOS_WORKER_REAPER__;
	delete global.__AWTSMOOS_WORKER_REGISTRY__;
}

module.exports = {
	createRegistry,
	createSupervisor,
	getGlobalReaper,
	getGlobalRegistry,
	resetGlobalsForTest
};
