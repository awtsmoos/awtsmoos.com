// B"H

function runtimeDeadline(control = {}) {
	if (!control.maxRuntimeMinutes || !control.startedAt) return null;
	const start = Date.parse(control.startedAt);
	return Number.isFinite(start)
		? start + control.maxRuntimeMinutes * 60000
		: null;
}

function expired(control = {}, now = Date.now()) {
	const explicit = Date.parse(control.deadlineAt || "");
	const derived = runtimeDeadline(control);
	const deadline = Number.isFinite(explicit) ? explicit : derived;
	return Number.isFinite(deadline) && now >= deadline;
}

function before(control = {}, now = Date.now()) {
	if (control.desiredState === "stopped") return gate("stopped", "stop");
	if (control.desiredState === "draining") return gate("drained", "stop");
	if (expired(control, now)) return gate("runtime_budget_reached", "wait");
	if (control.maxTurns > 0 && control.startedTurns >= control.maxTurns) {
		return gate("turn_budget_reached", "wait");
	}
	if (control.consecutiveErrors >= control.maxConsecutiveErrors) {
		return gate("error_budget_reached", "wait");
	}
	if (control.desiredState === "paused") {
		return control.oneTurnCredits > 0
			? { allowed: true, directive: "continue", reason: "one_turn_credit", oneTurn: true }
			: gate("paused_by_user", "wait");
	}
	return { allowed: true, directive: "continue", reason: "running", oneTurn: false };
}

function gate(reason, directive) {
	return { allowed: false, directive, reason, oneTurn: false };
}

function observedFor(decision = {}) {
	if (decision.allowed) return "running";
	if (decision.reason === "drained") return "drained";
	if (decision.reason === "stopped") return "stopped";
	if (/budget/.test(decision.reason)) return "budget-paused";
	return "paused";
}

module.exports = { before, expired, observedFor, runtimeDeadline };
