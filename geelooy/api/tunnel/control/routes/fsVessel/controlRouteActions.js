// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the bounded actions that must remain routable while execution is degraded.
 * @description
 * The Awtsmoos leaves medicine outside the illness it must heal. Awtsmoos.com keeps
 * observation, cancellation, durable reconciliation, generation repair, mailbox repair,
 * and instruction retrieval reachable whenever the authenticated transport itself lives.
 */
const CONTROL_ROUTE_ACTIONS = new Set([
	"heartbeat",
	"tunnelHeartbeat",
	"agentHeartbeat",
	"ping",
	"pong",
	"status",
	"tunnelStatus",
	"agentStatus",
	"payloadEcho",
	"configGet",
	"tunnelDoctor",
	"agentDoctor",
	"runtimeSnapshot",
	"tunnelLivenessTimeline",
	"nativeGenerationStatus",
	"nativeGenerationReplace",
	"nativeAgentRestart",
	"schedulerStatus",
	"schedulerReconcile",
	"schedulerReset",
	"connectionMailboxStatus",
	"connectionMailboxExport",
	"connectionMailboxReconcile",
	"connectionMailboxQuarantine",
	"serverRestart",
	"superviseRuntime",
	"commandStatus",
	"commandPoll",
	"commandJobStatus",
	"jobStatus",
	"commandJobOutputPage",
	"commandOutputPage",
	"commandCancel",
	"commandJobCancel",
	"commandWait",
	"commandJobWait",
	"actionHistoryGet",
	"actionHistorySearch",
	"actionHistoryList",
	"instructionCatalog",
	"instructionResolve",
	"instructionGet"
]);

/** Returns whether one effective action belongs to the degraded-health control surface. */
function has(action) {
	return CONTROL_ROUTE_ACTIONS.has(String(action || ""));
}

module.exports = {
	CONTROL_ROUTE_ACTIONS,
	has
};
