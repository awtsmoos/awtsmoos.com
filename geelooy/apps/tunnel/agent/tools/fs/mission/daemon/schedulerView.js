// B"H

const DEFAULT_INTERVAL_MS = 5000;
const MIN_INTERVAL_MS = 250;
const MAX_INTERVAL_MS = 3600000;

function intervalFrom(payload = {}) {
	const value = Number(payload.intervalMs || payload.daemonIntervalMs || DEFAULT_INTERVAL_MS);
	if (!Number.isFinite(value)) return DEFAULT_INTERVAL_MS;
	return Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, Math.floor(value)));
}

function resultSummary(result = {}) {
	return {
		ok: result.ok !== false,
		action: result.action || "missionDaemonTick",
		ranAction: result.ranAction || null,
		reason: result.reason || result.continuationGate?.reason || null,
		missionId: result.missionAdvisory?.missionId || result.missionId || null,
		nextSuggestedToolCall: result.nextSuggestedToolCall || null,
		continuationGate: result.continuationGate || null
	};
}

function publicStatus(state) {
	if (!state) {
		return {
			running: false,
			inFlight: false,
			timerActive: false,
			intervalMs: null,
			tickCount: 0,
			skippedOverlaps: 0
		};
	}
	return {
		key: state.key,
		missionId: state.missionId,
		running: state.running,
		inFlight: state.inFlight,
		timerActive: Boolean(state.timer),
		intervalMs: state.intervalMs,
		startedAt: state.startedAt,
		stoppedAt: state.stoppedAt,
		nextTickAt: state.nextTickAt,
		lastTickAt: state.lastTickAt,
		lastFinishedAt: state.lastFinishedAt,
		lastError: state.lastError,
		lastResult: state.lastResult,
		tickCount: state.tickCount,
		skippedOverlaps: state.skippedOverlaps
	};
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	MAX_INTERVAL_MS,
	MIN_INTERVAL_MS,
	intervalFrom,
	publicStatus,
	resultSummary
};
