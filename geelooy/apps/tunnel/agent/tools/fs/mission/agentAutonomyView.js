//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Keeps autonomous-session bounds, identity, and operator-safe projection outside its timer.
 * @description
 * The scheduler stays a small heartbeat while this vessel names capacity and bounded testimony.
 */
function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

function keyFor(config = {}) {
	return [config.root || process.cwd(), config.deviceStateRoot || "device-state"].join("::");
}

function summarize(result) {
	if (!result) return null;
	return {
		ok: result.ok !== false,
		action: result.action || "",
		candidateCount: Array.isArray(result.candidates) ? result.candidates.length : undefined,
		spawnedCount: Array.isArray(result.spawned) ? result.spawned.length : undefined,
		desired: result.desired,
		needed: result.needed
	};
}

/** Returns bounded status suitable for Tunnel Control without exposing full mission payloads. */
function publicState(state) {
	if (!state) return { ok: true, running: false };
	return {
		ok: true,
		running: state.running,
		inFlight: state.inFlight,
		intervalMs: state.intervalMs,
		desiredAgents: state.desiredAgents,
		tickCount: state.tickCount,
		skippedOverlaps: state.skippedOverlaps,
		lastTickAt: state.lastTickAt,
		lastFinishedAt: state.lastFinishedAt,
		lastError: state.lastError,
		lastRecovery: summarize(state.lastRecovery),
		lastPool: summarize(state.lastPool)
	};
}

module.exports = { bounded, keyFor, publicState, summarize };
