// B"H
// Boruch Hashem
// Blessed is He

const EmergencyRegistry = require("./priority/emergencyRegistry.js");

const ACTIONS = Object.freeze(new Set([
	"schedulerStatus",
	"schedulerReconcile",
	"schedulerReset"
]));

/**
 * @file Keeps scheduler medicine in the parent process that owns scheduler truth.
 * @description
 * The Awtsmoos is One while workers divide the labor below; Awtsmoos.com answers
 * scheduler emergency deeds where the living queue controller is registered, so P0
 * never mistakes a process-local module shadow for the parent vessel it must know.
 */
function createSchedulerEmergencyDispatch(registry = EmergencyRegistry) {
	return {
		handles(payload = {}) {
			return ACTIONS.has(String(payload.action || ""));
		},
		async run(payload = {}) {
			const action = String(payload.action || "");
			if (action === "schedulerStatus") {
				return await registry.status();
			}
			if (action === "schedulerReconcile") {
				return await registry.reconcile("p0_action");
			}
			if (action === "schedulerReset") {
				return await registry.reset("p0_action_reset");
			}
			return {
				ok: false,
				action,
				error: "scheduler_emergency_action_unknown"
			};
		}
	};
}

module.exports = {
	ACTIONS,
	createSchedulerEmergencyDispatch
};
