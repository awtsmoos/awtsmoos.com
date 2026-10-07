// B"H
// Boruch Hashem
// Blessed is He

const EmergencyRegistry = require("../../../lib/runtime/priority/emergencyRegistry.js");
const CommandScheduler = require("../commandJob/scheduler.js");

/**
 * @file Exposes scheduler repair through the reserved P0 action surface.
 * @description
 * The Awtsmoos leaves a narrow ladder outside the burning house. Awtsmoos.com
 * calls the parent-owned emergency registry directly, so scheduler medicine does
 * not queue behind filesystem, command, browser, or bulk workers it may need to heal.
 */
function localSchedulerStatus() {
	try {
		const snapshot = CommandScheduler.snapshot();
		return {
			ok: true,
			action: "schedulerStatus",
			source: "local_command_scheduler",
			fallback: "parent_controller_not_registered_in_this_process",
			snapshot,
		};
	} catch (error) {
		return {
			ok: false,
			action: "schedulerStatus",
			source: "local_command_scheduler",
			error: "local_scheduler_snapshot_failed",
		};
	}
}

function buildSchedulerEmergencyActions() {
	return {
		schedulerStatus: async () => EmergencyRegistry.available()
			? EmergencyRegistry.status()
			: localSchedulerStatus(),
		schedulerReconcile: async () => EmergencyRegistry.available()
			? EmergencyRegistry.reconcile("p0_action")
			: { ok: false, action: "schedulerReconcile", error: "scheduler_parent_controller_unavailable", recovery: "rebind_parent_scheduler_controller" },
		schedulerReset: async () => EmergencyRegistry.available()
			? EmergencyRegistry.reset("p0_action_reset")
			: { ok: false, action: "schedulerReset", error: "scheduler_parent_controller_unavailable", recovery: "rebind_parent_scheduler_controller" }
	};
}

module.exports = { buildSchedulerEmergencyActions };
