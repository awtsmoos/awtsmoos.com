// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps recovery and bounded interactive work outside bulk-pressure shadows.
 * @description
 * The Awtsmoos leaves a narrow doorway even when broad vessels overflow. Awtsmoos.com
 * therefore reserves recovery on P0 and routes small filesystem discovery or metadata
 * deeds through the interactive lane, while true bulk creation remains bounded apart.
 */
const CONTROL_ACTIONS = new Set([
	"heartbeat", "tunnelHeartbeat", "agentHeartbeat", "ping", "pong",
	"status", "payloadEcho", "configGet", "configSet", "tunnelStatus", "agentStatus",
	"instructionCatalog", "instructionResolve", "instructionGet",
	"commandStatus", "commandPoll", "commandJobStatus", "jobStatus",
	"commandCancel", "commandJobCancel", "treeStatus", "treeCancel",
	"rgStatus", "rgCancel", "processKillSafe", "runtimeSnapshot",
	"schedulerStatus", "schedulerReconcile", "schedulerReset",
	"connectionMailboxStatus", "connectionMailboxExport",
	"connectionMailboxReconcile", "connectionMailboxQuarantine",
	"nativeGenerationStatus", "nativeGenerationReplace", "nativeAgentRestart",
	"superviseRuntime", "serverRestart",
	"chromeTargets", "chromeClosePage", "chromeTargetRelease",
	"missionGet", "missionStatus", "missionHeartbeat", "missionWatchdogStatus",
	"missionDaemonStatus", "missionTurnStatus", "missionResourceStatus",
	"missionTurnSet", "missionTurnPause", "missionTurnResume", "missionTurnDrain",
	"missionTurnStop", "missionTurnOnce"
]);

const DIAGNOSTIC_ACTIONS = new Set([
	"tunnelDoctor", "tunnelLivenessTimeline", "agentDoctor", "agentSelfTest",
	"agentVersionSkewCheck", "runtimeSnapshot", "actionSchemaTrace",
	"nodeVersionDoctor", "nodePackageScripts", "nodeResolve",
	"awtsmoosOsBrowse", "awtsmoosRuntimeBrowse", "awtsmoosCapabilities",
	"missionRecovery", "missionWatchdogRecover", "schedulerStatus",
	"connectionMailboxStatus", "nativeGenerationStatus"
]);

const FS_LIGHT_ACTIONS = new Set([
	"stat", "read", "read64", "readBytes", "readLines", "readManyLines",
	"md", "list", "configGet", "fileHashes", "recentFiles", "connectedFiles",
	"grep", "findFiles", "selectString", "textStats",
	"mkdirp", "ensureFile", "touch"
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
