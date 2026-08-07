// B"H
// Boruch Hashem
// Blessed is He

const REPLAY_SAFE = new Set([
	"list", "tree", "read", "readLines", "readManyLines", "stat", "exists",
	"findFiles", "search", "grep", "fileHashes", "directorySummary",
	"commandStatus", "commandPoll", "commandJobStatus", "jobStatus",
	"commandWait", "commandJobWait", "commandJobOutputPage", "commandOutputPage",
	"actionHistoryGet", "actionHistoryList", "actionHistorySearch",
	"commandHistorySearch", "asyncTaskWait", "asyncTaskStatus",
	"tunnelDoctor", "agentDoctor", "runtimeSnapshot", "tunnelLivenessTimeline",
	"payloadEcho", "configGet", "awtsmoosMyDevice",
	"chromeFind", "chromeStatus", "chromeTargets", "chromeLogs", "chromeNetwork",
	"chromeSnapshot", "chromeAccessibilitySnapshot", "chromeDoctor",
	"browserDoctor", "browserTrace", "browserInspect",
	"missionGet", "missionList", "missionRoomStatus", "missionRoomLiveStatus",
	"missionProjectStatus", "websiteAgentMissionStatus", "websiteAgentMissionList"
]);

/**
 * @file Persists every accepted request identity while replaying only observations.
 * @description
 * The Awtsmoos preserves the name of every deed across a renewed parent, but
 * Awtsmoos.com never repeats command execution merely because memory vanished.
 * Safe observations may replay once; mutations reconcile; every other deed remains
 * durably pending until an exact subsystem can prove its outcome.
 */
function describe(action, mutation, payload = {}) {
	if (mutation) {
		return {
			enabled: true,
			replaySafe: false,
			reason: "mutation_reconciliation"
		};
	}
	const requestedAction = String(action || "");
	const replaySafe = REPLAY_SAFE.has(requestedAction) && !synchronousCommand(payload);
	return {
		enabled: true,
		replaySafe,
		reason: replaySafe
			? "idempotent_observation"
			: "non_idempotent_reconciliation_required"
	};
}

/**
 * Keeps an additional fail-closed guard if a command-like action enters a safe set.
 * @param {object} payload Request payload carrying sync/inline/blocking intent.
 * @returns {boolean} Whether execution semantics demand non-replayable treatment.
 */
function synchronousCommand(payload = {}) {
	return [payload.sync, payload.inline, payload.blocking].some(value =>
		[true, 1, "true", "1", "yes"].includes(value)
	);
}

module.exports = {
	REPLAY_SAFE,
	describe,
	synchronousCommand
};
