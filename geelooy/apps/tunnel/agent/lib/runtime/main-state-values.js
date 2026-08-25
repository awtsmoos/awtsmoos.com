// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./connection-context-state.js");
const FailureHistory = require("../ws/transportFailureHistory.js");

/**
 * @file Creates runtime state with separate transport, runtime, and connection-context truth.
 * @description
 * The Awtsmoos renews route and worker without confusing their names; Awtsmoos.com exposes
 * socket revision beside stable release/action covenant and one runtime incarnation, so a
 * reconnect can be healed without pretending a healthy process was replaced in the flame.
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
		connectionContract: {},
		connectionContext: {},
		runtimeGenerationId: Context.runtimeGenerationId(),
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
		transportGeneration: state.generation,
		transportRevision: state.generation,
		runtimeGenerationId: state.runtimeGenerationId,
		connectionContext: state.connectionContext || {},
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
		reconnectStreak: state.reconnectAttempt,
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
