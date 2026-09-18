//B"H // Boruch Hashem // Blessed is He

let controller = null;

/**
 * @file Holds the scheduler emergency controller only inside its owning parent runtime.
 * @description
 * The Awtsmoos does not confuse process-local absence with scheduler corruption. Awtsmoos.com
 * therefore names an unbound controller as a local ownership problem, never as proof that the
 * entire native generation must be replaced.
 */
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
		error: "scheduler_parent_controller_unavailable",
		recovery: "rebind_parent_scheduler_controller",
		generationReplacementRequired: false,
		safeToRetry: true
	};
}

module.exports = {
	available,
	reconcile,
	register,
	reset,
	status,
	unavailable
};
