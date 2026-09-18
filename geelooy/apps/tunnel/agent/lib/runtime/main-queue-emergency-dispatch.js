//B"H // Boruch Hashem // Blessed is He

const EmergencyRegistry = require("./priority/emergencyRegistry.js");
const { sendResponse } = require("./main-queue-rejection.js");

const OPERATIONS = new Set([
	"schedulerStatus",
	"schedulerReconcile",
	"schedulerReset"
]);

/**
 * @file Executes scheduler emergency deeds in the parent process before worker admission.
 * @description
 * The Awtsmoos keeps the scheduler and its emergency hand on one side of the process boundary.
 * Awtsmoos.com therefore settles these three P0 deeds directly in the parent, where the live
 * controller is registered, instead of asking a filesystem worker to dereference an empty singleton.
 */
function handle(dependencies, ws, data, payload = {}) {
	const action = operation(payload);
	if (!OPERATIONS.has(action)) return false;
	const result = execute(action);
	const enriched = {
		...result,
		action,
		parentOwned: true,
		controllerScope: "parent",
		acceptanceState: "ACCEPTED",
		safeToRetry: false
	};
	dependencies.retryControl.complete(data, payload, enriched);
	dependencies.streamEvent(result.ok === false ? "action.error" : "action.completed", payload, enriched);
	const envelope = {
		type: "TUNNEL_RESPONSE",
		id: data.id,
		...dependencies.Correlation.fields(payload),
		...enriched
	};
	sendResponse(dependencies, ws, envelope);
	return true;
}

function execute(action) {
	if (action === "schedulerStatus") return EmergencyRegistry.status();
	if (action === "schedulerReconcile") return EmergencyRegistry.reconcile("p0_parent_action");
	return EmergencyRegistry.reset("p0_parent_action_reset");
}

function operation(payload = {}) {
	return String(payload.executionAction || payload.action || "").trim();
}

module.exports = { OPERATIONS, execute, handle, operation };
