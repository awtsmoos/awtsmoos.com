// B"H

const REPLAY_SAFE = new Set([
	"list", "tree", "read", "readLines", "readManyLines", "stat", "exists",
	"findFiles", "search", "grep", "fileHashes", "directorySummary",
	"commandStatus", "commandPoll", "commandJobStatus", "jobStatus",
	"command", "commandRun", "commandStart", "shellCommand",
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
 * Durable replay permission is intentionally narrower than filesystem safety.
 * Only observations and status polling may execute once in a renewed parent.
 * Mutations retain their effect descriptor and are reconciled, never replayed.
 */
function describe(action, mutation, payload = {}) {
	if (mutation) return { enabled: true, replaySafe: false, reason: "mutation_reconciliation" };
	const commandIsSynchronous = ["command", "commandRun", "shellCommand"].includes(String(action || "")) &&
		[payload.sync, payload.inline, payload.blocking].some(value =>
			[true, 1, "true", "1", "yes"].includes(value)
		);
	const replaySafe = REPLAY_SAFE.has(String(action || "")) && !commandIsSynchronous;
	return {
		enabled: replaySafe,
		replaySafe,
		reason: replaySafe ? "idempotent_observation" : "memory_only_non_idempotent"
	};
}

module.exports = { REPLAY_SAFE, describe };
