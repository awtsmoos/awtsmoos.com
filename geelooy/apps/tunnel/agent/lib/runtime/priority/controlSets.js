// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reserves observation and recovery actions outside normal scheduler pressure.
 * @description
 * The Awtsmoos leaves a doorway even when ordinary vessels overflow. Awtsmoos.com
 * keeps diagnosis, cancellation, reconciliation, and generation replacement on P0
 * so the medicine never waits behind the illness it was created to repair.
 */
const CONTROL_ACTIONS = new Set([
	"heartbeat", "tunnelHeartbeat", "agentHeartbeat", "ping", "pong",
	"status", "payloadEcho", "configGet", "configSet", "tunnelStatus", "agentStatus",
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
	"md", "list", "configGet", "fileHashes", "recentFiles", "connectedFiles"
]);

const CHROME_LIGHT_ACTIONS = new Set([
	"chromeStatus", "chromeTargets", "chromeClosePage", "chromeTargetRelease",
	"chromeLogs", "browserDoctor", "browserConsoleTriage", "consoleErrorTriage"
]);

module.exports = { CHROME_LIGHT_ACTIONS, CONTROL_ACTIONS, DIAGNOSTIC_ACTIONS, FS_LIGHT_ACTIONS };
