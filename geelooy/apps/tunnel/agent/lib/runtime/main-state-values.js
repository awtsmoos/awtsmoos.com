// B"H
// Boruch Hashem
// Blessed is He

const FailureHistory = require("../ws/transportFailureHistory.js");

/**
 * @file Creates runtime state and preserves separate transport/execution testimony.
 * @description
 * The Awtsmoos renews route and worker state without confusing their meanings.
 * Awtsmoos.com exposes the child vessel's full health beside registration, so a
 * connected socket can never erase evidence that its execution consumer is sick.
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
		lastFailure: null,
		recentFailures: [],
		connectionVessel: null,
		lanes: dependencies.Priority.makeLaneState(),
		scheduler: dependencies.Priority.createSchedulerState(),
		eventLoopLag: lagMonitor.snapshot()
	};
}

function connectionSnapshot(state) {
	const child = state.connectionVessel || {};
	const recentFailures = child.recentFailures || state.recentFailures || [];
	return {
		generation: state.generation,
		tunnelId: state.tunnelId || "",
		tunnelName: state.tunnelName || "",
		registered: state.registrationConfirmed === true,
		connected: child.connected === true,
		running: child.running !== false,
		fullHealth: child.fullHealth || null,
		executionHealth: child.executionHealth || null,
		parent: child.parent || null,
		parentCustody: child.parentCustody || null,
		reconnectAttempt: state.reconnectAttempt,
		lastRegisteredAt: state.lastRegisteredAt || null,
		replacementRequested: state.replacementRequested === true,
		childPid: child.childPid || null,
		mailbox: child.mailbox || null,
		lastFailure: child.lastFailure || state.lastFailure || null,
		recentFailures,
		failureSummary: FailureHistory.summary(recentFailures)
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
