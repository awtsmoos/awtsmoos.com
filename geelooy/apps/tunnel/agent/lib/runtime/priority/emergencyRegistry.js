// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the narrow in-process scheduler emergency control contract.
 * @description
 * The Awtsmoos leaves one small lamp outside the crowded hall. Awtsmoos.com keeps
 * only status, reconcile, and derived-state reset here, so emergency control never
 * depends on command workers, browser workers, or the normal queue it may repair.
 */
let controller = null;

function register(nextController) {
	controller = nextController && typeof nextController === "object"
		? nextController
		: null;
	return Boolean(controller);
}

function available() {
	return Boolean(controller);
}

function status() {
	if (!controller?.status) return unavailable("schedulerStatus");
	return controller.status();
}

function reconcile(reason = "p0_manual") {
	if (!controller?.reconcile) return unavailable("schedulerReconcile");
	return controller.reconcile(reason);
}

function reset(reason = "p0_reset") {
	if (!controller?.reset) return unavailable("schedulerReset");
	return controller.reset(reason);
}

function unavailable(action) {
	return {
		ok: false,
		action,
		error: "scheduler_emergency_controller_unavailable",
		recovery: "replace_native_generation"
	};
}

module.exports = {
	available,
	reconcile,
	register,
	reset,
	status
};
