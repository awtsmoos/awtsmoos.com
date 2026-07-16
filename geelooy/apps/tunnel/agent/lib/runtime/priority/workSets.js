// B"H
// Boruch Hashem
// Blessed is He

const ASYNC_TASK_CONTROL_ACTIONS = new Set([
	"asyncTaskStatus",
	"asyncTaskOutputPage",
	"asyncTaskWait",
	"asyncTaskCancel"
]);

const PAGE_ACTIONS = new Set([
	"commandJobOutputPage",
	"commandOutputPage",
	"treePage",
	"treeStream",
	"treeSummary",
	"rgPage",
	"rgStream",
	"rgSummary"
]);

const HISTORY_ACTIONS = new Set([
	"actionHistoryGet",
	"actionHistoryList",
	"actionHistorySearch",
	"actionTimeline",
	"actionStream",
	"agentActionStream",
	"missionActionStream",
	"roomActionStream",
	"workerActionStream",
	"browserActionStream",
	"fsActionStream"
]);

const WAIT_ACTIONS = new Set([
	"commandWait",
	"commandJobWait",
	"waitForJob",
	"jobWait"
]);

const BULK_ACTIONS = new Set([
	"tree", "treeStart", "treeManifest", "treeDiff", "treeIndex",
	"findFiles", "grep", "rgStart", "rgRefine", "rgRerun", "selectString",
	"bulk", "bulkWrite", "bulkWriteIfHashes", "bulkRead",
	"actionBatch", "commandBatch", "parallelActionBatch", "forEachActionBatch",
	"missionAuto", "missionAutopilot", "missionLoopPulse",
	"missionContinueOneHour", "missionContinueUntilGate",
	"runtimeWorkflow", "simulateRuntime", "testMatrixRunner", "stressMatrix",
	"previewCreate", "previewFolder", "previewPage", "previewCollection",
	"previewLiveCommand", "chromeSnapshot", "chromeSnapshotScoped", "chromeFind"
]);

module.exports = {
	ASYNC_TASK_CONTROL_ACTIONS,
	BULK_ACTIONS,
	HISTORY_ACTIONS,
	PAGE_ACTIONS,
	WAIT_ACTIONS
};
