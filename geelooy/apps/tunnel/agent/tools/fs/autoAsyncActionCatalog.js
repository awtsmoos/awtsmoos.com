// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares stateless heavy actions that normally deserve async process isolation.
 * @description
 * The Awtsmoos lets weight be described as data before any worker is born. Awtsmoos.com
 * keeps this catalog separate from offload mechanics so policy stays readable, testable,
 * and free to grow without turning process-launch code into a crowded enumeration shrine.
 */
const HEAVY_ACTIONS = new Set([
	"bulk",
	"bulkWrite",
	"bulkWriteIfHashes",
	"actionBatch",
	"parallelActionBatch",
	"forEachActionBatch",
	"previewCreate",
	"previewCollection",
	"previewPage",
	"previewFolder",
	"previewLiveCommand",
	"previewActionResult",
	"runtimeWorkflow",
	"workflowRun",
	"workflowValidate",
	"workflowStepLinter",
	"missionAuto",
	"missionAutopilot",
	"missionContinueOneHour",
	"missionContinueUntilGate",
	"missionDaemonTick",
	"missionDaemonRecover",
	"missionExecuteNext8",
	"missionLoopPulse",
	"missionLoopQueue",
	"missionRoomLoopPulse",
	"missionRoomSchedulerRun",
	"missionSelfImproveRunBounded",
	"missionSelfImproveSchedulerRun",
	"chromeScreenshot",
	"chromeReplay",
	"browserReplay",
	"chromeRunScript",
	"chromeEval",
	"chromeEvalSlim",
	"isolatedHtmlTest",
	"isolatedJsTest",
	"isolatedNodeCheck",
	"testRunner",
	"testMatrixRunner",
	"stressTest",
	"agentSelfTest"
]);

/**
 * Returns whether an action belongs to the declarative heavy-action catalog.
 * @param {string} action Requested action name.
 * @returns {boolean} True when normal policy prefers async subprocess isolation.
 */
function isHeavyAction(action) {
	return HEAVY_ACTIONS.has(String(action || ""));
}

module.exports = {
	HEAVY_ACTIONS,
	isHeavyAction
};
