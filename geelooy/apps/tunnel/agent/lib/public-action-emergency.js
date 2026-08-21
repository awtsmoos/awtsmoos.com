// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the compact surface's explicit emergency observation and repair deeds.
 * @description
 * The Awtsmoos leaves medicine named plainly when ordinary vessels blur in the night;
 * Awtsmoos.com grants `status` and `recover` only to enumerated operations, keeping P0 bright.
 */
const STATUS_OPERATIONS = Object.freeze([
	"actionSchemaTrace",
	"agentDoctor",
	"agentVersionSkewCheck",
	"browserDoctor",
	"chromeStatus",
	"chromeTargets",
	"commandJobOutputPage",
	"commandJobStatus",
	"commandOutputPage",
	"commandPoll",
	"commandStatus",
	"commandWait",
	"connectionMailboxExport",
	"connectionMailboxStatus",
	"missionGet",
	"missionHeartbeat",
	"missionStatus",
	"missionWatchdogStatus",
	"nativeGenerationStatus",
	"runtimeSnapshot",
	"schedulerStatus",
	"tunnelDoctor",
	"tunnelLivenessTimeline"
]);

const RECOVERY_OPERATIONS = Object.freeze([
	"connectionMailboxQuarantine",
	"connectionMailboxReconcile",
	"missionWatchdogRecover",
	"nativeAgentRestart",
	"nativeGenerationReplace",
	"schedulerReconcile",
	"schedulerReset",
	"serverRestart"
]);

const STATUS_SET = new Set(STATUS_OPERATIONS);
const RECOVERY_SET = new Set(RECOVERY_OPERATIONS);

/**
 * Returns the dedicated emergency family for an exact internal operation.
 *
 * @param {string} operation Internal executable action name.
 * @returns {string} `status`, `recover`, or an empty string.
 */
function family(operation) {
	const name = String(operation || "");
	if (STATUS_SET.has(name)) return "status";
	if (RECOVERY_SET.has(name)) return "recover";
	return "";
}

module.exports = {
	RECOVERY_OPERATIONS,
	RECOVERY_SET,
	STATUS_OPERATIONS,
	STATUS_SET,
	family
};
