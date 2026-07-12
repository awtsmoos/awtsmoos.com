// B"H

const Decision = require("./decision.js");
const Store = require("./store.js");

async function beforeTick(config, payload = {}) {
	const current = await Store.read(config, payload);
	if (!current.ok) return { ...current, decision: { allowed: false, directive: "stop", reason: current.error } };
	const decision = Decision.before(current.control);
	const observedState = Decision.observedFor(decision);
	const unchangedGate = !decision.allowed &&
		current.control.observedState === observedState &&
		current.control.lastGateReason === decision.reason;
	if (unchangedGate) return { ...current, decision };
	const record = await Store.mutate(config, payload, control => ({
		...control,
		observedState,
		lastGateReason: decision.allowed ? null : decision.reason,
		startedAt: control.startedAt || new Date().toISOString(),
		turnStartedAt: decision.allowed ? new Date().toISOString() : control.turnStartedAt,
		startedTurns: control.startedTurns + (decision.allowed ? 1 : 0),
		oneTurnCredits: decision.oneTurn
			? Math.max(0, control.oneTurnCredits - 1)
			: control.oneTurnCredits
	}), { runtime: true });
	return { ...record, decision };
}

async function afterTick(config, payload = {}, result = null, error = null, ticket = {}) {
	return Store.mutate(config, payload, control => {
		const failed = Boolean(error || result?.ok === false);
		const desiredPaused = ticket.decision?.oneTurn || control.desiredState === "paused";
		return {
			...control,
			completedTurns: control.completedTurns + (failed ? 0 : 1),
			totalErrors: control.totalErrors + (failed ? 1 : 0),
			consecutiveErrors: failed ? control.consecutiveErrors + 1 : 0,
			observedState: desiredPaused ? "paused" : control.desiredState === "running" ? "idle" : control.observedState,
			lastFinishedAt: new Date().toISOString(),
			lastResultAction: result?.action || null,
			lastError: error ? String(error.message || error) : result?.ok === false ? result.error || "turn_failed" : null
		};
	}, { runtime: true });
}

module.exports = { afterTick, beforeTick };
