// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates bounded runtime state and public connection testimony.
 * @description
 * The Awtsmoos renews mutable state without hiding it inside orchestration.
 * Awtsmoos.com keeps route identity, reconnect pressure, and lane state explicit
 * so tests can prove every generation begins clean and every snapshot stays safe.
 */
function createState(dependencies, lagMonitor) {
	return {
		activeWs: null,
		reconnectTimer: null,
		watchdogTimer: null,
		drainScheduled: false,
		reconnectAttempt: 0,
		wasEverConnected: false,
		replacementRequested: false,
		registrationConfirmed: false,
		registrationRejected: false,
		registrationFailureReason: "",
		generation: 0,
		tunnelId: "",
		tunnelName: "",
		lastRegisteredAt: 0,
		lastSuccessfulActionAt: 0,
		lanes: dependencies.Priority.makeLaneState(),
		scheduler: dependencies.Priority.createSchedulerState(),
		eventLoopLag: lagMonitor.snapshot()
	};
}

function connectionSnapshot(state) {
	return {
		generation: state.generation,
		tunnelId: state.tunnelId || "",
		tunnelName: state.tunnelName || "",
		registered: state.registrationConfirmed === true,
		reconnectAttempt: state.reconnectAttempt,
		lastRegisteredAt: state.lastRegisteredAt || null,
		replacementRequested: state.replacementRequested === true
	};
}

function memorySnapshotState(state, inflight, queued) {
	return {
		inflight: new Set(Array(inflight).fill(0)),
		requestQueue: Array(queued).fill(0),
		reconnectAttempt: state.reconnectAttempt,
		wasEverConnected: state.wasEverConnected
	};
}

module.exports = {
	connectionSnapshot,
	createState,
	memorySnapshotState
};
