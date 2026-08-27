// B"H

const CONTROL_ACTIONS = new Set([
	"heartbeat", "tunnelHeartbeat", "agentHeartbeat", "ping", "pong",
	"status", "payloadEcho", "configGet", "tunnelStatus", "agentStatus",
	"commandStatus", "commandPoll", "commandJobStatus", "jobStatus",
	"commandCancel", "commandJobCancel", "treeStatus", "treeCancel",
	"rgStatus", "rgCancel", "chromeTargets", "chromeClosePage",
	"chromeTargetRelease", "missionGet", "missionStatus", "missionHeartbeat",
	"missionWatchdogStatus", "missionDaemonStatus", "missionTurnStatus",
	"missionResourceStatus", "missionTurnSet", "missionTurnPause",
	"missionTurnResume", "missionTurnDrain", "missionTurnStop",
	"missionTurnOnce"
]);

const DIAGNOSTIC_ACTIONS = new Set([
	"tunnelDoctor", "tunnelLivenessTimeline", "agentDoctor", "agentSelfTest",
	"agentVersionSkewCheck", "runtimeSnapshot", "actionSchemaTrace",
	"nodeVersionDoctor", "nodePackageScripts", "nodeResolve",
	"awtsmoosOsBrowse", "awtsmoosRuntimeBrowse", "awtsmoosCapabilities",
	"missionRecovery", "missionWatchdogRecover"
]);

const FS_LIGHT_ACTIONS = new Set([
	"stat", "read", "read64", "readBytes", "readLines", "readManyLines",
	"md", "list", "configGet", "fileHashes", "recentFiles", "connectedFiles"
]);

const CHROME_LIGHT_ACTIONS = new Set([
	"chromeStatus", "chromeTargets", "chromeClosePage", "chromeTargetRelease",
	"chromeLogs", "browserDoctor", "browserConsoleTriage", "consoleErrorTriage"
]);

module.exports = {
	CHROME_LIGHT_ACTIONS,
	CONTROL_ACTIONS,
	DIAGNOSTIC_ACTIONS,
	FS_LIGHT_ACTIONS
};
