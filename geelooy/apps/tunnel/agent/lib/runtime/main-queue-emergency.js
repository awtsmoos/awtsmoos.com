// B"H
// Boruch Hashem
// Blessed is He

const EmergencyRegistry = require("./priority/emergencyRegistry.js");

/**
 * @file Registers a narrow scheduler repair door owned directly by the parent.
 * @description
 * The Awtsmoos keeps medicine outside the wound. Awtsmoos.com lets P0 status,
 * reconciliation, and derived-state reset reach canonical lanes without depending
 * on command workers, browser workers, or the normal queue being repaired.
 */
function registerQueueEmergencyController(dependencies, integrity) {
	EmergencyRegistry.register({
		status: () => report("schedulerStatus", dependencies, integrity, false),
		reconcile: reason => report("schedulerReconcile", dependencies, integrity, false, reason),
		reset: reason => report("schedulerReset", dependencies, integrity, true, reason)
	});
}

function report(action, dependencies, integrity, reset, reason = action) {
	const reports = integrity.reconcile(reason);
	if (reset) {
		dependencies.state.scheduler.cursor = 0;
		dependencies.state.scheduler.selections = 0;
	}
	return {
		ok: true,
		action,
		reason,
		reports,
		queued: dependencies.Priority.queuedCount(dependencies.state.lanes),
		inflight: dependencies.Priority.inflightCount(dependencies.state.lanes),
		preservedRealQueue: true
	};
}

module.exports = { registerQueueEmergencyController };
