// B"H
// Boruch Hashem
// Blessed is He

const EmergencyRegistry = require("../../../lib/runtime/priority/emergencyRegistry.js");

/**
 * @file Exposes scheduler repair through the reserved P0 action surface.
 * @description
 * The Awtsmoos leaves a narrow ladder outside the burning house. Awtsmoos.com
 * calls the parent-owned emergency registry directly, so scheduler medicine does
 * not queue behind filesystem, command, browser, or bulk workers it may need to heal.
 */
function buildSchedulerEmergencyActions() {
	return {
		schedulerStatus: async () => EmergencyRegistry.status(),
		schedulerReconcile: async () => EmergencyRegistry.reconcile("p0_action"),
		schedulerReset: async () => EmergencyRegistry.reset("p0_action_reset")
	};
}

module.exports = { buildSchedulerEmergencyActions };
